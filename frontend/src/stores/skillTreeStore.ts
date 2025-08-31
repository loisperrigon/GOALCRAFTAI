import { create } from 'zustand'
import { guitarSkillNodes } from '@/data/guitarSkillData'
import { useStreakStore } from './streak-store'

// Interface pour les détails enrichis d'un node
export interface NodeDetails {
  why: string                    // Pourquoi cette étape est importante
  howTo: string[]                // Étapes pour réussir
  difficulty: 'Facile' | 'Moyen' | 'Difficile'
  tools: {
    name: string
    type: 'app' | 'website' | 'video' | 'article'
    url: string
    description: string
  }[]
  tips: string[]                 // Conseils de pro
  milestones: {                  // Jalons de progression
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
  dependencies: string[] // IDs des nœuds prérequis
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
  details?: NodeDetails  // Détails enrichis optionnels
}

export interface SkillTreeState {
  nodes: SkillNode[]
  userXP: number
  userLevel: number
  completedNodes: string[]
  activeNodeId: string | null
  
  // Actions
  completeNode: (nodeId: string) => void
  unlockNode: (nodeId: string) => void
  setActiveNode: (nodeId: string | null) => void
  addXP: (amount: number) => void
  resetProgress: () => void
  loadMockData: () => void
  loadNodeDetails: () => void  // Nouvelle fonction pour charger les détails
  toggleMilestone: (nodeId: string, milestoneIndex: number) => void  // Toggle milestone completion
}

const useSkillTreeStore = create<SkillTreeState>((set, get) => ({
  nodes: [],
  userXP: 0,
  userLevel: 1,
  completedNodes: [],
  activeNodeId: null,

  completeNode: (nodeId) => {
    set((state) => {
      const node = state.nodes.find(n => n.id === nodeId)
      if (!node || !node.unlocked) return state

      // Récupérer le multiplicateur de streak
      const streakMultiplier = useStreakStore.getState().streakMultiplier
      const xpWithBonus = Math.round((node?.xpReward || 0) * streakMultiplier)

      const updatedNodes = state.nodes.map(n => {
        if (n.id === nodeId) {
          return { ...n, completed: true }
        }
        // Débloquer les nœuds qui dépendent de celui-ci
        if (n.dependencies.includes(nodeId)) {
          const allDepsCompleted = n.dependencies.every(depId => 
            depId === nodeId || state.completedNodes.includes(depId)
          )
          if (allDepsCompleted) {
            return { ...n, unlocked: true }
          }
        }
        return n
      })

      return {
        ...state,
        nodes: updatedNodes,
        completedNodes: [...state.completedNodes, nodeId],
        userXP: state.userXP + xpWithBonus,
        userLevel: Math.floor((state.userXP + xpWithBonus) / 100) + 1
      }
    })
  },

  unlockNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.map(n => 
        n.id === nodeId ? { ...n, unlocked: true } : n
      )
    }))
  },

  setActiveNode: (nodeId) => {
    set({ activeNodeId: nodeId })
  },

  addXP: (amount) => {
    set((state) => ({
      userXP: state.userXP + amount,
      userLevel: Math.floor((state.userXP + amount) / 100) + 1
    }))
  },

  resetProgress: () => {
    set((state) => ({
      nodes: state.nodes.map(n => ({
        ...n,
        completed: false,
        unlocked: n.dependencies.length === 0
      })),
      userXP: 0,
      userLevel: 1,
      completedNodes: [],
      activeNodeId: null
    }))
  },

  loadMockData: () => {
    // Charger les nodes depuis le fichier de données
    set({
      nodes: guitarSkillNodes,
      userXP: 0,
      userLevel: 1,
      completedNodes: [],
      activeNodeId: null
    })
  },

  loadNodeDetails: () => {
    // Les détails sont déjà inclus dans guitarSkillNodes
    console.log('Les détails sont déjà chargés avec les nodes')
  },

  toggleMilestone: (nodeId, milestoneIndex) => {
    set((state) => ({
      nodes: state.nodes.map(node => {
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
    }))
  }
}))

export default useSkillTreeStore