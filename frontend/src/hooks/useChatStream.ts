"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useWebSocket } from './useWebSocket'
import { WSEventType, AIStreamData } from '@/services/websocket/types'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  isStreaming?: boolean
  metadata?: {
    model?: string
    tokensUsed?: number
    duration?: number
  }
}

/**
 * Hook spécialisé pour gérer le streaming des messages du chat
 */
export function useChatStream() {
  const { on, sendMessage, generateObjective, stopGeneration, isConnected } = useWebSocket()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [isAIStreaming, setIsAIStreaming] = useState(false)
  const [currentStreamingMessageId, setCurrentStreamingMessageId] = useState<string | null>(null)
  const streamingContentRef = useRef<Map<string, string>>(new Map())

  useEffect(() => {
    // Écouter l'état "IA réfléchit"
    const unsubThinking = on(WSEventType.AI_THINKING, () => {
      setIsAIThinking(true)
      setIsAIStreaming(false)
    })

    // Début du streaming
    const unsubStart = on<AIStreamData>(WSEventType.AI_MESSAGE_START, (data) => {
      setIsAIThinking(false)
      setIsAIStreaming(true)
      setCurrentStreamingMessageId(data.messageId)
      
      // Créer un nouveau message vide
      const newMessage: ChatMessage = {
        id: data.messageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true
      }
      
      setMessages(prev => [...prev, newMessage])
      streamingContentRef.current.set(data.messageId, '')
    })

    // Réception des chunks
    const unsubChunk = on<any>(WSEventType.AI_MESSAGE_CHUNK, (data) => {
      const { messageId, content, accumulatedContent } = data
      
      // Mettre à jour le contenu accumulé
      streamingContentRef.current.set(messageId, accumulatedContent || '')
      
      // Mettre à jour le message dans la liste
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            content: accumulatedContent || msg.content + content
          }
        }
        return msg
      }))
    })

    // Fin du streaming
    const unsubEnd = on<any>(WSEventType.AI_MESSAGE_END, (data) => {
      const { messageId, content, duration, stopReason } = data
      
      setIsAIStreaming(false)
      setCurrentStreamingMessageId(null)
      
      // Finaliser le message
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            content: content || streamingContentRef.current.get(messageId) || msg.content,
            isStreaming: false,
            metadata: {
              ...msg.metadata,
              duration,
              stopReason
            }
          }
        }
        return msg
      }))
      
      // Nettoyer la référence
      streamingContentRef.current.delete(messageId)
    })

    // Gestion des erreurs
    const unsubError = on(WSEventType.ERROR, (error) => {
      console.error('Chat error:', error)
      setIsAIThinking(false)
      setIsAIStreaming(false)
      
      // Ajouter un message d'erreur
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: `Erreur: ${error.message || 'Une erreur est survenue'}`,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    })

    // Cleanup
    return () => {
      unsubThinking()
      unsubStart()
      unsubChunk()
      unsubEnd()
      unsubError()
    }
  }, [on])

  /**
   * Envoi d'un message utilisateur
   */
  const sendUserMessage = useCallback((content: string) => {
    if (!content.trim() || !isConnected) return

    // Ajouter le message utilisateur
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    
    // Envoyer au serveur
    const messageId = sendMessage(content, {
      previousMessages: messages.length
    })
    
    return messageId
  }, [isConnected, messages.length, sendMessage])

  /**
   * Demande de génération d'objectif basée sur la conversation
   */
  const requestObjectiveGeneration = useCallback((prompt?: string) => {
    const finalPrompt = prompt || messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join(' ')
    
    return generateObjective(finalPrompt)
  }, [messages, generateObjective])

  /**
   * Arrêt du streaming en cours
   */
  const stopCurrentStreaming = useCallback(() => {
    if (currentStreamingMessageId) {
      stopGeneration(currentStreamingMessageId)
      
      // Marquer le message comme terminé
      setMessages(prev => prev.map(msg => {
        if (msg.id === currentStreamingMessageId) {
          return {
            ...msg,
            isStreaming: false,
            content: msg.content + ' [Interrompu]'
          }
        }
        return msg
      }))
      
      setIsAIStreaming(false)
      setCurrentStreamingMessageId(null)
    }
  }, [currentStreamingMessageId, stopGeneration])

  /**
   * Effacer tous les messages
   */
  const clearMessages = useCallback(() => {
    setMessages([])
    streamingContentRef.current.clear()
  }, [])

  /**
   * Supprimer un message spécifique
   */
  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
  }, [])

  return {
    // État
    messages,
    isAIThinking,
    isAIStreaming,
    isConnected,
    currentStreamingMessageId,
    
    // Actions
    sendUserMessage,
    requestObjectiveGeneration,
    stopCurrentStreaming,
    clearMessages,
    deleteMessage
  }
}