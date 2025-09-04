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
  type: z.enum([
    "message", 
    "objective_start", 
    "objective_step", 
    "objective_complete",
    // Nouveaux types pour modifications
    "objective_update",  // Mise à jour des métadonnées
    "objective_update_complete", // Fin de mise à jour
    "node_add",         // Ajout d'un nouveau node
    "node_update",      // Modification d'un node existant
    "node_delete"       // Suppression d'un node
  ]),
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
    title: z.string().optional(), // Optionnel pour permettre node_delete
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
  nodeId: z.string().optional(), // ID du node pour node_update ou node_delete
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
      nodeId,
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
    } else if (type === "objective_update" && objectiveMetadata) {
      // Mise à jour des métadonnées d'un objectif existant
      console.log("[Webhook] Mise à jour de l'objectif")
      
      const objectiveId = conversation.currentObjectiveId || conversation.objectiveId
      if (objectiveId) {
        const { ObjectId } = await import("mongodb")
        
        await db.collection("objectives").updateOne(
          { _id: new ObjectId(objectiveId) },
          {
            $set: {
              ...objectiveMetadata,
              status: "generating",
              updatedAt: new Date()
            }
          }
        )
        
        await db.collection("conversations").updateOne(
          { _id: conversationId },
          {
            $set: {
              status: "updating_objective"
            }
          }
        )
      }
    } else if (type === "node_add" && step) {
      // Ajout d'un nouveau node à l'objectif existant
      console.log("[Webhook] Ajout d'un node:", step.title)
      
      const objectiveId = conversation.currentObjectiveId || conversation.objectiveId
      if (objectiveId) {
        const { ObjectId } = await import("mongodb")
        
        // Ajouter le nouveau node
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
              updatedAt: new Date()
            }
          }
        )
        
        // Ajouter les edges si nécessaire
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
      }
    } else if (type === "node_update" && step) {
      // Modification d'un node existant
      console.log("[Webhook] Mise à jour du node:", step.id)
      
      const objectiveId = conversation.currentObjectiveId || conversation.objectiveId
      if (objectiveId) {
        const { ObjectId } = await import("mongodb")
        
        // Récupérer l'objectif actuel
        const objective = await db.collection("objectives").findOne({
          _id: new ObjectId(objectiveId)
        })
        
        if (objective && objective.skillTree) {
          // Mettre à jour le node
          const updatedNodes = objective.skillTree.nodes.map(node => {
            if (node.id === step.id) {
              return { ...node, ...step }
            }
            return node
          })
          
          // Mettre à jour les edges si les dépendances ont changé
          let updatedEdges = objective.skillTree.edges || []
          if (step.dependencies) {
            // Supprimer les anciens edges pour ce node
            updatedEdges = updatedEdges.filter(edge => edge.target !== step.id)
            // Ajouter les nouveaux edges
            const newEdges = step.dependencies.map(depId => ({
              id: `edge-${depId}-${step.id}`,
              source: depId,
              target: step.id
            }))
            updatedEdges = [...updatedEdges, ...newEdges]
          }
          
          await db.collection("objectives").updateOne(
            { _id: new ObjectId(objectiveId) },
            {
              $set: {
                "skillTree.nodes": updatedNodes,
                "skillTree.edges": updatedEdges,
                updatedAt: new Date()
              }
            }
          )
        }
      }
    } else if (type === "node_delete" && (nodeId || step?.id)) {
      // Suppression d'un node - accepter nodeId ou step.id
      const nodeToDelete = nodeId || step?.id
      console.log("[Webhook] Suppression du node:", nodeToDelete)
      
      const objectiveId = conversation.currentObjectiveId || conversation.objectiveId
      if (objectiveId) {
        const { ObjectId } = await import("mongodb")
        
        // Récupérer l'objectif actuel
        const objective = await db.collection("objectives").findOne({
          _id: new ObjectId(objectiveId)
        })
        
        if (objective && objective.skillTree) {
          // Supprimer le node
          const updatedNodes = objective.skillTree.nodes.filter(
            node => node.id !== nodeToDelete
          )
          
          // Supprimer les edges liés
          const updatedEdges = (objective.skillTree.edges || []).filter(
            edge => edge.source !== nodeToDelete && edge.target !== nodeToDelete
          )
          
          // Mettre à jour les dépendances des autres nodes
          const finalNodes = updatedNodes.map(node => {
            if (node.dependencies && node.dependencies.includes(nodeToDelete)) {
              return {
                ...node,
                dependencies: node.dependencies.filter(dep => dep !== nodeToDelete)
              }
            }
            return node
          })
          
          await db.collection("objectives").updateOne(
            { _id: new ObjectId(objectiveId) },
            {
              $set: {
                "skillTree.nodes": finalNodes,
                "skillTree.edges": updatedEdges,
                totalSteps: finalNodes.length,
                updatedAt: new Date()
              }
            }
          )
        }
      }
    } else if (type === "objective_update_complete") {
      // Fin de la mise à jour de l'objectif
      console.log("[Webhook] Fin de mise à jour de l'objectif")
      
      const objectiveId = conversation.currentObjectiveId || conversation.objectiveId
      if (objectiveId) {
        const { ObjectId } = await import("mongodb")
        
        // Marquer l'objectif comme actif
        const objective = await db.collection("objectives").findOneAndUpdate(
          { _id: new ObjectId(objectiveId) },
          {
            $set: {
              status: "active",
              updatedAt: new Date()
            }
          },
          { returnDocument: "after" }
        )
        
        // Mettre à jour le statut de la conversation
        await db.collection("conversations").updateOne(
          { _id: conversationId },
          {
            $push: {
              messages: {
                role: "assistant",
                content: encrypt(`Les modifications de votre parcours "${objective.value?.title}" sont terminées !`),
                timestamp: new Date()
              }
            },
            $set: {
              status: "completed",
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
      console.log("[Webhook] Type objective_complete reçu")
      console.log("[Webhook] Conversation:", conversation._id)
      console.log("[Webhook] CurrentObjectiveId:", conversation.currentObjectiveId)
      
      const objectiveId = conversation.currentObjectiveId
      if (objectiveId) {
        // Récupérer l'objectif complet pour l'envoyer
        const completeObjective = await db.collection("objectives").findOne({ _id: objectiveId })
        console.log("[Webhook] Objectif trouvé:", completeObjective?.title)
        console.log("[Webhook] Notification WebSocket pour objective_completed")
        
        const notificationData = {
          type: "objective_completed",
          conversationId: conversationId,
          objective: completeObjective,
          message: `Parcours créé avec succès !`,
          generationProgress: 100
        }
        console.log("[Webhook] Données de notification:", JSON.stringify(notificationData, null, 2))
        
        await notifyWebSocket(notificationData)
      } else {
        console.error("[Webhook] Pas de currentObjectiveId trouvé dans la conversation!")
      }
    } else if (type === "objective_update" && objectiveMetadata) {
      console.log(`[Webhook] Notification WebSocket pour objective_update`)
      const objectiveId = conversation.currentObjectiveId || conversation.objectiveId
      await notifyWebSocket({
        type: "objective_update_started",
        objectiveId: objectiveId,
        conversationId: conversationId,
        metadata: objectiveMetadata,
        message: `Mise à jour de votre parcours...`
      })
    } else if (type === "node_add" && step) {
      console.log(`[Webhook] Notification WebSocket pour node_add: ${step.title}`)
      await notifyWebSocket({
        type: "node_added",
        conversationId: conversationId,
        node: step,
        message: `Nouvelle étape ajoutée: ${step.title}`
      })
    } else if (type === "node_update" && step) {
      console.log(`[Webhook] Notification WebSocket pour node_update: ${step.id}`)
      await notifyWebSocket({
        type: "node_updated",
        conversationId: conversationId,
        nodeId: step.id,
        updates: step,
        message: `Étape modifiée: ${step.title || step.id}`
      })
    } else if (type === "node_delete" && (nodeId || step?.id)) {
      const nodeToDelete = nodeId || step?.id
      console.log(`[Webhook] Notification WebSocket pour node_delete: ${nodeToDelete}`)
      await notifyWebSocket({
        type: "node_deleted",
        conversationId: conversationId,
        nodeId: nodeToDelete,
        message: `Étape supprimée`
      })
    } else if (type === "objective_update_complete") {
      console.log(`[Webhook] Notification WebSocket pour objective_update_complete`)
      const objectiveId = conversation.currentObjectiveId || conversation.objectiveId
      await notifyWebSocket({
        type: "objective_update_completed",
        objectiveId: objectiveId,
        conversationId: conversationId,
        message: `Modifications terminées !`
      })
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