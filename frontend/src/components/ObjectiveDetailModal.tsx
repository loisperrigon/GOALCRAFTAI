"use client"

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { triggerMilestoneConfetti } from '@/components/Confetti'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import useSkillTreeStore from '@/stores/skillTreeStore'
import { 
  Clock, 
  Target, 
  BookOpen, 
  Youtube, 
  Globe, 
  FileText,
  ChevronRight,
  CheckCircle2,
  Circle,
  Lock,
  Sparkles,
  Trophy,
  Zap,
  Star,
  ExternalLink,
  PlayCircle,
  Download,
  Link2
} from 'lucide-react'

interface StepDetail {
  id: string
  title: string
  description: string
  why: string
  howTo: string[]
  estimatedTime: string
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

interface ObjectiveDetailModalProps {
  isOpen: boolean
  onClose: () => void
  nodeData: any
}

export default function ObjectiveDetailModal({ isOpen, onClose, nodeData }: ObjectiveDetailModalProps) {
  const { completeNode, toggleMilestone, nodes } = useSkillTreeStore()
  const [previousMilestones, setPreviousMilestones] = useState<boolean[]>([])
  
  // Récupérer les données actualisées depuis le store
  const currentNode = nodeData ? (nodes.find(n => n.id === nodeData.id) || nodeData) : null
  const hasDetails = currentNode?.details
  
  // Détecter quand un milestone est complété
  useEffect(() => {
    if (currentNode?.details?.milestones) {
      const currentStates = currentNode.details.milestones.map(m => m.completed)
      
      // Vérifier si un milestone vient d'être complété
      if (previousMilestones.length > 0) {
        currentStates.forEach((completed, index) => {
          if (completed && !previousMilestones[index]) {
            // Un milestone vient d'être complété !
            triggerMilestoneConfetti()
          }
        })
      }
      
      setPreviousMilestones(currentStates)
    }
  }, [currentNode?.details?.milestones])
  
  if (!nodeData || !currentNode) return null
  
  const stepDetail: StepDetail = hasDetails ? {
    id: currentNode.id,
    title: currentNode.title,
    description: currentNode.description,
    why: currentNode.details.why,
    howTo: currentNode.details.howTo,
    estimatedTime: currentNode.estimatedTime || "Non spécifié",
    difficulty: currentNode.details.difficulty,
    tools: currentNode.details.tools,
    tips: currentNode.details.tips,
    milestones: currentNode.details.milestones
  } : {
    // Fallback pour les nodes sans détails
    id: nodeData.id,
    title: nodeData.title,
    description: nodeData.description,
    why: "Cette étape fait partie de votre parcours d'apprentissage personnalisé.",
    howTo: [
      "Consultez les ressources recommandées",
      "Pratiquez régulièrement",
      "Demandez de l'aide si nécessaire",
      "Célébrez vos progrès"
    ],
    estimatedTime: nodeData.estimatedTime || "Variable",
    difficulty: 'Moyen' as const,
    tools: [
      {
        name: "Recherche Google",
        type: 'website' as const,
        url: `https://www.google.com/search?q=${encodeURIComponent(nodeData.title + ' guitare')}`,
        description: "Trouvez des ressources supplémentaires en ligne"
      }
    ],
    tips: [
      "💡 La pratique régulière est la clé du succès",
      "🎯 Fixez-vous des objectifs réalisables",
      "✨ Chaque petit progrès compte"
    ],
    milestones: [
      { title: "Comprendre les bases", completed: false },
      { title: "Pratiquer les techniques", completed: false },
      { title: "Maîtriser l'étape", completed: false }
    ]
  }

  const getIcon = () => {
    if (currentNode.completed) return <CheckCircle2 className="h-6 w-6 text-green-400" />
    if (!currentNode.unlocked) return <Lock className="h-6 w-6 text-gray-400" />
    if (currentNode.category === 'challenge') return <Zap className="h-6 w-6 text-pink-400" />
    if (currentNode.category === 'bonus') return <Star className="h-6 w-6 text-blue-400" />
    if (currentNode.id === 'final_concert') return <Trophy className="h-6 w-6 text-yellow-400" />
    return <Circle className="h-6 w-6 text-purple-400" />
  }

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'Facile': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'Moyen': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'Difficile': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getToolIcon = (type: string) => {
    switch(type) {
      case 'app': return <Download className="h-4 w-4" />
      case 'website': return <Globe className="h-4 w-4" />
      case 'video': return <PlayCircle className="h-4 w-4" />
      case 'article': return <FileText className="h-4 w-4" />
      default: return <Link2 className="h-4 w-4" />
    }
  }

  const progress = currentNode.details?.milestones 
    ? currentNode.details.milestones.filter(m => m.completed).length / currentNode.details.milestones.length * 100
    : stepDetail.milestones.filter(m => m.completed).length / stepDetail.milestones.length * 100

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[85vh] bg-card border-purple-500/20 overflow-hidden p-0 flex flex-col">
        {/* DialogTitle caché pour l'accessibilité */}
        <DialogTitle className="sr-only">{currentNode.title}</DialogTitle>
        
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                nodeData.completed ? 'bg-green-500/20' :
                nodeData.unlocked ? 'bg-purple-500/20' : 'bg-gray-500/20'
              }`}>
                {getIcon()}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-2">{stepDetail.title}</h2>
                <p className="text-base text-muted-foreground">
                  {stepDetail.description}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <Badge variant="outline" className={getDifficultyColor(stepDetail.difficulty)}>
                    {stepDetail.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {stepDetail.estimatedTime}
                  </div>
                  <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    +{nodeData.xpReward} XP
                  </Badge>
                </div>
              </div>
            </div>
            {/* Pourquoi cette étape */}
            <Card className="p-4 bg-purple-500/5 border-purple-500/20">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-400" />
                Pourquoi cette étape est importante
              </h3>
              <p className="text-sm text-muted-foreground">{stepDetail.why}</p>
            </Card>

            {/* Comment y arriver */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-400" />
                Comment réussir cette étape
              </h3>
              <div className="space-y-2">
                {stepDetail.howTo.map((step, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-purple-400 mt-0.5" />
                    <p className="text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progression */}
            {currentNode.unlocked && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  Votre progression
                </h3>
                <div className="space-y-3">
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-700">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="space-y-2">
                    {currentNode.details?.milestones ? currentNode.details.milestones.map((milestone, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          toggleMilestone(currentNode.id, index)
                        }}
                        className="flex items-center gap-2 w-full text-left hover:bg-purple-500/10 p-2 rounded-lg transition-colors"
                        disabled={!currentNode.unlocked}
                      >
                        {milestone.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${milestone.completed ? 'text-green-400 line-through' : 'text-muted-foreground'}`}>
                          {milestone.title}
                        </span>
                      </button>
                    )) : stepDetail.milestones.map((milestone, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 opacity-50"
                      >
                        <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {milestone.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Outils recommandés */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-pink-400" />
                Ressources recommandées
              </h3>
              <div className="grid gap-3">
                {stepDetail.tools.map((tool, index) => (
                  <Card key={index} className="p-3 hover:bg-purple-500/10 transition-colors cursor-pointer group">
                    <a href={tool.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                        {getToolIcon(tool.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{tool.name}</h4>
                          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                      </div>
                    </a>
                  </Card>
                ))}
              </div>
            </div>

            {/* Conseils */}
            <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
              <h3 className="font-semibold mb-3">Conseils de pro</h3>
              <div className="space-y-2">
                {stepDetail.tips.map((tip, index) => (
                  <p key={index} className="text-sm">{tip}</p>
                ))}
              </div>
            </Card>

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4 border-t border-border">
              {nodeData.unlocked && !nodeData.completed && (
                <Button 
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  onClick={() => {
                    console.log('Marquer comme complété:', nodeData.id)
                    completeNode(nodeData.id)
                    onClose()
                  }}
                >
                  Marquer comme complété
                </Button>
              )}
              {!nodeData.unlocked && (
                <Button 
                  disabled
                  className="flex-1"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Débloquer les prérequis d'abord
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}