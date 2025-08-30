"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
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
  Gamepad2,
  Maximize2,
  Minimize2,
  Menu,
  X
} from "lucide-react"

// Import dynamique pour éviter les erreurs SSR avec React Flow
const SkillTree = dynamic(() => import("@/components/SkillTree"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Sparkles className="h-10 w-10 text-purple-400" />
        </div>
        <p className="text-sm text-muted-foreground">Chargement de l'arbre...</p>
      </div>
    </div>
  )
})

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface Objective {
  id: string
  title: string
  category: string
  createdAt: Date
  lastActive: Date
  completed: boolean
}

export default function CreatePage() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [activeObjectiveId, setActiveObjectiveId] = useState("1")
  const [objectives, setObjectives] = useState<Objective[]>([
    {
      id: "1",
      title: "Apprendre la guitare",
      category: "music",
      createdAt: new Date(),
      lastActive: new Date(),
      completed: false
    },
    {
      id: "2",
      title: "Courir un marathon",
      category: "fitness",
      createdAt: new Date(Date.now() - 86400000),
      lastActive: new Date(Date.now() - 86400000),
      completed: false
    },
    {
      id: "3",
      title: "Créer une app mobile",
      category: "dev",
      createdAt: new Date(Date.now() - 172800000),
      lastActive: new Date(Date.now() - 172800000),
      completed: true
    }
  ])
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Bonjour ! Je suis votre coach IA personnel. 🎯\n\nDécrivez-moi votre objectif et je vais créer un parcours gamifié sur mesure pour vous aider à l'atteindre. Plus vous me donnez de détails, plus je pourrai personnaliser votre aventure !\n\nQuel défi souhaitez-vous relever ?",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState("")

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
      {/* Sidebar rétractable avec transition */}
      <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out border-r border-border bg-card/50 flex flex-col relative`}>
        {/* Bouton toggle */}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full bg-card border border-border hover:bg-purple-500/20"
        >
          {isSidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <X className="h-3 w-3" />}
        </Button>

        {/* Header */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              {!isSidebarCollapsed && (
                <span className="text-sm font-semibold overflow-hidden whitespace-nowrap">GoalCraftAI</span>
              )}
            </div>
          </div>
          <Button 
            size={isSidebarCollapsed ? "icon" : "sm"}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            onClick={() => {
              const newObjective: Objective = {
                id: Date.now().toString(),
                title: "Nouvel objectif",
                category: "general",
                createdAt: new Date(),
                lastActive: new Date(),
                completed: false
              }
              setObjectives([newObjective, ...objectives])
              setActiveObjectiveId(newObjective.id)
              console.log('📝 Nouvel objectif créé:', newObjective)
            }}
            title="Nouvel objectif"
          >
            <Plus className={isSidebarCollapsed ? "h-4 w-4" : "mr-1 h-3 w-3"} />
            {!isSidebarCollapsed && "Nouvel objectif"}
          </Button>
        </div>

        {/* Liste des objectifs */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {!isSidebarCollapsed && (
              <div className="text-xs font-medium text-muted-foreground px-2 py-1">Objectifs actifs</div>
            )}
            {objectives.filter(o => !o.completed).map((objective) => {
              const getCategoryIcon = () => {
                switch(objective.category) {
                  case 'music': return '🎸'
                  case 'fitness': return '🏃'
                  case 'dev': return '💻'
                  case 'business': return '💼'
                  default: return '🎯'
                }
              }
              return (
                <button
                  key={objective.id}
                  onClick={() => {
                    setActiveObjectiveId(objective.id)
                    console.log('🔄 Changement d\'objectif:', objective.title)
                  }}
                  title={objective.title}
                  className={`
                    w-full text-left ${isSidebarCollapsed ? 'px-0 py-2 flex justify-center' : 'px-3 py-2'} rounded-lg transition-all
                    ${activeObjectiveId === objective.id 
                      ? 'bg-purple-500/20 border-l-2 border-purple-500' 
                      : 'hover:bg-purple-500/10'
                    }
                  `}
                >
                  <div className={`flex ${isSidebarCollapsed ? 'justify-center' : 'items-start gap-2'}`}>
                    <span className={`${isSidebarCollapsed ? 'text-lg' : 'text-sm mt-0.5'}`}>{getCategoryIcon()}</span>
                    {!isSidebarCollapsed && (
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{objective.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(objective.lastActive).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
            
            {objectives.filter(o => o.completed).length > 0 && (
              <>
                {!isSidebarCollapsed && (
                  <div className="text-xs font-medium text-muted-foreground px-2 py-1 mt-4">Complétés</div>
                )}
                {isSidebarCollapsed && objectives.filter(o => !o.completed).length > 0 && (
                  <div className="h-px bg-border my-2" />
                )}
                {objectives.filter(o => o.completed).map((objective) => (
                  <button
                    key={objective.id}
                    onClick={() => {
                      setActiveObjectiveId(objective.id)
                      console.log('📚 Consultation objectif complété:', objective.title)
                    }}
                    title={objective.title}
                    className={`
                      w-full text-left ${isSidebarCollapsed ? 'px-0 py-2 flex justify-center' : 'px-3 py-2'} rounded-lg transition-all opacity-60
                      ${activeObjectiveId === objective.id 
                        ? 'bg-green-500/20 border-l-2 border-green-500' 
                        : 'hover:bg-green-500/10'
                      }
                    `}
                  >
                    <div className={`flex ${isSidebarCollapsed ? 'justify-center' : 'items-start gap-2'}`}>
                      <span className={`${isSidebarCollapsed ? 'text-lg' : 'text-sm mt-0.5'}`}>✅</span>
                      {!isSidebarCollapsed && (
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate line-through">{objective.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Complété le {new Date(objective.lastActive).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        </ScrollArea>

        {/* User Section */}
        <div className="p-3 border-t border-border">
          <div className={`flex ${isSidebarCollapsed ? 'justify-center' : 'items-center gap-2'}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-medium">Mon profil</p>
                <p className="text-xs text-muted-foreground">3 objectifs actifs</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-14 border-b border-border flex items-center px-6 bg-card/50">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-purple-400" />
            <h2 className="font-semibold">
              {objectives.find(o => o.id === activeObjectiveId)?.title || 'Nouvel objectif'}
            </h2>
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
      <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'w-96 border-l'} border-border bg-card/50 flex flex-col transition-all duration-300`}>
        {/* Artifact Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <h3 className="font-semibold">Artefact</h3>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Parcours guitare</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="hover:bg-purple-500/10"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Artifact Content - Skill Tree */}
        <div className="flex-1 relative overflow-hidden">
          <SkillTree />
        </div>
      </div>
    </div>
  )
}