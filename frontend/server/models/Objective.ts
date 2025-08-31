import mongoose, { Schema, Document } from 'mongoose'

export interface IObjective extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  description: string
  category: 'personal' | 'professional' | 'health' | 'learning' | 'creative' | 'social' | 'financial' | 'other'
  status: 'active' | 'completed' | 'paused' | 'abandoned'
  progress: number
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  xpReward: number
  xpEarned: number
  aiGenerated: boolean
  userPrompt?: string
  skillTree: {
    nodes: Array<{
      id: string
      title: string
      description: string
      xpReward: number
      requiredLevel: number
      dependencies: string[]
      optional: boolean
      completed: boolean
      unlocked: boolean
      category: 'main' | 'bonus' | 'challenge'
      icon?: string
      estimatedTime?: string
      position: {
        x: number
        y: number
      }
      details?: {
        why: string
        howTo: string[]
        difficulty: string
        tools: Array<{
          name: string
          type: string
          url: string
          description: string
        }>
        tips: string[]
        milestones: Array<{
          title: string
          completed: boolean
        }>
      }
    }>
    edges: Array<{
      id: string
      source: string
      target: string
    }>
  }
  milestones: Array<{
    id: string
    title: string
    description?: string
    completed: boolean
    completedAt?: Date
    order: number
  }>
  totalSteps: number
  completedSteps: number
  metadata?: {
    estimatedDuration?: string
    nextMilestone?: string
    tags?: string[]
    weeklyHours?: number
    n8nWorkflowId?: string
  }
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

const ObjectiveSchema = new Schema<IObjective>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000
  },
  category: {
    type: String,
    enum: ['personal', 'professional', 'health', 'learning', 'creative', 'social', 'financial', 'other'],
    default: 'personal'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'abandoned'],
    default: 'active'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium'
  },
  xpReward: {
    type: Number,
    default: 1000
  },
  xpEarned: {
    type: Number,
    default: 0
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  userPrompt: String,
  skillTree: {
    nodes: [{
      id: String,
      title: String,
      description: String,
      xpReward: Number,
      requiredLevel: Number,
      dependencies: [String],
      optional: Boolean,
      completed: Boolean,
      unlocked: Boolean,
      category: String,
      icon: String,
      estimatedTime: String,
      position: {
        x: Number,
        y: Number
      },
      details: {
        why: String,
        howTo: [String],
        difficulty: String,
        tools: [{
          name: String,
          type: String,
          url: String,
          description: String
        }],
        tips: [String],
        milestones: [{
          title: String,
          completed: Boolean
        }]
      }
    }],
    edges: [{
      id: String,
      source: String,
      target: String
    }]
  },
  milestones: [{
    id: String,
    title: String,
    description: String,
    completed: Boolean,
    completedAt: Date,
    order: Number
  }],
  totalSteps: {
    type: Number,
    default: 0
  },
  completedSteps: {
    type: Number,
    default: 0
  },
  metadata: {
    estimatedDuration: String,
    nextMilestone: String,
    tags: [String],
    weeklyHours: Number,
    n8nWorkflowId: String
  },
  completedAt: Date
}, {
  timestamps: true
})

// Méthode pour calculer la progression
ObjectiveSchema.methods.calculateProgress = function(): number {
  if (!this.skillTree?.nodes || this.skillTree.nodes.length === 0) {
    return 0
  }
  
  const completed = this.skillTree.nodes.filter((node: any) => node.completed).length
  const total = this.skillTree.nodes.length
  
  return Math.round((completed / total) * 100)
}

// Méthode pour débloquer les nodes suivants
ObjectiveSchema.methods.unlockNextNodes = function(completedNodeId: string): void {
  if (!this.skillTree?.nodes) return
  
  this.skillTree.nodes.forEach((node: any) => {
    if (node.dependencies.includes(completedNodeId)) {
      const allDepsCompleted = node.dependencies.every((depId: string) => 
        this.skillTree.nodes.find((n: any) => n.id === depId && n.completed)
      )
      if (allDepsCompleted) {
        node.unlocked = true
      }
    }
  })
}

// Indexes pour les performances
ObjectiveSchema.index({ userId: 1, status: 1 })
ObjectiveSchema.index({ userId: 1, createdAt: -1 })
ObjectiveSchema.index({ status: 1 })

export const Objective = mongoose.models.Objective || mongoose.model<IObjective>('Objective', ObjectiveSchema)