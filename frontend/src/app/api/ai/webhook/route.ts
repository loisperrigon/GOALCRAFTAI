import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { z } from "zod"

// Schema pour valider la réponse de n8n
const webhookSchema = z.object({
  messageId: z.string(),
  conversationId: z.string(),
  response: z.string(),
  action: z.enum(["chat", "create_objective"]).optional(),
  objective: z.any().optional(),
  isThinking: z.boolean().optional(),
  thinkingMessage: z.string().optional(),
  metadata: z.any().optional()
})

// Route POST pour recevoir les réponses de n8n
export async function POST(request: NextRequest) {
  try {
    console.log("[Webhook] Réception d'une réponse n8n")
    
    const body = await request.json()
    
    // Validation
    const validationResult = webhookSchema.safeParse(body)
    if (!validationResult.success) {
      console.error("[Webhook] Données invalides:", validationResult.error)
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      )
    }
    
    const { 
      messageId, 
      conversationId, 
      response, 
      action, 
      objective, 
      isThinking,
      metadata 
    } = validationResult.data
    
    console.log("[Webhook] Message ID:", messageId)
    console.log("[Webhook] Action:", action)
    console.log("[Webhook] Is Thinking:", isThinking)
    
    // Connexion à MongoDB
    const client = await clientPromise
    const db = client.db()
    
    // Retrouver la conversation
    const conversation = await db.collection("conversations").findOne({
      _id: conversationId,
      lastMessageId: messageId
    })
    
    if (!conversation) {
      console.error("[Webhook] Conversation non trouvée:", conversationId)
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      )
    }
    
    // Ajouter la réponse de l'IA à la conversation
    await db.collection("conversations").updateOne(
      { _id: conversationId },
      {
        $push: {
          messages: {
            role: "assistant",
            content: response,
            timestamp: new Date(),
            metadata: metadata,
            isThinking: isThinking
          }
        },
        $set: {
          status: isThinking ? "ai_thinking" : "completed",
          lastResponse: response,
          lastResponseAt: new Date()
        }
      }
    )
    
    // Si un objectif a été généré, le sauvegarder
    if (objective && action === "create_objective") {
      console.log("[Webhook] Sauvegarde de l'objectif généré")
      
      await db.collection("objectives").insertOne({
        userId: conversation.userId,
        conversationId: conversationId,
        ...objective,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
    
    // Notifier les clients connectés via Server-Sent Events ou WebSocket
    // (sera implémenté avec SSE dans la prochaine étape)
    
    return NextResponse.json({
      success: true,
      message: "Réponse traitée avec succès",
      isThinking: isThinking
    })
    
  } catch (error) {
    console.error("[Webhook] Erreur:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// Route GET pour vérifier le statut d'un message
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")
    const messageId = searchParams.get("messageId")
    
    if (!conversationId || !messageId) {
      return NextResponse.json(
        { error: "Paramètres manquants" },
        { status: 400 }
      )
    }
    
    const client = await clientPromise
    const db = client.db()
    
    const conversation = await db.collection("conversations").findOne({
      _id: conversationId,
      lastMessageId: messageId
    })
    
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      )
    }
    
    // Récupérer le dernier message de l'assistant
    const assistantMessages = conversation.messages?.filter(
      (msg: any) => msg.role === "assistant"
    ) || []
    
    const lastAssistantMessage = assistantMessages[assistantMessages.length - 1]
    
    return NextResponse.json({
      status: conversation.status,
      response: lastAssistantMessage?.content,
      isThinking: conversation.status === "ai_thinking",
      hasResponse: !!lastAssistantMessage
    })
    
  } catch (error) {
    console.error("[Webhook GET] Erreur:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}