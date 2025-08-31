import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    model?: string
    tokensUsed?: number
    duration?: number
    objectiveId?: string
  }
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  metadata?: {
    objectiveId?: string
    totalTokens?: number
  }
}

interface ChatState {
  // État
  conversations: Conversation[]
  currentConversationId: string | null
  isAIThinking: boolean
  isAIStreaming: boolean
  streamingMessageId: string | null
  
  // Actions - Conversations
  createConversation: (title?: string) => string
  selectConversation: (id: string) => void
  deleteConversation: (id: string) => void
  updateConversationTitle: (id: string, title: string) => void
  
  // Actions - Messages
  addMessage: (conversationId: string, message: ChatMessage) => void
  updateMessage: (conversationId: string, messageId: string, updates: Partial<ChatMessage>) => void
  deleteMessage: (conversationId: string, messageId: string) => void
  clearConversation: (conversationId: string) => void
  
  // Actions - Streaming
  setAIThinking: (thinking: boolean) => void
  setAIStreaming: (streaming: boolean, messageId?: string) => void
  
  // Getters
  getCurrentConversation: () => Conversation | null
  getConversation: (id: string) => Conversation | undefined
  getRecentConversations: (limit?: number) => Conversation[]
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // État initial
      conversations: [],
      currentConversationId: null,
      isAIThinking: false,
      isAIStreaming: false,
      streamingMessageId: null,
      
      // Créer une nouvelle conversation
      createConversation: (title) => {
        const id = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newConversation: Conversation = {
          id,
          title: title || `Conversation ${get().conversations.length + 1}`,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        set(state => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: id
        }))
        
        return id
      },
      
      // Sélectionner une conversation
      selectConversation: (id) => {
        set({ currentConversationId: id })
      },
      
      // Supprimer une conversation
      deleteConversation: (id) => {
        set(state => {
          const conversations = state.conversations.filter(c => c.id !== id)
          const currentConversationId = state.currentConversationId === id 
            ? (conversations[0]?.id || null)
            : state.currentConversationId
          
          return { conversations, currentConversationId }
        })
      },
      
      // Mettre à jour le titre d'une conversation
      updateConversationTitle: (id, title) => {
        set(state => ({
          conversations: state.conversations.map(conv =>
            conv.id === id
              ? { ...conv, title, updatedAt: new Date() }
              : conv
          )
        }))
      },
      
      // Ajouter un message
      addMessage: (conversationId, message) => {
        set(state => ({
          conversations: state.conversations.map(conv => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                messages: [...conv.messages, message],
                updatedAt: new Date(),
                metadata: {
                  ...conv.metadata,
                  totalTokens: (conv.metadata?.totalTokens || 0) + (message.metadata?.tokensUsed || 0)
                }
              }
            }
            return conv
          })
        }))
      },
      
      // Mettre à jour un message
      updateMessage: (conversationId, messageId, updates) => {
        set(state => ({
          conversations: state.conversations.map(conv => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                messages: conv.messages.map(msg =>
                  msg.id === messageId
                    ? { ...msg, ...updates }
                    : msg
                ),
                updatedAt: new Date()
              }
            }
            return conv
          })
        }))
      },
      
      // Supprimer un message
      deleteMessage: (conversationId, messageId) => {
        set(state => ({
          conversations: state.conversations.map(conv => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                messages: conv.messages.filter(msg => msg.id !== messageId),
                updatedAt: new Date()
              }
            }
            return conv
          })
        }))
      },
      
      // Effacer une conversation
      clearConversation: (conversationId) => {
        set(state => ({
          conversations: state.conversations.map(conv => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                messages: [],
                updatedAt: new Date(),
                metadata: {
                  ...conv.metadata,
                  totalTokens: 0
                }
              }
            }
            return conv
          })
        }))
      },
      
      // Définir l'état "IA réfléchit"
      setAIThinking: (thinking) => {
        set({ isAIThinking: thinking })
      },
      
      // Définir l'état de streaming
      setAIStreaming: (streaming, messageId) => {
        set({
          isAIStreaming: streaming,
          streamingMessageId: messageId || null
        })
      },
      
      // Obtenir la conversation actuelle
      getCurrentConversation: () => {
        const state = get()
        return state.conversations.find(c => c.id === state.currentConversationId) || null
      },
      
      // Obtenir une conversation par ID
      getConversation: (id) => {
        return get().conversations.find(c => c.id === id)
      },
      
      // Obtenir les conversations récentes
      getRecentConversations: (limit = 10) => {
        return get().conversations
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .slice(0, limit)
      }
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        conversations: state.conversations.slice(0, 20), // Garder seulement les 20 dernières
        currentConversationId: state.currentConversationId
      })
    }
  )
)