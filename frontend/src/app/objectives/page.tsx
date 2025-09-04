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
import { useAIChatWS } from "@/hooks/useAIChatWS"
import { useObjectiveStore } from "@/stores/objective-store"
import { motion, AnimatePresence } from "framer-motion"
import { Loader, Spinner } from "@/components/ui/loader"
import GenerationProgress from "@/components/GenerationProgress"
import { 
  Send, 
  Settings, 
  Target, 
  Zap,
  Brain
} from "lucide-react"

// Import dynamique pour éviter les erreurs SSR avec React Flow
const SkillTree = dynamic(() => import("@/components/SkillTree"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader size="lg" text="Chargement de l'arbre de progression..." />
    </div>
  )
})


export default function ObjectivesPage() {
  // NE PAS initialiser avec les données mock
  // useInitializeStores() // SUPPRIMÉ
  
  const { playNotification, playWhoosh } = useSound()
  const { currentObjective, setActiveObjective } = useObjectiveStore()
  const [inputMessage, setInputMessage] = useState("")
  // Initialiser activeView en fonction de l'objectif actuel
  const [activeView, setActiveView] = useState<"chat" | "tree">(() => {
    // Si on a déjà un objectif avec un arbre, commencer sur tree
    if (currentObjective?.skillTree?.nodes && currentObjective.skillTree.nodes.length > 0) {
      return "tree"
    }
    return "chat"
  })
  const [isInitializing, setIsInitializing] = useState(true)
  const hasInitialized = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Utiliser le hook AI Chat WebSocket pour la vraie intégration
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    streamingContent,
    loadMessages,
    isConnected,
    setConversationId
  } = useAIChatWS({
    objectiveType: currentObjective?.category || "general",
    useStreaming: false, // Pour l'instant on garde le mode normal
    onObjectiveGenerated: (objective) => {
      // L'agent a décidé de créer l'objectif
      playNotification()
      // Passer automatiquement à la vue arbre
      console.log("[ObjectivesPage] Passage à la vue arbre pour génération")
      setTimeout(() => setActiveView("tree"), 500)
    }
  })
  
  // Ne plus charger automatiquement - laisser AuthLayout gérer la sélection
  
  // Marquer comme initialisé quand on reçoit une conversation ou après un timeout de sécurité
  useEffect(() => {
    // Si on a déjà une conversation ou des messages, on n'est plus en initialisation
    if (currentObjective || messages.length > 0) {
      setIsInitializing(false)
      
      // NE PAS passer automatiquement à la vue tree
      // L'utilisateur décide ou on attend une modification d'objectif
      return
    }
    
    // Timeout de sécurité si aucune conversation n'arrive après 3 secondes
    const timer = setTimeout(() => {
      setIsInitializing(false)
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [currentObjective, messages.length])
  
  // Écouter les changements d'objectif depuis la sidebar
  useEffect(() => {
      if (currentObjective) {
        // Si on a un conversationId, le définir pour le chat
        if (currentObjective.conversationId) {
          console.log("[ObjectivesPage] Définition du conversationId:", currentObjective.conversationId)
          setConversationId(currentObjective.conversationId)
        }
        
        // Charger la conversation mais NE PAS changer la vue automatiquement
        if (currentObjective.skillTree && currentObjective.skillTree.nodes && currentObjective.skillTree.nodes.length > 0) {
          // Si on a un arbre avec des nodes, charger la conversation
          console.log("[ObjectivesPage] Objectif avec arbre - chargement de la conversation")
          loadConversationForObjective(currentObjective)
        } else {
          // Sinon, afficher le chat
          console.log("[ObjectivesPage] Objectif sans arbre - affichage du chat")
          if (currentObjective.conversationId) {
            loadConversationMessages(currentObjective.conversationId)
          } else {
            clearMessages()
          }
          setActiveView("chat")
        }
      } else {
        // Pas d'objectif - nouvelle conversation
        console.log("[ObjectivesPage] Nouvelle conversation démarrée")
        clearMessages()
        setActiveView("chat")
      }
  }, [currentObjective?.id, currentObjective?.isTemporary]) // eslint-disable-line react-hooks/exhaustive-deps
  
  // Détecter les modifications d'objectif pour changer de vue
  useEffect(() => {
    if (currentObjective?.isGenerating && currentObjective?.status === 'generating') {
      // Si l'objectif est en cours de génération/modification, passer à la vue arbre
      console.log("[ObjectivesPage] Objectif en cours de modification - passage à la vue arbre")
      setTimeout(() => setActiveView("tree"), 300)
    }
  }, [currentObjective?.isGenerating, currentObjective?.status])
  
  const loadConversationMessages = async (conversationId: string) => {
    try {
      console.log(`[ObjectivesPage] Chargement des messages pour conversation ${conversationId}`)
      const convResponse = await fetch(`/api/conversations?id=${conversationId}`)
      const convData = await convResponse.json()
      
      if (convData.success && convData.messages) {
        console.log(`[ObjectivesPage] ${convData.messages.length} messages chargés`)
        // Charger les messages dans le chat
        loadMessages(convData.messages, conversationId)
      } else {
        console.log("[ObjectivesPage] Aucun message trouvé")
        clearMessages()
      }
    } catch (error) {
      console.error("[ObjectivesPage] Erreur chargement messages:", error)
      clearMessages()
    }
  }
  
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


  // Si on est en initialisation, afficher UNIQUEMENT le loader
  if (isInitializing) {
    return (
      <AuthLayout>
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mb-2">
              <Brain className="h-10 w-10 text-purple-400" />
            </div>
            <Spinner size="lg" />
            <p className="text-sm text-muted-foreground">Chargement de votre conversation...</p>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="h-full flex flex-col overflow-hidden">
        {/* Navigation Tabs - Only show if we have an objective */}
        {currentObjective && (
          <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur flex-shrink-0">
            <div className="flex gap-1 bg-background/50 p-1 rounded-lg">
                <Button
                  variant={activeView === "chat" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveView("chat")}
                  className={activeView === "chat" 
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white" 
                    : "hover:bg-purple-500/10"
                  }
                >
                  <Brain className="h-4 w-4" />
                  <span className="ml-2">Chat IA</span>
                </Button>
                <Button
                  variant={activeView === "tree" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveView("tree")}
                  className={activeView === "tree" 
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white" 
                    : "hover:bg-purple-500/10"
                  }
                >
                  <Target className="h-4 w-4" />
                  <span className="ml-2">Arbre de progression</span>
                </Button>
              </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          {/* Chat Section - Show ONLY when chat view is active */}
          <div className={`${
            activeView === "chat" ? "flex" : "hidden"
          } h-full flex-col bg-background/50`}>
            <div className="flex-1 overflow-y-auto p-4 pt-6" ref={scrollRef}>
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
                
                {/* Loader avec logo animé */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex justify-start"
                  >
                    <div className="bg-card border border-border rounded-2xl rounded-tl-sm p-4">
                      <div className="flex items-center gap-3">
                        {/* Logo ou icône de votre app */}
                        <div className="relative w-8 h-8">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg opacity-20 animate-pulse" />
                          <div className="relative flex items-center justify-center w-full h-full">
                            <Target className="w-5 h-5 text-purple-500" />
                          </div>
                        </div>
                        
                        {/* Points animés */}
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "200ms" }} />
                          <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "400ms" }} />
                        </div>
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
                    placeholder={isLoading ? "En attente de la réponse..." : "Décrivez votre objectif... Ex: 'Je veux apprendre la guitare' ou 'Perdre 10kg en 3 mois'"}
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

          {/* Skill Tree Section - Only show when tree view is active AND we have an objective */}
          {currentObjective && activeView === "tree" && (
            <div className="h-full bg-gradient-to-br from-purple-900/5 via-background to-blue-900/5 relative">
              {/* Barre de progression de génération */}
              <AnimatePresence>
                {currentObjective.isGenerating && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md px-4">
                    <GenerationProgress />
                  </div>
                )}
              </AnimatePresence>
              
              <SkillTree isFullscreen={false} />
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  )
}