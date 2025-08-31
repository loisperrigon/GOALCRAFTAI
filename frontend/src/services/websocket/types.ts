/**
 * Types et interfaces pour le service WebSocket
 */

// Types d'événements WebSocket
export enum WSEventType {
  // Client → Server
  USER_MESSAGE = 'user_message',
  GENERATE_OBJECTIVE = 'generate_objective',
  STOP_GENERATION = 'stop_generation',
  UPDATE_OBJECTIVE = 'update_objective',
  PING = 'ping',
  
  // Server → Client
  AI_MESSAGE_START = 'ai_message_start',
  AI_MESSAGE_CHUNK = 'ai_message_chunk',
  AI_MESSAGE_END = 'ai_message_end',
  AI_THINKING = 'ai_thinking',
  OBJECTIVE_GENERATED = 'objective_generated',
  OBJECTIVE_UPDATED = 'objective_updated',
  ERROR = 'error',
  PONG = 'pong',
  CONNECTION_ACK = 'connection_ack'
}

// Structure de base d'un message WebSocket
export interface WSMessage<T = any> {
  id: string
  type: WSEventType
  timestamp: number
  data: T
  metadata?: WSMetadata
}

// Métadonnées du message
export interface WSMetadata {
  userId?: string
  sessionId?: string
  conversationId?: string
  requestId?: string
  [key: string]: any
}

// Données pour les messages utilisateur
export interface UserMessageData {
  content: string
  context?: {
    currentObjective?: string
    previousMessages?: number
  }
}

// Données pour le streaming IA
export interface AIStreamData {
  messageId: string
  content: string
  isComplete: boolean
  tokenCount?: number
  model?: string
  stopReason?: 'complete' | 'max_tokens' | 'stop_sequence' | 'user_cancelled'
}

// Données pour la génération d'objectif
export interface ObjectiveGenerationData {
  prompt: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  category?: string
  preferences?: {
    duration?: string
    style?: 'detailed' | 'simple' | 'gamified'
  }
}

// Données pour l'objectif généré
export interface GeneratedObjectiveData {
  objective: {
    id: string
    title: string
    description: string
    skillTree: {
      nodes: any[]
      edges: any[]
    }
    metadata?: any
  }
  generationTime: number
  tokensUsed: number
}

// Données d'erreur
export interface ErrorData {
  code: string
  message: string
  details?: any
  retryable: boolean
}

// État de connexion WebSocket
export enum WSConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

// Configuration WebSocket
export interface WSConfig {
  url: string
  reconnect: boolean
  reconnectAttempts: number
  reconnectDelay: number
  reconnectDelayMax: number
  reconnectDecay: number
  timeout: number
  pingInterval: number
  debug: boolean
}

// Options pour l'envoi de messages
export interface SendOptions {
  retry?: boolean
  retryAttempts?: number
  priority?: 'high' | 'normal' | 'low'
  timeout?: number
}

// Callback pour les événements
export type WSEventCallback<T = any> = (data: T, message: WSMessage<T>) => void

// File d'attente de messages
export interface QueuedMessage {
  message: WSMessage
  options?: SendOptions
  timestamp: number
  attempts: number
}