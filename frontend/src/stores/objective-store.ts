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
  conversationId?: string // ID de la conversation associée
  title: string
  description?: string
  category: 'personal' | 'professional' | 'health' | 'learning' | 'creative' | 'social' | 'financial' | 'other' | 'general'
  status: 'active' | 'completed' | 'paused' | 'abandoned' | 'generating' | 'draft'
  progress: number // 0-100
  xpReward: number // Total XP possible
  xpEarned?: number // XP déjà gagné
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'intermediate'
  createdAt?: Date
  updatedAt?: Date
  completedAt?: Date
  milestones: Milestone[]
  totalSteps: number
  completedSteps: number
  aiGenerated?: boolean
  userPrompt?: string
  skillTree?: SkillTree
  isGenerating?: boolean // Indique si l'objectif est en cours de génération
  generationProgress?: number // Progression de la génération (0-100)
  isPlaceholder?: boolean // Indique si c'est un placeholder
  isTemporary?: boolean // Pour compatibilité
  metadata?: {
    estimatedDuration?: string
    nextMilestone?: string
    category?: string
    tags?: string[]
    weeklyHours?: number
    caloriesGoal?: number
    investmentNeeded?: string
    [key: string]: string | number | undefined
  }
}

interface ObjectiveState {
  // L'objectif actuellement chargé/actif
  currentObjective: Objective | null
  isLoading: boolean
  
  // Actions
  setActiveObjective: (objective: Objective) => void
  updateProgress: (progress: number) => void
  completeNode: (nodeId: string) => Promise<void>
  toggleNodeMilestone: (nodeId: string, milestoneIndex: number) => void
  completeMilestone: (milestoneId: string) => void
  clearObjective: () => void
  
  // Actions pour la génération progressive
  startObjectiveGeneration: (metadata: Partial<Objective>) => void
  addNodeToObjective: (node: SkillNode) => void
  addEdgeToObjective: (edge: { id: string; source: string; target: string }) => void
  updateGenerationProgress: (progress: number) => void
  completeObjectiveGeneration: () => void
  
  // Actions pour les conversations
  updateObjectiveByConversationId: (conversationId: string, updates: Partial<Objective>) => void
  createPlaceholderObjective: (conversationId: string) => void
  
  // Actions pour les modifications d'objectif
  startObjectiveUpdate: () => void
  updateNodeInObjective: (nodeId: string, updates: Partial<SkillNode>) => void
  deleteNodeFromObjective: (nodeId: string) => void
  updateObjectiveMetadata: (metadata: Partial<Objective>) => void
  completeObjectiveUpdate: () => void
  
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

