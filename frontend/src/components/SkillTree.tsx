"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
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
} from 'reactflow'
import 'reactflow/dist/style.css'
import dagre from 'dagre'
import useSkillTreeStore from '@/stores/skillTreeStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, CheckCircle2, Circle, Star, Zap, Trophy, RotateCcw, Save, Download, Layout, Move } from 'lucide-react'
import ObjectiveDetailModal from '@/components/ObjectiveDetailModal'

// Layout automatique avec dagre
const dagreGraph = new dagre.graphlib.Graph()
dagreGraph.setDefaultEdgeLabel(() => ({}))

const nodeWidth = 200
const nodeHeight = 120

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR'
  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 80 })

  nodes.forEach((node) => {
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
  const { completeNode, setActiveNode } = useSkillTreeStore()
  const node = data as any

  const getNodeStyle = () => {
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
    if (node.completed) return <CheckCircle2 className="h-5 w-5 text-green-400" />
    if (!node.unlocked) return <Lock className="h-5 w-5 text-gray-500" />
    if (node.category === 'challenge') return <Zap className="h-5 w-5 text-pink-400" />
    if (node.category === 'bonus') return <Star className="h-5 w-5 text-blue-400" />
    if (node.id === 'final_concert') return <Trophy className="h-5 w-5 text-yellow-400" />
    return <Circle className="h-5 w-5 text-purple-400" />
  }

  const handleClick = () => {
    setActiveNode(node.id)
    // Ouvrir la modal au lieu de confirmer directement
    const parentComponent = (window as any).__skillTreeComponent
    if (parentComponent) {
      parentComponent.openNodeModal(node)
    }
  }

  return (
    <Card
      className={`
        w-48 p-3 cursor-pointer transition-all duration-300 transform
        ${getNodeStyle()}
        ${selected ? 'ring-2 ring-purple-400 scale-105' : ''}
        ${node.unlocked && !node.completed ? 'hover:scale-105' : ''}
      `}
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
          <h3 className="font-semibold text-sm mb-1 text-white line-clamp-1">
            {node.title}
          </h3>
          <p className="text-xs text-gray-300 line-clamp-2 mb-2">
            {node.description}
          </p>
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
  )
}

const nodeTypes = {
  skillNode: SkillNode,
}

interface SkillTreeProps {
  isFullscreen?: boolean
}

export default function SkillTree({ isFullscreen = false }: SkillTreeProps) {
  const { nodes, loadMockData, userXP, userLevel, completedNodes } = useSkillTreeStore()
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isInteractive, setIsInteractive] = useState(false)
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  // Charger les données mock au montage
  useEffect(() => {
    loadMockData()
  }, [loadMockData])

  // Fonction pour appliquer le layout automatique
  const onLayout = useCallback(
    (direction: string) => {
      const layouted = getLayoutedElements(flowNodes, edges, direction)
      setFlowNodes([...layouted.nodes])
      setEdges([...layouted.edges])
      console.log('Layout appliqué:', direction)
    },
    [flowNodes, edges, setFlowNodes, setEdges]
  )

  // Convertir les nodes du store en nodes React Flow avec layout automatique
  useEffect(() => {
    const rfNodes: Node[] = nodes.map((node) => ({
      id: node.id,
      type: 'skillNode',
      position: node.position || { x: 0, y: 0 },
      data: node,
    }))

    // Créer les edges basés sur les dépendances
    const rfEdges: Edge[] = []
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
      const layouted = getLayoutedElements(rfNodes, rfEdges, 'TB')
      setFlowNodes(layouted.nodes)
      setEdges(layouted.edges)
    }
  }, [nodes, setFlowNodes, setEdges])

  // Calculer la progression
  const progression = useMemo(() => {
    const mainNodes = nodes.filter(n => n.category === 'main')
    const completedMain = mainNodes.filter(n => n.completed).length
    return mainNodes.length > 0 ? (completedMain / mainNodes.length) * 100 : 0
  }, [nodes])

  // Fonctions pour les boutons
  const handleSave = () => {
    console.log('💾 Sauvegarde de la progression...', { nodes: flowNodes, edges, userXP, userLevel })
  }

  const handleExport = () => {
    console.log('📥 Export de l\'arbre...', { nodes: flowNodes, edges })
  }

  const handleReset = () => {
    console.log('🔄 Réinitialisation de la progression...')
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser votre progression ?')) {
      const resetStore = useSkillTreeStore.getState().resetProgress
      resetStore()
      console.log('Progression réinitialisée')
    }
  }

  const toggleInteractive = () => {
    setIsInteractive(!isInteractive)
    console.log(isInteractive ? '🔒 Mode édition désactivé' : '✏️ Mode édition activé')
  }

  return (
    <div className="h-full w-full relative bg-background">
      {/* Header avec stats - visible seulement en plein écran */}
      {isFullscreen && (
        <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
          <div className="flex items-center justify-between">
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

            <Card className="bg-card/90 backdrop-blur p-3 pointer-events-auto">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="flex items-center gap-1">
                    <Circle className="h-3 w-3 text-purple-400" />
                    <span className="text-xs">Principal</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-blue-400" />
                    <span className="text-xs">Bonus</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-pink-400" />
                    <span className="text-xs">Défi</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Barre de progression en bas - visible seulement en plein écran */}
      {isFullscreen && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none w-80">
          <Card className="bg-card/90 backdrop-blur p-3 pointer-events-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progression</span>
              <span className="text-sm text-muted-foreground">
                {completedNodes.length}/{nodes.filter(n => !n.optional).length} étapes
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                style={{ width: `${progression}%` }}
              />
            </div>
          </Card>
        </div>
      )}

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={flowNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        nodesDraggable={isInteractive}
        nodesConnectable={false}
        elementsSelectable={true}
        fitView
        className="bg-background"
        proOptions={{ hideAttribution: true }}
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
    </div>
  )
}