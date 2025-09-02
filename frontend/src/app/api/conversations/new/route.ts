import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/db-init"
import { auth } from "@/lib/auth"
import { getUniqueIdentifier } from "@/lib/rate-limiter"

// POST - Créer une nouvelle conversation vide
export async function POST(request: NextRequest) {
  try {
    console.log("[Conversations/New] Création d'une nouvelle conversation")
    
    // Vérifier l'authentification - OBLIGATOIRE
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    const userName = session.user.name || "Utilisateur"
    
    const db = await getDatabase()
    
    // Créer un ID unique pour la conversation
    const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Créer la conversation vide
    const newConversation = {
      _id: conversationId,
      userId: userId,
      userName: userName,
      messages: [],
      status: "new",
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await db.collection("conversations").insertOne(newConversation)
    
    console.log("[Conversations/New] Nouvelle conversation créée:", conversationId)
    
    return NextResponse.json({
      success: true,
      conversationId: conversationId,
      conversation: {
        id: conversationId,
        messages: [],
        status: "new",
        createdAt: newConversation.createdAt,
        updatedAt: newConversation.updatedAt
      }
    })
    
  } catch (error) {
    console.error("[Conversations/New] Erreur:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Erreur lors de la création de la conversation" 
      },
      { status: 500 }
    )
  }
}