import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/server/db-init"
import { z } from "zod"
import { getLastWebhookContext } from "@/lib/webhook-cache"
import { encrypt } from "@/lib/server/encryption"

// Vérifier le token secret du webhook
function verifyWebhookSecret(request: NextRequest): boolean {
  const webhookSecret = request.headers.get("x-webhook-secret")
  const expectedSecret = process.env.N8N_WEBHOOK_SECRET
  
  if (!expectedSecret) {
    console.error("[Webhook] N8N_WEBHOOK_SECRET non configuré")
    return false
  }
  
  return webhookSecret === expectedSecret
}

// Schema pour valider la réponse de n8n (IDs optionnels maintenant)
const webhookSchema = z.object({
  messageId: z.string().optional(),
  conversationId: z.string().optional(),
  type: z.enum(["message", "objective_start", "objective_step", "objective_complete"]), // Types pour génération progressive uniquement
  content: z.string().optional(), // Contenu du message (si type = "message")
  isFinal: z.boolean().optional().default(false), // L'IA décide si c'est son dernier message
  objectiveMetadata: z.object({ // Métadonnées de l'objectif (si type = "objective_start")
    id: z.string().optional(),
    title: z.string(),
    description: z.string(),
    category: z.string(),
    difficulty: z.string(),
    estimatedDuration: z.string(),
    totalSteps: z.number().optional()
  }).optional(),
  step: z.object({ // Une étape individuelle (si type = "objective_step")
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    xpReward: z.number().optional(),
    requiredLevel: z.number().optional(),
    dependencies: z.array(z.string()).optional(),
    optional: z.boolean().optional(),
    category: z.string().optional(), // Accepter n'importe quelle catégorie
    estimatedTime: z.string().optional(),
    position: z.object({
      x: z.number(),
      y: z.number()
    }).optional(),
    details: z.object({
      why: z.string(),
      howTo: z.array(z.string()),
      difficulty: z.string(),
      tools: z.array(z.any()),
      tips: z.array(z.string()),
      milestones: z.array(z.any())
    }).optional()
  }).optional(),
  isLastStep: z.boolean().optional().default(false), // Indique si c'est la dernière étape
  generationProgress: z.number().optional(), // Pourcentage de progression (0-100)
  metadata: z.any().optional()
})

