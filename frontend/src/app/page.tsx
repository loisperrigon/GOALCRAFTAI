"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function Home() {
  const router = useRouter()
  const [objective, setObjective] = useState("")
  const [isHovered, setIsHovered] = useState(false)

  const handleStartAdventure = () => {
    router.push("/objectives")
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-blue-900/20" />
      
      {/* Animated particles effect */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full filter blur-[128px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/30 rounded-full filter blur-[128px] animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/20 rounded-full filter blur-[128px] animate-pulse animation-delay-4000" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />

        {/* Hero Section */}
        <main className="container mx-auto px-4 pt-12 md:pt-20 pb-16 md:pb-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6 md:mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              <span className="text-sm text-purple-300">Propulsé par GPT-4</span>
            </div>

            {/* Main heading with gradient */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Transformez vos rêves
              </span>
              <br />
              <span className="text-foreground">en victoires épiques</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto">
              Décrivez votre objectif. L'IA crée votre quête personnalisée. 
              Débloquez des étapes, gagnez des XP, accomplissez l'impossible.
            </p>

            {/* Input Section */}
            <div className="max-w-2xl mx-auto mb-12 md:mb-16">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-card rounded-2xl p-2">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="text"
                      placeholder="Quel est votre prochain grand défi ? (ex: Créer mon entreprise, Apprendre le piano...)"
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      className="flex-1 bg-background border-0 text-base md:text-lg px-4 py-4 md:px-6 md:py-6 focus:ring-2 focus:ring-purple-500/50 placeholder:text-muted-foreground/60"
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    />
                    <Button 
                      size="lg"
                      onClick={handleStartAdventure}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-4 md:px-8 md:py-6 text-base md:text-lg font-semibold shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/40"
                    >
                      Commencer l'aventure →
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Suggestions */}
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                <span className="text-sm text-muted-foreground">Essayez:</span>
                {["Perdre 10kg", "Apprendre React", "Lancer un podcast", "Méditer quotidiennement"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setObjective(suggestion)}
                    className="text-sm px-3 py-1 rounded-full border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto mb-12 md:mb-20">
              <Card className="bg-card/50 backdrop-blur border-purple-500/20 p-6 hover:border-purple-500/40 transition-all group">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Objectifs structurés</h3>
                <p className="text-sm text-muted-foreground">
                  L'IA décompose vos rêves en étapes concrètes et réalisables
                </p>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-blue-500/20 p-6 hover:border-blue-500/40 transition-all group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Progression addictive</h3>
                <p className="text-sm text-muted-foreground">
                  Système de niveaux, XP et badges pour rester motivé
                </p>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-pink-500/20 p-6 hover:border-pink-500/40 transition-all group">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Succès garantis</h3>
                <p className="text-sm text-muted-foreground">
                  93% atteignent leurs objectifs avec notre méthode
                </p>
              </Card>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto py-8 md:py-12 border-y border-border/50">
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  50K+
                </div>
                <div className="text-sm text-muted-foreground mt-1">Utilisateurs actifs</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
                  2M+
                </div>
                <div className="text-sm text-muted-foreground mt-1">Objectifs atteints</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  4.9/5
                </div>
                <div className="text-sm text-muted-foreground mt-1">Note moyenne</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  93%
                </div>
                <div className="text-sm text-muted-foreground mt-1">Taux de réussite</div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="mt-12 md:mt-20 max-w-2xl mx-auto">
              <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20 p-8">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">⭐</span>
                  ))}
                </div>
                <p className="text-lg mb-4 italic">
                  "J'ai enfin réussi à lancer mon entreprise grâce à GoalCraftAI. 
                  Le système de progression m'a gardé motivé chaque jour. C'est addictif dans le bon sens!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full" />
                  <div>
                    <div className="font-semibold">Marie L.</div>
                    <div className="text-sm text-muted-foreground">Entrepreneure</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* CTA Section */}
            <div className="mt-12 md:mt-20">
              <h2 className="text-3xl font-bold mb-4">
                Prêt à transformer votre vie en jeu ?
              </h2>
              <p className="text-muted-foreground mb-8">
                Rejoignez des milliers de personnes qui accomplissent l'impossible chaque jour.
              </p>
              <Button 
                size="lg"
                onClick={handleStartAdventure}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 md:px-12 md:py-6 text-base md:text-lg font-semibold shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/40"
              >
                Commencer gratuitement
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                ✨ Pas de carte bancaire • 🎮 5 objectifs gratuits • ⚡ Setup en 30 secondes
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  )
}