import { getDatabase } from "@/lib/server/db-init";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// GET - Récupérer un objectif spécifique par ID (si l'utilisateur en est propriétaire)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }
    
    const { id: objectiveId } = await params;
    console.log("[Objective API] Récupération de l'objectif:", objectiveId, "pour l'utilisateur:", session.user.id);

    const db = await getDatabase();

    // Vérifier que l'objectif appartient à l'utilisateur
    const objective = await db.collection("objectives").findOne({
      _id: new ObjectId(objectiveId),
      userId: session.user.id
    });

    if (!objective) {
      return NextResponse.json(
        {
          success: false,
          error: "Objectif non trouvé",
        },
        { status: 404 }
      );
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
      conversationId: objective.conversationId,
    };

    return NextResponse.json({
      success: true,
      objective: formattedObjective,
    });
  } catch (error) {
    console.error("[Objective API] Erreur:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération de l'objectif",
      },
      { status: 500 }
    );
  }
}
