"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import AuthLayout from "@/components/AuthLayout"
import PremiumBadge from "@/components/PremiumBadge"
import { useToast } from "@/hooks/useToast"
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
  Zap
} from "lucide-react"

export default function ProfilePage() {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  
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
  
  const [profile, setProfile] = useState({
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    bio: "Passionné par l'apprentissage et le développement personnel. J'utilise GoalCraft pour transformer mes rêves en réalité !",
    avatar: "",
    joinDate: "Janvier 2024",
    isPremium: false
  })

  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    language: "fr",
    privacy: "public"
  })

  const stats = {
    totalXP: 2460,
    level: 3,
    objectivesCompleted: 4,
    totalObjectives: 7,
    streak: 12,
    badges: 8,
    hoursInvested: 47
  }

  const achievements = [
    { id: 1, name: "Premier pas", description: "Créer votre premier objectif", icon: Target, color: "text-blue-400", earned: true },
    { id: 2, name: "Semaine parfaite", description: "7 jours consécutifs", icon: Calendar, color: "text-green-400", earned: true },
    { id: 3, name: "Finisseur", description: "Compléter un objectif", icon: Trophy, color: "text-yellow-400", earned: true },
    { id: 4, name: "Série de feu", description: "30 jours consécutifs", icon: Zap, color: "text-orange-400", earned: false },
    { id: 5, name: "Maître", description: "Atteindre niveau 10", icon: Crown, color: "text-purple-400", earned: false },
    { id: 6, name: "Légende", description: "100 objectifs complétés", icon: Star, color: "text-indigo-400", earned: false }
  ]

  const handleSave = () => {
    setIsEditing(false)
    toast.success("Profil mis à jour", "Vos modifications ont été enregistrées")
  }

  return (
    <AuthLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Mon Profil</h1>
            <PremiumBadge isPremium={profile.isPremium} />
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
              onClick={() => setActiveTab("achievements")}
              className={`px-4 py-2 font-medium transition-colors relative ${
                activeTab === "achievements" 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Accomplissements
              {activeTab === "achievements" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500" />
              )}
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
                        onClick={() => setIsEditing(false)}
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
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Membre depuis {profile.joinDate}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Stats */}
            <div className="space-y-6">
              <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
                <h3 className="font-semibold mb-4">Statistiques</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-purple-400" />
                      <span className="text-sm">Niveau</span>
                    </div>
                    <span className="font-bold text-xl">{stats.level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm">XP Total</span>
                    </div>
                    <span className="font-bold">{stats.totalXP}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-400" />
                      <span className="text-sm">Objectifs</span>
                    </div>
                    <span className="font-bold">{stats.objectivesCompleted}/{stats.totalObjectives}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-400" />
                      <span className="text-sm">Série actuelle</span>
                    </div>
                    <span className="font-bold">{stats.streak} jours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-orange-400" />
                      <span className="text-sm">Badges</span>
                    </div>
                    <span className="font-bold">{stats.badges}</span>
                  </div>
                </div>
              </Card>

              {!profile.isPremium && (
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
                    onClick={() => window.location.href = "/pricing"}
                  >
                    Voir les offres
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => {
              const Icon = achievement.icon
              return (
                <Card 
                  key={achievement.id}
                  className={`p-6 ${
                    achievement.earned 
                      ? "border-purple-500/30 bg-purple-500/5" 
                      : "opacity-50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      achievement.earned
                        ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20"
                        : "bg-gray-500/10"
                    }`}>
                      <Icon className={`h-6 w-6 ${achievement.earned ? achievement.color : "text-gray-400"}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {achievement.earned && (
                        <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30">
                          Débloqué
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
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

              {/* Privacy */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Confidentialité
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="privacy">Visibilité du profil</Label>
                    <select
                      id="privacy"
                      value={settings.privacy}
                      onChange={(e) => setSettings({ ...settings, privacy: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                    >
                      <option value="public">Public</option>
                      <option value="friends">Amis seulement</option>
                      <option value="private">Privé</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Account Actions */}
              <Card className="p-6 border-red-500/30">
                <h3 className="font-semibold mb-4 text-red-400">Zone dangereuse</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start border-orange-500/30 hover:bg-orange-500/10 text-orange-400">
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-red-500/30 hover:bg-red-500/10 text-red-400">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer le compte
                  </Button>
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
                  <Button variant="outline" className="w-full justify-start">
                    Authentification à deux facteurs
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