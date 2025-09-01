import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/db-init"
import { z } from "zod"
import { getLastWebhookContext } from "@/lib/webhook-cache"

// Schema pour valider la réponse de n8n (IDs optionnels maintenant)
const webhookSchema = z.object({
  messageId: z.string().optional(),
  conversationId: z.string().optional(),
  type: z.enum(["message", "objective"]), // Seulement 2 types
  content: z.string().optional(), // Contenu du message (si type = "message")
  isFinal: z.boolean().optional().default(false), // L'IA décide si c'est son dernier message
  objective: z.object({ // Structure de l'objectif (si type = "objective")
    title: z.string(),
    description: z.string(),
    category: z.string(),
    difficulty: z.string(),
    estimatedDuration: z.string(),
    skillTree: z.object({
      nodes: z.array(z.any()),
      edges: z.array(z.any())
    })
  }).optional(),
  metadata: z.any().optional()
})

// Route POST pour recevoir les réponses de n8n
export async function POST(request: NextRequest) {
  try {
    console.log("[Webhook] Réception d'une réponse n8n")
    
    const rawBody = await request.json()
    
    // n8n peut envoyer soit directement les données, soit dans une structure action/parameters
    let body = rawBody
    if (rawBody.action === "WEBHOOK" && rawBody.parameters?.body) {
      console.log("[Webhook] Format n8n détecté, extraction du body depuis parameters.body")
      body = rawBody.parameters.body
    }
    
    // Validation
    const validationResult = webhookSchema.safeParse(body)
    if (!validationResult.success) {
      console.error("[Webhook] Données invalides:", validationResult.error)
      console.error("[Webhook] Body extrait:", JSON.stringify(body, null, 2))
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.flatten() },
        { status: 400 }
      )
    }
    
    let { 
      messageId, 
      conversationId, 
      type,
      content,
      objective, 
      isFinal,
      metadata 
    } = validationResult.data
    
    // Si n8n n'envoie pas les IDs, utiliser le cache
    if (!messageId || !conversationId) {
      const context = getLastWebhookContext()
      if (!context) {
        console.error("[Webhook] Pas de contexte trouvé dans le cache")
        return NextResponse.json(
          { error: "IDs manquants et pas de contexte en cache" },
          { status: 400 }
        )
      }
      messageId = messageId || context.messageId
      conversationId = conversationId || context.conversationId
      console.log("[Webhook] IDs récupérés du cache:", { messageId, conversationId })
    }
    
    console.log("[Webhook] Message ID:", messageId)
    console.log("[Webhook] Type:", type)
    console.log("[Webhook] Is Final:", isFinal)
    
    // Récupérer la base de données avec vérification de connexion
    const db = await getDatabase()
    
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
    
    // Traiter selon le type
    if (type === "message") {
      // Ajouter un message de chat
      await db.collection("conversations").updateOne(
        { _id: conversationId },
        {
          $push: {
            messages: {
              role: "assistant",
              content: content || "Message reçu",
              timestamp: new Date(),
              metadata: metadata,
              isFinal: isFinal
            }
          },
          $set: {
            status: isFinal ? "completed" : "ai_responding",
            lastResponse: content,
            lastResponseAt: new Date()
          }
        }
      )
    } else if (type === "objective" && objective) {
      // Sauvegarder l'objectif généré
      console.log("[Webhook] Sauvegarde de l'objectif généré")
      
      const newObjective = await db.collection("objectives").insertOne({
        userId: conversation.userId,
        conversationId: conversationId,
        ...objective,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      // Ajouter un message pour informer que l'objectif est créé
      await db.collection("conversations").updateOne(
        { _id: conversationId },
        {
          $push: {
            messages: {
              role: "assistant",
              content: `J'ai créé votre parcours personnalisé "${objective.title}" avec ${objective.skillTree.nodes.length} étapes !`,
              timestamp: new Date(),
              hasObjective: true,
              objectiveId: newObjective.insertedId
            }
          },
          $set: {
            status: "completed",
            hasObjective: true,
            objectiveId: newObjective.insertedId,
            lastResponseAt: new Date()
          }
        }
      )
    }
    
    // Notifier les clients connectés via SSE
    // Import dynamique pour éviter les problèmes de dépendances circulaires
    const { notifySSEClients } = await import("../sse/route")
    
    // Envoyer la notification appropriée
    if (type === "objective" && objective) {
      notifySSEClients(conversationId, messageId, {
        type: "objective_created",
        objective: objective,
        message: `Objectif "${objective.title}" créé avec succès !`
      })
    } else if (type === "message") {
      notifySSEClients(conversationId, messageId, {
        type: "message",
        content: content,
        isFinal: isFinal, // L'IA décide si elle a fini
        isThinking: !isFinal // Si pas final, elle réfléchit encore
      })
    }
    
    return NextResponse.json({
      success: true,
      message: "Réponse traitée avec succès",
      type: type,
      hasObjective: type === "objective"
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
    
    const db = await getDatabase()
    
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