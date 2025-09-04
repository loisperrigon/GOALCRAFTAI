import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDatabase } from "@/lib/server/db-init"
import { z } from "zod"
import { checkRateLimit, getUniqueIdentifier } from "@/lib/rate-limiter"
import { storeWebhookContext } from "@/lib/webhook-cache"
import { encrypt, decrypt } from "@/lib/server/encryption"

const chatSchema = z.object({
  message: z.string().min(1).max(10000), // Permet des descriptions détaillées
  conversationId: z.string().optional(),
  objectiveType: z.string().optional(),
  action: z.enum(["chat", "generate_objective"]).optional().default("chat")
})

// Webhooks n8n pour les différents agents
const N8N_CREATION_WEBHOOK = process.env.N8N_CREATION_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL || "https://n8n.larefonte.store/webhook/333e2809-84c9-4bf7-bc9b-3c5c7aaceb49"
const N8N_MODIFICATION_WEBHOOK = process.env.N8N_MODIFICATION_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL || "https://n8n.larefonte.store/webhook/333e2809-84c9-4bf7-bc9b-3c5c7aaceb49"

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
    // @ts-expect-error premiumType sera ajouté dans le callback de session
    const userType = session.user.premiumType || "free"
    
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

    // Vérifier si un objectif existe déjà dans la conversation
    const hasExistingObjective = !!(conversation.objectiveId || conversation.currentObjectiveId)
    let currentObjective = null

    if (hasExistingObjective) {
      const objectiveId = conversation.objectiveId || conversation.currentObjectiveId
      const { ObjectId } = await import("mongodb")
      
      // Récupérer l'objectif complet depuis MongoDB
      try {
        currentObjective = await db.collection("objectives").findOne({
          _id: new ObjectId(objectiveId)
        })
        console.log("[Chat API] Objectif existant trouvé:", objectiveId)
      } catch (error) {
        console.error("[Chat API] Erreur récupération objectif:", error)
      }
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
    const targetWebhookForLog = hasExistingObjective ? N8N_MODIFICATION_WEBHOOK : N8N_CREATION_WEBHOOK
    console.log("[n8n] Envoi webhook asynchrone:", targetWebhookForLog)
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
    
    // Construire le corps de la requête avec info sur l'objectif
    const webhookBody = {
      messageId: messageId, // ID unique pour retrouver la réponse
      userId: userId,
      message, // Message en clair pour n8n
      conversationId: conversation._id, // Déjà un string maintenant
      objectiveType: objectiveType || "general",
      messageCount: (conversation.messages?.length || 0) + 1,
      callbackUrl: `${process.env.SERVER_URL || process.env.NEXT_PUBLIC_APP_URL}/api/ai/webhook`, // URL de callback pour n8n
      
      // NOUVEAU : Informations sur l'objectif existant
      hasExistingObjective: hasExistingObjective,
      existingObjectiveId: conversation.objectiveId || conversation.currentObjectiveId || null,
      currentObjective: currentObjective, // L'objectif complet pour donner le contexte à l'IA
      
      context: {
        userName: userName,
        userEmail: userEmail,
        previousMessages: decryptedPreviousMessages, // Messages déchiffrés pour le contexte
        isFirstMessage: !conversation.messages || conversation.messages.length === 0,
        // NOUVEAU : Type d'agent pour n8n
        agentType: hasExistingObjective ? "modification" : "creation"
      }
    }
    
    // Choisir le bon webhook selon le contexte
    const targetWebhook = hasExistingObjective ? N8N_MODIFICATION_WEBHOOK : N8N_CREATION_WEBHOOK
    
    console.log("[n8n] Routage vers:", hasExistingObjective ? "Agent Modification" : "Agent Création")
    console.log("[n8n] URL du webhook:", targetWebhook)
    console.log("[n8n] Callback URL:", webhookBody.callbackUrl)
    console.log("[n8n] Objectif existant:", hasExistingObjective ? "OUI" : "NON")
    if (hasExistingObjective) {
      console.log("[n8n] ID de l'objectif:", webhookBody.existingObjectiveId)
    }
    
    // Fonction pour envoyer une erreur via WebSocket
    const sendErrorToClient = async (errorMessage: string) => {
      try {
        // 1. Sauvegarder dans MongoDB
        await db.collection("conversations").updateOne(
          { _id: conversation._id },
          {
            $push: {
              messages: {
                role: "assistant",
                content: encrypt(errorMessage),
                timestamp: new Date(),
                isError: true
              }
            }
          }
        )
        
        // 2. Notifier immédiatement via WebSocket
        await fetch('http://localhost:3002/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: conversation._id,
            data: {
              type: "message",
              content: errorMessage,
              isFinal: true,
              isError: true
            }
          })
        })
        console.log("[Erreur] Message d'erreur envoyé au client:", errorMessage)
      } catch (error) {
        console.error("[Erreur] Impossible d'envoyer le message d'erreur:", error)
      }
    }
    
    // Envoyer à n8n et gérer les erreurs immédiatement
    fetch(targetWebhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookBody)
      }).then(async response => {
        console.log("[n8n] Webhook envoyé, status:", response.status)
        if (response.status === 404) {
          console.error("[n8n] ERREUR 404 - L'URL du webhook n'existe pas ou n'est pas accessible")
          console.error("[n8n] Vérifiez que l'URL est correcte:", targetWebhook)
          const responseText = await response.text()
          console.error("[n8n] Réponse du serveur:", responseText)
          
          // Envoyer le message d'erreur immédiatement
          await sendErrorToClient("🔧 Notre système est temporairement indisponible. Nous travaillons activement à rétablir le service. Veuillez réessayer dans quelques instants.")
        } else if (!response.ok) {
          console.error("[n8n] Erreur HTTP:", response.status, response.statusText)
          const responseText = await response.text()
          console.error("[n8n] Réponse du serveur:", responseText)
          
          // Envoyer le message d'erreur immédiatement
          await sendErrorToClient("⚠️ Une erreur technique s'est produite. Notre équipe a été notifiée. Veuillez réessayer ou contactez le support si le problème persiste.")
        } else {
          console.log("[n8n] Webhook envoyé avec succès à l'agent:", hasExistingObjective ? "Modification" : "Création")
        }
      }).catch(async error => {
        console.error("[n8n] Erreur envoi webhook:", error)
        console.error("[n8n] Type d'erreur:", error.name)
        console.error("[n8n] Message d'erreur:", error.message)
        
        // Envoyer le message d'erreur immédiatement
        await sendErrorToClient("🌐 Impossible de contacter notre service IA. Vérifiez votre connexion internet ou réessayez dans quelques instants.")
      })
    
    // Retourner juste le strict minimum - le reste arrive par WebSocket
    return NextResponse.json({
      success: true,
      conversationId: conversation._id
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