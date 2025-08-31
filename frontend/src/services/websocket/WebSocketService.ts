import {
  WSConfig,
  WSConnectionState,
  WSEventType,
  WSMessage,
  WSEventCallback,
  SendOptions,
  QueuedMessage
} from './types'
import { EventEmitter } from './events'

/**
 * Service WebSocket principal pour la communication temps réel
 */
export class WebSocketService {
  private ws: WebSocket | null = null
  private config: WSConfig
  private state: WSConnectionState = WSConnectionState.DISCONNECTED
  private reconnectAttempts = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private pingTimer: NodeJS.Timeout | null = null
  private messageQueue: QueuedMessage[] = []
  private eventEmitter: EventEmitter
  private currentStreamingMessages: Map<string, string> = new Map()
  
  constructor(config: Partial<WSConfig> = {}) {
    this.config = {
      url: config.url || 'ws://localhost:3001',
      reconnect: config.reconnect !== false,
      reconnectAttempts: config.reconnectAttempts || 5,
      reconnectDelay: config.reconnectDelay || 1000,
      reconnectDelayMax: config.reconnectDelayMax || 30000,
      reconnectDecay: config.reconnectDecay || 1.5,
      timeout: config.timeout || 20000,
      pingInterval: config.pingInterval || 30000,
      debug: config.debug || false
    }
    
    this.eventEmitter = new EventEmitter()
  }

  /**
   * Connexion au serveur WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.state === WSConnectionState.CONNECTED) {
        resolve()
        return
      }

      this.log('Connecting to WebSocket...')
      this.setState(WSConnectionState.CONNECTING)

      try {
        this.ws = new WebSocket(this.config.url)
        
        // Timeout de connexion
        const timeoutId = setTimeout(() => {
          if (this.state === WSConnectionState.CONNECTING) {
            this.ws?.close()
            reject(new Error('Connection timeout'))
          }
        }, this.config.timeout)

        this.ws.onopen = () => {
          clearTimeout(timeoutId)
          this.log('WebSocket connected')
          this.setState(WSConnectionState.CONNECTED)
          this.reconnectAttempts = 0
          this.startPing()
          this.flushQueue()
          this.eventEmitter.emit('connected')
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as WSMessage
            this.handleMessage(message)
          } catch (error) {
            this.log('Failed to parse message:', error)
          }
        }

        this.ws.onerror = (error) => {
          clearTimeout(timeoutId)
          this.log('WebSocket error:', error)
          this.eventEmitter.emit('error', error)
        }

        this.ws.onclose = (event) => {
          clearTimeout(timeoutId)
          this.log('WebSocket closed:', event.code, event.reason)
          this.setState(WSConnectionState.DISCONNECTED)
          this.stopPing()
          this.eventEmitter.emit('disconnected')
          
          if (this.config.reconnect && !event.wasClean) {
            this.scheduleReconnect()
          }
        }
      } catch (error) {
        this.log('Failed to create WebSocket:', error)
        reject(error)
      }
    })
  }

  /**
   * Déconnexion du WebSocket
   */
  disconnect(): void {
    this.config.reconnect = false
    this.clearReconnectTimer()
    this.stopPing()
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    
    this.setState(WSConnectionState.DISCONNECTED)
  }

