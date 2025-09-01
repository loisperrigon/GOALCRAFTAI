"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useObjectiveStore } from '@/stores/objective-store'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  isStreaming?: boolean
  isFinal?: boolean
}

interface SSEData {
  type: 'message' | 'objective_created' | 'thinking'
  content?: string
  objective?: any
  message?: string
  isFinal?: boolean
  isThinking?: boolean
}

export function useSSEChat() {
  const router = useRouter()
  const { setActiveObjective } = useObjectiveStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messageId, setMessageId] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Fonction pour envoyer un message
  const sendMessage = useCallback(async (message: string) => {
    try {
      // Ajouter le message utilisateur
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])
      setIsAIThinking(true)

      // Envoyer au backend
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message,
          conversationId: conversationId 
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message')
      }

      const data = await response.json()
      setConversationId(data.conversationId)
      setMessageId(data.messageId)

      // Se connecter au SSE pour recevoir la réponse
      connectToSSE(data.conversationId, data.messageId)

    } catch (error) {
      console.error('[Chat] Erreur:', error)
      setIsAIThinking(false)
      
      // Ajouter un message d'erreur
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }, [conversationId])

  // Fonction pour se connecter au SSE
  const connectToSSE = useCallback((convId: string, msgId: string) => {
    // Fermer la connexion existante
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    // Créer une nouvelle connexion SSE
    const eventSource = new EventSource(`/api/ai/sse?conversationId=${convId}&messageId=${msgId}`)
    eventSourceRef.current = eventSource

    // Message de l'IA
    eventSource.addEventListener('message', (event) => {
      try {
        const data: SSEData = JSON.parse(event.data)
        console.log('[SSE] Message reçu:', data)

        if (data.type === 'message') {
          setIsAIThinking(false)
          
          // Ajouter ou mettre à jour le message de l'IA
          const aiMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: data.content || '',
            timestamp: new Date(),
            isFinal: data.isFinal
          }
          
          setMessages(prev => {
            // Remplacer le message "thinking" s'il existe
            const filtered = prev.filter(m => !m.isStreaming)
            return [...filtered, aiMessage]
          })

          // Si c'est le message final, fermer la connexion
          if (data.isFinal) {
            eventSource.close()
            eventSourceRef.current = null
          }
        } else if (data.type === 'objective_created' && data.objective) {
          console.log('[SSE] Objectif reçu:', data.objective)
          setIsAIThinking(false)
          
          // Stocker l'objectif dans le store
          setActiveObjective({
            id: `obj-${Date.now()}`,
            ...data.objective,
            progress: 0,
            completedSteps: [],
            unlockedSteps: data.objective.skillTree.nodes
              .filter((n: any) => n.dependencies.length === 0)
              .map((n: any) => n.id),
            createdAt: new Date(),
            updatedAt: new Date()
          })

          // Ajouter un message de confirmation
          const successMessage: ChatMessage = {
            id: `success-${Date.now()}`,
            role: 'assistant',
            content: data.message || `J'ai créé votre parcours "${data.objective.title}" ! Vous pouvez maintenant voir votre arbre de progression.`,
            timestamp: new Date(),
            isFinal: true
          }
          setMessages(prev => [...prev, successMessage])

          // Fermer la connexion SSE
          eventSource.close()
          eventSourceRef.current = null

          // Rediriger vers la page objectives après un court délai
          setTimeout(() => {
            router.push('/objectives')
          }, 2000)
        }
      } catch (error) {
        console.error('[SSE] Erreur parsing:', error)
      }
    })

    // État "thinking"
    eventSource.addEventListener('thinking', () => {
      setIsAIThinking(true)
    })

    // Gestion des erreurs
    eventSource.onerror = (error) => {
      console.error('[SSE] Erreur connexion:', error)
      setIsAIThinking(false)
      eventSource.close()
      eventSourceRef.current = null
    }

  }, [setActiveObjective, router])

  // Nettoyer à la destruction du composant
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  return {
    messages,
    isAIThinking,
    sendMessage,
    conversationId
  }
}