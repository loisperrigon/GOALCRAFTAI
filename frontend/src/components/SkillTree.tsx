"use client"

import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps,
  BackgroundVariant,
  ConnectionMode,
  Panel,
  ReactFlowInstance,
} from 'reactflow'
import 'reactflow/dist/style.css'
import '@/styles/skill-tree.css'
import dagre from 'dagre'
import { motion, AnimatePresence } from 'framer-motion'
import { useObjectiveStore } from '@/stores/objective-store'
import { useUserStore } from '@/stores/user-store'
import { useStreakStore } from '@/stores/streak-store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, CheckCircle2, Circle, Star, Zap, Trophy, RotateCcw, Save, Download, Layout, Move, Target } from 'lucide-react'
import ObjectiveDetailModal from '@/components/ObjectiveDetailModal'
import Confetti from '@/components/Confetti'
import { useSound } from '@/hooks/useSound'
import { SimpleStreakNotification } from '@/components/SimpleStreakNotification'

// Layout automatique avec dagre

const nodeWidth = 200
const nodeHeight = 120

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR'
  
  // Créer une nouvelle instance de dagre pour chaque calcul (évite les problèmes de cache)
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  
  dagreGraph.setGraph({ 
    rankdir: direction, 
    ranksep: 100,     // Espacement vertical entre les niveaux
    nodesep: 80,      // Espacement horizontal entre les nodes
    align: 'DR',      // Alignement centré pour les nodes isolés
    marginx: 20,      // Petite marge horizontale
    marginy: 20       // Petite marge verticale
  })

  // Sauvegarder les positions d'origine si elles existent
  const originalPositions = new Map()
  nodes.forEach((node) => {
    if (node.position) {
      originalPositions.set(node.id, { ...node.position })
    }
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    node.targetPosition = isHorizontal ? Position.Left : Position.Top
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom

    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    }
  })

  return { nodes, edges }
}