  completeNode: async (nodeId) => {
    const state = get()
    if (!state.currentObjective?.skillTree) return

    try {
      // Appeler l'API pour sauvegarder en base
      const response = await fetch('/api/objectives/complete-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectiveId: state.currentObjective.id,
          stepId: nodeId,
          completed: true
        })
      })

      if (!response.ok) {
        console.error('Erreur lors de la sauvegarde de la complétion')
        // On continue quand même pour mettre à jour l'UI
      }

      const data = await response.json()
      console.log('[ObjectiveStore] Étape complétée:', data)
    } catch (error) {
      console.error('[ObjectiveStore] Erreur API complete-step:', error)
      // On continue quand même pour mettre à jour l'UI
    }

    // Mise à jour locale de l'état
    set(state => {
      if (!state.currentObjective?.skillTree) return state

      const updatedNodes = state.currentObjective.skillTree.nodes.map(node => {
        // Marquer le node comme complété
        if (node.id === nodeId && node.unlocked) {
          return { ...node, completed: true }
        }
        
        // Débloquer les nodes dépendants
        if (node.dependencies && node.dependencies.includes(nodeId)) {
          const allDepsCompleted = node.dependencies.every(depId => {
            const depNode = state.currentObjective?.skillTree?.nodes.find(n => n.id === depId)
            const isCompleted = depNode?.completed || depId === nodeId
            return isCompleted
          })
          if (allDepsCompleted) {
            return { ...node, unlocked: true }
          }
        }
        return node
      })

      const completedSteps = updatedNodes.filter(n => n.completed).length
      const progress = Math.round((completedSteps / updatedNodes.length) * 100)

      // Créer un nouvel objet pour forcer React à détecter le changement
      const updatedObjective = {
        ...state.currentObjective,
        completedSteps,
        progress,
        skillTree: {
          ...state.currentObjective.skillTree,
          nodes: updatedNodes
        }
      }
      
      return {
        currentObjective: updatedObjective
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

  // Méthodes pour la génération progressive
  startObjectiveGeneration: (metadata) => {
    set({
      currentObjective: {
        id: metadata.id || `generating-${Date.now()}`,
        conversationId: metadata.conversationId, // Ajouter le conversationId
        title: metadata.title || "Nouvel objectif",
        description: metadata.description,
        category: metadata.category || 'other',
        status: 'generating',
        progress: 0,
        xpReward: 0,
        difficulty: metadata.difficulty || 'medium',
        milestones: [],
        totalSteps: metadata.totalSteps || 0,
        completedSteps: 0,
        skillTree: { nodes: [], edges: [] },
        isGenerating: true,
        generationProgress: 0,
        metadata: metadata.metadata
      }
    })
  },

  addNodeToObjective: (node) => {
    set(state => {
      if (!state.currentObjective) {
        console.warn("[ObjectiveStore] Pas d'objectif actif")
        return state
      }

      // Vérifier si le node existe déjà
      const existingNodes = state.currentObjective.skillTree?.nodes || []
      if (existingNodes.some(n => n.id === node.id)) {
        return state
      }

      const updatedNodes = [...existingNodes, node]
      const totalSteps = updatedNodes.length
      
      return {
        currentObjective: {
          ...state.currentObjective,
          skillTree: {
            nodes: updatedNodes,
            edges: [...(state.currentObjective.skillTree?.edges || [])]
          },
          totalSteps,
          xpReward: updatedNodes.reduce((acc, n) => acc + (n.xpReward || 0), 0)
        }
      }
    })
  },
  
  updateObjectiveByConversationId: (conversationId: string, updates: Partial<Objective>) => {
    set(state => {
      if (!state.currentObjective || state.currentObjective.conversationId !== conversationId) {
        console.warn(`[ObjectiveStore] Pas d'objectif avec conversationId: ${conversationId}`)
        return state
      }
      
      return {
        currentObjective: {
          ...state.currentObjective,
          ...updates,
          isGenerating: updates.status !== 'active'
        }
      }
    })
  },
  
  createPlaceholderObjective: (conversationId: string) => {
    const placeholder: Objective = {
      id: `placeholder-${conversationId}`,
      conversationId,
      title: "Nouvel objectif",
      description: "En attente de votre description...",
      category: "general",
      difficulty: "intermediate",
      status: "draft",
      progress: 0,
      xpReward: 0,
      totalSteps: 0,
      completedSteps: 0,
      skillTree: { nodes: [], edges: [] },
      isPlaceholder: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    set({ currentObjective: placeholder })
  },

  addEdgeToObjective: (edge) => {
    set(state => {
      if (!state.currentObjective) {
        return state
      }

      // Vérifier si l'edge existe déjà
      const existingEdges = state.currentObjective.skillTree?.edges || []
      if (existingEdges.some(e => e.id === edge.id)) {
        return state
      }

      return {
        currentObjective: {
          ...state.currentObjective,
          skillTree: {
            ...state.currentObjective.skillTree!,
            edges: [...existingEdges, edge]
          }
        }
      }
    })
  },

  updateGenerationProgress: (progress) => {
    set(state => {
      if (!state.currentObjective) {
        return state
      }

      return {
        currentObjective: {
          ...state.currentObjective,
          generationProgress: progress
        }
      }
    })
  },

  completeObjectiveGeneration: () => {
    set(state => {
      if (!state.currentObjective) {
        return state
      }

      return {
        currentObjective: {
          ...state.currentObjective,
          status: 'active',
          isGenerating: false,
          generationProgress: 100
        }
      }
    })
  },

  fetchObjective: async (id) => {
    set({ isLoading: true })
    
    // Simulation d'un appel API
    
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Pour l'instant, on récupère depuis les mock data
    // Plus tard: const response = await fetch(`/api/objectives/${id}`)
    // const objective = await response.json()
    
    const { mockObjectives } = await import('@/data/mockObjectives')
    const objective = mockObjectives.find(obj => obj.id === id)
    
    if (objective) {
      set({ currentObjective: objective, isLoading: false })
    } else {
      set({ isLoading: false })
    }
  },

  // Implémentation des actions de modification
  startObjectiveUpdate: () => {
    set(state => {
      if (!state.currentObjective) return state
      
      return {
        currentObjective: {
          ...state.currentObjective,
          isGenerating: true,
          status: 'generating' as const
        }
      }
    })
  },

  updateNodeInObjective: (nodeId, updates) => {
    set(state => {
      if (!state.currentObjective?.skillTree) return state

      const updatedNodes = state.currentObjective.skillTree.nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, ...updates }
        }
        return node
      })

      // Recalculer les dépendances si nécessaire
      if (updates.dependencies) {
        // Mettre à jour les edges
        const existingEdges = state.currentObjective.skillTree.edges.filter(
          edge => edge.target !== nodeId
        )
        const newEdges = updates.dependencies.map(depId => ({
          id: `edge-${depId}-${nodeId}`,
          source: depId,
          target: nodeId
        }))

        return {
          currentObjective: {
            ...state.currentObjective,
            skillTree: {
              nodes: updatedNodes,
              edges: [...existingEdges, ...newEdges]
            },
            updatedAt: new Date()
          }
        }
      }

      return {
        currentObjective: {
          ...state.currentObjective,
          skillTree: {
            ...state.currentObjective.skillTree,
            nodes: updatedNodes
          },
          updatedAt: new Date()
        }
      }
    })
  },

  deleteNodeFromObjective: (nodeId) => {
    set(state => {
      if (!state.currentObjective?.skillTree) return state

      // Supprimer le node
      const updatedNodes = state.currentObjective.skillTree.nodes.filter(
        node => node.id !== nodeId
      )

      // Supprimer les edges liés
      const updatedEdges = state.currentObjective.skillTree.edges.filter(
        edge => edge.source !== nodeId && edge.target !== nodeId
      )

      // Mettre à jour les dépendances des autres nodes
      const finalNodes = updatedNodes.map(node => {
        if (node.dependencies && node.dependencies.includes(nodeId)) {
          return {
            ...node,
            dependencies: node.dependencies.filter(dep => dep !== nodeId)
          }
        }
        return node
      })

      const completedSteps = finalNodes.filter(n => n.completed).length
      const progress = finalNodes.length > 0 
        ? Math.round((completedSteps / finalNodes.length) * 100)
        : 0

      return {
        currentObjective: {
          ...state.currentObjective,
          skillTree: {
            nodes: finalNodes,
            edges: updatedEdges
          },
          totalSteps: finalNodes.length,
          completedSteps,
          progress,
          updatedAt: new Date()
        }
      }
    })
  },

  updateObjectiveMetadata: (metadata) => {
    set(state => {
      if (!state.currentObjective) return state

      return {
        currentObjective: {
          ...state.currentObjective,
          ...metadata,
          updatedAt: new Date()
        }
      }
    })
  },

  completeObjectiveUpdate: () => {
    set(state => {
      if (!state.currentObjective) return state

      return {
        currentObjective: {
          ...state.currentObjective,
          isGenerating: false,
          status: 'active' as const
        }
      }
    })
  }
}))