"use client"

import { useState, useEffect, useCallback, memo } from "react"
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

function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const { user, isAuthenticated } = useUserStore()
  const { setActiveObjective, currentObjective } = useObjectiveStore()
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(currentObjective?.id || null)
  const [isLoadingObjective, setIsLoadingObjective] = useState(false)
  const [conversations, setConversations] = useState<any[]>([])
  const [loadingConversations, setLoadingConversations] = useState(true)
  
  // Event listener pour le toggle de sidebar depuis l'extérieur
  useEffect(() => {
    const handleToggleSidebar = () => {
      setIsMobileSidebarOpen(prev => !prev)
    }
    
    window.addEventListener('toggle-sidebar', handleToggleSidebar)
    
    return () => {
      window.removeEventListener('toggle-sidebar', handleToggleSidebar)
    }
  }, [])
  
  const loadConversations = useCallback(async () => {
    try {
      // Ne montrer le loader que si on n'a pas encore de conversations
      if (conversations.length === 0) {
        setLoadingConversations(true)
      }
      
      const response = await fetch('/api/conversations?all=true')
      
      // Si non authentifié, rediriger vers /auth
      if (response.status === 401) {
        console.log("[AuthLayout] Utilisateur non authentifié, redirection vers /auth")
        router.push('/auth')
        return []
      }
      
      const data = await response.json()
      
      if (data.success && data.conversations) {
        console.log(`[AuthLayout] ${data.conversations.length} conversations chargées depuis MongoDB`)
        setConversations(data.conversations)
        return data.conversations // Retourner les conversations pour pouvoir les utiliser
      } else {
        console.error("[AuthLayout] Erreur lors du chargement des conversations")
        return []
      }
    } catch (error) {
      console.error("[AuthLayout] Erreur:", error)
      return []
    } finally {
      setLoadingConversations(false)
    }
  }, [conversations.length])
  
  // Charger les conversations depuis MongoDB au montage
  useEffect(() => {
    const initializeConversations = async () => {
      const loadedConversations = await loadConversations()
      
      // Sélectionner automatiquement la dernière conversation si disponible et si on n'a pas déjà une sélection
      if (!selectedObjectiveId && !currentObjective && loadedConversations && loadedConversations.length > 0) {
        // Trier les conversations par date de dernière activité (plus récent en premier)
        const sortedConversations = [...loadedConversations].sort((a, b) => {
          // Utiliser updatedAt ou le timestamp du dernier message, ou createdAt en fallback
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 
                        a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() :
                        a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 
                        b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() :
                        b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA // Ordre décroissant (plus récent en premier)
        })
        
        // Sélectionner la conversation avec l'activité la plus récente
        const mostRecentConversation = sortedConversations[0]
        handleConversationClick(mostRecentConversation)
      }
    }
    
    initializeConversations()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  // Recharger les conversations quand un objectif change de status
  useEffect(() => {
    if (currentObjective) {
      // Recharger quand l'objectif passe en génération ou est complété
      if (currentObjective.status === 'generating' || currentObjective.status === 'active') {
        loadConversations()
      }
    }
  }, [currentObjective?.status, loadConversations])

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

  const handleConversationClick = useCallback(async (conversation: any) => {
    setSelectedObjectiveId(conversation._id)
    setIsLoadingObjective(true)
    
    try {
      // Si la conversation a un objectifId, charger l'objectif complet depuis la DB
      if (conversation.objectiveId) {
        console.log(`[AuthLayout] Chargement de l'objectif ${conversation.objectiveId}`)
        const response = await fetch(`/api/objectives/${conversation.objectiveId}`)
        const data = await response.json()
        
        if (data.success && data.objective) {
          console.log(`[AuthLayout] Objectif chargé avec succès:`, data.objective.title)
          setActiveObjective({
            ...data.objective,
            conversationId: conversation._id,
            isPlaceholder: false // S'assurer que ce n'est pas un placeholder
          })
        } else {
          // Si on ne peut pas charger l'objectif, créer un placeholder
          console.warn(`[AuthLayout] Impossible de charger l'objectif ${conversation.objectiveId}`)
          setActiveObjective({
            id: conversation.objectiveId,
            conversationId: conversation._id,
            title: "Chargement...",
            description: "",
            category: "general",
            difficulty: "intermediate",
            progress: 0,
            completedSteps: [],
            skillTree: { nodes: [], edges: [] },
            isPlaceholder: true
          })
        }
      } else {
        // Créer un placeholder pour la conversation vide
        setActiveObjective({
          id: `placeholder-${conversation._id}`,
          conversationId: conversation._id,
          title: "Nouvelle conversation",
          description: "",
          category: "general",
          difficulty: "intermediate",
          progress: 0,
          completedSteps: [],
          skillTree: { nodes: [], edges: [] },
          isPlaceholder: true
        })
      }
    } catch (error) {
      console.error("[AuthLayout] Erreur chargement objectif:", error)
    } finally {
      setIsLoadingObjective(false)
      router.push("/objectives")
    }
  }, [router, setActiveObjective])

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
                <h3 className="text-sm font-medium text-muted-foreground">Mes Conversations</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 hover:bg-purple-500/10"
                  onClick={async () => {
                    if (!isAuthenticated) {
                      router.push('/auth')
                    } else {
                      try {
                        // Créer une nouvelle conversation vide
                        console.log("[AuthLayout] Création d'une nouvelle conversation")
                        const response = await fetch('/api/conversations/new', {
                          method: 'POST'
                        })
                        const data = await response.json()
                        
                        if (data.success && data.conversationId) {
                          console.log("[AuthLayout] Nouvelle conversation créée:", data.conversationId)
                          
                          // Créer un placeholder pour cette conversation
                          setActiveObjective({
                            id: `placeholder-${data.conversationId}`,
                            conversationId: data.conversationId,
                            title: "Nouvelle conversation",
                            description: "",
                            category: "general",
                            difficulty: "intermediate",
                            progress: 0,
                            completedSteps: [],
                            skillTree: { nodes: [], edges: [] },
                            isPlaceholder: true
                          })
                          
                          // Recharger les conversations pour afficher la nouvelle
                          loadConversations()
                          router.push("/objectives")
                        }
                      } catch (error) {
                        console.error("[AuthLayout] Erreur création conversation:", error)
                      }
                    }
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="space-y-2 pb-4">
                      {loadingConversations ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="text-center">
                            <Spinner size="md" className="mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">Chargement des conversations...</p>
                          </div>
                        </div>
                      ) : conversations.length === 0 ? (
                        <div className="text-center py-8">
                          <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">Aucune conversation</p>
                          <p className="text-xs text-muted-foreground mt-1">Commencez par discuter avec l'IA</p>
                        </div>
                      ) : conversations.map((conversation) => (
                        <Card 
                          key={conversation._id}
                          className={`p-3 cursor-pointer transition-all hover:shadow-md relative ${
                            conversation._id === selectedObjectiveId
                              ? "border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10" 
                              : "border-border hover:border-purple-500/20 hover:bg-purple-500/5"
                          } ${isLoadingObjective && conversation._id === selectedObjectiveId ? "opacity-60" : ""}
                          ${conversation.status === 'generating_objective' ? "animate-pulse bg-gradient-to-r from-purple-500/5 to-blue-500/5" : ""}`}
                          onClick={() => {
                            if (!isLoadingObjective) {
                              handleConversationClick(conversation)
                            }
                          }}
                        >
                          {isLoadingObjective && conversation._id === selectedObjectiveId && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                              <Spinner size="sm" />
                            </div>
                          )}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-xs line-clamp-1">
                                {conversation.objectiveInfo?.title || 
                                 (conversation.hasObjective ? "Objectif en cours" : "Nouvelle conversation")}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {conversation.messagesCount || 0} messages
                                {conversation.objectiveInfo?.stepsCount > 0 && ` • ${conversation.objectiveInfo.stepsCount} étapes`}
                              </p>
                            </div>
                            {conversation.hasObjective && (
                              <Badge className="bg-purple-500/20 text-purple-300 text-xs px-1.5 py-0">
                                <Target className="h-3 w-3" />
                              </Badge>
                            )}
                          </div>
                          {conversation.lastMessage && (
                            <div className="text-xs text-muted-foreground line-clamp-2 mt-2">
                              "{conversation.lastMessage.content}"
                            </div>
                          )}
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
                    <h3 className="text-sm font-medium text-muted-foreground">Mes Conversations</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 hover:bg-purple-500/10"
                      onClick={async () => {
                        if (!isAuthenticated) {
                          router.push('/auth')
                          setIsMobileSidebarOpen(false)
                        } else {
                          try {
                            // Créer une nouvelle conversation vide
                            const response = await fetch('/api/conversations/new', {
                              method: 'POST'
                            })
                            const data = await response.json()
                            
                            if (data.success && data.conversationId) {
                              // Créer un placeholder pour cette conversation
                              setActiveObjective({
                                id: `placeholder-${data.conversationId}`,
                                conversationId: data.conversationId,
                                title: "Nouvelle conversation",
                                description: "",
                                category: "general",
                                difficulty: "intermediate",
                                progress: 0,
                                completedSteps: [],
                                skillTree: { nodes: [], edges: [] },
                                isPlaceholder: true
                              })
                              
                              // Recharger les conversations
                              loadConversations()
                              router.push("/objectives")
                              setIsMobileSidebarOpen(false)
                            }
                          } catch (error) {
                            console.error("[AuthLayout] Erreur création conversation:", error)
                          }
                        }
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="h-[320px] overflow-y-auto">
                    <div className="space-y-2">
                      {loadingConversations ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="text-center">
                            <Spinner size="md" className="mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">Chargement des conversations...</p>
                          </div>
                        </div>
                      ) : conversations.length === 0 ? (
                        <div className="text-center py-8">
                          <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">Aucune conversation</p>
                          <p className="text-xs text-muted-foreground mt-1">Commencez par discuter avec l'IA</p>
                        </div>
                      ) : conversations.map((conversation) => (
                        <Card 
                          key={conversation._id}
                          className={`p-3 cursor-pointer transition-all ${
                            conversation._id === selectedObjectiveId
                              ? "border-purple-500/30 bg-purple-500/5" 
                              : "border-border"
                          } ${conversation.status === 'generating_objective' ? "animate-pulse bg-gradient-to-r from-purple-500/5 to-blue-500/5" : ""}`}
                          onClick={() => {
                            handleConversationClick(conversation)
                            setIsMobileSidebarOpen(false)
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-xs">
                                {conversation.objectiveInfo?.title || 
                                 (conversation.hasObjective ? "Objectif en cours" : "Nouvelle conversation")}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {conversation.messagesCount || 0} messages
                                {conversation.objectiveInfo?.stepsCount > 0 && ` • ${conversation.objectiveInfo.stepsCount} étapes`}
                              </p>
                            </div>
                            {conversation.hasObjective && (
                              <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                                <Target className="h-3 w-3" />
                              </Badge>
                            )}
                          </div>
                          {conversation.lastMessage && (
                            <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                              "{conversation.lastMessage.content}"
                            </div>
                          )}
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
      
      
      {/* Pricing Modal */}
      <PricingModal 
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
      />
    </div>
  )
}

export default memo(AuthLayout)