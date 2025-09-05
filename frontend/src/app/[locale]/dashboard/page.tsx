"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AuthModal from "@/components/AuthModal"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import AuthLayout from "@/components/AuthLayout"
import { useUserStore } from "@/stores/user-store"
import { useObjectiveStore } from "@/stores/objective-store"
import { useStreakStore } from "@/stores/streak-store"
import { mockObjectives } from "@/data/mockObjectives"
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
  Sparkles,
  Music,
  Heart,
  Briefcase,
  BookOpen
} from "lucide-react"

export default function Dashboard() {
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user, isAuthenticated } = useUserStore()
  const { currentObjective, fetchObjective } = useObjectiveStore()
  const { currentStreak } = useStreakStore()
  
  // Vérifier l'authentification
  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
    }
  }, [isAuthenticated])
  
  // Utiliser les mêmes données que la sidebar (mockObjectives avec currentObjective mis à jour)
  const objectives = mockObjectives.map(obj => {
    if (currentObjective && obj.id === currentObjective.id) {
      return currentObjective
    }
    return obj
  })
  
  // Calculer les vraies stats depuis les données
  const totalXP = user?.xp || 0
  const level = user?.level || 1
  const currentLevelXP = totalXP % 1000
  const badges = user?.badges || []
  const achievements = user?.achievements || []
  
  const activeObjectives = objectives.filter(obj => obj.status === "active")
  const completedObjectives = objectives.filter(obj => obj.status === "completed")
  const pausedObjectives = objectives.filter(obj => obj.status === "paused")
  
  // Mapper les catégories aux icônes et couleurs
  const categoryConfig: Record<string, { icon: any, color: string }> = {
    "learning": { 
      icon: BookOpen, 
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30" 
    },
    "health": { 
      icon: Heart, 
      color: "bg-red-500/20 text-red-400 border-red-500/30" 
    },
    "professional": { 
      icon: Briefcase, 
      color: "bg-purple-500/20 text-purple-400 border-purple-500/30" 
    },
    "personal": { 
      icon: Star, 
      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" 
    },
    "creative": { 
      icon: Music, 
      color: "bg-green-500/20 text-green-400 border-green-500/30" 
    }
  }
  
  const difficultyColors: Record<string, string> = {
    "easy": "text-green-400",
    "medium": "text-orange-400",
    "hard": "text-red-400",
    "expert": "text-purple-400"
  }
  
  const handleObjectiveClick = async (objectiveId: string) => {
    await fetchObjective(objectiveId)
    router.push("/objectives")
  }

  // Si non connecté, afficher un placeholder avec modal
  if (!isAuthenticated) {
    return (
      <>
        <AuthLayout>
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-2">Connexion requise</h2>
                <p className="text-muted-foreground mb-6">
                  Connectez-vous pour accéder à votre tableau de bord
                </p>
                <Button 
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                >
                  Se connecter
                </Button>
              </div>
            </div>
          </div>
        </AuthLayout>
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false)
            // Si toujours pas connecté, retourner à la page d'accueil
            if (!isAuthenticated) {
              router.push("/")
            }
          }}
          onSuccess={() => {
            setShowAuthModal(false)
            // Rafraîchir la page après connexion
            window.location.reload()
          }}
          redirectTo="/dashboard"
        />
      </>
    )
  }

  return (
    <AuthLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
              <p className="text-muted-foreground">
                Bienvenue {user?.name || "Aventurier"} ! Suivez votre progression
              </p>
            </div>
            <Button 
              onClick={() => router.push("/objectives")}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvel objectif
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="h-5 w-5 text-purple-400" />
                <Badge className="bg-purple-500/20 text-purple-300">
                  Niveau {level}
                </Badge>
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
              <p className="text-2xl font-bold">{currentStreak}</p>
              <p className="text-xs text-muted-foreground">Jours de série</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Award className="h-5 w-5 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold">{badges.length}</p>
              <p className="text-xs text-muted-foreground">Badges gagnés</p>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Objectives List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Vos objectifs</h2>
              <span className="text-sm text-muted-foreground">
                {objectives.length} au total
              </span>
            </div>

            <div className="space-y-4">
              {objectives.map((objective) => {
                const categoryInfo = categoryConfig[objective.category] || categoryConfig.personal
                const CategoryIcon = categoryInfo.icon
                
                return (
                  <Card 
                    key={objective.id} 
                    className={`p-6 cursor-pointer hover:shadow-lg transition-all ${
                      objective.status === "completed" ? "opacity-60" : ""
                    } ${objective.status === "paused" ? "border-orange-500/30" : ""}`}
                    onClick={() => handleObjectiveClick(objective.id)}
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
                        <p className="text-sm text-muted-foreground mb-3">
                          {objective.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className={categoryInfo.color}>
                            <CategoryIcon className="h-3 w-3 mr-1" />
                            {objective.metadata?.category || objective.category}
                          </Badge>
                          <Badge variant="outline" className="border-border">
                            <Star className={`h-3 w-3 mr-1 ${difficultyColors[objective.difficulty]}`} />
                            {objective.difficulty}
                          </Badge>
                          {objective.aiGenerated && (
                            <Badge variant="outline" className="border-purple-500/30">
                              <Sparkles className="h-3 w-3 mr-1 text-purple-400" />
                              IA
                            </Badge>
                          )}
                          {objective.metadata?.estimatedDuration && (
                            <Badge variant="outline" className="border-border">
                              <Calendar className="h-3 w-3 mr-1" />
                              {objective.metadata.estimatedDuration}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-400">
                          {Math.round(objective.progress)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {objective.xpEarned || 0}/{objective.xpReward} XP
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progression</span>
                        <span className="font-medium">
                          {objective.completedSteps}/{objective.totalSteps} étapes
                        </span>
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
                )
              })}
              
              {objectives.length === 0 && (
                <Card className="p-12 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">Aucun objectif pour le moment</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Commencez votre aventure en créant votre premier objectif
                  </p>
                  <Button 
                    onClick={() => router.push("/objectives")}
                    className="bg-gradient-to-r from-purple-500 to-blue-500"
                  >
                    Créer un objectif
                  </Button>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Level Progress Card */}
            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-400" />
                Progression du niveau
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Niveau {level}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {user?.name || "Aventurier"}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">XP actuel</span>
                    <span className="font-medium">{totalXP}</span>
                  </div>
                  <Progress 
                    value={(currentLevelXP / 1000) * 100} 
                    className="h-3" 
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{currentLevelXP} XP</span>
                    <span>1000 XP</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    Plus que {1000 - currentLevelXP} XP pour le niveau {level + 1} !
                  </p>
                </div>
              </div>
            </Card>

            {/* Recent Achievements */}
            {achievements.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  Derniers accomplissements
                </h3>
                <div className="space-y-3">
                  {achievements.slice(0, 3).map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                        <Award className="h-5 w-5 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{achievement.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            
            {/* Motivation Quote */}
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
              <Sparkles className="h-5 w-5 text-purple-400 mb-3" />
              <p className="text-sm italic">
                "Le succès est la somme de petits efforts répétés jour après jour."
              </p>
              <p className="text-xs text-muted-foreground mt-2">- Robert Collier</p>
            </Card>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}