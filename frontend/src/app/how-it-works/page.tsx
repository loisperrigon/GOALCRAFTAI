"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useRouter } from "next/navigation"
import { 
  MessageSquare, 
  Sparkles, 
  Target, 
  Trophy,
  Zap,
  ChevronRight,
  Play,
  Gamepad2,
  Brain,
  Rocket,
  Stars,
  Gift,
  Medal,
  Crown,
  Shield,
  Swords,
  Heart,
  ArrowRight,
  CheckCircle,
  Lock,
  Unlock
} from "lucide-react"

export default function HowItWorksPage() {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)
  const [unlockedSteps, setUnlockedSteps] = useState([0])
  const [currentXP, setCurrentXP] = useState(0)
  const [level, setLevel] = useState(1)
  const [showConfetti, setShowConfetti] = useState(false)

  // Animation des XP quand on débloque une étape
  const unlockStep = (stepIndex: number) => {
    if (!unlockedSteps.includes(stepIndex)) {
      setUnlockedSteps([...unlockedSteps, stepIndex])
      setCurrentXP(prev => {
        const newXP = prev + 25
        if (newXP >= 100) {
          setLevel(prev => prev + 1)
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 3000)
          return newXP - 100
        }
        return newXP
      })
    }
    setActiveStep(stepIndex)
  }

  // Auto-play demo
  const [isPlaying, setIsPlaying] = useState(false)
  useEffect(() => {
    if (isPlaying && activeStep < 3) {
      const timer = setTimeout(() => {
        unlockStep(activeStep + 1)
      }, 2000)
      return () => clearTimeout(timer)
    } else if (isPlaying && activeStep === 3) {
      setIsPlaying(false)
    }
  }, [isPlaying, activeStep])

  const steps = [
    {
      icon: MessageSquare,
      title: "Décris ton rêve",
      description: "Parle à notre IA de ton objectif, qu'il soit personnel ou professionnel",
      color: "from-blue-500 to-cyan-500",
      badge: "Étape 1",
      xp: 25,
      animation: "animate-pulse"
    },
    {
      icon: Sparkles,
      title: "L'IA crée ton parcours",
      description: "Notre IA génère un arbre de compétences personnalisé avec des étapes progressives",
      color: "from-purple-500 to-pink-500",
      badge: "Étape 2",
      xp: 25,
      animation: "animate-bounce"
    },
    {
      icon: Target,
      title: "Progresse étape par étape",
      description: "Complète les missions, débloque de nouvelles compétences et gagne de l'XP",
      color: "from-green-500 to-emerald-500",
      badge: "Étape 3",
      xp: 25,
      animation: "animate-pulse"
    },
    {
      icon: Trophy,
      title: "Atteins ton objectif !",
      description: "Célèbre ta réussite avec des badges, achievements et récompenses",
      color: "from-yellow-500 to-orange-500",
      badge: "Victoire",
      xp: 25,
      animation: "animate-bounce"
    }
  ]

  const features = [
    {
      icon: Brain,
      title: "IA Personnalisée",
      description: "Parcours adapté à ton niveau et tes préférences",
      color: "text-purple-400"
    },
    {
      icon: Gamepad2,
      title: "100% Gamifié",
      description: "XP, niveaux, badges et achievements pour rester motivé",
      color: "text-blue-400"
    },
    {
      icon: Rocket,
      title: "Progression Rapide",
      description: "Système de déblocage qui rend l'apprentissage addictif",
      color: "text-green-400"
    },
    {
      icon: Crown,
      title: "Mode Premium",
      description: "Parcours illimités et fonctionnalités exclusives",
      color: "text-yellow-400"
    }
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-background to-purple-950/10">
        {/* Hero Section avec animation */}
        <section className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
              <span className="text-sm font-medium text-purple-400">Comment ça marche</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Transforme tes rêves en 
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> quête épique</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              4 étapes simples pour gamifier n'importe quel objectif et le rendre aussi addictif qu'un jeu vidéo
            </p>

            {/* Mini game bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium">Niveau {level}</span>
                </div>
                <span className="text-sm text-muted-foreground">{currentXP}/100 XP</span>
              </div>
              <div className="w-full bg-background/50 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${currentXP}%` }}
                />
              </div>
            </div>

            <Button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              {isPlaying ? "Pause" : "Lancer la démo"}
            </Button>
          </div>

          {/* Steps avec animations */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isUnlocked = unlockedSteps.includes(index)
              const isActive = activeStep === index
              
              return (
                <Card 
                  key={index}
                  className={`relative p-6 cursor-pointer transition-all duration-500 ${
                    isUnlocked 
                      ? "border-purple-500/30 shadow-lg shadow-purple-500/20" 
                      : "opacity-50 border-border"
                  } ${isActive ? "scale-105" : "scale-100"}`}
                  onClick={() => isUnlocked && setActiveStep(index)}
                >
                  {/* Lock/Unlock indicator */}
                  <div className="absolute -top-3 -right-3">
                    {isUnlocked ? (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                        <Lock className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Badge */}
                  <Badge className="mb-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20">
                    {step.badge}
                  </Badge>

                  {/* Icon avec animation */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-4 ${
                    isActive ? step.animation : ""
                  }`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{step.description}</p>

                  {/* XP Reward */}
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 bg-yellow-500/10 rounded-full">
                      <span className="text-xs font-medium text-yellow-400">+{step.xp} XP</span>
                    </div>
                    {isUnlocked && (
                      <Medal className="h-4 w-4 text-yellow-400 animate-pulse" />
                    )}
                  </div>

                  {/* Connection line to next step */}
                  {index < steps.length - 1 && (
                    <div className={`absolute top-1/2 -right-3 w-6 h-0.5 ${
                      unlockedSteps.includes(index + 1) 
                        ? "bg-gradient-to-r from-purple-500 to-blue-500" 
                        : "bg-gray-700"
                    }`} />
                  )}
                </Card>
              )
            })}
          </div>

          {/* Interactive Demo Section */}
          <Card className="p-8 mb-12 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Essaie maintenant !</h2>
              <p className="text-muted-foreground">Clique sur "Débloquer" pour voir la magie opérer</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {[
                { icon: Swords, label: "Choisir une quête", unlocked: true },
                { icon: Stars, label: "Gagner de l'XP", unlocked: unlockedSteps.length > 2 },
                { icon: Crown, label: "Devenir légendaire", unlocked: unlockedSteps.length === 4 }
              ].map((item, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border transition-all ${
                    item.unlocked 
                      ? "border-purple-500/50 bg-purple-500/10" 
                      : "border-border opacity-50"
                  }`}
                >
                  <item.icon className={`h-6 w-6 mb-2 ${
                    item.unlocked ? "text-purple-400" : "text-muted-foreground"
                  }`} />
                  <p className="text-sm font-medium">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => {
                  if (unlockedSteps.length < 4) {
                    unlockStep(unlockedSteps.length)
                  } else {
                    setUnlockedSteps([0])
                    setActiveStep(0)
                    setCurrentXP(0)
                    setLevel(1)
                  }
                }}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                {unlockedSteps.length < 4 ? (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Débloquer l'étape suivante
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Recommencer
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card 
                  key={index}
                  className="p-6 hover:shadow-lg transition-all hover:scale-105 hover:border-purple-500/30"
                >
                  <Icon className={`h-10 w-10 mb-4 ${feature.color}`} />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              )
            })}
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="p-8 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30">
              <Gift className="h-12 w-12 mx-auto mb-4 text-purple-400 animate-bounce" />
              <h2 className="text-3xl font-bold mb-4">
                Prêt à transformer ta vie en jeu ?
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Commence gratuitement et découvre une nouvelle façon d'atteindre tes objectifs
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={() => router.push("/objectives")}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  Commencer l'aventure
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => router.push("/pricing")}
                  className="border-purple-500/50 hover:bg-purple-500/10"
                >
                  <Crown className="h-5 w-5 mr-2 text-yellow-400" />
                  Voir Premium
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* Confetti animation */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent animate-bounce">
                LEVEL UP!
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}