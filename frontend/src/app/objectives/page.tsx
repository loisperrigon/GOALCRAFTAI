"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import AuthLayout from "@/components/AuthLayout"
import { Button } from "@/components/ui/button"
import { GameButton } from "@/components/ui/game-button"
import { useSound } from "@/hooks/useSound"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAIChat } from "@/hooks/useAIChat"
import { useObjectiveStore } from "@/stores/objective-store"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Send, 
  Settings, 
  Target, 
  Zap,
  Brain,
  Maximize2,
  Minimize2,
  Map,
  Bot,
  Loader2
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


export default function ObjectivesPage() {
  // NE PAS initialiser avec les données mock
  // useInitializeStores() // SUPPRIMÉ
  
  const { playNotification, playWhoosh } = useSound()
  const { currentObjective, setActiveObjective } = useObjectiveStore()
  const [loadingLastObjective, setLoadingLastObjective] = useState(true)
  const [inputMessage, setInputMessage] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeView, setActiveView] = useState<"chat" | "tree">("chat")
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Utiliser le hook AI Chat pour la vraie intégration
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    streamingContent,
    loadMessages
  } = useAIChat({
    objectiveType: currentObjective?.category || "general",
    useStreaming: false, // Pour l'instant on garde le mode normal
    onObjectiveGenerated: (objective) => {
      // L'agent a décidé de créer l'objectif
      playNotification()
      // Passer automatiquement à la vue arbre
      setTimeout(() => setActiveView("tree"), 1500)
    }
  })
  
  // Charger le dernier objectif depuis MongoDB au montage
  useEffect(() => {
    loadLastObjective()
  }, [])
  
  // Écouter les changements d'objectif depuis la sidebar
  useEffect(() => {
    if (!loadingLastObjective) {
      if (currentObjective) {
        // Un objectif a été sélectionné depuis la sidebar
        loadConversationForObjective(currentObjective)
      } else {
        // Bouton "+" cliqué - nouvelle conversation
        console.log("[ObjectivesPage] Nouvelle conversation démarrée")
        clearMessages()
        setActiveView("chat")
      }
    }
  }, [currentObjective?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  
  const loadConversationForObjective = async (objective: any) => {
    try {
      // Vider les messages actuels d'abord
      clearMessages()
      
      if (objective.conversationId) {
        const convResponse = await fetch(`/api/conversations?id=${objective.conversationId}`)
        const convData = await convResponse.json()
        
        if (convData.success && convData.messages) {
          console.log(`[ObjectivesPage] Chargement de ${convData.messages.length} messages pour l'objectif ${objective.title}`)
          // Charger les messages dans le chat
          loadMessages(convData.messages, objective.conversationId)
        }
      }
      
      // Afficher l'arbre
      setActiveView("tree")
    } catch (error) {
      console.error("[ObjectivesPage] Erreur chargement conversation:", error)
    }
  }
  
  const loadLastObjective = async () => {
    try {
      setLoadingLastObjective(true)
      
      // Charger le dernier objectif
      const objResponse = await fetch('/api/objectives')
      const objData = await objResponse.json()
      
      if (objData.success && objData.objectives && objData.objectives.length > 0) {
        // Prendre le dernier objectif (le plus récent)
        const lastObjective = objData.objectives[0]
        console.log("[ObjectivesPage] Dernier objectif chargé:", lastObjective.title)
        setActiveObjective(lastObjective)
        
        // Charger la conversation associée
        await loadConversationForObjective(lastObjective)
      } else {
        console.log("[ObjectivesPage] Aucun objectif trouvé, mode chat")
        // Pas d'objectif, rester en mode chat
        setActiveView("chat")
      }
    } catch (error) {
      console.error("[ObjectivesPage] Erreur chargement:", error)
    } finally {
      setLoadingLastObjective(false)
    }
  }
  
  // Auto-scroll quand de nouveaux messages arrivent
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const message = inputMessage.trim()
    setInputMessage("")
    playWhoosh() // Son d'envoi
    
    // Envoyer le message au vrai backend
    await sendMessage(message)
    playNotification() // Son de notification pour la réponse
  }

  return (
    <AuthLayout>
      <div className="h-screen max-h-screen flex flex-col overflow-hidden">
        {/* Mobile View Toggle - Only show if we have an objective */}
        {currentObjective && (
          <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur flex-shrink-0">
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
        )}

        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Chat Section - Always visible on desktop when no objective, or based on activeView */}
          <div className={`${
            !currentObjective 
              ? "flex" 
              : activeView === "chat" ? "flex" : "hidden"
            } md:flex flex-1 flex-col min-h-0 bg-background/50 ${
            currentObjective ? "md:border-r md:border-border" : ""
          } ${
            isFullscreen ? "md:hidden" : ""
          } transition-all duration-300`}>
            <div className="border-b border-border bg-card/50 backdrop-blur p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Coach IA</h3>
                    <p className="text-xs text-muted-foreground">{isLoading ? "En train de réfléchir..." : "En ligne • Prêt à t'aider"}</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
            </div>

            <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
              <div className="space-y-4 max-w-2xl mx-auto">
                {/* Message d'accueil si pas de messages */}
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Brain className="h-10 w-10 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Bonjour ! Je suis votre Coach IA 🎯</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Je peux vous aider à transformer vos rêves en objectifs concrets avec un parcours personnalisé.
                    </p>
                    <div className="grid gap-3 max-w-lg mx-auto text-left">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                        <Target className="h-5 w-5 text-purple-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Créer des objectifs structurés</p>
                          <p className="text-xs text-muted-foreground">Décrivez votre rêve et je créerai un parcours étape par étape</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                        <Zap className="h-5 w-5 text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Gamification motivante</p>
                          <p className="text-xs text-muted-foreground">Gagnez des XP, débloquez des étapes et suivez votre progression</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                        <Brain className="h-5 w-5 text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Conseils personnalisés</p>
                          <p className="text-xs text-muted-foreground">Recevez des recommandations adaptées à votre parcours</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-6">
                      💬 Commencez par me dire quel objectif vous souhaitez atteindre !
                    </p>
                  </motion.div>
                )}
                
                <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
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
                  </motion.div>
                ))}
                
                {/* Indicateur de réflexion de l'IA */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-card border border-border rounded-2xl rounded-tl-sm p-4 max-w-[85%] md:max-w-[70%]">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                        <span className="text-sm text-muted-foreground animate-pulse">
                          L'IA réfléchit à votre demande...
                        </span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            </div>

            <div className="border-t border-border bg-card/50 backdrop-blur p-4 md:p-6 flex-shrink-0">
              <div className="max-w-3xl mx-auto">
                <div className="flex gap-3">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    placeholder={isLoading ? "L'IA réfléchit..." : "Décrivez votre objectif... Ex: 'Je veux apprendre la guitare' ou 'Perdre 10kg en 3 mois'"}
                    className="flex-1 bg-background/50 h-12 md:h-14 text-sm md:text-base px-4 md:px-6"
                    disabled={isLoading}
                  />
                  <GameButton 
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 md:px-8 h-12 md:h-14 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5 md:mr-2" />
                    <span className="hidden md:inline">Envoyer</span>
                  </GameButton>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Tree Section - Only show if we have an objective */}
          {currentObjective && (
            <div className={`${activeView === "tree" ? "flex" : "hidden"} md:flex flex-1 flex-col min-h-0 ${
              isFullscreen ? "md:flex fixed inset-0 z-50 bg-background" : ""
            } animate-in slide-in-from-right duration-300`}>
            <div className="border-b border-border bg-card/50 backdrop-blur p-4 flex-shrink-0">
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
          )}
        </div>
      </div>
    </AuthLayout>
  )
}