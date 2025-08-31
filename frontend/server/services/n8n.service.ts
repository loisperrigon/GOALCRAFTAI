import axios from 'axios'
import { EventEmitter } from 'events'

export interface N8nWebhookPayload {
  conversationId: string
  messageId: string
  userId: string
  content: string
  context?: {
    objectiveId?: string
    previousMessages?: any[]
    userProfile?: any
  }
}

export interface N8nResponse {
  executionId: string
  status: 'success' | 'error'
  data?: any
  error?: string
}

class N8nService extends EventEmitter {
  private webhookUrl: string
  private apiKey?: string
  private activeStreams: Map<string, boolean> = new Map()

  constructor() {
    super()
    this.webhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook'
    this.apiKey = process.env.N8N_API_KEY
  }

  /**
   * Envoie un message au workflow n8n pour génération IA
   */
  async sendChatMessage(payload: N8nWebhookPayload): Promise<N8nResponse> {
    try {
      const response = await axios.post(
        `${this.webhookUrl}/chat`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(this.apiKey && { 'X-API-Key': this.apiKey })
          },
          timeout: 30000 // 30 secondes timeout
        }
      )

      return {
        executionId: response.data.executionId,
        status: 'success',
        data: response.data
      }
    } catch (error: any) {
      console.error('N8n webhook error:', error.message)
      return {
        executionId: 'error',
        status: 'error',
        error: error.message
      }
    }
  }

  /**
   * Génère un objectif via n8n
   */
  async generateObjective(
    prompt: string,
    userId: string,
    options?: {
      difficulty?: string
      category?: string
      duration?: string
    }
  ): Promise<N8nResponse> {
    try {
      const response = await axios.post(
        `${this.webhookUrl}/generate-objective`,
        {
          prompt,
          userId,
          ...options
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(this.apiKey && { 'X-API-Key': this.apiKey })
          },
          timeout: 60000 // 60 secondes pour la génération
        }
      )

      return {
        executionId: response.data.executionId,
        status: 'success',
        data: response.data.objective
      }
    } catch (error: any) {
      console.error('N8n objective generation error:', error.message)
      return {
        executionId: 'error',
        status: 'error',
        error: error.message
      }
    }
  }

  /**
   * Setup du streaming pour recevoir les chunks de n8n
   * n8n peut envoyer les chunks via webhook ou SSE
   */
  setupStreamingEndpoint(app: any): void {
    // Endpoint pour recevoir les chunks de n8n
    app.post('/api/n8n/stream-chunk', (req: any, res: any) => {
      const { messageId, chunk, isComplete } = req.body
      
      // Émettre le chunk aux listeners
      this.emit('chunk', {
        messageId,
        content: chunk,
        isComplete
      })
      
      res.json({ received: true })
    })

    // SSE endpoint pour le streaming (alternative)
    app.get('/api/n8n/stream/:messageId', (req: any, res: any) => {
      const { messageId } = req.params
      
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      })

      const sendChunk = (data: any) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`)
      }

      // Écouter les chunks pour ce message
      const chunkListener = (data: any) => {
        if (data.messageId === messageId) {
          sendChunk(data)
          if (data.isComplete) {
            this.removeListener('chunk', chunkListener)
            res.end()
          }
        }
      }

      this.on('chunk', chunkListener)

      // Cleanup on disconnect
      req.on('close', () => {
        this.removeListener('chunk', chunkListener)
        this.activeStreams.delete(messageId)
      })

      this.activeStreams.set(messageId, true)
    })
  }

  /**
   * Arrête un streaming en cours
   */
  stopStreaming(messageId: string): void {
    if (this.activeStreams.has(messageId)) {
      this.activeStreams.delete(messageId)
      this.emit('chunk', {
        messageId,
        content: '',
        isComplete: true,
        stopReason: 'user_cancelled'
      })
    }
  }

  /**
   * Teste la connexion à n8n
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.webhookUrl}/health`,
        {
          headers: this.apiKey ? { 'X-API-Key': this.apiKey } : {},
          timeout: 5000
        }
      )
      return response.status === 200
    } catch (error) {
      console.error('N8n connection test failed:', error)
      return false
    }
  }

  /**
   * Obtient le statut d'une exécution n8n
   */
  async getExecutionStatus(executionId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.webhookUrl}/execution/${executionId}`,
        {
          headers: this.apiKey ? { 'X-API-Key': this.apiKey } : {},
          timeout: 5000
        }
      )
      return response.data
    } catch (error) {
      console.error('Failed to get execution status:', error)
      return null
    }
  }
}

// Singleton
let instance: N8nService | null = null

export const getN8nService = (): N8nService => {
  if (!instance) {
    instance = new N8nService()
  }
  return instance
}

export default N8nService