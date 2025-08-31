import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import clientPromise from "@/lib/mongodb"
import { z } from "zod"

const chatSchema = z.object({
  message: z.string().min(1).max(10000), // Permet des descriptions détaillées
  conversationId: z.string().optional(),
  objectiveType: z.string().optional(),
  action: z.enum(["chat", "generate_objective"]).optional().default("chat")
})

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "https://n8n.larefonte.store/webhook/333e2809-84c9-4bf7-bc9b-3c5c7aaceb49"

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validation
    const validationResult = chatSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Message invalide" },
        { status: 400 }
      )
    }

    const { message, conversationId, objectiveType } = validationResult.data

    // Sauvegarder le message utilisateur
    const client = await clientPromise
    const db = client.db()
    
    let conversation
    if (conversationId) {
      // Récupérer la conversation existante
      conversation = await db.collection("conversations").findOne({
        _id: conversationId,
        userId: session.user.id
      })
    }

    if (!conversation) {
      // Créer une nouvelle conversation
      const result = await db.collection("conversations").insertOne({
        userId: session.user.id,
        objectiveType: objectiveType || "general",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      conversation = { _id: result.insertedId, messages: [] }
    }

    // Ajouter le message utilisateur
    await db.collection("conversations").updateOne(
      { _id: conversation._id },
      {
        $push: {
          messages: {
            role: "user",
            content: message,
            timestamp: new Date()
          }
        },
        $set: { updatedAt: new Date() }
      }
    )

    // Appeler le webhook n8n
    try {
      const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          message,
          conversationId: conversation._id.toString(),
          objectiveType: objectiveType || "general",
          messageCount: (conversation.messages?.length || 0) + 1,
          context: {
            userName: session.user.name,
            userEmail: session.user.email,
            previousMessages: conversation.messages?.slice(-10) || [], // Plus de contexte
            isFirstMessage: !conversation.messages || conversation.messages.length === 0
          }
        })
      })

      if (!n8nResponse.ok) {
        console.error("n8n webhook error:", await n8nResponse.text())
        throw new Error("Erreur webhook n8n")
      }

      const aiResponse = await n8nResponse.json()

      // Sauvegarder la réponse IA
      await db.collection("conversations").updateOne(
        { _id: conversation._id },
        {
          $push: {
            messages: {
              role: "assistant",
              content: aiResponse.response || aiResponse.message || "Je réfléchis à votre objectif...",
              timestamp: new Date(),
              metadata: aiResponse.metadata
            }
          }
        }
      )

      // Si l'IA a généré un objectif (après discussion), le sauvegarder
      // L'IA peut répondre plusieurs fois avant de générer l'objectif final
      if (aiResponse.objective && aiResponse.action === "create_objective") {
        await db.collection("objectives").insertOne({
          userId: session.user.id,
          conversationId: conversation._id.toString(),
          ...aiResponse.objective,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }

      return NextResponse.json({
        conversationId: conversation._id.toString(),
        response: aiResponse.response || aiResponse.message,
        objective: aiResponse.objective, // Peut être null si on est encore en discussion
        action: aiResponse.action || "chat", // "chat" ou "create_objective"
        metadata: aiResponse.metadata
      })

    } catch (error) {
      console.error("n8n webhook error:", error)
      
      // Fallback response
      return NextResponse.json({
        conversationId: conversation._id.toString(),
        response: "Je comprends votre objectif. Pour le moment, je vais vous proposer un parcours type. Le système d'IA sera bientôt disponible pour personnaliser complètement votre expérience !",
        isFallback: true
      })
    }

  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// GET pour récupérer l'historique
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")

    const client = await clientPromise
    const db = client.db()

    if (conversationId) {
      // Récupérer une conversation spécifique
      const conversation = await db.collection("conversations").findOne({
        _id: conversationId,
        userId: session.user.id
      })

      if (!conversation) {
        return NextResponse.json(
          { error: "Conversation non trouvée" },
          { status: 404 }
        )
      }

      return NextResponse.json(conversation)
    } else {
      // Récupérer toutes les conversations
      const conversations = await db.collection("conversations")
        .find({ userId: session.user.id })
        .sort({ updatedAt: -1 })
        .limit(10)
        .toArray()

      return NextResponse.json(conversations)
    }
  } catch (error) {
    console.error("Get conversations error:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}