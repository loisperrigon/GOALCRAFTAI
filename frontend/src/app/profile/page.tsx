"use client"

import { useState, useEffect } from "react"
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
  
  // Récupérer les données des stores
  const { user, updateProfile } = useUserStore()
  const { currentObjective } = useObjectiveStore()
  const { currentStreak } = useStreakStore()
  
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

  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    language: "fr",
    privacy: "public"
  })

  // Calculer les stats réelles
  const stats = {
    totalXP: user?.xp || 0,
    level: user?.level || 1,
    objectivesCompleted: objectives.filter(obj => obj.status === "completed").length,
    totalObjectives: objectives.length,
    streak: currentStreak,
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

  const handleSave = () => {
    // Mettre à jour le store user
    updateProfile({
      name: profileEdit.name,
      email: profileEdit.email,
      bio: profileEdit.bio,
      avatar: profileEdit.avatar
    })
    setIsEditing(false)
    toast.success("Profil mis à jour", "Vos modifications ont été enregistrées")
  }

  // Calculer la progression vers le prochain niveau
  const currentLevelXP = stats.totalXP % 1000
  const xpToNextLevel = 1000 - currentLevelXP

  return (
    <AuthLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Mon Profil</h1>
            <PremiumBadge isPremium={user?.isPremium || false} />
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
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
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
                  <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-purple-400" />
                      <span className="text-sm">Statut</span>
                    </div>
                    <Badge className={user?.isPremium ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white" : "bg-gray-500/20"}>
                      {user?.isPremium ? "Premium" : "Gratuit"}
                    </Badge>
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


              {!user?.isPremium && (
                <Card className="p-6 border-purple-500/30 bg-purple-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="h-5 w-5 text-yellow-400" />
                    <h3 className="font-semibold">Passer Premium</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Débloquez l'IA illimitée et des fonctionnalités exclusives
                  </p>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                    onClick={() => router.push("/pricing")}
                  >
                    Voir les offres
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Card>
              )}
              
              {/* Déconnexion */}
              <Card className="p-6">
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-border hover:bg-destructive/10"
                  onClick={() => {
                    toast({
                      title: "Déconnexion",
                      description: "Vous avez été déconnecté avec succès"
                    })
                    router.push("/auth")
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
                      onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.notifications ? "bg-purple-500" : "bg-gray-300"
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.notifications ? "translate-x-6" : "translate-x-0.5"
                      }`} />
                    </button>
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
                      onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.darkMode ? "bg-purple-500" : "bg-gray-300"
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.darkMode ? "translate-x-6" : "translate-x-0.5"
                      }`} />
                    </button>
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
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}