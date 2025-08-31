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
    if (!isAuthenticated) {
      setError("Vous devez être connecté pour utiliser le chat")
      return
    }

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
        // Mode normal
        const response = await aiClient.sendMessage(content, {
          conversationId: conversationId || undefined,
          objectiveType: options.objectiveType
        })

        setConversationId(response.conversationId)

        // Ajouter la réponse de l'assistant
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: response.response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])

        // Si un objectif a été généré
        if (response.objective) {
          if (options.onObjectiveGenerated) {
            options.onObjectiveGenerated(response.objective)
          }
          
          // Mettre à jour le store si configuré
          setCurrentObjective(response.objective)
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
  }, [isAuthenticated, conversationId, options, setCurrentObjective, streamingContent])

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