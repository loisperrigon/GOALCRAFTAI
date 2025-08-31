import {
  WSMessage,
  WSEventType,
  AIStreamData,
  GeneratedObjectiveData,
  ErrorData
} from './types'

/**
 * Gestionnaire de messages pour traiter les différents types de messages WebSocket
 */
export class MessageHandler {
  private streamingMessages: Map<string, StreamingMessage> = new Map()
  
  /**
   * Traite un message entrant
   */
  processMessage(message: WSMessage): ProcessedMessage {
    switch (message.type) {
      case WSEventType.AI_MESSAGE_START:
        return this.handleAIMessageStart(message)
      
      case WSEventType.AI_MESSAGE_CHUNK:
        return this.handleAIMessageChunk(message)
      
      case WSEventType.AI_MESSAGE_END:
        return this.handleAIMessageEnd(message)
      
      case WSEventType.AI_THINKING:
        return this.handleAIThinking(message)
      
      case WSEventType.OBJECTIVE_GENERATED:
        return this.handleObjectiveGenerated(message)
      
      case WSEventType.ERROR:
        return this.handleError(message)
      
      default:
        return {
          type: message.type,
          data: message.data,
          processed: false
        }
    }
  }

  /**
   * Gère le début d'un message IA en streaming
   */
  private handleAIMessageStart(message: WSMessage<AIStreamData>): ProcessedMessage {
    const { messageId } = message.data
    
    this.streamingMessages.set(messageId, {
      id: messageId,
      content: '',
      chunks: [],
      startTime: Date.now(),
      isComplete: false
    })
    
    return {
      type: WSEventType.AI_MESSAGE_START,
      data: {
        messageId,
        timestamp: message.timestamp
      },
      processed: true
    }
  }

  /**
   * Gère un chunk de message IA
   */
  private handleAIMessageChunk(message: WSMessage<AIStreamData>): ProcessedMessage {
    const { messageId, content } = message.data
    const streamingMessage = this.streamingMessages.get(messageId)
    
    if (!streamingMessage) {
      console.warn(`Received chunk for unknown message: ${messageId}`)
      return {
        type: WSEventType.AI_MESSAGE_CHUNK,
        data: message.data,
        processed: false
      }
    }
    
    streamingMessage.content += content
    streamingMessage.chunks.push({
      content,
      timestamp: Date.now()
    })
    
    return {
      type: WSEventType.AI_MESSAGE_CHUNK,
      data: {
        messageId,
        content,
        accumulatedContent: streamingMessage.content,
        chunkIndex: streamingMessage.chunks.length - 1
      },
      processed: true
    }
  }

  /**
   * Gère la fin d'un message IA
   */
  private handleAIMessageEnd(message: WSMessage<AIStreamData>): ProcessedMessage {
    const { messageId, isComplete, stopReason } = message.data
    const streamingMessage = this.streamingMessages.get(messageId)
    
    if (!streamingMessage) {
      console.warn(`Received end for unknown message: ${messageId}`)
      return {
        type: WSEventType.AI_MESSAGE_END,
        data: message.data,
        processed: false
      }
    }
    
    streamingMessage.isComplete = true
    streamingMessage.endTime = Date.now()
    streamingMessage.duration = streamingMessage.endTime - streamingMessage.startTime
    
    const fullMessage = {
      messageId,
      content: streamingMessage.content,
      isComplete,
      stopReason,
      duration: streamingMessage.duration,
      chunkCount: streamingMessage.chunks.length,
      timestamp: message.timestamp
    }
    
    // Nettoyer le message de streaming
    this.streamingMessages.delete(messageId)
    
    return {
      type: WSEventType.AI_MESSAGE_END,
      data: fullMessage,
      processed: true
    }
  }

  /**
   * Gère l'état "IA réfléchit"
   */
  private handleAIThinking(message: WSMessage): ProcessedMessage {
    return {
      type: WSEventType.AI_THINKING,
      data: {
        isThinking: true,
        timestamp: message.timestamp,
        ...message.data
      },
      processed: true
    }
  }

  /**
   * Gère un objectif généré
   */
  private handleObjectiveGenerated(message: WSMessage<GeneratedObjectiveData>): ProcessedMessage {
    const { objective, generationTime, tokensUsed } = message.data
    
    return {
      type: WSEventType.OBJECTIVE_GENERATED,
      data: {
        objective: {
          ...objective,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        stats: {
          generationTime,
          tokensUsed
        }
      },
      processed: true
    }
  }

  /**
   * Gère les erreurs
   */
  private handleError(message: WSMessage<ErrorData>): ProcessedMessage {
    const { code, message: errorMessage, details, retryable } = message.data
    
    console.error('[WebSocket Error]', code, errorMessage, details)
    
    return {
      type: WSEventType.ERROR,
      data: {
        code,
        message: errorMessage,
        details,
        retryable,
        timestamp: message.timestamp
      },
      processed: true
    }
  }

  /**
   * Annule un message en streaming
   */
  cancelStreaming(messageId: string): boolean {
    if (this.streamingMessages.has(messageId)) {
      this.streamingMessages.delete(messageId)
      return true
    }
    return false
  }

  /**
   * Récupère l'état actuel d'un message en streaming
   */
  getStreamingState(messageId: string): StreamingMessage | undefined {
    return this.streamingMessages.get(messageId)
  }

  /**
   * Nettoie tous les messages en streaming
   */
  clearAllStreaming(): void {
    this.streamingMessages.clear()
  }
}

// Types internes
interface StreamingMessage {
  id: string
  content: string
  chunks: Array<{
    content: string
    timestamp: number
  }>
  startTime: number
  endTime?: number
  duration?: number
  isComplete: boolean
}

interface ProcessedMessage {
  type: WSEventType
  data: any
  processed: boolean
}

// Instance singleton
let instance: MessageHandler | null = null

export const getMessageHandler = (): MessageHandler => {
  if (!instance) {
    instance = new MessageHandler()
  }
  return instance
}

export default MessageHandler