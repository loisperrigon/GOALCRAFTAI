import { Server as SocketIOServer, Socket } from 'socket.io'
import { getN8nService } from '../services/n8n.service'
import { Conversation } from '../models/Conversation'
import { Objective } from '../models/Objective'
import { User } from '../models/User'

interface ClientToServerEvents {
  user_message: (data: {
    content: string
    conversationId?: string
    context?: any
  }) => void
  
  generate_objective: (data: {
    prompt: string
    difficulty?: string
    category?: string
  }) => void
  
  stop_generation: (data: {
    messageId?: string
  }) => void
  
  ping: () => void
}

interface ServerToClientEvents {
  ai_thinking: () => void
  ai_message_start: (data: { messageId: string }) => void
  ai_message_chunk: (data: { messageId: string; content: string }) => void
  ai_message_end: (data: { messageId: string; isComplete: boolean }) => void
  objective_generated: (data: { objective: any }) => void
  error: (data: { code: string; message: string }) => void
  pong: () => void
}

export function setupWebSocket(io: SocketIOServer) {
  const n8nService = getN8nService()
  
  // Écouter les chunks de n8n et les transmettre aux clients
  n8nService.on('chunk', (data) => {
    io.to(data.messageId).emit('ai_message_chunk', data)
  })

  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    console.log('🔌 Client connected:', socket.id)

    // Gestion des messages utilisateur
    socket.on('user_message', async (data) => {
      const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      try {
        // Joindre la room du message pour recevoir les chunks
        socket.join(messageId)
        
        // Notifier que l'IA réfléchit
        socket.emit('ai_thinking')
        
        // Envoyer au service n8n
        const response = await n8nService.sendChatMessage({
          conversationId: data.conversationId || 'default',
          messageId,
          userId: 'user-id', // TODO: Récupérer depuis la session
          content: data.content,
          context: data.context
        })
        
        if (response.status === 'error') {
          socket.emit('error', {
            code: 'N8N_ERROR',
            message: response.error || 'Erreur lors de la génération'
          })
          return
        }
        
        // Commencer le streaming
        socket.emit('ai_message_start', { messageId })
        
        // Si n8n ne supporte pas le streaming, simuler
        if (response.data?.fullResponse) {
          // Simuler le streaming en découpant la réponse
          const chunks = response.data.fullResponse.match(/.{1,50}/g) || []
          for (const chunk of chunks) {
            socket.emit('ai_message_chunk', {
              messageId,
              content: chunk
            })
            await new Promise(resolve => setTimeout(resolve, 50))
          }
          
          socket.emit('ai_message_end', {
            messageId,
            isComplete: true
          })
        }
        
        // Sauvegarder en DB si nécessaire
        if (data.conversationId) {
          try {
            await Conversation.findByIdAndUpdate(
              data.conversationId,
              {
                $push: {
                  messages: [
                    {
                      id: `user-${Date.now()}`,
                      role: 'user',
                      content: data.content,
                      timestamp: new Date()
                    },
                    {
                      id: messageId,
                      role: 'assistant',
                      content: response.data?.fullResponse || '',
                      timestamp: new Date(),
                      metadata: {
                        n8nExecutionId: response.executionId
                      }
                    }
                  ]
                }
              }
            )
          } catch (error) {
            console.error('Failed to save conversation:', error)
          }
        }
        
      } catch (error: any) {
        console.error('WebSocket handler error:', error)
        socket.emit('error', {
          code: 'INTERNAL_ERROR',
          message: 'Une erreur est survenue'
        })
      } finally {
        socket.leave(messageId)
      }
    })

    // Génération d'objectif
    socket.on('generate_objective', async (data) => {
      try {
        socket.emit('ai_thinking')
        
        const response = await n8nService.generateObjective(
          data.prompt,
          'user-id', // TODO: Récupérer depuis la session
          {
            difficulty: data.difficulty,
            category: data.category
          }
        )
        
        if (response.status === 'error') {
          socket.emit('error', {
            code: 'GENERATION_ERROR',
            message: response.error || 'Impossible de générer l\'objectif'
          })
          return
        }
        
        // Sauvegarder l'objectif en DB
        if (response.data) {
          try {
            const objective = new Objective({
              userId: 'user-id', // TODO: Récupérer depuis la session
              ...response.data,
              aiGenerated: true,
              userPrompt: data.prompt
            })
            
            await objective.save()
            
            socket.emit('objective_generated', {
              objective: objective.toObject()
            })
          } catch (error) {
            console.error('Failed to save objective:', error)
            socket.emit('objective_generated', {
              objective: response.data
            })
          }
        }
        
      } catch (error: any) {
        console.error('Objective generation error:', error)
        socket.emit('error', {
          code: 'GENERATION_ERROR',
          message: 'Erreur lors de la génération'
        })
      }
    })

    // Arrêt de génération
    socket.on('stop_generation', (data) => {
      if (data.messageId) {
        n8nService.stopStreaming(data.messageId)
        socket.emit('ai_message_end', {
          messageId: data.messageId,
          isComplete: false
        })
      }
    })

    // Ping/Pong pour maintenir la connexion
    socket.on('ping', () => {
      socket.emit('pong')
    })

    // Déconnexion
    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id)
    })
  })
}