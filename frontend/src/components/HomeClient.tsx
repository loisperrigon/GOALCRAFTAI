"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface HomeClientProps {
  locale: string
  translations: any
}

export default function HomeClient({ locale, translations: t }: HomeClientProps) {
  const router = useRouter()
  const [objective, setObjective] = useState("")

  const handleStartAdventure = () => {
    router.push(`/${locale}/objectives`)
  }

  const suggestions = locale === 'fr' 
    ? ["Perdre 10kg", "Apprendre React", "Lancer un podcast", "Méditer quotidiennement"]
    : locale === 'es'
    ? ["Perder 10kg", "Aprender React", "Lanzar un podcast", "Meditar diariamente"]
    : ["Lose 10kg", "Learn React", "Launch a podcast", "Meditate daily"]

  return (
    <>
      {/* Input Section */}
      <div className="max-w-2xl mx-auto mb-12 md:mb-16">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-card rounded-2xl p-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="text"
                placeholder={t.objectives?.chat?.placeholder}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="flex-1 bg-background border-0 text-base md:text-lg px-4 py-4 md:px-6 md:py-6 focus:ring-2 focus:ring-purple-500/50 placeholder:text-muted-foreground/60"
              />
              <Button 
                size="lg"
                onClick={handleStartAdventure}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-4 md:px-8 md:py-6 text-base md:text-lg font-semibold shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/40"
              >
                {t.home?.hero?.cta} →
              </Button>
            </div>
          </div>
        </div>
        
        {/* Suggestions */}
        <div className="flex flex-wrap gap-2 justify-center mt-6">
          <span className="text-sm text-muted-foreground">
            {locale === 'fr' ? 'Essayez:' : locale === 'es' ? 'Prueba:' : 'Try:'}
          </span>
          {suggestions.map((suggestion) => (
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

      {/* CTA Section */}
      <div className="mt-12 md:mt-20">
        <h2 className="text-3xl font-bold mb-4">
          {locale === 'fr' ? 'Prêt à transformer votre vie en jeu ?' : 
           locale === 'es' ? '¿Listo para convertir tu vida en un juego?' : 
           'Ready to turn your life into a game?'}
        </h2>
        <p className="text-muted-foreground mb-8">
          {locale === 'fr' ? "Rejoignez des milliers de personnes qui accomplissent l'impossible chaque jour." : 
           locale === 'es' ? 'Únete a miles de personas que logran lo imposible cada día.' : 
           'Join thousands of people achieving the impossible every day.'}
        </p>
        <Button 
          size="lg"
          onClick={handleStartAdventure}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 md:px-12 md:py-6 text-base md:text-lg font-semibold shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/40"
        >
          {t.pricing?.cta?.free}
        </Button>
        <p className="text-sm text-muted-foreground mt-4">
          {locale === 'fr' ? '✨ Pas de carte bancaire • 🎮 5 objectifs gratuits • ⚡ Setup en 30 secondes' : 
           locale === 'es' ? '✨ Sin tarjeta de crédito • 🎮 5 objetivos gratis • ⚡ Configuración en 30 segundos' : 
           '✨ No credit card • 🎮 5 free goals • ⚡ 30 second setup'}
        </p>
      </div>
    </>
  )
}