import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import clientPromise from "@/lib/mongodb"
import { z } from "zod"
import { checkRateLimit, getUniqueIdentifier } from "@/lib/rate-limiter"

const chatSchema = z.object({
  message: z.string().min(1).max(10000), // Permet des descriptions détaillées
  conversationId: z.string().optional(),
  objectiveType: z.string().optional(),
  action: z.enum(["chat", "generate_objective"]).optional().default("chat")
})

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "https://n8n.larefonte.store/webhook/333e2809-84c9-4bf7-bc9b-3c5c7aaceb49"

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification (optionnel - tout le monde peut tester)
    const session = await getServerSession(authOptions)
    
    // Déterminer le type d'utilisateur
    const userType = session?.user?.isPremium ? "premium" : session?.user ? "free" : "anon"
    
    // Vérifier le rate limiting
    const rateLimitResponse = await checkRateLimit(request, userType)
    if (rateLimitResponse) {
      return rateLimitResponse // Retourne 429 si limité
    }
    
    // Utiliser l'user authentifié OU un identifiant unique pour anonyme
    const uniqueId = getUniqueIdentifier(request)
    const userId = session?.user?.id || `anon-${uniqueId}`
    const userName = session?.user?.name || "Utilisateur"
    const userEmail = session?.user?.email || "anonymous@example.com"

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

    // Connexion à MongoDB
    const client = await clientPromise
    const db = client.db()
    
    let conversation
    if (conversationId) {
      // Récupérer la conversation existante
      conversation = await db.collection("conversations").findOne({
        _id: conversationId,
        userId: userId
      })
    }

    if (!conversation) {
      // Créer une nouvelle conversation
      const result = await db.collection("conversations").insertOne({
        userId: userId,
        objectiveType: objectiveType || "general",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      conversation = { _id: result.insertedId, messages: [] }
    }

    // Ajouter le message utilisateur
    await db.collection("conversations").updateOne(
      { _id: conversation._id },
      {
        $push: {
          messages: {
            role: "user",
            content: message,
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
    
    // Envoyer la requête à n8n de manière asynchrone
    console.log("[n8n] Envoi webhook asynchrone:", N8N_WEBHOOK_URL)
    console.log("[n8n] Message ID:", messageId)
    
    // Envoyer à n8n sans attendre la réponse
    fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId: messageId, // ID unique pour retrouver la réponse
          userId: userId,
          message,
          conversationId: conversation._id.toString(),
          objectiveType: objectiveType || "general",
          messageCount: (conversation.messages?.length || 0) + 1,
          callbackUrl: `${process.env.SERVER_URL || process.env.NEXT_PUBLIC_APP_URL}/api/ai/webhook`, // URL de callback pour n8n
          context: {
            userName: userName,
            userEmail: userEmail,
            previousMessages: conversation.messages?.slice(-10) || [],
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
      conversationId: conversation._id.toString(),
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
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || `anon-${request.headers.get("x-forwarded-for") || "unknown"}`

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")

    const client = await clientPromise
    const db = client.db()

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