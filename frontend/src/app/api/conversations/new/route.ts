import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/db-init"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { getUniqueIdentifier } from "@/lib/rate-limiter"

// POST - Créer une nouvelle conversation vide
export async function POST(request: NextRequest) {
  try {
    console.log("[Conversations/New] Création d'une nouvelle conversation")
    
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    
    // Utiliser l'user authentifié OU un identifiant unique pour anonyme
    const uniqueId = getUniqueIdentifier(request)
    const userId = session?.user?.id || `anon-${uniqueId}`
    const userName = session?.user?.name || "Utilisateur"
    
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