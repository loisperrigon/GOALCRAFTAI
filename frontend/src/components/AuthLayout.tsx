"use client"

import { useState, useEffect } from "react"
import AuthModal from "@/components/AuthModal"
import PricingModal from "@/components/PricingModal"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SimpleStreak } from "@/components/SimpleStreak"
import { useObjectiveStore } from "@/stores/objective-store"
import { useUserStore } from "@/stores/user-store"
import { Spinner } from "@/components/ui/loader"
import { 
  LayoutDashboard,
  Target,
  User,
  Award,
  Menu,
  X,
  Plus,
  LogOut,
  Crown,
  Gamepad2,
  Trophy,
  Calendar
} from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode
}

interface Objective {
  id: string
  title: string
  progress: number
  xp: number
  totalSteps: number
  completedSteps: number
  isActive?: boolean
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const { user, isAuthenticated } = useUserStore()
  const { setActiveObjective, currentObjective } = useObjectiveStore()
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(currentObjective?.id || null)
  const [isLoadingObjective, setIsLoadingObjective] = useState(false)
  const [objectives, setObjectives] = useState<any[]>([])
  const [loadingObjectives, setLoadingObjectives] = useState(true)
  
  // Charger les objectifs depuis MongoDB au montage
  useEffect(() => {
    loadObjectives()
  }, [])
  
  // Gérer les changements d'objectif actif
  useEffect(() => {
    if (currentObjective) {
      setSelectedObjectiveId(currentObjective.id)
      
      // Si c'est un objectif temporaire, l'ajouter/mettre à jour dans la liste
      if (currentObjective.isTemporary) {
        setObjectives(prev => {
          const exists = prev.find(obj => obj.id === currentObjective.id)
          if (!exists) {
            return [currentObjective, ...prev]
          }
          // Mettre à jour l'objectif existant
          return prev.map(obj => 
            obj.id === currentObjective.id ? currentObjective : obj
          )
        })
      } else {
        // Si ce n'est plus temporaire, remplacer l'objectif temporaire par le permanent
        setObjectives(prev => {
          // Enlever l'objectif temporaire avec le même ID
          const filtered = prev.filter(obj => obj.id !== currentObjective.id || !obj.isTemporary)
          // Ajouter la version non-temporaire si elle n'existe pas déjà
          const exists = filtered.find(obj => obj.id === currentObjective.id)
          if (!exists) {
            return [currentObjective, ...filtered]
          }
          return filtered.map(obj => 
            obj.id === currentObjective.id ? currentObjective : obj
          )
        })
        // Recharger depuis MongoDB après un délai pour avoir la version à jour
        setTimeout(() => loadObjectives(), 1000)
      }
    }
  }, [currentObjective])
  
  const loadObjectives = async () => {
    try {
      // Ne montrer le loader que si on n'a pas encore d'objectifs
      if (objectives.length === 0) {
        setLoadingObjectives(true)
      }
      
      const response = await fetch('/api/objectives')
      const data = await response.json()
      
      if (data.success && data.objectives) {
        console.log(`[AuthLayout] ${data.objectives.length} objectifs chargés depuis MongoDB`)
        
        // Préserver les objectifs temporaires existants
        setObjectives(prev => {
          const tempObjectives = prev.filter(obj => obj.isTemporary)
          return [...tempObjectives, ...data.objectives]
        })
      } else {
        console.error("[AuthLayout] Erreur lors du chargement des objectifs")
      }
    } catch (error) {
      console.error("[AuthLayout] Erreur:", error)
    } finally {
      setLoadingObjectives(false)
    }
  }

  const navigationItems = [
    { 
      href: "/dashboard", 
      label: "Tableau de bord", 
      icon: LayoutDashboard,
      active: pathname === "/dashboard"
    }
  ]
  
  // Utiliser les données du store user
  const currentUser = user || {
    name: "Utilisateur",
    email: "user@example.com",
    avatar: null,
    level: 1,
    xp: 0
  }

  const handleObjectiveClick = async (objective: any) => {
    setSelectedObjectiveId(objective.id)
    setIsLoadingObjective(true)
    
    // Charger l'objectif dans le store
    setActiveObjective(objective)
    
    setIsLoadingObjective(false)
    router.push("/objectives")
  }

  return (
    <div className="h-screen overflow-hidden bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 border-r border-border bg-card/50 backdrop-blur h-screen flex-col overflow-hidden">
          {/* Fixed header section */}
          <div className="p-4 flex-shrink-0">
            {/* Logo Section */}
            <div className="mb-4">
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => router.push("/")}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">G</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  GoalCraftAI
                </span>
              </div>
            </div>
            
