"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Sparkles } from "lucide-react"

interface HomeHeroProps {
  locale: string
  translations: {
    placeholder?: string
    button?: string
    suggestions?: {
      label?: string
      items?: string[]
    }
  }
}

function HomeHero({ locale, translations }: HomeHeroProps) {
  const router = useRouter()
  const [objective, setObjective] = React.useState("")
  const [isHovered, setIsHovered] = React.useState(false)

  const handleStartAdventure = () => {
    if (objective.trim()) {
      // Stocker l'objectif dans sessionStorage pour le récupérer sur la page objectives
      sessionStorage.setItem('initial_objective', objective)
    }
    router.push(`/${locale}/objectives`)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setObjective(suggestion)
  }

  const suggestions = translations.suggestions?.items || [
    "Perdre 10kg en 6 mois",
    "Apprendre React en 3 mois", 
    "Lancer un podcast",
    "Méditer tous les jours"
  ]

  return (
    <div className="space-y-8">
      {/* Input Section avec animations */}
      <div className="max-w-2xl mx-auto">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-card rounded-2xl p-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleStartAdventure()}
                placeholder={translations.placeholder || "Décrivez votre objectif..."}
                className="flex-1 bg-background/50 border-0 text-lg px-6 py-6 focus:ring-2 focus:ring-purple-500/50"
              />
              <Button
                onClick={handleStartAdventure}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 whitespace-nowrap group/btn"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <span className="flex items-center gap-2">
                  {translations.button || "Commencer"}
                  <ArrowRight className={`h-5 w-5 transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions interactives */}
      <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          {translations.suggestions?.label || 'Essayez :'}
        </span>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="text-sm px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-105 cursor-pointer"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}

export default HomeHero