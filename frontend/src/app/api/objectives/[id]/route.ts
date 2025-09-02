import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/db-init"
import { ObjectId } from "mongodb"

// GET - Récupérer un objectif spécifique par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const objectiveId = params.id
    console.log("[Objective API] Récupération de l'objectif:", objectiveId)
    
    const db = await getDatabase()
    
    // Convertir l'ID string en ObjectId MongoDB
    const objective = await db.collection("objectives").findOne({
      _id: new ObjectId(objectiveId)
    })
    
    if (!objective) {
      return NextResponse.json(
        { 
          success: false,
          error: "Objectif non trouvé" 
        },
        { status: 404 }
      )
    }
    
    // Formater l'objectif pour le frontend
    const formattedObjective = {
      id: objective._id,
      title: objective.title || "Sans titre",
      description: objective.description || "",
      category: objective.category || "general",
      difficulty: objective.difficulty || "intermediate",
      estimatedDuration: objective.estimatedDuration || "Non défini",
      skillTree: objective.skillTree || { nodes: [], edges: [] },
      progress: objective.progress || 0,
      completedSteps: objective.completedSteps || [],
      unlockedSteps: objective.unlockedSteps || [],
      createdAt: objective.createdAt || new Date(),
      updatedAt: objective.updatedAt || new Date(),
      userId: objective.userId || "anonymous",
      conversationId: objective.conversationId
    }
    
    return NextResponse.json({
      success: true,
      objective: formattedObjective
    })
    
  } catch (error) {
    console.error("[Objective API] Erreur:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Erreur lors de la récupération de l'objectif" 
      },
      { status: 500 }
    )
  }
}