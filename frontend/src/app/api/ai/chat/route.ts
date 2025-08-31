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
    // Vérifier l'authentification (optionnel - tout le monde peut tester)
    const session = await getServerSession(authOptions)
    
    // Utiliser l'user authentifié OU un user anonyme
    const userId = session?.user?.id || `anon-${request.headers.get("x-forwarded-for") || "unknown"}`
    const userName = session?.user?.name || "Utilisateur"
    const userEmail = session?.user?.email || "anonymous@example.com"

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

    // Connexion à MongoDB
    const client = await clientPromise
    const db = client.db()
    
    let conversation
    if (conversationId) {
      // Récupérer la conversation existante
      conversation = await db.collection("conversations").findOne({
        _id: conversationId,
        userId: userId
      })
    }

    if (!conversation) {
      // Créer une nouvelle conversation
      const result = await db.collection("conversations").insertOne({
        userId: userId,
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
    console.log("[n8n] Appel webhook:", N8N_WEBHOOK_URL)
    console.log("[n8n] Payload:", { userId, message, objectiveType })
    
    try {
      const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          message,
          conversationId: conversation._id.toString(),
          objectiveType: objectiveType || "general",
          messageCount: (conversation.messages?.length || 0) + 1,
          context: {
            userName: userName,
            userEmail: userEmail,
            previousMessages: conversation.messages?.slice(-10) || [], // Plus de contexte
            isFirstMessage: !conversation.messages || conversation.messages.length === 0
          }
        })
      })

      if (!n8nResponse.ok) {
        const errorText = await n8nResponse.text()
        console.error("[n8n] HTTP Error:", n8nResponse.status, errorText)
        throw new Error(`n8n HTTP ${n8nResponse.status}: ${errorText}`)
      }

      const responseText = await n8nResponse.text()
      console.log("[n8n] Réponse brute:", responseText)
      
      let aiResponse
      try {
        aiResponse = JSON.parse(responseText)
      } catch (parseError) {
        console.error("[n8n] Erreur parsing JSON:", parseError)
        throw new Error("Réponse n8n invalide")
      }

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
          userId: userId,
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
      console.error("[n8n] Erreur complète:", error)
      console.error("[n8n] Stack:", error instanceof Error ? error.stack : "N/A")
      
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
    const userId = session?.user?.id || `anon-${request.headers.get("x-forwarded-for") || "unknown"}`

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")

    const client = await clientPromise
    const db = client.db()

    if (conversationId) {
      // Récupérer une conversation spécifique
      const conversation = await db.collection("conversations").findOne({
        _id: conversationId,
        userId: userId
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
        .find({ userId: userId })
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