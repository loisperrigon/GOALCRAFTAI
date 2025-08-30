"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Send, 
  Plus, 
  Settings, 
  Target, 
  Calendar,
  Trophy,
  Sparkles,
  User,
  MessageSquare,
  ChevronRight,
  Zap,
  Brain,
  Gamepad2
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function CreatePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Bonjour ! Je suis votre coach IA personnel. 🎯\n\nDécrivez-moi votre objectif et je vais créer un parcours gamifié sur mesure pour vous aider à l'atteindre. Plus vous me donnez de détails, plus je pourrai personnaliser votre aventure !\n\nQuel défi souhaitez-vous relever ?",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [projectName, setProjectName] = useState("Mon Objectif")
  const [difficulty, setDifficulty] = useState("medium")
  const [duration, setDuration] = useState("3 mois")
  const [category, setCategory] = useState("development")

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages([...messages, newMessage])
    setInputMessage("")

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Excellent choix ! Je vais analyser votre objectif et créer un parcours personnalisé. Voici ce que je comprends de votre projet...\n\n🎮 Je vais structurer cela en étapes progressives avec des récompenses à chaque accomplissement.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-card/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              GoalCraftAI
            </span>
          </div>
          <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle conversation
          </Button>
        </div>

        {/* Project Settings */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {/* Project Name */}
            <div>
              <Label htmlFor="project-name" className="text-sm font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-400" />
                Nom du projet
              </Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-background/50 border-purple-500/20 focus:border-purple-500/50"
                placeholder="Ex: Apprendre React"
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="text-sm font-medium mb-2 flex items-center gap-2">
                <Gamepad2 className="h-4 w-4 text-blue-400" />
                Catégorie
              </Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-background/50 border border-purple-500/20 rounded-md text-sm focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              >
                <option value="development">Développement</option>
                <option value="fitness">Fitness</option>
                <option value="business">Business</option>
                <option value="creative">Créatif</option>
                <option value="education">Éducation</option>
                <option value="lifestyle">Lifestyle</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <Label htmlFor="difficulty" className="text-sm font-medium mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                Difficulté
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {["easy", "medium", "hard"].map((level) => (
                  <Button
                    key={level}
                    variant={difficulty === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDifficulty(level)}
                    className={difficulty === level 
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0" 
                      : "border-purple-500/20 hover:border-purple-500/50"
                    }
                  >
                    {level === "easy" ? "Facile" : level === "medium" ? "Moyen" : "Expert"}
                  </Button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <Label htmlFor="duration" className="text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-400" />
                Durée estimée
              </Label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 bg-background/50 border border-purple-500/20 rounded-md text-sm focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              >
                <option value="1 mois">1 mois</option>
                <option value="3 mois">3 mois</option>
                <option value="6 mois">6 mois</option>
                <option value="1 an">1 an</option>
                <option value="custom">Personnalisé</option>
              </select>
            </div>

            {/* Rewards */}
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-orange-400" />
                Système de récompenses
              </Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-purple-500/10 rounded-lg">
                  <span className="text-sm">XP par étape</span>
                  <span className="text-sm font-bold text-purple-400">10-100</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-500/10 rounded-lg">
                  <span className="text-sm">Badges</span>
                  <span className="text-sm font-bold text-blue-400">Activés</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-pink-500/10 rounded-lg">
                  <span className="text-sm">Leaderboard</span>
                  <span className="text-sm font-bold text-pink-400">Global</span>
                </div>
              </div>
            </div>

            {/* AI Settings */}
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-400" />
                Personnalité de l'IA
              </Label>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start border-purple-500/20">
                  <Sparkles className="h-4 w-4 mr-2 text-purple-400" />
                  Coach motivant
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start border-purple-500/20">
                  <Settings className="h-4 w-4 mr-2 text-blue-400" />
                  Expert technique
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Utilisateur</p>
              <p className="text-xs text-muted-foreground">Niveau 1 • 0 XP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-14 border-b border-border flex items-center px-6 bg-card/50">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-purple-400" />
            <h2 className="font-semibold">{projectName}</h2>
            <span className="text-sm text-muted-foreground">• Configuration de votre parcours</span>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-purple-500 to-blue-500"
                        : "bg-gradient-to-br from-pink-500 to-purple-500"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <Card
                    className={`p-4 ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20"
                        : "bg-card border-border"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {message.timestamp.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border p-4 bg-card/50">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Décrivez votre objectif en détail... (Appuyez sur Entrée pour envoyer)"
                className="min-h-[80px] pr-12 bg-background/50 border-purple-500/20 focus:border-purple-500/50 resize-none"
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="absolute bottom-2 right-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">
                Astuce: Soyez précis sur vos motivations et contraintes pour un parcours optimal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Artifact Panel */}
      <div className="w-96 border-l border-border bg-card/50 flex flex-col">
        {/* Artifact Header */}
        <div className="h-14 border-b border-border flex items-center px-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <h3 className="font-semibold">Artefact</h3>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Votre parcours</span>
          </div>
        </div>

        {/* Artifact Content */}
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-10 w-10 text-purple-400" />
            </div>
            <h4 className="font-semibold mb-2">Zone d'artefact</h4>
            <p className="text-sm text-muted-foreground">
              Votre parcours gamifié apparaîtra ici une fois généré
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}