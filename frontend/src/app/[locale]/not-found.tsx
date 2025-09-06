"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Home, ArrowLeft, Search, Gamepad2, Ghost } from "lucide-react"
import dynamic from 'next/dynamic'
const HeaderClient = dynamic(() => import('@/components/HeaderClient'), { ssr: true })
import Footer from "@/components/Footer"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeaderClient locale="fr" translations={{ home: 'Accueil', pricing: 'Tarifs', login: 'Se connecter' }} />
      
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full text-center">
          {/* Animated 404 */}
          <div className="relative mb-8">
            <div className="text-[150px] md:text-[200px] font-bold leading-none text-transparent bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text animate-pulse">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Ghost className="h-20 w-20 md:h-32 md:w-32 text-purple-400/20 animate-bounce" />
            </div>
          </div>

          {/* Error message */}
          <h1 className="text-2xl md:text-4xl font-bold mb-4">
            Oops ! Cette quête n&apos;existe pas
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Il semble que vous ayez trouvé un bug dans la matrice... 
            Cette page est introuvable ou a été déplacée vers une autre dimension.
          </p>

          {/* Fun gaming references */}
          <Card className="bg-card/50 backdrop-blur border-purple-500/20 p-6 mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Gamepad2 className="h-5 w-5 text-purple-400" />
              <span className="text-sm font-semibold text-purple-400">GAME OVER</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Vous avez perdu 0 XP • Pas de pénalité • Réessayez !
            </p>
          </Card>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              size="lg"
            >
              <Home className="h-5 w-5 mr-2" />
              Retour à l&apos;accueil
            </Button>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="border-purple-500/50 hover:bg-purple-500/10"
              size="lg"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Page précédente
            </Button>
            <Button
              onClick={() => router.push("/objectives")}
              variant="outline"
              className="border-purple-500/50 hover:bg-purple-500/10"
              size="lg"
            >
              <Search className="h-5 w-5 mr-2" />
              Voir mes objectifs
            </Button>
          </div>

          {/* Helpful suggestions */}
          <div className="mt-12 p-6 bg-purple-500/5 rounded-lg border border-purple-500/20">
            <h2 className="font-semibold mb-3">Pages populaires :</h2>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link
                href="/objectives"
                className="px-4 py-2 bg-card hover:bg-purple-500/10 rounded-lg border border-border transition-colors"
              >
                Mes Objectifs
              </Link>
              <Link
                href="/pricing"
                className="px-4 py-2 bg-card hover:bg-purple-500/10 rounded-lg border border-border transition-colors"
              >
                Tarifs
              </Link>
              <Link
                href="/auth"
                className="px-4 py-2 bg-card hover:bg-purple-500/10 rounded-lg border border-border transition-colors"
              >
                Connexion
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}