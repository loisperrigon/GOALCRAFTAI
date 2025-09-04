import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/server/db-init"
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
    
    // Vérifier s'il existe déjà une conversation vide (sans messages et sans objectif)
    const existingEmptyConversation = await db.collection("conversations").findOne({
      userId: userId,
      $or: [
        { messages: { $size: 0 } },
        { messages: { $exists: false } }
      ],
      $and: [
        { objectiveId: { $exists: false } },
        { currentObjectiveId: { $exists: false } }
      ]
    })
    
    if (existingEmptyConversation) {
      console.log("[Conversations/New] Conversation vide existante trouvée:", existingEmptyConversation._id)
      
      // Retourner la conversation vide existante au lieu d'en créer une nouvelle
      return NextResponse.json({
        success: true,
        conversationId: existingEmptyConversation._id,
        conversation: {
          id: existingEmptyConversation._id,
          messages: existingEmptyConversation.messages || [],
          status: existingEmptyConversation.status || "new",
          createdAt: existingEmptyConversation.createdAt,
          updatedAt: existingEmptyConversation.updatedAt
        },
        existing: true // Indique qu'on a réutilisé une conversation existante
      })
    }
    
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