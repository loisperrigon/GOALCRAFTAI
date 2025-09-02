import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "https://n8n.larefonte.store/webhook/333e2809-84c9-4bf7-bc9b-3c5c7aaceb49"

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth()
    if (!session?.user?.id) {
      return new Response("Non authentifié", { status: 401 })
    }

    const body = await request.json()
    const { message, objectiveType, context } = body

    // Créer un stream pour la réponse
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Appeler n8n avec mode streaming
          const response = await fetch(N8N_WEBHOOK_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: session.user.id,
              message,
              objectiveType,
              stream: true, // Indiquer à n8n qu'on veut du streaming
              context: {
                userName: session.user.name,
                ...context
              }
            })
          })

          if (!response.ok) {
            throw new Error("Erreur webhook n8n")
          }

          // Si n8n supporte le streaming
          if (response.body) {
            const reader = response.body.getReader()
            
            while (true) {
              const { done, value } = await reader.read()
              
              if (done) {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"))
                break
              }

              // Transmettre les chunks au client
              controller.enqueue(value)
            }
          } else {
            // Fallback si pas de streaming
            const data = await response.json()
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          }
        } catch (error) {
          console.error("Stream error:", error)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              error: "Erreur de streaming",
              fallback: true 
            })}\n\n`)
          )
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      }
    })

  } catch (error) {
    console.error("Stream API error:", error)
    return new Response("Erreur serveur", { status: 500 })
  }
}