            {/* User Profile Section with Streak */}
            <div 
              className="mb-6 flex items-center justify-between gap-2 p-2 bg-purple-500/10 rounded-lg cursor-pointer hover:bg-purple-500/20 transition-colors"
              onClick={() => router.push("/profile")}
            >
              {/* Profile */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-muted-foreground">Niv. {currentUser.level}</p>
                </div>
              </div>
              
              {/* Streak dans le même conteneur */}
              <div className="flex-shrink-0">
                <SimpleStreak />
              </div>
            </div>

            <div className="mb-4">
              <h2 className="text-sm font-medium text-muted-foreground">Navigation</h2>
            </div>
          </div>

          {/* Scrollable content section */}
          <div className="flex-1 overflow-y-auto px-4">
            {/* Navigation Links */}
            <div className="space-y-1 mb-6">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className={`w-full justify-start ${
                      item.active 
                        ? "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20" 
                        : "hover:bg-purple-500/10"
                    }`}
                    onClick={() => router.push(item.href)}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                )
              })}
            </div>

            {/* Objectives Section */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">Mes Objectifs</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 hover:bg-purple-500/10"
                  onClick={async () => {
                    if (!isAuthenticated) {
                      setShowAuthModal(true)
                    } else {
                      // Vérifier s'il y a déjà un objectif temporaire
                      const existingTemp = objectives.find(obj => obj.isTemporary)
                      
                      if (existingTemp) {
                        // S'il existe déjà, le sélectionner au lieu d'en créer un nouveau
                        setActiveObjective(existingTemp)
                        router.push("/objectives")
                      } else {
                        // Créer un nouvel objectif temporaire
                        const tempObjective = {
                          id: `temp-${Date.now()}`,
                          title: "Nouvel objectif",
                          description: "En attente de votre description...",
                          category: "general",
                          difficulty: "intermediate",
                          progress: 0,
                          completedSteps: [],
                          skillTree: { nodes: [] },
                          createdAt: new Date(),
                          isTemporary: true
                        }
                        
                        // Ajouter l'objectif temporaire à la liste
                        setObjectives(prev => [tempObjective, ...prev])
                        setActiveObjective(tempObjective)
                        router.push("/objectives")
                      }
                    }
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="space-y-2 pb-4">
                      {loadingObjectives ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="text-center">
                            <Spinner size="md" className="mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">Chargement des objectifs...</p>
                          </div>
                        </div>
                      ) : objectives.length === 0 ? (
                        <div className="text-center py-8">
                          <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">Aucun objectif créé</p>
                          <p className="text-xs text-muted-foreground mt-1">Commencez par discuter avec l'IA</p>
                        </div>
                      ) : objectives.map((objective) => (
                        <Card 
                          key={objective.id}
                          className={`p-3 cursor-pointer transition-all hover:shadow-md relative ${
                            objective.id === currentObjective?.id
                              ? "border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10" 
                              : "border-border hover:border-purple-500/20 hover:bg-purple-500/5"
                          } ${isLoadingObjective && objective.id === selectedObjectiveId ? "opacity-60" : ""} ${
                            objective.isTemporary ? "animate-pulse" : ""
                          }`}
                          onClick={() => {
                            if (!isLoadingObjective) {
                              if (objective.isTemporary) {
                                // Pour un objectif temporaire, juste le sélectionner et aller à /objectives
                                setActiveObjective(objective)
                                router.push("/objectives")
                              } else {
                                // Pour un objectif normal, utiliser handleObjectiveClick
                                handleObjectiveClick(objective)
                              }
                            }
                          }}
                        >
                          {isLoadingObjective && objective.id === selectedObjectiveId && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                              <Spinner size="sm" />
                            </div>
                          )}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-xs line-clamp-1">{objective.title}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {objective.completedSteps?.length || 0}/{objective.skillTree?.nodes?.length || 0} étapes
                              </p>
                            </div>
                            <Badge className="bg-purple-500/20 text-purple-300 text-xs px-1.5 py-0">
                              {Math.round(objective.progress || 0)}%
                            </Badge>
                          </div>
                          <div className="w-full bg-background/50 rounded-full h-1">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-1 rounded-full transition-all"
                              style={{ width: `${objective.progress || 0}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              {objective.skillTree?.nodes?.reduce((sum: number, node: any) => sum + (node.xpReward || 0), 0) || 0} XP
                            </span>
                          </div>
                        </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Premium CTA Footer - Always visible */}
          {!user?.isPremium && (
            <div className="p-4 border-t border-border flex-shrink-0">
              <Card className="p-3 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-semibold">Passer Premium</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Débloquez l'IA illimitée et toutes les fonctionnalités
                </p>
                <Button 
                  size="sm"
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                  onClick={() => setShowPricingModal(true)}
                >
                  Voir les offres
                </Button>
              </Card>
            </div>
          )}
      </div>

        {/* Mobile Sidebar Button */}
        <button
          className="md:hidden fixed bottom-4 right-4 z-20 p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white shadow-lg"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Mobile Sidebar */}
        {isMobileSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="fixed top-0 left-0 h-full w-[280px] bg-background border-r border-border z-40 md:hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">G</span>
                  </div>
                  <span className="font-bold">GoalCraftAI</span>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-4 flex flex-col h-[calc(100%-73px)]">
                {/* Mobile Navigation */}
                <div className="space-y-1 mb-4">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Button
                        key={item.href}
                        variant="ghost"
                        className={`w-full justify-start ${
                          item.active 
                            ? "bg-purple-500/10 text-purple-400" 
                            : "hover:bg-purple-500/10"
                        }`}
                        onClick={() => {
                          router.push(item.href)
                          setIsMobileSidebarOpen(false)
                        }}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {item.label}
                      </Button>
                    )
                  })}
                </div>

                {/* Mobile Objectives Section */}
                <div className="border-t border-border pt-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Mes Objectifs</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 hover:bg-purple-500/10"
                      onClick={() => {
                        if (!isAuthenticated) {
                          setShowAuthModal(true)
                          setIsMobileSidebarOpen(false)
                        } else {
                          // Vérifier s'il y a déjà un objectif temporaire
                          const existingTemp = objectives.find(obj => obj.isTemporary)
                          
                          if (existingTemp) {
                            // S'il existe déjà, le sélectionner au lieu d'en créer un nouveau
                            setActiveObjective(existingTemp)
                          } else {
                            // Créer un nouvel objectif temporaire
                            const tempObjective = {
                              id: `temp-${Date.now()}`,
                              title: "Nouvel objectif",
                              description: "En attente de votre description...",
                              category: "general",
                              difficulty: "intermediate",
                              progress: 0,
                              completedSteps: [],
                              skillTree: { nodes: [] },
                              createdAt: new Date(),
                              isTemporary: true
                            }
                            
                            // Ajouter l'objectif temporaire à la liste
                            setObjectives(prev => [tempObjective, ...prev])
                            setActiveObjective(tempObjective)
                          }
                          router.push("/objectives")
                          setIsMobileSidebarOpen(false)
                        }
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="h-[320px] overflow-y-auto">
                    <div className="space-y-2">
                      {loadingObjectives ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="text-center">
                            <Spinner size="md" className="mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">Chargement des objectifs...</p>
                          </div>
                        </div>
                      ) : objectives.length === 0 ? (
                        <div className="text-center py-8">
                          <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">Aucun objectif créé</p>
                          <p className="text-xs text-muted-foreground mt-1">Commencez par discuter avec l'IA</p>
                        </div>
                      ) : objectives.map((objective) => (
                        <Card 
                          key={objective.id}
                          className={`p-3 cursor-pointer transition-all ${
                            objective.id === currentObjective?.id
                              ? "border-purple-500/30 bg-purple-500/5" 
                              : "border-border"
                          } ${objective.isTemporary ? "animate-pulse" : ""}`}
                          onClick={() => {
                            if (objective.isTemporary) {
                              // Pour un objectif temporaire, juste le sélectionner
                              setActiveObjective(objective)
                              router.push("/objectives")
                            } else {
                              // Pour un objectif normal, utiliser handleObjectiveClick
                              handleObjectiveClick(objective)
                            }
                            setIsMobileSidebarOpen(false)
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-xs">{objective.title}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {objective.completedSteps?.length || 0}/{objective.skillTree?.nodes?.length || 0} étapes
                              </p>
                            </div>
                            <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                              {objective.progress}%
                            </Badge>
                          </div>
                          <div className="w-full bg-background/50 rounded-full h-1">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-1 rounded-full"
                              style={{ width: `${objective.progress || 0}%` }}
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mobile Premium CTA */}
                {!user?.isPremium && (
                  <Card className="p-3 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-semibold">Passer Premium</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Débloquez l'IA illimitée
                    </p>
                    <Button 
                      size="sm"
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                      onClick={() => {
                        setShowPricingModal(true)
                        setIsMobileSidebarOpen(false)
                      }}
                    >
                      Voir les offres
                    </Button>
                  </Card>
                )}

                {/* Mobile User Profile Section */}
                <div className="mt-auto border-t border-border pt-4">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-purple-500/5 cursor-pointer transition-colors"
                       onClick={() => {
                         router.push("/profile")
                         setIsMobileSidebarOpen(false)
                       }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Jean Dupont</p>
                        <p className="text-xs text-muted-foreground">jean.dupont@email.com</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-500/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push("/auth")
                        setIsMobileSidebarOpen(false)
                      }}
                    >
                      <LogOut className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden h-screen">
        {children}
      </main>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false)
          window.location.reload()
        }}
      />
      
      {/* Pricing Modal */}
      <PricingModal 
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
      />
    </div>
  )
}