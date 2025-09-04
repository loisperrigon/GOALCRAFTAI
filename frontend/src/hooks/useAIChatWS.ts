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
    // Vérifier si une connexion est déjà active ou en cours
    if (wsRef.current) {
      const state = wsRef.current.readyState
      const url = wsRef.current.url
      
      // Si connexion en cours ou ouverte pour la même conversation, ne rien faire
      if ((state === WebSocket.CONNECTING || state === WebSocket.OPEN) && 
          url && url.includes(convId)) {
        console.log(`[useAIChatWS] WebSocket déjà connecté/en cours pour ${convId}`)
        return
      }
      
      // Fermer l'ancienne connexion si elle existe
      if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) {
        console.log("[useAIChatWS] Fermeture de l'ancienne connexion WebSocket")
        wsRef.current.close()
        wsRef.current = null
      }
    }
    
    console.log(`[useAIChatWS] Nouvelle connexion WebSocket pour conversation: ${convId}`)
    
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
        
        // console.log(`[useAIChatWS] Message reçu: ${data.type}`) // Commenté pour réduire les logs
        
        if (data.type === "connected") {
          console.log("[useAIChatWS] Connexion confirmée")
        } else if (data.type === "message") {
          // Mettre à jour le dernier message ou ajouter un nouveau message
          setMessages(prev => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            
            // Vérifier si on a déjà ce message d'erreur (éviter les doublons)
            if (data.isError) {
              const isDuplicate = newMessages.some(msg => 
                msg.role === "assistant" && 
                msg.content === data.content && 
                msg.isError === true
              )
              
              if (isDuplicate) {
                console.log("[WS] Message d'erreur dupliqué ignoré")
                return newMessages // Ignorer le doublon
              }
            }
            
            // Si c'est un message d'erreur ou si le dernier message n'est pas de l'assistant
            if (data.isError || !lastMessage || lastMessage.role !== "assistant") {
              // Ajouter un nouveau message
              return [...newMessages, {
                id: `msg-${Date.now()}`,
                role: "assistant" as const,
                content: data.content,
                timestamp: new Date(),
                isError: data.isError || false
              }]
            } else {
              // Mettre à jour le dernier message assistant
              lastMessage.content = data.content
              lastMessage.isError = data.isError || false
            }
            return newMessages
          })
          
          // Si c'est un message final ou d'erreur, arrêter le loading
          if (data.isFinal || data.isError) {
            setIsLoading(false)
          }
        } else if (data.type === "objective_started" && data.objectiveMetadata) {
          // Vérifier que c'est bien pour la conversation active
          if (data.conversationId && data.conversationId !== conversationId) {
            console.log(`[WS] Objective_started ignoré, conversationId différent: ${data.conversationId} != ${conversationId}`)
            return
          }
          
          // Vérifier aussi que l'objectif actuel correspond à cette conversation
          const currentObj = useObjectiveStore.getState().currentObjective
          if (currentObj && currentObj.conversationId && currentObj.conversationId !== conversationId) {
            console.log(`[WS] Objective_started ignoré, objectif actuel est pour une autre conversation`)
            return
          }
          
          // Début de la génération progressive
          console.log("[WS] Début de génération progressive:", data.objectiveMetadata.title)
          
          // Si on a un objectiveId et conversationId, mettre à jour l'objectif existant
          if (data.objectiveId && data.conversationId) {
            const { setActiveObjective } = useObjectiveStore.getState()
            // Forcer la mise à jour de l'objectif actuel avec le bon conversationId
            setActiveObjective({
              id: data.objectiveId,
              conversationId: data.conversationId, // S'assurer que le conversationId est correct
              ...data.objectiveMetadata,
              isGenerating: true,
              status: 'generating',
              skillTree: { nodes: [], edges: [] }
            })
          } else {
            const { startObjectiveGeneration } = useObjectiveStore.getState()
            startObjectiveGeneration({
              ...data.objectiveMetadata,
              conversationId: data.conversationId || conversationId
            })
          }
          
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
          // Vérifier que c'est bien pour la conversation active
          if (data.conversationId && data.conversationId !== conversationId) {
            console.log(`[WS] Step ignoré, conversationId différent: ${data.conversationId} != ${conversationId}`)
            return
          }
          
          // Vérifier aussi que l'objectif actuel correspond à cette conversation
          const currentObj = useObjectiveStore.getState().currentObjective
          if (currentObj && currentObj.conversationId !== conversationId) {
            console.log(`[WS] Step ignoré, objectif actuel est pour une autre conversation: ${currentObj.conversationId} != ${conversationId}`)
            return
          }
          
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
          
          const updatedObj = useObjectiveStore.getState().currentObjective
          const stepCount = updatedObj?.skillTree?.nodes.length || 0
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
          // Vérifier que c'est bien pour la conversation active
          if (data.conversationId && data.conversationId !== conversationId) {
            console.log(`[WS] Completion ignorée, conversationId différent: ${data.conversationId} != ${conversationId}`)
            return
          }
          
          // Vérifier aussi que l'objectif actuel correspond à cette conversation
          const currentObj = useObjectiveStore.getState().currentObjective
          if (currentObj && currentObj.conversationId !== conversationId) {
            console.log(`[WS] Completion ignorée, objectif actuel est pour une autre conversation: ${currentObj.conversationId} != ${conversationId}`)
            console.log(`[WS] Objectif actuel:`, currentObj.id, currentObj.title)
            return
          }
          
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
        } else if (data.type === "objective_update_started" && data.metadata) {
          // Début d'une mise à jour d'objectif
          if (data.conversationId && data.conversationId !== conversationId) {
            return
          }
          
          console.log("[WS] Début de mise à jour d'objectif")
          const { startObjectiveUpdate, updateObjectiveMetadata } = useObjectiveStore.getState()
          startObjectiveUpdate()
          if (data.metadata) {
            updateObjectiveMetadata(data.metadata)
          }
          
          // Ajouter un nouveau message au lieu de remplacer
          setMessages(prev => [
            ...prev,
            {
              role: "assistant" as const,
              content: data.message || "🔄 Mise à jour de votre parcours en cours...",
              timestamp: new Date().toISOString()
            }
          ])
        } else if (data.type === "node_added" && data.node) {
          // Ajout d'un nouveau node
          if (data.conversationId && data.conversationId !== conversationId) {
            return
          }
          
          console.log("[WS] Nouveau node ajouté:", data.node.title)
          const { addNodeToObjective, addEdgeToObjective, startObjectiveUpdate } = useObjectiveStore.getState()
          
          // Déclencher le mode update si pas déjà fait
          const currentObj = useObjectiveStore.getState().currentObjective
          if (currentObj && !currentObj.isGenerating) {
            startObjectiveUpdate()
          }
          
          addNodeToObjective(data.node)
          
          if (data.node.dependencies && data.node.dependencies.length > 0) {
            data.node.dependencies.forEach((depId: string) => {
              addEdgeToObjective({
                id: `edge-${depId}-${data.node.id}`,
                source: depId,
                target: data.node.id
              })
            })
          }
          
          // Ajouter un nouveau message au lieu de remplacer
          setMessages(prev => [
            ...prev,
            {
              role: "assistant" as const,
              content: data.message || `✅ Nouvelle étape ajoutée: "${data.node.title}"`,
              timestamp: new Date().toISOString()
            }
          ])
        } else if (data.type === "node_updated" && data.nodeId) {
          // Mise à jour d'un node existant
          if (data.conversationId && data.conversationId !== conversationId) {
            return
          }
          
          console.log("[WS] Node mis à jour:", data.nodeId)
          const { updateNodeInObjective, startObjectiveUpdate } = useObjectiveStore.getState()
          
          // Déclencher le mode update si pas déjà fait
          const currentObj = useObjectiveStore.getState().currentObjective
          if (currentObj && !currentObj.isGenerating) {
            startObjectiveUpdate()
          }
          
          if (data.updates) {
            updateNodeInObjective(data.nodeId, data.updates)
          }
          
          // Ajouter un nouveau message au lieu de remplacer
          setMessages(prev => [
            ...prev,
            {
              role: "assistant" as const,
              content: data.message || `📝 Étape modifiée`,
              timestamp: new Date().toISOString()
            }
          ])
        } else if (data.type === "node_deleted" && data.nodeId) {
          // Suppression d'un node
          if (data.conversationId && data.conversationId !== conversationId) {
            return
          }
          
          console.log("[WS] Node supprimé:", data.nodeId)
          const { deleteNodeFromObjective, startObjectiveUpdate } = useObjectiveStore.getState()
          
          // Déclencher le mode update si pas déjà fait
          const currentObj = useObjectiveStore.getState().currentObjective
          if (currentObj && !currentObj.isGenerating) {
            startObjectiveUpdate()
          }
          
          deleteNodeFromObjective(data.nodeId)
          
          // Ajouter un nouveau message au lieu de remplacer
          setMessages(prev => [
            ...prev,
            {
              role: "assistant" as const,
              content: data.message || `🗑️ Étape supprimée`,
              timestamp: new Date().toISOString()
            }
          ])
        } else if (data.type === "objective_update_completed") {
          // Fin de mise à jour de l'objectif
          if (data.conversationId && data.conversationId !== conversationId) {
            return
          }
          
          console.log("[WS] Fin de mise à jour d'objectif")
          const { completeObjectiveUpdate } = useObjectiveStore.getState()
          completeObjectiveUpdate()
          
          // Ajouter un nouveau message au lieu de remplacer
          setMessages(prev => [
            ...prev,
            {
              role: "assistant" as const,
              content: data.message || "✨ Modifications terminées avec succès !",
              timestamp: new Date().toISOString()
            }
          ])
          
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
    
    // Si on a un conversationId et qu'il est différent, mettre à jour
    if (existingConversationId && existingConversationId !== conversationId) {
      // Mettre à jour le conversationId (la connexion WebSocket sera gérée par useEffect)
      setConversationId(existingConversationId)
    }
  }, [conversationId])
  
  // Établir la connexion WebSocket quand conversationId est défini ou change
  useEffect(() => {
    if (!conversationId) {
      // Pas de conversationId, fermer toute connexion existante
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      return
    }
    
    // Vérifier si on a besoin de reconnecter
    const needsNewConnection = !wsRef.current || 
      wsRef.current.readyState === WebSocket.CLOSED ||
      wsRef.current.readyState === WebSocket.CLOSING ||
      (wsRef.current.url && !wsRef.current.url.includes(conversationId))
    
    if (needsNewConnection) {
      console.log(`[useAIChatWS] Établissement connexion WebSocket pour conversationId: ${conversationId}`)
      connectWebSocket(conversationId)
    }
    
    // Cleanup function pour fermer la connexion
    return () => {
      if (wsRef.current) {
        console.log("[useAIChatWS] Cleanup: fermeture de la connexion WebSocket")
        wsRef.current.close()
        wsRef.current = null
        setIsConnected(false)
      }
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
        
        // Pas de message temporaire - on laisse juste le loader
        // Les vrais messages arriveront via WebSocket
        return response
      }
    } catch (err) {
      console.error("Erreur chat IA:", err)
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
      
      // Ne pas ajouter de message fallback ici
      // Les messages d'erreur arrivent maintenant via WebSocket depuis l'API
      // qui gère proprement les différents cas d'erreur
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
      const state = wsRef.current.readyState
      if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) {
        console.log("[useAIChatWS] Fermeture de la connexion WebSocket")
        wsRef.current.close()
      }
      wsRef.current = null
      setIsConnected(false)
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
    disconnectWebSocket,
    setConversationId
  }
}