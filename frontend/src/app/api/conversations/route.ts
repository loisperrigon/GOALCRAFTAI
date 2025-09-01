import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/db-init"

// GET - Récupérer une conversation par ID ou la dernière
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("id")
    const withObjective = searchParams.get("withObjective") === "true"
    
    const db = await getDatabase()
    
    let conversation
    
    if (conversationId) {
      // Récupérer une conversation spécifique
      conversation = await db.collection("conversations").findOne({
        _id: conversationId
      })
    } else if (withObjective) {
      // Récupérer la dernière conversation qui a un objectif
      conversation = await db.collection("conversations")
        .findOne(
          { hasObjective: true },
          { sort: { updatedAt: -1 } }
        )
    } else {
      // Récupérer la dernière conversation
      conversation = await db.collection("conversations")
        .findOne({}, { sort: { updatedAt: -1 } })
    }
    
    if (!conversation) {
      return NextResponse.json({
        success: true,
        conversation: null,
        messages: []
      })
    }
    
    // Formater les messages
    const formattedMessages = (conversation.messages || []).map((msg: any) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp || new Date()
    }))
    
    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation._id,
        userId: conversation.userId,
        hasObjective: conversation.hasObjective,
        objectiveId: conversation.objectiveId,
        status: conversation.status,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      },
      messages: formattedMessages
    })
    
  } catch (error) {
    console.error("[Conversations API] Erreur:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Erreur lors de la récupération de la conversation" 
      },
      { status: 500 }
    )
  }
}