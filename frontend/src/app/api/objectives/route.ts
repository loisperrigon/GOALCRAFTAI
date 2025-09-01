import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/db-init"

// GET - Récupérer tous les objectifs (sans filtre pour l'instant)
export async function GET(request: NextRequest) {
  try {
    console.log("[Objectives API] Récupération de tous les objectifs")
    
    // Récupérer la base de données
    const db = await getDatabase()
    
    // Récupérer TOUS les objectifs (pas de filtre par user pour l'instant)
    const objectives = await db.collection("objectives")
      .find({})
      .sort({ createdAt: -1 }) // Plus récents en premier
      .limit(50) // Limiter à 50 pour éviter de surcharger
      .toArray()
    
    console.log(`[Objectives API] ${objectives.length} objectifs trouvés`)
    
    // Formater les objectifs pour le frontend
    const formattedObjectives = objectives.map(obj => ({
      id: obj._id,
      title: obj.title || "Sans titre",
      description: obj.description || "",
      category: obj.category || "general",
      difficulty: obj.difficulty || "medium",
      estimatedDuration: obj.estimatedDuration || "Non défini",
      skillTree: obj.skillTree || { nodes: [], edges: [] },
      progress: obj.progress || 0,
      completedSteps: obj.completedSteps || [],
      unlockedSteps: obj.unlockedSteps || [],
      createdAt: obj.createdAt || new Date(),
      updatedAt: obj.updatedAt || new Date(),
      userId: obj.userId || "anonymous",
      conversationId: obj.conversationId
    }))
    
    return NextResponse.json({
      success: true,
      objectives: formattedObjectives,
      count: formattedObjectives.length
    })
    
  } catch (error) {
    console.error("[Objectives API] Erreur:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Erreur lors de la récupération des objectifs",
        objectives: [] 
      },
      { status: 500 }
    )
  }
}

// POST - Créer un nouvel objectif (optionnel, pour tester)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const db = await getDatabase()
    
    const newObjective = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
      progress: 0,
      completedSteps: [],
      unlockedSteps: body.skillTree?.nodes
        ?.filter((n: any) => !n.dependencies || n.dependencies.length === 0)
        ?.map((n: any) => n.id) || []
    }
    
    const result = await db.collection("objectives").insertOne(newObjective)
    
    return NextResponse.json({
      success: true,
      objectiveId: result.insertedId,
      message: "Objectif créé avec succès"
    })
    
  } catch (error) {
    console.error("[Objectives API] Erreur création:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Erreur lors de la création de l'objectif" 
      },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un objectif (pour le nettoyage)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const objectiveId = searchParams.get("id")
    
    if (!objectiveId) {
      return NextResponse.json(
        { error: "ID de l'objectif manquant" },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    
    const result = await db.collection("objectives").deleteOne({
      _id: objectiveId
    })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Objectif non trouvé" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: "Objectif supprimé avec succès"
    })
    
  } catch (error) {
    console.error("[Objectives API] Erreur suppression:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'objectif" },
      { status: 500 }
    )
  }
}