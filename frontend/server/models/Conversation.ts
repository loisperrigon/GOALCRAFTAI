import mongoose, { Schema, Document } from 'mongoose'

export interface IMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    model?: string
    tokensUsed?: number
    duration?: number
    n8nExecutionId?: string
  }
}

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId
  objectiveId?: mongoose.Types.ObjectId
  title: string
  messages: IMessage[]
  totalTokens: number
  status: 'active' | 'archived'
  metadata?: {
    lastModel?: string
    n8nWorkflowId?: string
  }
  createdAt: Date
  updatedAt: Date
}

const ConversationSchema = new Schema<IConversation>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  objectiveId: {
    type: Schema.Types.ObjectId,
    ref: 'Objective'
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  messages: [{
    id: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      model: String,
      tokensUsed: Number,
      duration: Number,
      n8nExecutionId: String
    }
  }],
  totalTokens: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  metadata: {
    lastModel: String,
    n8nWorkflowId: String
  }
}, {
  timestamps: true
})

// Méthode pour ajouter un message
ConversationSchema.methods.addMessage = function(message: IMessage): void {
  this.messages.push(message)
  if (message.metadata?.tokensUsed) {
    this.totalTokens += message.metadata.tokensUsed
  }
  this.updatedAt = new Date()
}

// Méthode pour obtenir le dernier message
ConversationSchema.methods.getLastMessage = function(): IMessage | null {
  return this.messages.length > 0 ? this.messages[this.messages.length - 1] : null
}

// Limiter le nombre de messages conservés (pour économiser l'espace)
ConversationSchema.pre('save', function(next) {
  const maxMessages = 100
  if (this.messages.length > maxMessages) {
    // Garder seulement les 100 derniers messages
    this.messages = this.messages.slice(-maxMessages)
  }
  next()
})

// Indexes pour les performances
ConversationSchema.index({ userId: 1, status: 1 })
ConversationSchema.index({ userId: 1, createdAt: -1 })
ConversationSchema.index({ objectiveId: 1 })

export const Conversation = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema)