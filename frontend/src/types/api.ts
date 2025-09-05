// Types pour les API et WebSocket

export interface WebSocketMessage {
  type: string
  content?: string
  objectiveMetadata?: any
  step?: any
  nodeId?: string
  isLastStep?: boolean
  generationProgress?: any
  isFinal?: boolean
  metadata?: Record<string, any>
  conversationId?: string
  isError?: boolean
}

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export interface SkillTreeNode {
  id: string
  title: string
  description: string
  xpReward: number
  estimatedTime: string
  dependencies: string[]
  category: 'main' | 'bonus' | 'challenge'
  tools?: string[]
  tips?: string[]
  milestones?: string[]
}

export interface Objective {
  _id?: string
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  conversationId?: string
  skillTree?: {
    nodes: SkillTreeNode[]
  }
  createdAt?: string
  updatedAt?: string
}

export interface Conversation {
  _id?: string
  id: string
  title: string
  messages: ConversationMessage[]
  createdAt?: string
  updatedAt?: string
  objective?: Objective
}

export interface AuthFormData {
  email: string
  password: string
  name?: string
}

export interface ProgressData {
  completedSteps: string[]
  xpEarned: number
  level: number
  achievements: string[]
}