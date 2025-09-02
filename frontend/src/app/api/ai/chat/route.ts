import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDatabase } from "@/lib/db-init"
import { z } from "zod"
import { checkRateLimit, getUniqueIdentifier } from "@/lib/rate-limiter"
import { storeWebhookContext } from "@/lib/webhook-cache"
import { encrypt, decrypt } from "@/lib/encryption"

const chatSchema = z.object({
  message: z.string().min(1).max(10000), // Permet des descriptions détaillées
  conversationId: z.string().optional(),
  objectiveType: z.string().optional(),
  action: z.enum(["chat", "generate_objective"]).optional().default("chat")
})

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "https://n8n.larefonte.store/webhook/333e2809-84c9-4bf7-bc9b-3c5c7aaceb49"

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification - OBLIGATOIRE
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }
    
    // Déterminer le type d'utilisateur
    // @ts-expect-error isPremium sera ajouté dans le callback de session
    const userType = session.user.isPremium ? "premium" : "free"
    
    // Vérifier le rate limiting
    const rateLimitResponse = await checkRateLimit(request, userType)
    if (rateLimitResponse) {
      return rateLimitResponse // Retourne 429 si limité
    }
    
    const userId = session.user.id
    const userName = session.user.name || "Utilisateur"
    const userEmail = session.user.email || "user@example.com"

    const body = await request.json()
    
    // Validation
    const validationResult = chatSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Message invalide" },
        { status: 400 }
      )
    }

    const { message, conversationId, objectiveType } = validationResult.data

    // Récupérer la base de données avec vérification de connexion
    const db = await getDatabase()
    
    let conversation
    if (conversationId) {
      // Récupérer la conversation existante (sans vérifier userId pour permettre l'utilisation)
      conversation = await db.collection("conversations").findOne({
        _id: conversationId
      })
      
      // Si la conversation existe mais n'a pas de userId ou a un userId différent, le mettre à jour
      if (conversation && (!conversation.userId || conversation.userId === "anonymous")) {
        await db.collection("conversations").updateOne(
          { _id: conversationId },
          { $set: { userId: userId } }
        )
        conversation.userId = userId
      }
    }

    if (!conversation) {
      // Créer une nouvelle conversation avec un ID string
      const newConversationId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      await db.collection("conversations").insertOne({
        _id: newConversationId, // Utiliser un string ID au lieu d'ObjectId
        userId: userId,
        objectiveType: objectiveType || "general",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      conversation = { _id: newConversationId, messages: [] }
    }

    // Ajouter le message utilisateur (CHIFFRÉ)
    await db.collection("conversations").updateOne(
      { _id: conversation._id },
      {
        $push: {
          messages: {
            role: "user",
            content: encrypt(message), // Chiffrer le contenu
            timestamp: new Date()
          }
        },
        $set: { updatedAt: new Date() }
      }
    )

    // Générer un ID unique pour cette conversation
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Sauvegarder le message avec un statut "pending"
    await db.collection("conversations").updateOne(
      { _id: conversation._id },
      {
        $set: {
          lastMessageId: messageId,
          status: "waiting_for_ai"
        }
      }
    )
    
    // Stocker le contexte pour retrouver la conversation plus tard
    storeWebhookContext(messageId, conversation._id, userId)
    
    // Envoyer la requête à n8n de manière asynchrone
    console.log("[n8n] Envoi webhook asynchrone:", N8N_WEBHOOK_URL)
    console.log("[n8n] Message ID:", messageId)
    console.log("[n8n] Conversation ID:", conversation._id)
    
    // Déchiffrer les messages précédents pour le contexte n8n
    const decryptedPreviousMessages = (conversation.messages?.slice(-10) || []).map((msg: any) => {
      try {
        return {
          ...msg,
          content: decrypt(msg.content) // Déchiffrer pour n8n
        }
      } catch (error) {
        // Si pas chiffré, garder tel quel
        return msg
      }
    })
    
    // Envoyer à n8n sans attendre la réponse
    fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId: messageId, // ID unique pour retrouver la réponse
          userId: userId,
          message, // Message en clair pour n8n
          conversationId: conversation._id, // Déjà un string maintenant
          objectiveType: objectiveType || "general",
          messageCount: (conversation.messages?.length || 0) + 1,
          callbackUrl: `${process.env.SERVER_URL || process.env.NEXT_PUBLIC_APP_URL}/api/ai/webhook`, // URL de callback pour n8n
          context: {
            userName: userName,
            userEmail: userEmail,
            previousMessages: decryptedPreviousMessages, // Messages déchiffrés pour le contexte
            isFirstMessage: !conversation.messages || conversation.messages.length === 0
          }
        })
      }).then(response => {
        console.log("[n8n] Webhook envoyé, status:", response.status)
      }).catch(error => {
        console.error("[n8n] Erreur envoi webhook:", error)
      })
    
    // Retourner immédiatement au frontend que le message est en cours de traitement
    return NextResponse.json({
      conversationId: conversation._id, // Déjà un string
      messageId: messageId,
      status: "processing",
      message: "Votre message a été envoyé à l'IA. Je réfléchis..."
    })

  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// GET pour récupérer l'historique
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }
    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")

    const db = await getDatabase()

    if (conversationId) {
      // Récupérer une conversation spécifique
      const conversation = await db.collection("conversations").findOne({
        _id: conversationId,
        userId: userId
      })

      if (!conversation) {
        return NextResponse.json(
          { error: "Conversation non trouvée" },
          { status: 404 }
        )
      }

      return NextResponse.json(conversation)
    } else {
      // Récupérer toutes les conversations
      const conversations = await db.collection("conversations")
        .find({ userId: userId })
        .sort({ updatedAt: -1 })
        .limit(10)
        .toArray()

      return NextResponse.json(conversations)
    }
  } catch (error) {
    console.error("Get conversations error:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}