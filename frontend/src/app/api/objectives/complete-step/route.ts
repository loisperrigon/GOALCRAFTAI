import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDatabase } from "@/lib/server/db-init"
import { z } from "zod"

// Schéma de validation
const completeStepSchema = z.object({
  objectiveId: z.string(),
  stepId: z.string(),
  completed: z.boolean().default(true), // true pour compléter, false pour déverrouiller
})

// Route POST pour marquer une étape comme complétée/débloquée
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    const body = await request.json()
    
    // Validation
    const validationResult = completeStepSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.flatten() },
        { status: 400 }
      )
    }
    
    const { objectiveId, stepId, completed } = validationResult.data
    
    // Récupérer la base de données
    const db = await getDatabase()
    const { ObjectId } = await import("mongodb")
    
    // Vérifier que l'objectif appartient bien à l'utilisateur
    const objective = await db.collection("objectives").findOne({
      _id: new ObjectId(objectiveId),
      userId: userId
    })
    
    if (!objective) {
      return NextResponse.json(
        { error: "Objectif non trouvé ou non autorisé" },
        { status: 404 }
      )
    }
    
    // Trouver le node dans le skillTree
    const nodeIndex = objective.skillTree?.nodes?.findIndex((n: any) => n.id === stepId)
    if (nodeIndex === -1 || nodeIndex === undefined) {
      return NextResponse.json(
        { error: "Étape non trouvée dans l'objectif" },
        { status: 404 }
      )
    }
    
    // Mettre à jour le statut du node
    const updatePath = `skillTree.nodes.${nodeIndex}.completed`
    await db.collection("objectives").updateOne(
      { _id: new ObjectId(objectiveId) },
      {
        $set: {
          [updatePath]: completed,
          updatedAt: new Date()
        }
      }
    )
    
    // Si on complète une étape, débloquer les étapes suivantes
    if (completed) {
      const completedNode = objective.skillTree.nodes[nodeIndex]
      
      // Trouver tous les nodes qui dépendent uniquement de cette étape
      const nodesToUnlock = objective.skillTree.nodes
        .filter((node: any, idx: number) => {
          // Vérifier si ce node a comme seule dépendance le node qu'on vient de compléter
          return node.dependencies?.length === 1 && 
                 node.dependencies[0] === stepId &&
                 !node.unlocked
        })
        .map((node: any) => node.id)
      
      // Débloquer ces nodes
      if (nodesToUnlock.length > 0) {
        const bulkOps = nodesToUnlock.map((nodeId: string) => {
          const idx = objective.skillTree.nodes.findIndex((n: any) => n.id === nodeId)
          return {
            updateOne: {
              filter: { _id: new ObjectId(objectiveId) },
              update: {
                $set: {
                  [`skillTree.nodes.${idx}.unlocked`]: true
                }
              }
            }
          }
        })
        
        await db.collection("objectives").bulkWrite(bulkOps)
        
        console.log(`[CompleteStep] Débloqué ${nodesToUnlock.length} nouvelles étapes`)
      }
      
      // Mettre à jour les statistiques globales
      const completedSteps = objective.skillTree.nodes.filter((n: any) => n.completed).length + 1
      const totalSteps = objective.skillTree.nodes.length
      const progress = Math.round((completedSteps / totalSteps) * 100)
      const totalXP = objective.skillTree.nodes
        .filter((n: any) => n.completed || n.id === stepId)
        .reduce((sum: number, n: any) => sum + (n.xpReward || 0), 0)
      
      await db.collection("objectives").updateOne(
        { _id: new ObjectId(objectiveId) },
        {
          $set: {
            progress: progress,
            completedSteps: completedSteps,
            totalXP: totalXP
          }
        }
      )
      
      // Mettre à jour les XP de l'utilisateur
      await db.collection("users").updateOne(
        { _id: userId },
        {
          $inc: {
            totalXP: completedNode.xpReward || 0,
            stepsCompleted: 1
          },
          $set: {
            lastActivity: new Date()
          }
        }
      )
    }
    
    // Récupérer l'objectif mis à jour
    const updatedObjective = await db.collection("objectives").findOne({
      _id: new ObjectId(objectiveId)
    })
    
    return NextResponse.json({
      success: true,
      stepId,
      completed,
      progress: updatedObjective?.progress,
      totalXP: updatedObjective?.totalXP,
      message: completed ? "Étape complétée avec succès" : "Étape déverrouillée"
    })
    
  } catch (error) {
    console.error("[CompleteStep] Erreur:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// GET pour récupérer le statut d'une étape
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const objectiveId = searchParams.get("objectiveId")
    const stepId = searchParams.get("stepId")
    
    if (!objectiveId || !stepId) {
      return NextResponse.json(
        { error: "objectiveId et stepId requis" },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    const { ObjectId } = await import("mongodb")
    
    const objective = await db.collection("objectives").findOne({
      _id: new ObjectId(objectiveId),
      userId: session.user.id
    })
    
    if (!objective) {
      return NextResponse.json(
        { error: "Objectif non trouvé" },
        { status: 404 }
      )
    }
    
    const node = objective.skillTree?.nodes?.find((n: any) => n.id === stepId)
    if (!node) {
      return NextResponse.json(
        { error: "Étape non trouvée" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      stepId,
      completed: node.completed || false,
      unlocked: node.unlocked || false,
      title: node.title,
      xpReward: node.xpReward
    })
    
  } catch (error) {
    console.error("[CompleteStep GET] Erreur:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}