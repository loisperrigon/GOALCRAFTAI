import { useState, useCallback, useRef, useEffect } from "react"
import { aiClient, ChatMessage } from "@/lib/ai-client"
import { useObjectiveStore } from "@/stores/objective-store"
import { useUserStore } from "@/stores/user-store"

interface UseAIChatOptions {
  objectiveType?: string
  onObjectiveGenerated?: (objective: any) => void
  useStreaming?: boolean
}

export function useAIChatWS(options: UseAIChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [streamingContent, setStreamingContent] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  
  const { isAuthenticated } = useUserStore()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Fonction pour se connecter au WebSocket
  const connectWebSocket = useCallback((convId: string) => {
    // Si déjà connecté, ne rien faire
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("[useAIChatWS] WebSocket déjà connecté")
      return
    }
    
    console.log(`[useAIChatWS] Connexion WebSocket pour conversation: ${convId}`)
    
    const ws = new WebSocket(`ws://localhost:3002?conversationId=${convId}`)
    
    ws.onopen = () => {
      console.log("[useAIChatWS] WebSocket connecté")
      setIsConnected(true)
      // Nettoyer le timeout de reconnexion
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // Ignorer les heartbeats
        if (data.type === "heartbeat") {
          return
        }
        
        console.log(`[useAIChatWS] Message reçu: ${data.type}`)
        
        if (data.type === "connected") {
          console.log("[useAIChatWS] Connexion confirmée")
        } else if (data.type === "message") {
          // Mettre à jour le dernier message
          setMessages(prev => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            if (lastMessage && lastMessage.role === "assistant") {
              lastMessage.content = data.content
            }
            return newMessages
          })
        } else if (data.type === "objective_started" && data.objectiveMetadata) {
          // Début de la génération progressive
          console.log("[WS] Début de génération progressive:", data.objectiveMetadata.title)
          
          const { startObjectiveGeneration } = useObjectiveStore.getState()
          startObjectiveGeneration(data.objectiveMetadata)
          
          setMessages(prev => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            if (lastMessage && lastMessage.role === "assistant") {
              lastMessage.content = data.message || `Je crée votre parcours "${data.objectiveMetadata.title}"...`
            }
            return newMessages
          })
          
          if (options.onObjectiveGenerated) {
            options.onObjectiveGenerated(data.objectiveMetadata)
          }
        } else if (data.type === "step_added" && data.step) {
          // Ajout d'une étape
          console.log("[WS] Nouvelle étape:", data.step.title)
          
          const { addNodeToObjective, addEdgeToObjective, updateGenerationProgress } = useObjectiveStore.getState()
          
          addNodeToObjective(data.step)
          
          if (data.step.dependencies && data.step.dependencies.length > 0) {
            data.step.dependencies.forEach((depId: string) => {
              addEdgeToObjective({
                id: `edge-${depId}-${data.step.id}`,
                source: depId,
                target: data.step.id
              })
            })
          }
          
          if (data.generationProgress) {
            updateGenerationProgress(data.generationProgress)
          }
          
          const currentObj = useObjectiveStore.getState().currentObjective
          const stepCount = currentObj?.skillTree?.nodes.length || 0
          setMessages(prev => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            if (lastMessage && lastMessage.role === "assistant") {
              lastMessage.content = `Création en cours... ${stepCount} étapes générées`
              if (data.isLastStep) {
                lastMessage.content += ` ✨ Finalisation...`
              }
            }
            return newMessages
          })
        } else if (data.type === "objective_completed" && data.objective) {
          // Fin de la génération progressive
          console.log("[WS] Génération terminée:", data.objective.title)
          
          const { completeObjectiveGeneration } = useObjectiveStore.getState()
          completeObjectiveGeneration()
          
          setMessages(prev => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            if (lastMessage && lastMessage.role === "assistant") {
              lastMessage.content = data.message || `Votre parcours "${data.objective.title}" est prêt ! 🎯`
            }
            return newMessages
          })
          
          setIsLoading(false)
        }
      } catch (error) {
        console.error("[useAIChatWS] Erreur parsing message:", error)
      }
    }
    
    ws.onerror = (error) => {
      console.error("[useAIChatWS] Erreur WebSocket:", error)
      setIsConnected(false)
    }
    
    ws.onclose = () => {
      console.log("[useAIChatWS] WebSocket fermé")
      setIsConnected(false)
      wsRef.current = null
      
      // Reconnexion automatique après 3 secondes
      if (conversationId === convId) {
        console.log("[useAIChatWS] Tentative de reconnexion dans 3 secondes...")
        reconnectTimeoutRef.current = setTimeout(() => {
          if (conversationId === convId) {
            connectWebSocket(convId)
          }
        }, 3000)
      }
    }
    
    wsRef.current = ws
  }, [conversationId, options])
  
  // Fonction pour charger des messages existants
  const loadMessages = useCallback((existingMessages: ChatMessage[], existingConversationId?: string) => {
    console.log(`[useAIChatWS] Chargement de ${existingMessages.length} messages existants`)
    // Convertir les timestamps en objets Date
    const messagesWithDates = existingMessages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
    }))
    setMessages(messagesWithDates)
    
    // Si on a un conversationId et qu'il est différent, établir la connexion WebSocket
    if (existingConversationId && existingConversationId !== conversationId) {
      // Fermer l'ancienne connexion si elle existe
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      
      // Mettre à jour le conversationId
      setConversationId(existingConversationId)
      
      // Établir une nouvelle connexion WebSocket
      connectWebSocket(existingConversationId)
    }
  }, [conversationId, connectWebSocket])

  const sendMessage = useCallback(async (content: string) => {
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
        
        // Établir la connexion WebSocket si pas déjà fait
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          connectWebSocket(response.conversationId)
        }
        
        // Afficher un message temporaire pendant le traitement
        const tempMessage: ChatMessage = {
          role: "assistant",
          content: "Je réfléchis à votre demande...",
          timestamp: new Date()
        }
        setMessages(prev => [...prev, tempMessage])
        
        // Les messages arriveront via la connexion WebSocket
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
  }, [conversationId, options, streamingContent, connectWebSocket])

  const clearMessages = useCallback(() => {
    setMessages([])
    // NE PAS fermer la connexion WebSocket ici ! Elle doit rester persistante
    setError(null)
    setStreamingContent("")
  }, [])

  const loadConversation = useCallback(async (convId: string) => {
    try {
      setIsLoading(true)
      const conversation = await aiClient.getConversation(convId)
      setMessages(conversation.messages || [])
      setConversationId(convId)
      
      // Établir la connexion WebSocket pour cette conversation
      connectWebSocket(convId)
    } catch (err) {
      console.error("Erreur chargement conversation:", err)
      setError("Impossible de charger la conversation")
    } finally {
      setIsLoading(false)
    }
  }, [connectWebSocket])

  const stopStreaming = useCallback(() => {
    // Pour WebSocket, on pourrait envoyer un message d'arrêt si nécessaire
    console.log("[useAIChatWS] Arrêt du streaming")
  }, [])

  // Fonction pour fermer proprement la connexion WebSocket
  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      console.log("[useAIChatWS] Fermeture de la connexion WebSocket")
      wsRef.current.close()
      wsRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [])

  // Nettoyer à la destruction du composant
  useEffect(() => {
    return () => {
      disconnectWebSocket()
    }
  }, [disconnectWebSocket])

  return {
    messages,
    isLoading,
    error,
    conversationId,
    streamingContent,
    isConnected,
    sendMessage,
    clearMessages,
    loadMessages,
    loadConversation,
    stopStreaming,
    disconnectWebSocket
  }
}