"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import AuthLayout from "@/components/AuthLayout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Send, 
  Settings, 
  Target, 
  Zap,
  Brain,
  Maximize2,
  Minimize2,
  Map,
  Bot
} from "lucide-react"

// Import dynamique pour éviter les erreurs SSR avec React Flow
const SkillTree = dynamic(() => import("@/components/SkillTree"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Brain className="h-10 w-10 text-purple-400" />
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
  timestamp?: Date
}

export default function ObjectivesPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Salut ! Je suis ton coach IA 🎮 Dis-moi quel objectif tu veux atteindre et je vais créer un parcours gamifié personnalisé pour toi. Que veux-tu accomplir ?",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeView, setActiveView] = useState<"chat" | "tree">("chat")

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

    // Simulation de réponse IA
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Super choix ! Je vais créer un parcours personnalisé pour t'aider à atteindre cet objectif. Voici ton arbre de progression avec des étapes gamifiées. Chaque étape débloquée te rapporte de l'XP ! 🎯",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  return (
    <AuthLayout>
      <div className="h-full">
        {/* Mobile View Toggle */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur">
          <span className="font-semibold">Mes Objectifs</span>
          <div className="flex gap-1">
            <Button
              variant={activeView === "chat" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveView("chat")}
              className={activeView === "chat" ? "bg-gradient-to-r from-purple-500 to-blue-500" : ""}
            >
              <Bot className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Chat</span>
            </Button>
            <Button
              variant={activeView === "tree" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveView("tree")}
              className={activeView === "tree" ? "bg-gradient-to-r from-purple-500 to-blue-500" : ""}
            >
              <Map className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Arbre</span>
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(100%-65px)] md:h-full relative">
          {/* Chat Section */}
          <div className={`${activeView === "chat" ? "flex" : "hidden"} md:flex flex-1 flex-col bg-background/50 md:border-r md:border-border ${
            isFullscreen ? "md:hidden" : ""
          }`}>
            <div className="border-b border-border bg-card/50 backdrop-blur p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Coach IA</h3>
                    <p className="text-xs text-muted-foreground">En ligne • Prêt à t'aider</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Zap className="h-3 w-3 mr-1" />
                    GPT-4
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] md:max-w-[70%] ${
                      message.role === "user" 
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl rounded-tr-sm" 
                        : "bg-card border border-border rounded-2xl rounded-tl-sm"
                    } p-4`}>
                      <p className="text-sm md:text-base">{message.content}</p>
                      {message.timestamp && (
                        <p className={`text-xs mt-2 ${
                          message.role === "user" ? "text-white/70" : "text-muted-foreground"
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t border-border bg-card/50 backdrop-blur p-4">
              <div className="max-w-3xl mx-auto">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Décris ton objectif..."
                    className="flex-1 bg-background/50"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 md:px-6"
                  >
                    <Send className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Envoyer</span>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge 
                    variant="outline" 
                    className="border-purple-500/30 hover:bg-purple-500/10 cursor-pointer text-xs"
                  >
                    💪 Sport & Fitness
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="border-purple-500/30 hover:bg-purple-500/10 cursor-pointer text-xs"
                  >
                    📚 Apprentissage
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="border-purple-500/30 hover:bg-purple-500/10 cursor-pointer text-xs"
                  >
                    💼 Carrière
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="border-purple-500/30 hover:bg-purple-500/10 cursor-pointer text-xs"
                  >
                    🎨 Créativité
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Tree Section */}
          <div className={`${activeView === "tree" ? "flex" : "hidden"} md:flex flex-1 flex-col ${
            isFullscreen ? "md:flex fixed inset-0 z-50 bg-background" : ""
          }`}>
            <div className="border-b border-border bg-card/50 backdrop-blur p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-purple-400" />
                  <div>
                    <h3 className="font-semibold text-sm md:text-base">Arbre de Progression</h3>
                    <p className="text-xs text-muted-foreground">4/12 étapes complétées</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                    <Brain className="h-3 w-3 mr-1" />
                    420 XP
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="hidden md:inline-flex"
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-gradient-to-br from-purple-900/5 via-background to-blue-900/5">
              <SkillTree isFullscreen={isFullscreen} />
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}