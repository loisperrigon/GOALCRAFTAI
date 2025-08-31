"use client"

import { useEffect, useRef, useCallback, useState } from 'react'
import { getWebSocketService } from '@/services/websocket/WebSocketService'
import { 
  WSEventType, 
  WSConnectionState,
  WSEventCallback,
  UserMessageData,
  ObjectiveGenerationData
} from '@/services/websocket/types'

/**
 * Hook principal pour utiliser le service WebSocket
 */
export function useWebSocket() {
  const wsRef = useRef(getWebSocketService())
  const [connectionState, setConnectionState] = useState<WSConnectionState>(WSConnectionState.DISCONNECTED)
  const [isConnected, setIsConnected] = useState(false)

  // Connexion au montage
  useEffect(() => {
    const ws = wsRef.current

    // Écouter les changements d'état
    const unsubscribeState = ws.on('stateChange', (state: WSConnectionState) => {
      setConnectionState(state)
      setIsConnected(state === WSConnectionState.CONNECTED)
    })

    // Se connecter
    ws.connect().catch(error => {
      console.error('Failed to connect WebSocket:', error)
    })

    // Cleanup
    return () => {
      unsubscribeState()
      // Ne pas déconnecter ici car d'autres composants peuvent utiliser le service
    }
  }, [])

  /**
   * Envoi d'un message utilisateur
   */
  const sendMessage = useCallback((content: string, context?: any): string => {
    const data: UserMessageData = {
      content,
      context
    }
    return wsRef.current.send(WSEventType.USER_MESSAGE, data)
  }, [])

  /**
   * Demande de génération d'objectif
   */
  const generateObjective = useCallback((
    prompt: string,
    options?: Partial<ObjectiveGenerationData>
  ): string => {
    const data: ObjectiveGenerationData = {
      prompt,
      ...options
    }
    return wsRef.current.send(WSEventType.GENERATE_OBJECTIVE, data)
  }, [])

  /**
   * Arrêt de la génération en cours
   */
  const stopGeneration = useCallback((messageId?: string): string => {
    return wsRef.current.send(WSEventType.STOP_GENERATION, { messageId })
  }, [])

  /**
   * Écoute d'un événement
   */
  const on = useCallback(<T = any>(
    event: WSEventType | 'connected' | 'disconnected' | 'error',
    callback: WSEventCallback<T>
  ): (() => void) => {
    return wsRef.current.on(event, callback)
  }, [])

  /**
   * Écoute unique d'un événement
   */
  const once = useCallback(<T = any>(
    event: WSEventType | 'connected' | 'disconnected' | 'error',
    callback: WSEventCallback<T>
  ): (() => void) => {
    return wsRef.current.once(event, callback)
  }, [])

  /**
   * Retrait d'un écouteur
   */
  const off = useCallback((
    event: WSEventType | 'connected' | 'disconnected' | 'error',
    callback: Function
  ): void => {
    wsRef.current.off(event, callback)
  }, [])

  return {
    // État
    connectionState,
    isConnected,
    
    // Actions
    sendMessage,
    generateObjective,
    stopGeneration,
    
    // Événements
    on,
    once,
    off,
    
    // Service direct (pour cas avancés)
    ws: wsRef.current
  }
}