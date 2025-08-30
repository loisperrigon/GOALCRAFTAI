"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
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
  const { completeNode } = useSkillTreeStore()
  
  if (!nodeData) return null

  // Mock data détaillées pour l'exemple
  const stepDetail: StepDetail = {
    id: nodeData.id,
    title: nodeData.title,
    description: nodeData.description,
    why: "Cette étape est cruciale pour développer une base solide et progresser efficacement dans votre apprentissage de la guitare.",
    howTo: [
      "Commencez par 15 minutes par jour",
      "Pratiquez lentement et augmentez progressivement la vitesse",
      "Enregistrez-vous pour suivre vos progrès",
      "Rejoignez une communauté en ligne pour rester motivé"
    ],
    estimatedTime: nodeData.estimatedTime || "2 semaines",
    difficulty: nodeData.difficulty || 'Moyen',
    tools: [
      {
        name: "Justin Guitar",
        type: 'website',
        url: "https://www.justinguitar.com",
        description: "Cours gratuits structurés pour débutants"
      },
      {
        name: "Guitar Pro",
        type: 'app',
        url: "https://www.guitar-pro.com",
        description: "Logiciel de tablatures et d'apprentissage"
      },
      {
        name: "Fender Play",
        type: 'video',
        url: "https://www.fender.com/play",
        description: "Vidéos tutoriels progressifs"
      },
      {
        name: "Ultimate Guitar",
        type: 'website',
        url: "https://www.ultimate-guitar.com",
        description: "Base de données de tablatures et accords"
      }
    ],
    tips: [
      "💡 Pratiquez tous les jours, même 5 minutes valent mieux que rien",
      "🎯 Fixez-vous des mini-objectifs hebdomadaires",
      "🎵 Écoutez activement la musique que vous aimez",
      "✨ Célébrez chaque petit progrès"
    ],
    milestones: [
      { title: "Tenir correctement la guitare", completed: true },
      { title: "Accorder la guitare", completed: true },
      { title: "Jouer les accords de base", completed: false },
      { title: "Enchaîner 3 accords fluidement", completed: false }
    ]
  }

  const getIcon = () => {
    if (nodeData.completed) return <CheckCircle2 className="h-6 w-6 text-green-400" />
    if (!nodeData.unlocked) return <Lock className="h-6 w-6 text-gray-400" />
    if (nodeData.category === 'challenge') return <Zap className="h-6 w-6 text-pink-400" />
    if (nodeData.category === 'bonus') return <Star className="h-6 w-6 text-blue-400" />
    if (nodeData.id === 'final_concert') return <Trophy className="h-6 w-6 text-yellow-400" />
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

  const progress = stepDetail.milestones.filter(m => m.completed).length / stepDetail.milestones.length * 100

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[85vh] bg-card border-purple-500/20 overflow-hidden p-0 flex flex-col">
        {/* DialogTitle caché pour l'accessibilité */}
        <DialogTitle className="sr-only">{nodeData.title}</DialogTitle>
        
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
            {nodeData.unlocked && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  Votre progression
                </h3>
                <div className="space-y-3">
                  <Progress value={progress} className="h-2" />
                  <div className="space-y-2">
                    {stepDetail.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {milestone.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-400" />
                        )}
                        <span className={`text-sm ${milestone.completed ? 'text-green-400' : 'text-muted-foreground'}`}>
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