import { NextRequest } from "next/server"
import clientPromise from "@/lib/mongodb"

// Map pour stocker les connexions SSE actives
const activeConnections = new Map<string, ReadableStreamDefaultController>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get("conversationId")
  const messageId = searchParams.get("messageId")
  
  if (!conversationId || !messageId) {
    return new Response("Paramètres manquants", { status: 400 })
  }
  
  console.log(`[SSE] Nouvelle connexion: ${conversationId}/${messageId}`)
  
  // Créer un stream pour Server-Sent Events
  const stream = new ReadableStream({
    async start(controller) {
      // Stocker la connexion
      const connectionKey = `${conversationId}-${messageId}`
      activeConnections.set(connectionKey, controller)
      
      // Envoyer un message initial
      const encoder = new TextEncoder()
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ 
          type: "connected", 
          message: "Connexion établie" 
        })}\n\n`)
      )
      
      // Fonction pour vérifier les mises à jour
      const checkForUpdates = async () => {
        try {
          const client = await clientPromise
          const db = client.db()
          
          const conversation = await db.collection("conversations").findOne({
            _id: conversationId
          })
          
          if (conversation) {
            // Récupérer les messages de l'assistant
            const assistantMessages = conversation.messages?.filter(
              (msg: any) => msg.role === "assistant"
            ) || []
            
            if (assistantMessages.length > 0) {
              const lastMessage = assistantMessages[assistantMessages.length - 1]
              
              // Envoyer la mise à jour
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: "message",
                  content: lastMessage.content,
                  isThinking: lastMessage.isThinking || false,
                  timestamp: lastMessage.timestamp
                })}\n\n`)
              )
              
              // Si l'IA ne réfléchit plus, fermer la connexion
              if (!lastMessage.isThinking && conversation.status === "completed") {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({
                    type: "complete",
                    message: "Réponse complète reçue"
                  })}\n\n`)
                )
                
                // Nettoyer et fermer
                activeConnections.delete(connectionKey)
                controller.close()
                return
              }
            }
          }
          
          // Continuer à vérifier toutes les 2 secondes
          setTimeout(checkForUpdates, 2000)
          
        } catch (error) {
          console.error("[SSE] Erreur:", error)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: "error",
              message: "Erreur de connexion"
            })}\n\n`)
          )
          activeConnections.delete(connectionKey)
          controller.close()
        }
      }
      
      // Démarrer la vérification après 1 seconde
      setTimeout(checkForUpdates, 1000)
    },
    
    cancel() {
      console.log("[SSE] Connexion fermée par le client")
    }
  })
  
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*"
    }
  })
}

// Fonction utilitaire pour notifier les clients SSE
export function notifySSEClients(conversationId: string, messageId: string, data: any) {
  const connectionKey = `${conversationId}-${messageId}`
  const controller = activeConnections.get(connectionKey)
  
  if (controller) {
    const encoder = new TextEncoder()
    try {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
      )
    } catch (error) {
      console.error("[SSE] Erreur envoi notification:", error)
      activeConnections.delete(connectionKey)
    }
  }
}