  /**
   * Envoi d'un message
   */
  send<T = any>(type: WSEventType, data: T, options?: SendOptions): string {
    const message: WSMessage<T> = {
      id: this.generateId(),
      type,
      timestamp: Date.now(),
      data
    }

    if (this.state === WSConnectionState.CONNECTED && this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message))
        this.log('Message sent:', type, message.id)
      } catch (error) {
        this.log('Failed to send message:', error)
        this.queueMessage(message, options)
      }
    } else {
      this.queueMessage(message, options)
    }

    return message.id
  }

  /**
   * Écoute d'un événement
   */
  on<T = any>(event: WSEventType | 'connected' | 'disconnected' | 'error', callback: WSEventCallback<T>): () => void {
    return this.eventEmitter.on(event, callback)
  }

  /**
   * Écoute unique d'un événement
   */
  once<T = any>(event: WSEventType | 'connected' | 'disconnected' | 'error', callback: WSEventCallback<T>): () => void {
    return this.eventEmitter.once(event, callback)
  }

  /**
   * Retrait d'un écouteur
   */
  off(event: WSEventType | 'connected' | 'disconnected' | 'error', callback: Function): void {
    this.eventEmitter.off(event, callback)
  }

  /**
   * Gestion des messages reçus
   */
  private handleMessage(message: WSMessage): void {
    this.log('Message received:', message.type, message.id)

    // Gestion spéciale pour le streaming IA
    if (message.type === WSEventType.AI_MESSAGE_START) {
      const { messageId } = message.data
      this.currentStreamingMessages.set(messageId, '')
    } else if (message.type === WSEventType.AI_MESSAGE_CHUNK) {
      const { messageId, content } = message.data
      const current = this.currentStreamingMessages.get(messageId) || ''
      this.currentStreamingMessages.set(messageId, current + content)
      
      // Émettre le message accumulé
      message.data.accumulatedContent = this.currentStreamingMessages.get(messageId)
    } else if (message.type === WSEventType.AI_MESSAGE_END) {
      const { messageId } = message.data
      message.data.fullContent = this.currentStreamingMessages.get(messageId)
      this.currentStreamingMessages.delete(messageId)
    }

    // Émettre l'événement
    this.eventEmitter.emit(message.type, message.data, message)
  }

  /**
   * Planification de la reconnexion
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.reconnectAttempts) {
      this.log('Max reconnection attempts reached')
      this.setState(WSConnectionState.ERROR)
      return
    }

    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(this.config.reconnectDecay, this.reconnectAttempts),
      this.config.reconnectDelayMax
    )

    this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`)
    this.setState(WSConnectionState.RECONNECTING)
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      this.connect().catch(() => {
        // La reconnexion sera replanifiée dans onclose
      })
    }, delay)
  }

  /**
   * Annulation du timer de reconnexion
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  /**
   * Démarrage du ping
   */
  private startPing(): void {
    this.stopPing()
    this.pingTimer = setInterval(() => {
      if (this.state === WSConnectionState.CONNECTED) {
        this.send(WSEventType.PING, { timestamp: Date.now() })
      }
    }, this.config.pingInterval)
  }

  /**
   * Arrêt du ping
   */
  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  /**
   * Ajout d'un message à la file d'attente
   */
  private queueMessage(message: WSMessage, options?: SendOptions): void {
    this.messageQueue.push({
      message,
      options,
      timestamp: Date.now(),
      attempts: 0
    })
    
    this.log('Message queued:', message.type, message.id)
  }

  /**
   * Envoi des messages en file d'attente
   */
  private flushQueue(): void {
    const queue = [...this.messageQueue]
    this.messageQueue = []
    
    queue.forEach(({ message, options }) => {
      this.send(message.type, message.data, options)
    })
  }

  /**
   * Changement d'état
   */
  private setState(state: WSConnectionState): void {
    this.state = state
    this.eventEmitter.emit('stateChange', state)
  }

  /**
   * Génération d'ID unique
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Log de debug
   */
  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[WebSocket]', ...args)
    }
  }

  /**
   * Getters
   */
  get connectionState(): WSConnectionState {
    return this.state
  }

  get isConnected(): boolean {
    return this.state === WSConnectionState.CONNECTED
  }

  get queueSize(): number {
    return this.messageQueue.length
  }
}

// Instance singleton
let instance: WebSocketService | null = null

export const getWebSocketService = (config?: Partial<WSConfig>): WebSocketService => {
  if (!instance) {
    instance = new WebSocketService(config)
  }
  return instance
}

export default WebSocketService