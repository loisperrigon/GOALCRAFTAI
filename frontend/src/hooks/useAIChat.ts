import { useState, useCallback, useRef } from "react"
import { aiClient, ChatMessage, ChatResponse } from "@/lib/ai-client"
import { useObjectiveStore } from "@/stores/objective-store"
import { useUserStore } from "@/stores/user-store"

interface UseAIChatOptions {
  objectiveType?: string
  onObjectiveGenerated?: (objective: any) => void
  useStreaming?: boolean
}

export function useAIChat(options: UseAIChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [streamingContent, setStreamingContent] = useState("")
  
  const { setCurrentObjective } = useObjectiveStore()
  const { isAuthenticated } = useUserStore()
  
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    // Retirer la vérification d'authentification pour permettre l'accès anonyme
    // if (!isAuthenticated) {
    //   setError("Vous devez être connecté pour utiliser le chat")
    //   return
    // }

    setIsLoading(true)
    setError(null)
    
    // Ajouter le message utilisateur
    const userMessage: ChatMessage = {
      role: "user",
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    try {
      if (options.useStreaming) {
        // Mode streaming
        setStreamingContent("")
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: "",
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])

        await aiClient.streamMessage(
          content,
          {
            objectiveType: options.objectiveType,
            context: { conversationId }
          },
          (chunk) => {
            setStreamingContent(prev => prev + chunk)
            setMessages(prev => {
              const newMessages = [...prev]
              const lastMessage = newMessages[newMessages.length - 1]
              if (lastMessage && lastMessage.role === "assistant") {
                lastMessage.content = streamingContent + chunk
              }
              return newMessages
            })
          }
        )
      } else {
        // Mode normal avec webhook asynchrone
        const response = await aiClient.sendMessage(content, {
          conversationId: conversationId || undefined,
          objectiveType: options.objectiveType
        })

        setConversationId(response.conversationId)
        
        // Si on a un messageId, écouter les mises à jour via SSE
        if (response.messageId && response.status === "processing") {
          // Afficher un message temporaire
          const tempMessage: ChatMessage = {
            role: "assistant",
            content: "Je réfléchis à votre demande...",
            timestamp: new Date()
          }
          setMessages(prev => [...prev, tempMessage])
          
          // Se connecter au SSE pour recevoir les réponses
          const eventSource = new EventSource(
            `/api/ai/sse?conversationId=${response.conversationId}&messageId=${response.messageId}`
          )
          
          eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data)
            
            if (data.type === "message") {
              // Mettre à jour le dernier message
              setMessages(prev => {
                const newMessages = [...prev]
                const lastMessage = newMessages[newMessages.length - 1]
                if (lastMessage && lastMessage.role === "assistant") {
                  lastMessage.content = data.content
                }
                return newMessages
              })
              
              // Si l'IA a fini (elle décide)
              if (data.isFinal) {
                eventSource.close()
                setIsLoading(false)
              }
              // Sinon elle continue de réfléchir
            } else if (data.type === "objective_created" && data.objective) {
              // Un objectif a été créé !
              console.log("[SSE] Objectif reçu:", data.objective)
              
              // Mettre à jour le dernier message
              setMessages(prev => {
                const newMessages = [...prev]
                const lastMessage = newMessages[newMessages.length - 1]
                if (lastMessage && lastMessage.role === "assistant") {
                  lastMessage.content = data.message || "Objectif créé avec succès !"
                }
                return newMessages
              })
              
              // Mettre à jour le store avec le nouvel objectif
              setCurrentObjective(data.objective)
              
              // Appeler le callback si fourni
              if (options.onObjectiveGenerated) {
                options.onObjectiveGenerated(data.objective)
              }
              
              // Fermer la connexion
              eventSource.close()
              setIsLoading(false)
            } else if (data.type === "complete") {
              // Fermer la connexion SSE
              eventSource.close()
              setIsLoading(false)
            } else if (data.type === "error") {
              eventSource.close()
              setError("Erreur lors de la réception de la réponse")
              setIsLoading(false)
            }
          }
          
          eventSource.onerror = () => {
            eventSource.close()
            setIsLoading(false)
          }
        } else {
          // Réponse directe (fallback ou erreur)
          const assistantMessage: ChatMessage = {
            role: "assistant",
            content: response.response || response.message || "Message reçu",
            timestamp: new Date()
          }
          setMessages(prev => [...prev, assistantMessage])
        }

        return response
      }
    } catch (err) {
      console.error("Erreur chat IA:", err)
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
      
      // Ajouter un message d'erreur fallback
      const fallbackMessage: ChatMessage = {
        role: "assistant",
        content: "Je comprends votre demande. Pour le moment, laissez-moi vous proposer un parcours type qui pourra vous aider à démarrer. Notre système d'IA personnalisée sera bientôt disponible !",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, fallbackMessage])
    } finally {
      setIsLoading(false)
      setStreamingContent("")
    }
  }, [conversationId, options, setCurrentObjective, streamingContent])

  const clearMessages = useCallback(() => {
    setMessages([])
    setConversationId(null)
    setError(null)
    setStreamingContent("")
  }, [])

  const loadConversation = useCallback(async (convId: string) => {
    try {
      setIsLoading(true)
      const conversation = await aiClient.getConversation(convId)
      setMessages(conversation.messages || [])
      setConversationId(convId)
    } catch (err) {
      console.error("Erreur chargement conversation:", err)
      setError("Impossible de charger la conversation")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  return {
    messages,
    isLoading,
    error,
    conversationId,
    streamingContent,
    sendMessage,
    clearMessages,
    loadConversation,
    stopStreaming
  }
}