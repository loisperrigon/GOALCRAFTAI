import { create } from 'zustand'

// Types pour le skill tree
export interface NodeDetails {
  why: string
  howTo: string[]
  difficulty: 'Facile' | 'Moyen' | 'Difficile'
  tools: {
    name: string
    type: 'app' | 'website' | 'video' | 'article'
    url: string
    description: string
  }[]
  tips: string[]
  milestones: {
    title: string
    completed: boolean
  }[]
}

export interface SkillNode {
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
  position?: {
    x: number
    y: number
  }
  details?: NodeDetails
}

export interface SkillTree {
  nodes: SkillNode[]
  edges: {
    id: string
    source: string
    target: string
  }[]
}

export interface Milestone {
  id: string
  title: string
  description?: string
  completed: boolean
  completedAt?: Date
  order: number
}

export interface Objective {
  id: string
  title: string
  description?: string
  category: 'personal' | 'professional' | 'health' | 'learning' | 'creative' | 'social' | 'financial' | 'other'
  status: 'active' | 'completed' | 'paused' | 'abandoned'
  progress: number // 0-100
  xpReward: number // Total XP possible
  xpEarned?: number // XP déjà gagné
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  createdAt?: Date
  updatedAt?: Date
  completedAt?: Date
  milestones: Milestone[]
  totalSteps: number
  completedSteps: number
  aiGenerated?: boolean
  userPrompt?: string
  skillTree?: SkillTree
  metadata?: {
    estimatedDuration?: string
    nextMilestone?: string
    category?: string
    tags?: string[]
    weeklyHours?: number
    caloriesGoal?: number
    investmentNeeded?: string
    [key: string]: any
  }
}

interface ObjectiveState {
  // L'objectif actuellement chargé/actif
  currentObjective: Objective | null
  isLoading: boolean
  
  // Actions
  setActiveObjective: (objective: Objective) => void
  updateProgress: (progress: number) => void
  completeNode: (nodeId: string) => void
  toggleNodeMilestone: (nodeId: string, milestoneIndex: number) => void
  completeMilestone: (milestoneId: string) => void
  clearObjective: () => void
  
  // API calls (mock pour l'instant)
  fetchObjective: (id: string) => Promise<void>
}

export const useObjectiveStore = create<ObjectiveState>((set, get) => ({
  currentObjective: null,
  isLoading: false,

  setActiveObjective: (objective) => {
    set({ currentObjective: objective })
  },

  updateProgress: (progress) => {
    set(state => ({
      currentObjective: state.currentObjective 
        ? { ...state.currentObjective, progress }
        : null
    }))
  },

  completeNode: (nodeId) => {
    set(state => {
      if (!state.currentObjective?.skillTree) return state

      const updatedNodes = state.currentObjective.skillTree.nodes.map(node => {
        if (node.id === nodeId && node.unlocked) {
          return { ...node, completed: true }
        }
        // Débloquer les nodes dépendants
        if (node.dependencies.includes(nodeId)) {
          const allDepsCompleted = node.dependencies.every(depId => {
            const depNode = state.currentObjective?.skillTree?.nodes.find(n => n.id === depId)
            return depNode?.completed || depId === nodeId
          })
          if (allDepsCompleted) {
            return { ...node, unlocked: true }
          }
        }
        return node
      })

      const completedSteps = updatedNodes.filter(n => n.completed).length
      const progress = Math.round((completedSteps / updatedNodes.length) * 100)

      return {
        currentObjective: {
          ...state.currentObjective,
          completedSteps,
          progress,
          skillTree: {
            ...state.currentObjective.skillTree,
            nodes: updatedNodes
          }
        }
      }
    })
  },

  toggleNodeMilestone: (nodeId, milestoneIndex) => {
    set(state => {
      if (!state.currentObjective?.skillTree) return state

      const updatedNodes = state.currentObjective.skillTree.nodes.map(node => {
        if (node.id === nodeId && node.details?.milestones) {
          const updatedMilestones = [...node.details.milestones]
          updatedMilestones[milestoneIndex] = {
            ...updatedMilestones[milestoneIndex],
            completed: !updatedMilestones[milestoneIndex].completed
          }
          
          return {
            ...node,
            details: {
              ...node.details,
              milestones: updatedMilestones
            }
          }
        }
        return node
      })

      return {
        currentObjective: {
          ...state.currentObjective,
          skillTree: {
            ...state.currentObjective.skillTree,
            nodes: updatedNodes
          }
        }
      }
    })
  },

  completeMilestone: (milestoneId) => {
    set(state => {
      if (!state.currentObjective) return state

      const updatedMilestones = state.currentObjective.milestones.map(m =>
        m.id === milestoneId 
          ? { ...m, completed: true, completedAt: new Date() }
          : m
      )

      return {
        currentObjective: {
          ...state.currentObjective,
          milestones: updatedMilestones
        }
      }
    })
  },

  clearObjective: () => {
    set({ currentObjective: null })
  },

  fetchObjective: async (id) => {
    set({ isLoading: true })
    
    // Simulation d'un appel API
    console.log(`🔄 Fetching objective ${id} from API...`)
    
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Pour l'instant, on récupère depuis les mock data
    // Plus tard: const response = await fetch(`/api/objectives/${id}`)
    // const objective = await response.json()
    
    const { mockObjectives } = await import('@/data/mockObjectives')
    const objective = mockObjectives.find(obj => obj.id === id)
    
    if (objective) {
      console.log(`✅ Objective loaded:`, objective.title)
      set({ currentObjective: objective, isLoading: false })
    } else {
      console.error(`❌ Objective ${id} not found`)
      set({ isLoading: false })
    }
  }
}))