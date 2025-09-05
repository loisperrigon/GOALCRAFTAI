// WebSocket specific types with proper typing

export interface SkillNode {
  id: string
  title: string
  description: string
  xpReward: number
  requiredLevel: number
  completed: boolean
  unlocked: boolean
  dependencies: string[]
  estimatedTime?: string
  tips?: string[]
  tools?: string[]
  milestones?: string[]
}

export interface SkillEdge {
  id: string
  source: string
  target: string
  type?: string
}

export interface SkillTree {
  nodes: SkillNode[]
  edges: SkillEdge[]
}

export interface ObjectiveData {
  id: string
  title: string
  description: string
  skillTree: SkillTree
  metadata?: Record<string, unknown>
}

export interface WebSocketMessage {
  id: string
  type: string
  content?: string
  data?: unknown
  timestamp: number
  role?: 'user' | 'assistant' | 'system'
}

export type WebSocketCallback = (data: unknown, message: WebSocketMessage) => void
export type MessageHandler = (message: WebSocketMessage) => void
export type ErrorHandler = (error: Error | string) => void