import { create } from 'zustand'

export interface Objective {
  id: string
  title: string
  description: string
  category: 'personal' | 'professional' | 'health' | 'learning' | 'creative' | 'other'
  status: 'active' | 'paused' | 'completed' | 'abandoned'
  progress: number // 0-100
  xpReward: number
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  dueDate?: Date
  skillTree?: SkillTree
  milestones: Milestone[]
  totalSteps: number
  completedSteps: number
  aiGenerated: boolean
  userPrompt?: string
}

export interface SkillTree {
  nodes: SkillNode[]
  edges: SkillEdge[]
}

export interface SkillNode {
  id: string
  title: string
  description: string
  position: { x: number; y: number }
  completed: boolean
  unlocked: boolean
  dependencies: string[]
  xpReward: number
  estimatedTime?: string
  category: 'main' | 'bonus' | 'challenge'
  optional: boolean
  details?: NodeDetails
}

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

export interface SkillEdge {
  id: string
  source: string
  target: string
}

export interface Milestone {
  id: string
  title: string
  description?: string
  completed: boolean
  completedAt?: Date
  order: number
}

interface ObjectivesState {
  // État
  objectives: Objective[]
  activeObjectiveId: string | null
  isLoading: boolean
  
  // Actions CRUD
  createObjective: (objective: Partial<Objective>) => Promise<Objective>
  updateObjective: (id: string, updates: Partial<Objective>) => void
  deleteObjective: (id: string) => void
  completeObjective: (id: string) => void
  abandonObjective: (id: string) => void
  pauseObjective: (id: string) => void
  resumeObjective: (id: string) => void
  
  // Actions Skill Tree
  completeNode: (objectiveId: string, nodeId: string) => void
  unlockNode: (objectiveId: string, nodeId: string) => void
  updateNodeProgress: (objectiveId: string, nodeId: string, progress: number) => void
  
  // Actions Milestones
  completeMilestone: (objectiveId: string, milestoneId: string) => void
  addMilestone: (objectiveId: string, milestone: Milestone) => void
  
  // Helpers
  setActiveObjective: (id: string | null) => void
  getActiveObjective: () => Objective | null
  getObjectiveById: (id: string) => Objective | undefined
  getObjectivesByStatus: (status: Objective['status']) => Objective[]
  calculateTotalProgress: () => number
  generateObjectiveFromAI: (prompt: string) => Promise<Objective>
  clearDuplicates: () => void
}

