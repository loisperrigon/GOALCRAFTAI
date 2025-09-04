"use client"

import { useState, useEffect, useCallback } from "react"
import { signOut } from "next-auth/react"
import AuthModal from "@/components/AuthModal"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import AuthLayout from "@/components/AuthLayout"
import PremiumBadge from "@/components/PremiumBadge"
import { useToast } from "@/hooks/useToast"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/stores/user-store"
import { useObjectiveStore } from "@/stores/objective-store"
import { useStreakStore } from "@/stores/streak-store"
import { useSettingsStore } from "@/stores/settings-store"
import { useSound } from "@/hooks/useSound"
import { mockObjectives } from "@/data/mockObjectives"
import { 
  User,
  Mail,
  Calendar,
  Trophy,
  Target,
  Award,
  Settings,
  Camera,
  Save,
  Download,
  Crown,
  Shield,
  Bell,
  Moon,
  Globe,
  Key,
  LogOut,
  Trash2,
  ChevronRight,
  Star,
  Zap,
  Flame,
  Lock,
  LayoutDashboard
} from "lucide-react"

export default function ProfilePage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  
  // Récupérer les données des stores
  const { user, updateProfile, isAuthenticated } = useUserStore()
  const { currentObjective } = useObjectiveStore()
  const { currentStreak } = useStreakStore()
  
  // Charger les vraies données depuis la BDD
  useEffect(() => {
    const loadProfileData = async () => {
      if (!isAuthenticated) {
        setShowAuthModal(true)
        setIsLoadingProfile(false)
        return
      }
      
      try {
        const response = await fetch('/api/user/profile')
        const data = await response.json()
        
        if (data.success && data.user) {
          // Mettre à jour le store avec les vraies données
          updateProfile(data.user)
        }
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du profil",
          variant: "destructive"
        })
      } finally {
        setIsLoadingProfile(false)
      }
    }
    
    loadProfileData()
  }, [isAuthenticated, updateProfile, toast])
  
  // Les objectifs avec currentObjective mis à jour
  const objectives = mockObjectives.map(obj => {
    if (currentObjective && obj.id === currentObjective.id) {
      return currentObjective
    }
    return obj
  })
  
  // Récupérer le tab depuis l'URL
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab')
      if (tab === 'achievements' || tab === 'settings') return tab
    }
    return 'profile'
  }
  
  const [activeTab, setActiveTab] = useState<"profile" | "settings" | "achievements">(getInitialTab())
  
  // Profile local state pour l'édition
  const [profileEdit, setProfileEdit] = useState({
    name: user?.name || "Utilisateur",
    email: user?.email || "user@example.com",
    bio: user?.bio || "Nouvel utilisateur de GoalCraft. Prêt à transformer mes rêves en réalité !",
    avatar: user?.avatar || ""
  })

  // Récupérer les paramètres et les méthodes depuis le store
  const { 
    settings: appSettings, 
    updateSettings, 
    exportSettings,
    setTheme,
    setSoundEnabled: setStoreSoundEnabled,
    setLanguage,
    toggleNotifications
  } = useSettingsStore()
  
  // Force re-render state
  const [, forceUpdate] = useState({})
  
  // Fonction pour changer la couleur d'accent
  const setAccentColor = (color: 'purple' | 'blue' | 'orange') => {
    updateSettings({ accentColor: color })
    document.documentElement.setAttribute('data-accent', color)
    // Force un re-render pour mettre à jour les styles inline
    forceUpdate({})
  }
  
  // Fonction pour obtenir la couleur d'accent actuelle
  const getAccentColor = () => {
    const color = appSettings.accentColor || 'purple'
    switch(color) {
      case 'purple': return '#a855f7'
      case 'blue': return '#3b82f6'
      case 'orange': return '#fb923c'
      default: return '#a855f7'
    }
  }
  const { setSoundEnabled, setVolume, soundEnabled, volume } = useSound()
  
  // State local pour les paramètres en cours d'édition
  const [localSettings, setLocalSettings] = useState({
    notifications: appSettings.notifications.enabled,
    reminderTime: appSettings.notifications.reminderTime,
    darkMode: appSettings.theme === 'dark',
    language: appSettings.locale.language,
    accentColor: appSettings.accentColor,
    soundEnabled: appSettings.sound.effectsEnabled,
    soundVolume: appSettings.sound.effectsVolume,
    autoSave: appSettings.experience.autoSave
  })
  
  // Synchroniser les paramètres quand ils changent dans le store
  useEffect(() => {
    setLocalSettings({
      notifications: appSettings.notifications.enabled,
      reminderTime: appSettings.notifications.reminderTime,
      darkMode: appSettings.theme === 'dark',
      language: appSettings.locale.language,
      accentColor: appSettings.accentColor,
      soundEnabled: appSettings.sound.effectsEnabled,
      soundVolume: appSettings.sound.effectsVolume,
      autoSave: appSettings.experience.autoSave
    })
  }, [appSettings])
  
  // Synchroniser avec les valeurs réelles du hook useSound
  useEffect(() => {
    setLocalSettings(prev => ({
      ...prev,
      soundEnabled: soundEnabled,
      soundVolume: volume
    }))
  }, [soundEnabled, volume])
  
  // Appliquer le thème et les couleurs sur le document
  useEffect(() => {
    const applyTheme = () => {
      if (appSettings.theme === 'dark') {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else if (appSettings.theme === 'light') {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
      } else {
        // Mode système
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          document.documentElement.classList.add('dark')
          document.documentElement.classList.remove('light')
        } else {
          document.documentElement.classList.remove('dark')
          document.documentElement.classList.add('light')
        }
      }
    }
    
    applyTheme()
    
    // Écouter les changements de préférence système
    if (appSettings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme()
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [appSettings.theme])
  
  // Appliquer la couleur d'accent - s'assurer que ça se met à jour à chaque changement
  useEffect(() => {
    const accentColor = appSettings.accentColor || 'purple'
    document.documentElement.setAttribute('data-accent', accentColor)
    // Forcer un re-render si nécessaire
    document.documentElement.style.setProperty('--current-accent', accentColor)
  }, [appSettings.accentColor])
  
  // Les paramètres sont automatiquement sauvegardés dans localStorage via Zustand
  // Pas besoin de sauvegarde BDD pour les préférences visuelles

  // Calculer les stats réelles depuis les données BDD
  const stats = {
    totalXP: user?.xp || 0,
    level: user?.level || 1,
    objectivesCompleted: user?.completedObjectives || objectives.filter(obj => obj.status === "completed").length,
    totalObjectives: user?.totalObjectives || objectives.length,
    streak: user?.currentStreak || currentStreak || 0,
    badges: user?.badges?.length || 0,
    achievements: user?.achievements?.length || 0
  }

  // Achievements basés sur les vraies données
  const achievements = [
    { 
      id: 1, 
      name: "Premier pas", 
      description: "Créer votre premier objectif", 
      icon: Target, 
      color: "text-blue-400", 
      earned: objectives.length > 0 
    },
    { 
      id: 2, 
      name: "Semaine parfaite", 
      description: "7 jours consécutifs", 
      icon: Calendar, 
      color: "text-green-400", 
      earned: currentStreak >= 7 
    },
    { 
      id: 3, 
      name: "Finisseur", 
      description: "Compléter un objectif", 
      icon: Trophy, 
      color: "text-yellow-400", 
      earned: stats.objectivesCompleted > 0 
    },
    { 
      id: 4, 
      name: "Série de feu", 
      description: "30 jours consécutifs", 
      icon: Flame, 
      color: "text-orange-400", 
      earned: currentStreak >= 30 
    },
    { 
      id: 5, 
      name: "Apprenti", 
      description: "Atteindre niveau 5", 
      icon: Star, 
      color: "text-purple-400", 
      earned: stats.level >= 5 
    },
    { 
      id: 6, 
      name: "Maître", 
      description: "Atteindre niveau 10", 
      icon: Crown, 
      color: "text-indigo-400", 
      earned: stats.level >= 10 
    },
    { 
      id: 7, 
      name: "Collectionneur", 
      description: "Gagner 10 badges", 
      icon: Award, 
      color: "text-pink-400", 
      earned: stats.badges >= 10 
    },
    { 
      id: 8, 
      name: "Marathonien", 
      description: "100 jours de série", 
      icon: Zap, 
      color: "text-cyan-400", 
      earned: currentStreak >= 100 
    }
  ]

  const handleSave = async () => {
    try {
      // Sauvegarder dans la BDD
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: profileEdit.name,
          bio: profileEdit.bio,
          avatar: profileEdit.avatar
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Mettre à jour le store local
        updateProfile({
          name: profileEdit.name,
          email: profileEdit.email,
          bio: profileEdit.bio,
          avatar: profileEdit.avatar
        })
        setIsEditing(false)
        toast({
          title: "Profil mis à jour",
          description: "Vos modifications ont été enregistrées"
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications",
        variant: "destructive"
      })
    }
  }

  // Calculer la progression vers le prochain niveau
  const currentLevelXP = stats.totalXP % 1000
  const xpToNextLevel = 1000 - currentLevelXP
  
  // Si le profil est en cours de chargement
  if (isLoadingProfile) {
    return (
      <AuthLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-pulse">
                <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <div className="h-8 w-48 bg-muted rounded mx-auto mb-2" />
                <div className="h-4 w-64 bg-muted rounded mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </AuthLayout>
    )
  }

  // Si non connecté, afficher la modal d'authentification
  if (!isAuthenticated) {
    return (
      <>
        <AuthLayout>
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-2">Connexion requise</h2>
                <p className="text-muted-foreground mb-6">
                  Vous devez être connecté pour accéder à votre profil
                </p>
                <Button 
                  onClick={() => setShowAuthModal(true)}
                  className="hover:opacity-90 text-white transition-opacity"
                  style={{
                    background: `linear-gradient(to right, ${getAccentColor()}, #3b82f6)`
                  }}
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
            // Si toujours pas connecté, retourner au dashboard
            if (!isAuthenticated) {
              router.push("/dashboard")
            }
          }}
          onSuccess={() => {
            setShowAuthModal(false)
            // Rafraîchir la page après connexion
            window.location.reload()
          }}
          redirectTo="/profile"
        />
      </>
    )
  }

  return (
    <AuthLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Mon Profil</h1>
            <PremiumBadge premiumType={user?.premiumType || 'free'} />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 font-medium transition-colors relative ${
                activeTab === "profile" 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Profil
              {activeTab === "profile" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500" />
              )}
            </button>
            <button
              onClick={() => {
                toast({
                  title: "Bientôt disponible",
                  description: "Les accomplissements seront disponibles dans la prochaine version"
                })
              }}
              className="px-4 py-2 font-medium transition-colors relative text-muted-foreground/50 cursor-not-allowed flex items-center gap-2"
              disabled
            >
              <Lock className="h-3 w-3" />
              Accomplissements
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 font-medium transition-colors relative ${
                activeTab === "settings" 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Paramètres
              {activeTab === "settings" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500" />
              )}
            </button>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Informations personnelles</h2>
                  {!isEditing ? (
                    <Button 
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="border-purple-500/50 hover:bg-purple-500/10"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          // Restaurer les valeurs originales
                          setProfileEdit({
                            name: user?.name || "Utilisateur",
                            email: user?.email || "user@example.com",
                            bio: user?.bio || "",
                            avatar: user?.avatar || ""
                          })
                        }}
                      >
                        Annuler
                      </Button>
                      <Button 
                        onClick={handleSave}
                        className="hover:opacity-90 text-white transition-opacity"
                  style={{
                    background: `linear-gradient(to right, ${getAccentColor()}, #3b82f6)`
                  }}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Sauvegarder
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <User className="h-12 w-12 text-white" />
                      </div>
                      {isEditing && (
                        <button className="absolute bottom-0 right-0 p-2 bg-purple-500 rounded-full text-white hover:bg-purple-600 transition-colors">
                          <Camera className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Photo de profil</p>
                      {isEditing && (
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG ou GIF. Max 2MB
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom</Label>
                      <Input
                        id="name"
                        value={profileEdit.name}
                        onChange={(e) => setProfileEdit({ ...profileEdit, name: e.target.value })}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileEdit.email}
                        onChange={(e) => setProfileEdit({ ...profileEdit, email: e.target.value })}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileEdit.bio}
                      onChange={(e) => setProfileEdit({ ...profileEdit, bio: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                      rows={4}
                      placeholder="Parlez-nous de vous et de vos objectifs..."
                    />
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Membre depuis {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "aujourd'hui"}</span>
                    </div>
                  </div>
                </div>
              </Card>

            </div>

            {/* Right Column - Quick Actions */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Aperçu rapide</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-purple-400" />
                        <span className="text-sm">Statut</span>
                      </div>
                      <PremiumBadge premiumType={user?.premiumType || 'free'} />
                    </div>
                    <div className="mt-2 pt-2 border-t border-purple-500/20">
                      <p className="text-xs text-muted-foreground">
                        {user?.premiumType === 'free' && "3 objectifs max • 10 étapes par objectif"}
                        {user?.premiumType === 'starter' && "10 objectifs • Étapes illimitées • Support prioritaire"}
                        {user?.premiumType === 'pro' && "Tout illimité • IA avancée • Coaching personnalisé"}
                      </p>
                      {user?.premiumExpiresAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Expire le {new Date(user.premiumExpiresAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      <span className="text-sm">Membre depuis</span>
                    </div>
                    <span className="text-sm font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Aujourd'hui"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-green-400" />
                      <span className="text-sm">Email vérifié</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">
                      <Shield className="h-3 w-3 mr-1" />
                      Vérifié
                    </Badge>
                  </div>
                </div>
              </Card>


              {user?.premiumType === 'free' && (
                <Card className="p-6 border-purple-500/30 bg-purple-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="h-5 w-5 text-yellow-400" />
                    <h3 className="font-semibold">Passer Premium</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Débloquez l'IA illimitée et des fonctionnalités exclusives
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs">
                      <Star className="h-3 w-3 text-blue-400" />
                      <span>Starter: 9.99€/mois - 10 objectifs</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Crown className="h-3 w-3 text-yellow-400" />
                      <span>Pro: 19.99€/mois - Tout illimité</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                    onClick={() => router.push("/pricing")}
                  >
                    Voir les offres
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Card>
              )}
              
              {user?.premiumType === 'starter' && (
                <Card className="p-6 border-blue-500/30 bg-blue-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-5 w-5 text-blue-400" />
                    <h3 className="font-semibold">Plan Starter</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Vous bénéficiez de 10 objectifs et d'étapes illimitées
                  </p>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                    onClick={() => router.push("/pricing")}
                  >
                    Passer à Pro
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Card>
              )}
              
              {user?.premiumType === 'pro' && (
                <Card className="p-6 border-yellow-500/30 bg-yellow-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="h-5 w-5 text-yellow-400" />
                    <h3 className="font-semibold">Plan Pro</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Vous avez accès à toutes les fonctionnalités premium
                  </p>
                  <Badge className="w-full justify-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    <Zap className="h-3 w-3 mr-1" />
                    Accès illimité
                  </Badge>
                </Card>
              )}
              
              {/* Déconnexion */}
              <Card className="p-6">
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-border hover:bg-destructive/10"
                  onClick={async () => {
                    try {
                      await signOut({ 
                        callbackUrl: "/auth",
                        redirect: true 
                      })
                      toast({
                        title: "Déconnexion",
                        description: "Vous avez été déconnecté avec succès"
                      })
                    } catch (error) {
                      console.error("Erreur déconnexion:", error)
                      toast({
                        title: "Erreur",
                        description: "Impossible de se déconnecter",
                        variant: "destructive"
                      })
                    }
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Se déconnecter
                </Button>
              </Card>
            </div>
          </div>
        )}


        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Notifications */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notifications push</p>
                      <p className="text-sm text-muted-foreground">Recevoir des rappels pour vos objectifs</p>
                    </div>
                    <button
                      onClick={() => {
                        const newValue = !localSettings.notifications
                        setLocalSettings({ ...localSettings, notifications: newValue })
                        toggleNotifications()
                      }}
                      className="w-12 h-6 rounded-full transition-colors"
                      style={{
                        backgroundColor: localSettings.notifications ? getAccentColor() : '#d1d5db'
                      }}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        localSettings.notifications ? "translate-x-6" : "translate-x-0.5"
                      }`} />
                    </button>
                  </div>
                  {/* Rappel quotidien */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Rappel quotidien</p>
                      <p className="text-sm text-muted-foreground">Recevoir un rappel à heure fixe</p>
                    </div>
                    <select
                      value={localSettings.reminderTime}
                      onChange={(e) => {
                        const newTime = e.target.value
                        setLocalSettings({ ...localSettings, reminderTime: newTime })
                        updateSettings({
                          notifications: { ...appSettings.notifications, reminderTime: newTime }
                        })
                      }}
                      className="px-3 py-1 bg-background border border-border rounded-lg text-sm"
                      disabled={!localSettings.notifications}
                    >
                      <option value="09:00">9h00</option>
                      <option value="12:00">12h00</option>
                      <option value="18:00">18h00</option>
                      <option value="21:00">21h00</option>
                    </select>
                  </div>
                </div>
              </Card>
              
              {/* Sons */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Sons
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Effets sonores</p>
                      <p className="text-sm text-muted-foreground">Sons de validation et notifications</p>
                    </div>
                    <button
                      onClick={() => {
                        const newValue = !localSettings.soundEnabled
                        setLocalSettings({ ...localSettings, soundEnabled: newValue })
                        setSoundEnabled(newValue) // Hook useSound
                        setStoreSoundEnabled(newValue) // Store settings
                      }}
                      className="w-12 h-6 rounded-full transition-colors"
                      style={{
                        backgroundColor: localSettings.soundEnabled ? getAccentColor() : '#d1d5db'
                      }}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        localSettings.soundEnabled ? "translate-x-6" : "translate-x-0.5"
                      }`} />
                    </button>
                  </div>
                  {/* Volume */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">Volume</p>
                      <span className="text-sm text-muted-foreground">{Math.round(localSettings.soundVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={localSettings.soundVolume * 100}
                      onChange={(e) => {
                        const newVolume = parseInt(e.target.value) / 100
                        setLocalSettings({ ...localSettings, soundVolume: newVolume })
                        setVolume(newVolume)
                        updateSettings({
                          sound: { ...appSettings.sound, effectsVolume: newVolume }
                        })
                        // Pas de sauvegarde à chaque changement de volume (trop de requêtes)
                      }}
                      disabled={!localSettings.soundEnabled}
                      className="w-full"
                      style={{
                        accentColor: getAccentColor()
                      }}
                    />
                  </div>
                </div>
              </Card>

              {/* Appearance */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Moon className="h-5 w-5" />
                  Apparence
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mode sombre</p>
                      <p className="text-sm text-muted-foreground">Utiliser le thème sombre</p>
                    </div>
                    <button
                      onClick={() => {
                        const newValue = !localSettings.darkMode
                        setLocalSettings({ ...localSettings, darkMode: newValue })
                        setTheme(newValue ? 'dark' : 'light')
                      }}
                      className="w-12 h-6 rounded-full transition-colors"
                      style={{
                        backgroundColor: localSettings.darkMode ? getAccentColor() : '#d1d5db'
                      }}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        localSettings.darkMode ? "translate-x-6" : "translate-x-0.5"
                      }`} />
                    </button>
                  </div>
                  {/* Couleur d'accent */}
                  <div>
                    <p className="font-medium mb-2">Couleur d'accent</p>
                    <div className="flex gap-2">
                      {(['purple', 'blue', 'orange'] as const).map(color => (
                        <button
                          key={color}
                          onClick={() => {
                            setLocalSettings({ ...localSettings, accentColor: color })
                            setAccentColor(color)
                          }}
                          className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 ${
                            localSettings.accentColor === color 
                              ? 'border-white scale-110 shadow-lg ring-2 ring-offset-2 ring-offset-background' 
                              : 'border-border/50 hover:scale-105 hover:border-border'
                          }`}
                          style={{
                            background: color === 'purple' 
                              ? 'linear-gradient(135deg, #a855f7, #9333ea)'
                              : color === 'blue'
                              ? 'linear-gradient(135deg, #3b82f6, #06b6d4)'
                              : 'linear-gradient(135deg, #fb923c, #f97316)'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Account Actions - Zone dangereuse */}
              <Card className="p-6 border-red-500/30">
                <h3 className="font-semibold mb-4 text-red-400">Zone dangereuse</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start border-red-500/30 hover:bg-red-500/10 text-red-400">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer le compte
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Cette action est irréversible. Toutes vos données seront supprimées.
                  </p>
                </div>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Sécurité
                </h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    Changer le mot de passe
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Langue
                </h3>
                <select
                  value={localSettings.language}
                  onChange={(e) => {
                    const newLang = e.target.value as 'fr' | 'en' | 'es'
                    setLocalSettings({ ...localSettings, language: newLang })
                    setLanguage(newLang)
                  }}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </Card>
              
              {/* Export des données */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Sauvegarde
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">Sauvegarde auto</p>
                      <p className="text-xs text-muted-foreground">Enregistrer automatiquement</p>
                    </div>
                    <button
                      onClick={() => {
                        const newValue = !localSettings.autoSave
                        setLocalSettings({ ...localSettings, autoSave: newValue })
                        updateSettings({
                          experience: { ...appSettings.experience, autoSave: newValue }
                        })
                      }}
                      className="w-12 h-6 rounded-full transition-colors"
                      style={{
                        backgroundColor: localSettings.autoSave ? getAccentColor() : '#d1d5db'
                      }}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        localSettings.autoSave ? "translate-x-6" : "translate-x-0.5"
                      }`} />
                    </button>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      const dataStr = exportSettings()
                      const dataBlob = new Blob([dataStr], { type: 'application/json' })
                      const url = URL.createObjectURL(dataBlob)
                      const link = document.createElement('a')
                      link.href = url
                      link.download = `goalcraft-settings-${new Date().toISOString().split('T')[0]}.json`
                      link.click()
                      toast({
                        title: "Export réussi",
                        description: "Vos paramètres ont été exportés"
                      })
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exporter mes données
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}