// Custom Node Component
const SkillNode = ({ data, selected }: NodeProps) => {
  const { currentObjective, completeNode } = useObjectiveStore()
  const { playClick, playUnlock } = useSound()
  const node = data as any
  
  // Déterminer si c'est le nœud en cours d'apprentissage
  const isCurrentLearning = node.unlocked && !node.completed && 
    !currentObjective?.skillTree?.nodes.some((n: any) => 
      n.unlocked && !n.completed && n.id !== node.id && n.requiredLevel < node.requiredLevel
    )

  const getNodeStyle = () => {
    // Style spécial pour le nœud racine (titre de l'objectif)
    if (node.isRoot) {
      return 'bg-gradient-to-br from-amber-500/40 to-orange-500/40 border-2 border-amber-500 shadow-lg shadow-amber-500/30 scale-125'
    }
    if (node.completed) {
      return 'bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/50 shadow-green-500/20'
    }
    if (node.unlocked) {
      if (node.category === 'main') {
        return 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/50 shadow-purple-500/20 hover:shadow-purple-500/40'
      }
      if (node.category === 'bonus') {
        return 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/50 shadow-blue-500/20 hover:shadow-blue-500/40'
      }
      if (node.category === 'challenge') {
        return 'bg-gradient-to-br from-pink-500/20 to-red-500/20 border-pink-500/50 shadow-pink-500/20 hover:shadow-pink-500/40'
      }
    }
    return 'bg-gray-800/50 border-gray-600/50 opacity-60'
  }

  const getIcon = () => {
    if (node.isRoot) return <Target className="h-6 w-6 text-amber-400" /> // Icône spéciale pour le nœud racine
    if (node.completed) return <CheckCircle2 className="h-5 w-5 text-green-400" />
    if (!node.unlocked) return <Lock className="h-5 w-5 text-gray-500" />
    if (node.category === 'challenge') return <Zap className="h-5 w-5 text-pink-400" />
    if (node.category === 'bonus') return <Star className="h-5 w-5 text-blue-400" />
    if (node.id === 'final_concert') return <Trophy className="h-5 w-5 text-yellow-400" />
    return <Circle className="h-5 w-5 text-purple-400" />
  }

  const handleClick = () => {
    // Ne pas permettre le clic sur le nœud racine
    if (node.isRoot) {
      return
    }
    
    if (node.unlocked) {
      playClick()
    } else {
      playUnlock() // Son différent si verrouillé
    }
    // Ouvrir la modal au lieu de confirmer directement
    const parentComponent = (window as any).__skillTreeComponent
    if (parentComponent) {
      parentComponent.openNodeModal(node)
    }
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        duration: 0.5,
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: (currentObjective?.isGenerating && node.index !== undefined) ? node.index * 0.1 : 0
      }}
    >
      <Card
        className={`
          ${node.isRoot ? 'w-64' : 'w-48'} p-3 transition-all duration-300 transform
          ${node.isRoot ? '' : 'cursor-pointer'}
          ${getNodeStyle()}
          ${selected ? 'ring-2 ring-purple-400 scale-105' : ''}
          ${!node.isRoot && node.unlocked && !node.completed ? 'hover:scale-105' : ''}
          ${isCurrentLearning ? 'next-to-unlock ring-2 ring-purple-500 ring-opacity-50' : ''}
        `}
        data-current={isCurrentLearning}
        onClick={handleClick}
      >
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-purple-500 border-none"
      />
      
      <div className="flex items-start gap-2">
        <div className="mt-1">{getIcon()}</div>
        <div className="flex-1">
          <h3 className={`font-semibold text-sm mb-1 text-white ${node.isRoot ? '' : 'line-clamp-2'}`}>
            {node.title}
          </h3>
          <p className={`text-xs text-gray-300 mb-2 ${node.isRoot ? '' : 'line-clamp-2'}`}>
            {node.description}
          </p>
          {!node.isRoot && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-purple-300">
                +{node.xpReward} XP
              </span>
              {node.estimatedTime && (
                <span className="text-xs text-gray-400 line-clamp-1">
                  {node.estimatedTime}
                </span>
              )}
            </div>
          )}
          {node.isRoot && (
            <div className="text-center">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Objectif Principal
              </span>
            </div>
          )}
          {node.optional && (
            <span className="text-xs text-blue-300 mt-1 inline-block">
              Optionnel
            </span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-purple-500 border-none"
      />
    </Card>
    </motion.div>
  )
}

// Définir nodeTypes en dehors du composant pour éviter les re-renders
const nodeTypes = {
  skillNode: SkillNode,
}

interface SkillTreeProps {
  isFullscreen?: boolean
}