export const useObjectivesStore = create<ObjectivesState>((set, get) => ({
      objectives: [],
      activeObjectiveId: null,
      isLoading: false,

      createObjective: async (objectiveData) => {
        set({ isLoading: true })
        
        // Vérifier si un objectif avec cet ID existe déjà
        const existingObjective = get().objectives.find(o => o.id === objectiveData.id)
        if (existingObjective) {
          set({ isLoading: false })
          return existingObjective // Retourner l'objectif existant au lieu d'en créer un nouveau
        }
        
        // Générer un ID unique avec timestamp + random pour éviter les doublons
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(2, 9)
        const uniqueId = objectiveData.id || `${timestamp}-${random}`
        
        // Créer un nouvel objectif sans spread pour éviter l'écrasement de l'ID
        const newObjective: Objective = {
          id: uniqueId,
          title: objectiveData.title || 'Nouvel objectif',
          description: objectiveData.description || '',
          category: objectiveData.category || 'other',
          status: objectiveData.status || 'active',
          progress: objectiveData.progress || 0,
          xpReward: objectiveData.xpReward || 100,
          difficulty: objectiveData.difficulty || 'medium',
          createdAt: objectiveData.createdAt || new Date(),
          updatedAt: objectiveData.updatedAt || new Date(),
          milestones: objectiveData.milestones || [],
          totalSteps: objectiveData.totalSteps || 0,
          completedSteps: objectiveData.completedSteps || 0,
          aiGenerated: objectiveData.aiGenerated || false,
          userPrompt: objectiveData.userPrompt,
          skillTree: objectiveData.skillTree,
          completedAt: objectiveData.completedAt
        }
        
        set(state => ({
          objectives: [...state.objectives, newObjective],
          isLoading: false
        }))
        
        return newObjective
      },

      updateObjective: (id, updates) => {
        set(state => ({
          objectives: state.objectives.map(obj =>
            obj.id === id 
              ? { ...obj, ...updates, updatedAt: new Date() }
              : obj
          )
        }))
      },

      deleteObjective: (id) => {
        set(state => ({
          objectives: state.objectives.filter(obj => obj.id !== id),
          activeObjectiveId: state.activeObjectiveId === id ? null : state.activeObjectiveId
        }))
      },

      completeObjective: (id) => {
        set(state => ({
          objectives: state.objectives.map(obj =>
            obj.id === id 
              ? { 
                  ...obj, 
                  status: 'completed' as const,
                  progress: 100,
                  completedAt: new Date(),
                  updatedAt: new Date()
                }
              : obj
          )
        }))
      },

      abandonObjective: (id) => {
        set(state => ({
          objectives: state.objectives.map(obj =>
            obj.id === id 
              ? { 
                  ...obj, 
                  status: 'abandoned' as const,
                  updatedAt: new Date()
                }
              : obj
          )
        }))
      },

      pauseObjective: (id) => {
        set(state => ({
          objectives: state.objectives.map(obj =>
            obj.id === id 
              ? { 
                  ...obj, 
                  status: 'paused' as const,
                  updatedAt: new Date()
                }
              : obj
          )
        }))
      },

      resumeObjective: (id) => {
        set(state => ({
          objectives: state.objectives.map(obj =>
            obj.id === id 
              ? { 
                  ...obj, 
                  status: 'active' as const,
                  updatedAt: new Date()
                }
              : obj
          )
        }))
      },

      completeNode: (objectiveId, nodeId) => {
        set(state => ({
          objectives: state.objectives.map(obj => {
            if (obj.id !== objectiveId || !obj.skillTree) return obj
            
            const updatedNodes = obj.skillTree.nodes.map(node => {
              if (node.id === nodeId) {
                return { ...node, completed: true }
              }
              // Débloquer les nœuds dépendants
              if (node.dependencies.includes(nodeId)) {
                const allDepsCompleted = node.dependencies.every(depId =>
                  depId === nodeId || obj.skillTree?.nodes.find(n => n.id === depId)?.completed
                )
                if (allDepsCompleted) {
                  return { ...node, unlocked: true }
                }
              }
              return node
            })
            
            const completedSteps = updatedNodes.filter(n => n.completed).length
            const progress = Math.round((completedSteps / updatedNodes.length) * 100)
            
            return {
              ...obj,
              skillTree: { ...obj.skillTree, nodes: updatedNodes },
              completedSteps,
              progress,
              updatedAt: new Date()
            }
          })
        }))
      },

      unlockNode: (objectiveId, nodeId) => {
        set(state => ({
          objectives: state.objectives.map(obj => {
            if (obj.id !== objectiveId || !obj.skillTree) return obj
            
            return {
              ...obj,
              skillTree: {
                ...obj.skillTree,
                nodes: obj.skillTree.nodes.map(node =>
                  node.id === nodeId ? { ...node, unlocked: true } : node
                )
              },
              updatedAt: new Date()
            }
          })
        }))
      },

      updateNodeProgress: (objectiveId, nodeId, progress) => {
        // Pour des nodes avec progression partielle (future feature)
        console.log('updateNodeProgress', objectiveId, nodeId, progress)
      },

      completeMilestone: (objectiveId, milestoneId) => {
        set(state => ({
          objectives: state.objectives.map(obj => {
            if (obj.id !== objectiveId) return obj
            
            const updatedMilestones = obj.milestones.map(m =>
              m.id === milestoneId
                ? { ...m, completed: true, completedAt: new Date() }
                : m
            )
            
            const completedCount = updatedMilestones.filter(m => m.completed).length
            const progress = Math.round((completedCount / updatedMilestones.length) * 100)
            
            return {
              ...obj,
              milestones: updatedMilestones,
              progress,
              updatedAt: new Date()
            }
          })
        }))
      },

      addMilestone: (objectiveId, milestone) => {
        set(state => ({
          objectives: state.objectives.map(obj =>
            obj.id === objectiveId
              ? {
                  ...obj,
                  milestones: [...obj.milestones, milestone],
                  updatedAt: new Date()
                }
              : obj
          )
        }))
      },

      setActiveObjective: (id) => {
        set({ activeObjectiveId: id })
      },

      getActiveObjective: () => {
        const state = get()
        return state.objectives.find(obj => obj.id === state.activeObjectiveId) || null
      },

      getObjectiveById: (id) => {
        return get().objectives.find(obj => obj.id === id)
      },

      getObjectivesByStatus: (status) => {
        return get().objectives.filter(obj => obj.status === status)
      },

      calculateTotalProgress: () => {
        const objectives = get().objectives
        if (objectives.length === 0) return 0
        
        const totalProgress = objectives.reduce((sum, obj) => sum + obj.progress, 0)
        return Math.round(totalProgress / objectives.length)
      },

      generateObjectiveFromAI: async (prompt) => {
        set({ isLoading: true })
        
        // Simulation - À remplacer par appel API OpenAI
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Mock de réponse IA
        const aiObjective: Objective = {
          id: Date.now().toString(),
          title: "Apprendre la guitare en 3 mois",
          description: "Un parcours structuré pour maîtriser les bases de la guitare acoustique",
          category: 'learning',
          status: 'active',
          progress: 0,
          xpReward: 500,
          difficulty: 'medium',
          createdAt: new Date(),
          updatedAt: new Date(),
          totalSteps: 15,
          completedSteps: 0,
          aiGenerated: true,
          userPrompt: prompt,
          milestones: [
            {
              id: '1',
              title: 'Acheter une guitare',
              completed: false,
              order: 1
            },
            {
              id: '2',
              title: 'Apprendre les accords de base',
              completed: false,
              order: 2
            },
            {
              id: '3',
              title: 'Jouer sa première chanson',
              completed: false,
              order: 3
            }
          ],
          skillTree: {
            nodes: [], // À remplir avec les nodes générés
            edges: []
          }
        }
        
        set(state => ({
          objectives: [...state.objectives, aiObjective],
          activeObjectiveId: aiObjective.id,
          isLoading: false
        }))
        
        return aiObjective
      },

      clearDuplicates: () => {
        set(state => {
          const seen = new Set<string>()
          const uniqueObjectives = state.objectives.filter(obj => {
            if (seen.has(obj.id)) {
              return false
            }
            seen.add(obj.id)
            return true
          })
          
          return {
            objectives: uniqueObjectives
          }
        })
      }
    }))