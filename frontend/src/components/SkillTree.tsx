"use client"

import { useCallback, useEffect, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'
import useSkillTreeStore from '@/stores/skillTreeStore'
import { Card } from '@/components/ui/card'
import { Lock, CheckCircle2, Circle, Star, Zap, Trophy } from 'lucide-react'

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
    if (node.id === 'final') return <Trophy className="h-5 w-5 text-yellow-400" />
    return <Circle className="h-5 w-5 text-purple-400" />
  }

  const handleClick = () => {
    setActiveNode(node.id)
    if (node.unlocked && !node.completed) {
      // Simuler la complétion pour la démo
      if (window.confirm(`Marquer "${node.title}" comme complété ?`)) {
        completeNode(node.id)
      }
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
          <h3 className="font-semibold text-sm mb-1 text-white">
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
              <span className="text-xs text-gray-400">
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

export default function SkillTree() {
  const { nodes, loadMockData, userXP, userLevel, completedNodes } = useSkillTreeStore()
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // Charger les données mock au montage
  useEffect(() => {
    loadMockData()
  }, [loadMockData])

  // Convertir les nodes du store en nodes React Flow
  useEffect(() => {
    const rfNodes: Node[] = nodes.map((node) => ({
      id: node.id,
      type: 'skillNode',
      position: node.position,
      data: node,
    }))
    setFlowNodes(rfNodes)

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
    setEdges(rfEdges)
  }, [nodes, setFlowNodes, setEdges])

  // Calculer la progression
  const progression = useMemo(() => {
    const mainNodes = nodes.filter(n => n.category === 'main')
    const completedMain = mainNodes.filter(n => n.completed).length
    return mainNodes.length > 0 ? (completedMain / mainNodes.length) * 100 : 0
  }, [nodes])

  return (
    <div className="h-full w-full relative bg-background">
      {/* Header avec stats */}
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

      {/* Barre de progression en bas */}
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

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={flowNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="#4b5563"
        />
        <Controls className="bg-card border-border" />
      </ReactFlow>
    </div>
  )
}