export default function SkillTree({ isFullscreen = false }: SkillTreeProps) {
  // Récupérer l'objectif actif depuis objective-store avec sélecteurs optimisés
  const currentObjective = useObjectiveStore(state => state.currentObjective)
  const completeObjectiveNode = useObjectiveStore(state => state.completeNode)
  
  const { user, addXP } = useUserStore()
  
  // Extraire les données de l'objectif actif - Créer une nouvelle référence pour forcer les re-renders
  // On utilise un shallow copy pour que React détecte les changements
  const nodes = useMemo(() => {
    return currentObjective?.skillTree?.nodes ? [...currentObjective.skillTree.nodes] : []
  }, [currentObjective?.skillTree?.nodes])
  
  const completedNodes = nodes.filter(n => n.completed).map(n => n.id)
  const userXP = user?.xp || 0
  const userLevel = user?.level || 1
  
  // Log pour debug de la génération progressive - Supprimé pour éviter les re-renders
  // useEffect(() => {
  //   if (currentObjective?.isGenerating) {
  //     console.log(`[SkillTree] Génération en cours: ${nodes.length} nodes, progress: ${currentObjective.generationProgress}%`)
  //   }
  // }, [nodes.length, currentObjective?.isGenerating, currentObjective?.generationProgress])
  
  const { playComplete, playLevelUp, playXpGain, playWhoosh } = useSound()
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isInteractive, setIsInteractive] = useState(false)
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const previousFullscreenRef = useRef(isFullscreen)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const previousCompletedRef = useRef<string[]>([])
  const previousLevelRef = useRef(userLevel)
  const [showStreakNotif, setShowStreakNotif] = useState(false)
  const { currentStreak, checkStreak } = useStreakStore()
  const previousObjectiveIdRef = useRef(currentObjective?.id)
  const [isPositioning, setIsPositioning] = useState(false)
  const previousNodesRef = useRef<Node[]>([])
  const layoutedNodesRef = useRef<Node[]>([])
  const [shouldCenter, setShouldCenter] = useState(false)

  // Fonction pour trouver le nœud en cours d'apprentissage
  const getCurrentLearningNode = useCallback(() => {
    if (!currentObjective?.skillTree?.nodes) return null
    
    const skillNodes = currentObjective.skillTree.nodes
    
    // Priorité 1 : Le premier nœud débloqué non complété
    const nextNode = skillNodes.find(n => n.unlocked && !n.completed)
    if (nextNode) return nextNode
    
    // Priorité 2 : Le dernier nœud complété
    const completedNodesLocal = skillNodes.filter(n => n.completed)
    if (completedNodesLocal.length > 0) {
      return completedNodesLocal[completedNodesLocal.length - 1]
    }
    
    // Priorité 3 : Le premier nœud disponible
    return skillNodes.find(n => n.unlocked) || skillNodes[0]
  }, [currentObjective])

  // Exposer la fonction pour ouvrir la modal
  useEffect(() => {
    (window as any).__skillTreeComponent = {
      openNodeModal: (nodeData: any) => {
        setSelectedNode(nodeData)
        setIsModalOpen(true)
      }
    }
    return () => {
      delete (window as any).__skillTreeComponent
    }
  }, [])

  // Initialiser au montage
  useEffect(() => {
    // Initialiser la référence des nodes complétés
    previousCompletedRef.current = completedNodes
    // Vérifier le streak au chargement
    checkStreak()
  }, [checkStreak])
  
  // Détecter quand une étape est complétée
  useEffect(() => {
    if (previousCompletedRef.current.length > 0 && completedNodes.length > previousCompletedRef.current.length) {
      // Une nouvelle étape a été complétée !
      setShowConfetti(true)
      playComplete() // Son de complétion
      playXpGain() // Son de gain d'XP
      setShowStreakNotif(true) // Notification de streak
      setTimeout(() => {
        setShowConfetti(false)
        setShowStreakNotif(false)
      }, 3500)
    }
    previousCompletedRef.current = completedNodes
  }, [completedNodes, playComplete, playXpGain])

  // Détecter quand on monte de niveau
  useEffect(() => {
    if (previousLevelRef.current > 0 && userLevel > previousLevelRef.current) {
      // Level up!
      playLevelUp()
    }
    previousLevelRef.current = userLevel
  }, [userLevel, playLevelUp])

  // Fonction pour appliquer le layout automatique
  const onLayout = useCallback(
    (direction: string) => {
      const layouted = getLayoutedElements(flowNodes, edges, direction)
      setFlowNodes([...layouted.nodes])
      setEdges([...layouted.edges])
      // Layout appliqué
    },
    [flowNodes, edges, setFlowNodes, setEdges]
  )

  // Convertir les nodes du store en nodes React Flow avec layout automatique
  useEffect(() => {
    // Ne pas mettre à jour si on est en train de positionner
    if (isPositioning) return
    
    // Sauvegarder la position actuelle avant la mise à jour
    const currentViewport = reactFlowInstance?.getViewport()
    
    // Vérifier si c'est le premier chargement ou un changement d'objectif
    const isFirstLoad = previousNodesRef.current.length === 0
    const isObjectiveChange = previousObjectiveIdRef.current !== currentObjective?.id
    
    // Si c'est juste une mise à jour de progression (pas un changement d'objectif)
    // on garde les positions existantes
    const shouldKeepPositions = !isFirstLoad && !isObjectiveChange
    
    // Ajouter le titre de l'objectif comme nœud racine
    const rfNodes: Node[] = []
    
    // Nœud racine avec le titre de l'objectif
    if (currentObjective?.title) {
      rfNodes.push({
        id: 'root-objective',
        type: 'skillNode',
        position: { x: 0, y: 0 },
        data: {
          id: 'root-objective',
          title: currentObjective.title,
          description: currentObjective.description || '',
          completed: true, // Le nœud racine est toujours "complété" pour ne pas bloquer
          unlocked: true,
          xpReward: 0,
          dependencies: [],
          category: 'objective',
          isRoot: true // Marqueur pour styliser différemment
        }
      })
    }
    
    // Ajouter les autres nœuds
    nodes.forEach((node) => {
      rfNodes.push({
        id: node.id,
        type: 'skillNode',
        position: node.position || { x: 0, y: 0 },
        data: node,
      })
    })

    // Créer les edges basés sur les dépendances
    const rfEdges: Edge[] = []
    
    // Connecter le nœud racine aux nœuds sans dépendances (premiers nœuds)
    if (currentObjective?.title) {
      nodes.forEach((node) => {
        if (!node.dependencies || node.dependencies.length === 0) {
          rfEdges.push({
            id: `root-${node.id}`,
            source: 'root-objective',
            target: node.id,
            animated: node.unlocked && !node.completed,
            style: {
              stroke: node.completed ? '#10b981' : node.unlocked ? '#a855f7' : '#4b5563',
              strokeWidth: 2,
            },
          })
        }
      })
    }
    
    // Ajouter les edges normaux entre les nœuds
    nodes.forEach((node) => {
      node.dependencies.forEach((depId) => {
        const isActive = node.unlocked || node.completed
        rfEdges.push({
          id: `${depId}-${node.id}`,
          source: depId,
          target: node.id,
          animated: isActive && !node.completed,
          style: {
            stroke: node.completed 
              ? '#10b981' 
              : isActive 
                ? '#a855f7' 
                : '#4b5563',
            strokeWidth: 2,
          },
        })
      })
    })

    // Appliquer le layout automatique si les nodes n'ont pas de position
    if (nodes.length > 0) {
      let finalNodes = rfNodes
      let finalEdges = rfEdges
      
      // Utiliser dagre pour calculer automatiquement les positions des nodes pour un layout propre
      // Directions disponibles : 'TB' (Top-Bottom), 'BT' (Bottom-Top), 'LR' (Left-Right), 'RL' (Right-Left)
      const layouted = getLayoutedElements(rfNodes, rfEdges, 'TB') // TB pour un layout vertical de haut en bas
      finalNodes = layouted.nodes
      finalEdges = layouted.edges
      layoutedNodesRef.current = layouted.nodes
      
      setFlowNodes(() => finalNodes)
      setEdges(() => finalEdges)
      
      // Sauvegarder les nodes pour la prochaine fois
      previousNodesRef.current = finalNodes
      
      // Mettre à jour la ref de l'objectif
      if (isObjectiveChange) {
        previousObjectiveIdRef.current = currentObjective?.id
        
        // IMPORTANT: Forcer un reset complet du viewport quand on change d'objectif
        if (reactFlowInstance) {
          // Reset le viewport à la position par défaut
          reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 0 })
          // Puis marquer qu'on doit recentrer
          setTimeout(() => {
            setShouldCenter(true)
          }, 50)
        }
      }
      
      // Marquer qu'on doit centrer sur le nœud
      if (isFirstLoad || isObjectiveChange) {
        // Si React Flow est déjà initialisé, on peut centrer tout de suite
        if (reactFlowInstance) {
          setShouldCenter(true)
        }
        // Sinon, onInit le fera quand React Flow sera prêt
      }
      
      // Ne pas toucher au viewport si on garde les positions
      if (!shouldKeepPositions && reactFlowInstance && currentViewport) {
        // Restaurer le viewport seulement si nécessaire
        setTimeout(() => {
          reactFlowInstance.setViewport(currentViewport, { duration: 0 })
        }, 10)
      }
    }
  }, [nodes, currentObjective?.id, currentObjective?.isGenerating, currentObjective?.generationProgress, isPositioning])

  // Centrage sur le nœud actuel - SIMPLE ET DIRECT
  useEffect(() => {
    if (shouldCenter && reactFlowInstance && layoutedNodesRef.current.length > 0) {
      setShouldCenter(false)
      
      // Trouver le nœud actuel
      const skillNodes = currentObjective?.skillTree?.nodes || []
      let currentNode = skillNodes.find(n => n.unlocked && !n.completed) ||
                       skillNodes.filter(n => n.completed).pop() ||
                       skillNodes.find(n => n.unlocked) ||
                       skillNodes[0]
      
      if (currentNode) {
        // Trouver la position du nœud dans les nodes layoutés
        const targetNode = layoutedNodesRef.current.find(n => n.id === currentNode.id)
        if (targetNode && targetNode.position) {
          // ZOOM DIRECT AU CENTRE DU NŒUD
          // nodeWidth = 200, nodeHeight = 120 (définis plus haut)
          reactFlowInstance.setCenter(
            targetNode.position.x + nodeWidth / 2,
            targetNode.position.y + nodeHeight / 2,
            { zoom: 1.5, duration: 800 }
          )
        }
      }
    }
  }, [shouldCenter, reactFlowInstance, currentObjective])

  // Ajuster la position lors du changement de mode plein écran
  useEffect(() => {
    if (previousFullscreenRef.current !== isFullscreen && reactFlowInstance && containerRef.current) {
      const viewport = reactFlowInstance.getViewport()
      
      if (isFullscreen) {
        // En passant en plein écran, ajuster pour centrer sur la même zone
        const widthBefore = window.innerWidth * 0.33 // L'arbre occupait 1/3 de la largeur
        const widthAfter = window.innerWidth // L'arbre occupe toute la largeur
        const widthDiff = (widthAfter - widthBefore) / 2
        
        setTimeout(() => {
          reactFlowInstance.setViewport({
            x: viewport.x + widthDiff,
            y: viewport.y,
            zoom: viewport.zoom
          }, { duration: 400 })
        }, 100)
      } else {
        // En sortant du plein écran, recentrer sur la zone réduite
        const widthBefore = window.innerWidth // L'arbre occupait toute la largeur
        const widthAfter = window.innerWidth * 0.33 // L'arbre occupe 1/3 de la largeur
        const widthDiff = (widthBefore - widthAfter) / 2
        
        setTimeout(() => {
          reactFlowInstance.setViewport({
            x: viewport.x - widthDiff,
            y: viewport.y,
            zoom: viewport.zoom
          }, { duration: 400 })
        }, 100)
      }
    }
    previousFullscreenRef.current = isFullscreen
  }, [isFullscreen, reactFlowInstance])


  // Calculer la progression
  const progression = useMemo(() => {
    const mainNodes = nodes.filter(n => n.category === 'main')
    const completedMain = mainNodes.filter(n => n.completed).length
    return mainNodes.length > 0 ? (completedMain / mainNodes.length) * 100 : 0
  }, [nodes])

  // Fonctions pour les boutons
  const handleSave = () => {
    // Sauvegarde de la progression
  }

  const handleExport = () => {
    // Export de l'arbre
  }

  const handleReset = () => {
    // Réinitialisation de la progression
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser votre progression pour cet objectif ?')) {
      // Pour l'instant on ne peut pas reset un objectif spécifique
      // TODO: Ajouter une fonction resetObjective dans objectives-store
      // Fonction de reset à implémenter
    }
  }

  const toggleInteractive = () => {
    setIsInteractive(!isInteractive)
    console.log(isInteractive ? '🔒 Mode édition désactivé' : '✏️ Mode édition activé')
  }

  const onInit = (instance: ReactFlowInstance) => {
    setReactFlowInstance(instance)
    // React Flow est maintenant complètement chargé
    // On peut déclencher le centrage immédiatement si nécessaire
    if (layoutedNodesRef.current.length > 0) {
      setShouldCenter(true)
    }
  }

  // Simuler le statut Free/Premium (à remplacer par vraie logique)
  const isPremium = false // À connecter avec votre système d'auth
  const maxStepsInFree = 10
  const currentSteps = nodes.filter(n => n.category === 'main').length
  
  // Si pas d'objectif actif, afficher un message
  if (!currentObjective) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Target className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Aucun objectif sélectionné</h3>
          <p className="text-muted-foreground mb-4">
            Sélectionnez un objectif dans la sidebar ou créez-en un nouveau pour commencer
          </p>
          <Button 
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            onClick={() => {
              // TODO: Ouvrir le dialog de création d'objectif
            }}
          >
            Créer un objectif
          </Button>
        </Card>
      </div>
    )
  }
  
  return (
    <div ref={containerRef} className="h-full w-full relative bg-background">
      {/* Header avec stats - visible seulement en plein écran */}
      {isFullscreen && (
        <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Card className="bg-card/90 backdrop-blur p-3 pointer-events-auto">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Niveau</p>
                    <p className="text-lg font-bold text-purple-400">{userLevel}</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div>
                    <p className="text-xs text-muted-foreground">XP Total</p>
                    <p className="text-lg font-bold text-blue-400">{userXP}</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div>
                    <p className="text-xs text-muted-foreground">Progression</p>
                    <p className="text-lg font-bold text-green-400">{Math.round(progression)}%</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="bg-card/90 backdrop-blur p-3 pointer-events-auto">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs">Complété</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-xs">Disponible</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gray-500" />
                    <span className="text-xs">Verrouillé</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}


      {/* Barre de progression globale - visible seulement en plein écran */}
      {isFullscreen && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
          <Card className="bg-card/90 backdrop-blur p-4 pointer-events-auto min-w-[400px] max-w-[600px]">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium whitespace-nowrap">Progression globale</span>
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden min-w-[200px]">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${progression}%` }}
                />
              </div>
              <span className="text-sm font-bold text-purple-400 whitespace-nowrap">{Math.round(progression)}%</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground text-center">
              {completedNodes.length} étapes complétées sur {nodes.filter(n => n.category === 'main').length} principales
            </div>
          </Card>
        </div>
      )}

      <ReactFlow
        nodes={flowNodes}
        edges={edges}
        onNodesChange={isInteractive ? onNodesChange : undefined}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView={false}
        attributionPosition="bottom-right"
        nodesDraggable={isInteractive}
        nodesConnectable={false}
        elementsSelectable={true}
        className="bg-background"
        proOptions={{ hideAttribution: true }}
        onInit={onInit}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="#4b5563"
        />
        
        {/* Panneau de contrôle minimaliste vertical - visible seulement en plein écran */}
        {isFullscreen && (
          <Panel position="top-left" className="bg-card/90 backdrop-blur p-2 rounded-lg border border-border" style={{ top: '80px', left: '16px' }}>
            <div className="flex flex-col gap-1">
              <Button
                size="icon"
                variant={isInteractive ? "default" : "ghost"}
                onClick={toggleInteractive}
                className={`h-8 w-8 ${isInteractive ? 'bg-purple-500 hover:bg-purple-600' : 'hover:bg-purple-500/20'}`}
                title="Mode édition (glisser-déposer)"
              >
                <Move className="h-4 w-4" />
              </Button>

              <div className="h-px bg-border/50 my-1" />

              <Button
                size="icon"
                variant="ghost"
                onClick={handleSave}
                className="h-8 w-8 hover:bg-purple-500/20"
                title="Sauvegarder"
              >
                <Save className="h-4 w-4" />
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                onClick={handleExport}
                className="h-8 w-8 hover:bg-purple-500/20"
                title="Exporter"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                onClick={handleReset}
                className="h-8 w-8 hover:bg-red-500/20"
                title="Réinitialiser"
              >
                <RotateCcw className="h-4 w-4 text-red-400" />
              </Button>
            </div>
          </Panel>
        )}
      </ReactFlow>

      {/* Modal de détail */}
      <ObjectiveDetailModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedNode(null)
        }}
        nodeData={selectedNode}
      />
      
      {/* Confetti animation */}
      <Confetti trigger={showConfetti} />
      
      {/* Streak Notifications */}
      <SimpleStreakNotification 
        show={showStreakNotif}
        days={currentStreak}
      />
    </div>
  )
}