// Route POST pour recevoir les réponses de n8n
export async function POST(request: NextRequest) {
  try {
    // Vérifier le token secret
    if (!verifyWebhookSecret(request)) {
      console.error("[Webhook] Token secret invalide")
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
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
      objectiveMetadata,
      step,
      isLastStep,
      generationProgress,
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
      // Ajouter un message de chat (CHIFFRÉ)
      await db.collection("conversations").updateOne(
        { _id: conversationId },
        {
          $push: {
            messages: {
              role: "assistant",
              content: encrypt(content || "Message reçu"), // Chiffrer le contenu
              timestamp: new Date(),
              metadata: metadata,
              isFinal: isFinal
            }
          },
          $set: {
            status: isFinal ? "waiting_for_generation" : "ai_responding", // Ne pas mettre "completed" si on attend une génération
            lastResponse: encrypt(content || ""), // Chiffrer aussi lastResponse
            lastResponseAt: new Date()
          }
        }
      )
    } else if (type === "objective_start" && objectiveMetadata) {
      // Début de la génération progressive d'un objectif
      console.log("[Webhook] Début de génération progressive:", objectiveMetadata.title)
      
      // Créer l'objectif avec statut "generating"
      const newObjective = await db.collection("objectives").insertOne({
        userId: conversation.userId,
        conversationId: conversationId,
        ...objectiveMetadata,
        status: "generating",
        skillTree: { nodes: [], edges: [] }, // Arbre vide pour commencer
        generationProgress: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      // Sauvegarder l'ID de l'objectif ET le messageId original dans la conversation
      await db.collection("conversations").updateOne(
        { _id: conversationId },
        {
          $set: {
            objectiveId: newObjective.insertedId, // Ajouter objectiveId pour la relation permanente
            currentObjectiveId: newObjective.insertedId,
            status: "generating_objective",
            originalMessageId: conversation.lastMessageId // Garder le messageId original
          }
        }
      )
    } else if (type === "objective_step" && step) {
      // Ajout d'une étape à l'objectif en cours de génération
      console.log("[Webhook] Ajout d'une étape:", step.title)
      
      // Récupérer l'objectif en cours
      const objectiveId = conversation.currentObjectiveId
      if (!objectiveId) {
        console.error("[Webhook] Pas d'objectif en cours de génération")
        return NextResponse.json(
          { error: "Pas d'objectif en cours de génération" },
          { status: 400 }
        )
      }
      
      // Importer ObjectId pour la conversion
      const { ObjectId } = await import("mongodb")
      
      // Ajouter l'étape à l'objectif
      await db.collection("objectives").updateOne(
        { _id: new ObjectId(objectiveId) },
        {
          $push: {
            "skillTree.nodes": {
              ...step,
              completed: false,
              unlocked: !step.dependencies || step.dependencies.length === 0
            }
          },
          $set: {
            generationProgress: generationProgress || 50,
            updatedAt: new Date()
          }
        }
      )
      
      // Ajouter les edges si des dépendances existent
      if (step.dependencies && step.dependencies.length > 0) {
        const edges = step.dependencies.map(depId => ({
          id: `edge-${depId}-${step.id}`,
          source: depId,
          target: step.id
        }))
        
        await db.collection("objectives").updateOne(
          { _id: new ObjectId(objectiveId) },
          {
            $push: {
              "skillTree.edges": { $each: edges }
            }
          }
        )
      }
    } else if (type === "objective_complete") {
      // Fin de la génération de l'objectif
      console.log("[Webhook] Génération de l'objectif terminée")
      
      const objectiveId = conversation.currentObjectiveId
      if (objectiveId) {
        // Importer ObjectId pour la conversion
        const { ObjectId } = await import("mongodb")
        
        // Marquer l'objectif comme complété
        const objective = await db.collection("objectives").findOneAndUpdate(
          { _id: new ObjectId(objectiveId) },
          {
            $set: {
              status: "active",
              generationProgress: 100,
              updatedAt: new Date()
            }
          },
          { returnDocument: "after" }
        )
        
        // Ajouter un message de confirmation
        await db.collection("conversations").updateOne(
          { _id: conversationId },
          {
            $push: {
              messages: {
                role: "assistant",
                content: `Votre parcours "${objective.value?.title}" est prêt ! J'ai créé ${objective.value?.skillTree?.nodes?.length || 0} étapes personnalisées pour vous.`,
                timestamp: new Date(),
                hasObjective: true,
                objectiveId: objectiveId
              }
            },
            $set: {
              status: "completed",
              hasObjective: true,
              objectiveId: objectiveId,
              lastResponseAt: new Date()
            }
          }
        )
      }
    }
    
    // Notifier les clients connectés via le serveur WebSocket
    const notifyWebSocket = async (data: any) => {
      try {
        const response = await fetch('http://localhost:3002/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            conversationId,
            data
          })
        })
        
        const result = await response.json()
        console.log(`[Webhook] Notification WebSocket: ${result.message}`)
      } catch (error) {
        console.error('[Webhook] Erreur envoi WebSocket:', error)
      }
    }
    
    // Envoyer la notification appropriée via WebSocket
    if (type === "objective_start" && objectiveMetadata) {
      console.log(`[Webhook] Notification WebSocket pour objective_start`)
      const objectiveId = conversation.currentObjectiveId
      await notifyWebSocket({
        type: "objective_started",
        objectiveId: objectiveId,
        conversationId: conversationId,
        objectiveMetadata: objectiveMetadata,
        message: `Création de votre parcours "${objectiveMetadata.title}"...`,
        generationProgress: 0
      })
    } else if (type === "objective_step" && step) {
      console.log(`[Webhook] Notification WebSocket pour step_added: ${step.title}`)
      await notifyWebSocket({
        type: "step_added",
        conversationId: conversationId,
        step: step,
        isLastStep: isLastStep,
        generationProgress: generationProgress || 50
      })
    } else if (type === "objective_complete") {
      const objectiveId = conversation.currentObjectiveId
      if (objectiveId) {
        // Récupérer l'objectif complet pour l'envoyer
        const completeObjective = await db.collection("objectives").findOne({ _id: objectiveId })
        console.log(`[Webhook] Notification WebSocket pour objective_completed`)
        await notifyWebSocket({
          type: "objective_completed",
          conversationId: conversationId,
          objective: completeObjective,
          message: `Parcours créé avec succès !`,
          generationProgress: 100
        })
      }
    } else if (type === "message") {
      await notifyWebSocket({
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