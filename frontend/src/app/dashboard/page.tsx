"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import AuthLayout from "@/components/AuthLayout"
import { 
  Trophy, 
  Target, 
  Zap, 
  Calendar,
  TrendingUp,
  Award,
  Star,
  Plus,
  ChevronRight,
  Flame,
  Clock,
  CheckCircle,
  Lock,
  Sparkles
} from "lucide-react"

interface Objective {
  id: string
  title: string
  description: string
  progress: number
  xp: number
  totalSteps: number
  completedSteps: number
  category: string
  difficulty: "Facile" | "Moyen" | "Difficile"
  status: "active" | "paused" | "completed"
  daysLeft?: number
  streak?: number
}

export default function Dashboard() {
  const router = useRouter()
  
  const [objectives] = useState<Objective[]>([
    {
      id: "1",
      title: "Apprendre la guitare",
      description: "Maîtriser les bases de la guitare acoustique",
      progress: 35,
      xp: 420,
      totalSteps: 12,
      completedSteps: 4,
      category: "Musique",
      difficulty: "Moyen",
      status: "active",
      daysLeft: 62,
      streak: 5
    },
    {
      id: "2",
      title: "Perdre 10kg",
      description: "Atteindre mon poids idéal avec un plan structuré",
      progress: 53,
      xp: 630,
      totalSteps: 15,
      completedSteps: 8,
      category: "Santé",
      difficulty: "Difficile",
      status: "active",
      daysLeft: 45,
      streak: 12
    },
    {
      id: "3",
      title: "Méditer quotidiennement",
      description: "Créer une habitude de méditation de 10 minutes",
      progress: 43,
      xp: 210,
      totalSteps: 7,
      completedSteps: 3,
      category: "Bien-être",
      difficulty: "Facile",
      status: "paused"
    },
    {
      id: "4",
      title: "Lancer mon blog",
      description: "Créer et publier mon blog personnel",
      progress: 100,
      xp: 1200,
      totalSteps: 10,
      completedSteps: 10,
      category: "Projet",
      difficulty: "Moyen",
      status: "completed"
    }
  ])

  const totalXP = objectives.reduce((acc, obj) => acc + obj.xp, 0)
  const level = Math.floor(totalXP / 1000) + 1
  const currentLevelXP = totalXP % 1000
  const activeObjectives = objectives.filter(obj => obj.status === "active")
  const completedObjectives = objectives.filter(obj => obj.status === "completed")

  const categoryColors: Record<string, string> = {
    "Musique": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "Santé": "bg-red-500/20 text-red-400 border-red-500/30",
    "Bien-être": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "Projet": "bg-green-500/20 text-green-400 border-green-500/30"
  }

  const difficultyColors: Record<string, string> = {
    "Facile": "text-green-400",
    "Moyen": "text-orange-400",
    "Difficile": "text-red-400"
  }

  return (
    <AuthLayout>
      <div className="container mx-auto px-4 py-8">
        {/* User Stats Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
              <p className="text-muted-foreground">Suivez votre progression et accomplissez vos objectifs</p>
            </div>
            <Button 
              onClick={() => router.push("/objectives")}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvel objectif
            </Button>
          </div>

          {/* Global Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="h-5 w-5 text-purple-400" />
                <Badge className="bg-purple-500/20 text-purple-300">Niveau {level}</Badge>
              </div>
              <p className="text-2xl font-bold">{totalXP}</p>
              <p className="text-xs text-muted-foreground">XP Total</p>
              <Progress value={(currentLevelXP / 1000) * 100} className="mt-2 h-1" />
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-5 w-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold">{activeObjectives.length}</p>
              <p className="text-xs text-muted-foreground">Objectifs actifs</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold">{completedObjectives.length}</p>
              <p className="text-xs text-muted-foreground">Complétés</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Flame className="h-5 w-5 text-orange-400" />
              </div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-muted-foreground">Jours de série</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Award className="h-5 w-5 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs text-muted-foreground">Badges gagnés</p>
            </Card>
          </div>
        </div>

        {/* Objectives Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Objectives */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Objectifs en cours</h2>
              <Button variant="ghost" size="sm">
                Voir tout
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="space-y-4">
              {objectives.map((objective) => (
                <Card 
                  key={objective.id} 
                  className={`p-6 cursor-pointer hover:shadow-lg transition-all ${
                    objective.status === "completed" ? "opacity-60" : ""
                  } ${objective.status === "paused" ? "border-orange-500/30" : ""}`}
                  onClick={() => router.push("/objectives")}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{objective.title}</h3>
                        {objective.status === "completed" && (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        )}
                        {objective.status === "paused" && (
                          <Clock className="h-5 w-5 text-orange-400" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{objective.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={categoryColors[objective.category]}>
                          {objective.category}
                        </Badge>
                        <Badge variant="outline" className="border-border">
                          <Star className={`h-3 w-3 mr-1 ${difficultyColors[objective.difficulty]}`} />
                          {objective.difficulty}
                        </Badge>
                        {objective.streak && objective.streak > 0 && (
                          <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                            <Flame className="h-3 w-3 mr-1" />
                            {objective.streak} jours
                          </Badge>
                        )}
                        {objective.daysLeft && (
                          <Badge variant="outline" className="border-border">
                            <Calendar className="h-3 w-3 mr-1" />
                            {objective.daysLeft}j restants
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-400">{objective.progress}%</p>
                      <p className="text-xs text-muted-foreground">{objective.xp} XP</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-medium">{objective.completedSteps}/{objective.totalSteps} étapes</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          objective.status === "completed" 
                            ? "bg-green-500" 
                            : "bg-gradient-to-r from-purple-500 to-blue-500"
                        }`}
                        style={{ width: `${objective.progress}%` }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Recent Achievements */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-400" />
                Derniers accomplissements
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Première semaine complète</p>
                    <p className="text-xs text-muted-foreground">Il y a 2 jours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center">
                    <Flame className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Série de 10 jours</p>
                    <p className="text-xs text-muted-foreground">Il y a 4 jours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Premier objectif complété</p>
                    <p className="text-xs text-muted-foreground">Il y a 1 semaine</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Weekly Progress */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Progression hebdomadaire
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Lun</span>
                  <div className="flex-1 mx-3 h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: "80%" }} />
                  </div>
                  <span className="text-xs font-medium">80%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mar</span>
                  <div className="flex-1 mx-3 h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: "100%" }} />
                  </div>
                  <span className="text-xs font-medium">100%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mer</span>
                  <div className="flex-1 mx-3 h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: "60%" }} />
                  </div>
                  <span className="text-xs font-medium">60%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Jeu</span>
                  <div className="flex-1 mx-3 h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: "90%" }} />
                  </div>
                  <span className="text-xs font-medium">90%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ven</span>
                  <div className="flex-1 mx-3 h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: "75%" }} />
                  </div>
                  <span className="text-xs font-medium">75%</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Moyenne</span>
                  <span className="text-lg font-bold text-purple-400">81%</span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
              <h3 className="font-semibold mb-4">Actions rapides</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-purple-500/30 hover:bg-purple-500/10"
                  onClick={() => router.push("/objectives")}
                >
                  <Zap className="h-4 w-4 mr-2 text-purple-400" />
                  Continuer "Apprendre la guitare"
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-purple-500/30 hover:bg-purple-500/10"
                >
                  <Trophy className="h-4 w-4 mr-2 text-yellow-400" />
                  Voir mes badges
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-purple-500/30 hover:bg-purple-500/10"
                >
                  <Target className="h-4 w-4 mr-2 text-blue-400" />
                  Explorer les templates
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}