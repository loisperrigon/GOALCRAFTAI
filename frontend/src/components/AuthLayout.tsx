"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SimpleStreak } from "@/components/SimpleStreak"
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Objectifs simulés - En production, viendraient d'un store global ou API
  const [objectives] = useState<Objective[]>([
    {
      id: "1",
      title: "Apprendre la guitare",
      progress: 35,
      xp: 420,
      totalSteps: 12,
      completedSteps: 4,
      isActive: true
    },
    {
      id: "2",
      title: "Perdre 10kg",
      progress: 53,
      xp: 630,
      totalSteps: 15,
      completedSteps: 8
    },
    {
      id: "3",
      title: "Méditer quotidiennement",
      progress: 43,
      xp: 210,
      totalSteps: 7,
      completedSteps: 3
    }
  ])

  const navigationItems = [
    { 
      href: "/dashboard", 
      label: "Tableau de bord", 
      icon: LayoutDashboard,
      active: pathname === "/dashboard"
    },
    { 
      href: "/profile?tab=achievements", 
      label: "Mes Badges", 
      icon: Award,
      active: pathname === "/profile" && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get("tab") === "achievements"
    }
  ]
  
  // Mock user data - à remplacer par vraies données
  const currentUser = {
    name: "Loïs Martin",
    email: "lois@example.com",
    avatar: null,
    level: 12,
    xp: 1250
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex flex-1 h-screen">
        {/* Desktop Sidebar */}
        <div className={`hidden md:block border-r border-border bg-card/50 backdrop-blur transition-all duration-300 ${
          isSidebarCollapsed ? "w-16" : "w-64"
        }`}>
          <div className="p-4 h-full flex flex-col">
            {/* Logo Section */}
            <div className="mb-4">
              <div 
                className={`flex items-center gap-2 cursor-pointer ${isSidebarCollapsed ? 'justify-center' : ''}`}
                onClick={() => router.push("/")}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">G</span>
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    GoalCraftAI
                  </span>
                )}
              </div>
            </div>
            
            {/* User Profile Section */}
            {!isSidebarCollapsed && (
              <div 
                className="mb-4 p-3 bg-purple-500/10 rounded-lg cursor-pointer hover:bg-purple-500/20 transition-colors"
                onClick={() => router.push("/profile")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Niveau {currentUser.level}</span>
                  <span className="text-xs font-medium text-purple-400">{currentUser.xp} XP</span>
                </div>
              </div>
            )}
            
            {/* Streak Display */}
            {!isSidebarCollapsed && (
              <div className="mb-6 p-3 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
                <SimpleStreak />
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              {!isSidebarCollapsed && (
                <h2 className="text-sm font-medium text-muted-foreground">Navigation</h2>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hover:bg-purple-500/10"
              >
                {isSidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </Button>
            </div>

            {!isSidebarCollapsed && (
              <>
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
                <div className="border-t border-border pt-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Mes Objectifs</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 hover:bg-purple-500/10"
                      onClick={() => router.push("/objectives")}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {objectives.map((objective) => (
                        <Card 
                          key={objective.id}
                          className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                            objective.isActive 
                              ? "border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10" 
                              : "border-border hover:border-purple-500/20 hover:bg-purple-500/5"
                          }`}
                          onClick={() => router.push("/objectives")}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-xs line-clamp-1">{objective.title}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {objective.completedSteps}/{objective.totalSteps} étapes
                              </p>
                            </div>
                            <Badge className="bg-purple-500/20 text-purple-300 text-xs px-1.5 py-0">
                              {objective.progress}%
                            </Badge>
                          </div>
                          <div className="w-full bg-background/50 rounded-full h-1">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-1 rounded-full transition-all"
                              style={{ width: `${objective.progress}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              {objective.xp} XP
                            </span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Premium CTA */}
                <Card className="p-3 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 mb-4">
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
                    onClick={() => router.push("/pricing")}
                  >
                    Voir les offres
                  </Button>
                </Card>

                {/* Logout Button */}
                <div className="mt-auto border-t border-border pt-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-red-500/10 text-red-400"
                    onClick={() => router.push("/auth")}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Déconnexion
                  </Button>
                </div>
              </>
            )}

            {/* Collapsed State Icons */}
            {isSidebarCollapsed && (
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Button
                      key={item.href}
                      variant="ghost"
                      size="sm"
                      className={`w-full ${
                        item.active 
                          ? "bg-purple-500/10 text-purple-400" 
                          : "hover:bg-purple-500/10"
                      }`}
                      onClick={() => router.push(item.href)}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  )
                })}
              </div>
            )}
          </div>
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
                        router.push("/objectives")
                        setIsMobileSidebarOpen(false)
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {objectives.map((objective) => (
                        <Card 
                          key={objective.id}
                          className={`p-3 cursor-pointer transition-all ${
                            objective.isActive 
                              ? "border-purple-500/30 bg-purple-500/5" 
                              : "border-border"
                          }`}
                          onClick={() => {
                            router.push("/objectives")
                            setIsMobileSidebarOpen(false)
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-xs">{objective.title}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {objective.completedSteps}/{objective.totalSteps} étapes
                              </p>
                            </div>
                            <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                              {objective.progress}%
                            </Badge>
                          </div>
                          <div className="w-full bg-background/50 rounded-full h-1">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-1 rounded-full"
                              style={{ width: `${objective.progress}%` }}
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Mobile Premium CTA */}
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
                      router.push("/pricing")
                      setIsMobileSidebarOpen(false)
                    }}
                  >
                    Voir les offres
                  </Button>
                </Card>

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
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}