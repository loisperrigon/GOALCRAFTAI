"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, Send, Sparkles, TreePine, MessageCircle, Zap, Target, Brain } from "lucide-react"
import AuthLayout from "@/components/AuthLayout"
import SkillTree from "@/components/SkillTree"
import { useObjectiveStore } from "@/stores/objective-store"
import { useUserStore } from "@/stores/user-store"
import { useAIChatWS } from "@/hooks/useAIChatWS"
import { mockObjectives } from "@/data/mockObjectives"
import confetti from "canvas-confetti"
import ObjectiveDetailModal from "@/components/ObjectiveDetailModal"

interface ObjectivesClientProps {
  translations?: { [key: string]: any }
  locale: string
}

export default function ObjectivesClient({ translations, locale }: ObjectivesClientProps) {
  const [message, setMessage] = useState("")
  const [showTree, setShowTree] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedStep, setSelectedStep] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { user } = useUserStore()
  const { 
    currentObjective, 
    selectObjective,
    completeStep,
    canUnlockStep
  } = useObjectiveStore()
  
  const {
    messages,
    sendMessage,
    isConnected,
    isGenerating,
    currentConversationId
  } = useAIChatWS()

  useEffect(() => {
    if (!currentObjective) {
      const guitarObjective = mockObjectives.find(obj => obj.id === "guitar-learning")
      if (guitarObjective) {
        selectObjective(guitarObjective.id)
      }
    }
  }, [currentObjective, selectObjective])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim() || isGenerating) return
    sendMessage(message)
    setMessage("")
  }

  const handleStepClick = (step: any) => {
    setSelectedStep(step)
    setIsDetailModalOpen(true)
  }

  const handleCompleteStep = (stepId: string) => {
    completeStep(currentObjective?.id || "", stepId)
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.5 }
    })
    
    setIsDetailModalOpen(false)
  }

  return (
    <AuthLayout>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Chat Section */}
        <div className={`${showTree ? 'hidden md:flex' : 'flex'} flex-1 flex-col`}>
          <Card className="flex-1 m-4 flex flex-col overflow-hidden backdrop-blur-xl bg-white/5 border-white/10">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold">AI Coach</h2>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                      <span className="text-xs text-muted-foreground">
                        {isConnected ? 'En ligne' : 'Hors ligne'}
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="md:hidden"
                  onClick={() => setShowTree(true)}
                >
                  <TreePine className="h-4 w-4 mr-2" />
                  <span className="ml-2 hidden sm:inline">Voir l'arbre</span>
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                    <h3 className="text-lg font-semibold mb-2">Créons votre parcours ensemble !</h3>
                    <p className="text-muted-foreground">
                      Décrivez votre objectif et je créerai un plan étape par étape
                    </p>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                  >
                    <div className={`max-w-[80%] ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white' 
                        : 'bg-white/10 backdrop-blur-lg'
                    } rounded-lg p-3 shadow-lg`}>
                      <div className="flex items-start gap-2">
                        {msg.role === 'assistant' && <Brain className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 animate-pulse" />
                        <span className="text-sm">Création de votre parcours...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Décrivez votre objectif..."
                  className="flex-1 bg-white/10 border-white/20"
                  disabled={!isConnected || isGenerating}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!message.trim() || !isConnected || isGenerating}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Tree Section */}
        <div className={`${showTree ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
          <Card className="flex-1 m-4 flex flex-col overflow-hidden backdrop-blur-xl bg-white/5 border-white/10">
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="font-semibold">Arbre de progression</h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="md:hidden"
                  onClick={() => setShowTree(false)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  <span className="ml-2 hidden sm:inline">Chat IA</span>
                </Button>
              </div>
            </div>
            
            {currentObjective && currentObjective.skillTree ? (
              <SkillTree 
                tree={currentObjective.skillTree}
                onStepClick={handleStepClick}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <TreePine className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-muted-foreground">
                    Commencez par décrire votre objectif dans le chat
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {selectedStep && (
        <ObjectiveDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          step={selectedStep}
          onComplete={handleCompleteStep}
          canComplete={canUnlockStep(currentObjective?.id || "", selectedStep.id)}
        />
      )}
    </AuthLayout>
  )
}