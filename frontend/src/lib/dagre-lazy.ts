// Lazy loading wrapper pour dagre
import { Node, Edge } from 'reactflow'

interface DagreGraph {
  setDefaultEdgeLabel: (fn: () => any) => void
  setGraph: (config: any) => void
  setNode: (id: string, config: any) => void
  setEdge: (source: string, target: string) => void
  node: (id: string) => any
}

interface DagreModule {
  graphlib: {
    Graph: new () => DagreGraph
  }
  layout: (graph: DagreGraph) => void
}

let dagreModule: DagreModule | null = null
let dagrePromise: Promise<DagreModule> | null = null

async function loadDagre(): Promise<DagreModule> {
  if (dagreModule) return dagreModule
  
  if (!dagrePromise) {
    dagrePromise = import('dagre').then(module => {
      dagreModule = module.default as any
      return dagreModule!
    })
  }
  
  return dagrePromise
}

export async function getLayoutedElements(
  nodes: Node[], 
  edges: Edge[], 
  direction = 'TB'
): Promise<{ nodes: Node[], edges: Edge[] }> {
  
  // Si pas de nodes, pas besoin de layout
  if (nodes.length === 0) {
    return { nodes, edges }
  }
  
  // Charger dagre de manière lazy
  const dagre = await loadDagre()
  
  const isHorizontal = direction === 'LR'
  const nodeWidth = 200
  const nodeHeight = 120
  
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  
  dagreGraph.setGraph({ 
    rankdir: direction, 
    ranksep: 100,
    nodesep: 80,
    align: 'DR',
    marginx: 20,
    marginy: 20
  })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    node.targetPosition = isHorizontal ? 'left' : 'top'
    node.sourcePosition = isHorizontal ? 'right' : 'bottom'

    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    }
  })

  return { nodes, edges }
}