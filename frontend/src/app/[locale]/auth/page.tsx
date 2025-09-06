import { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/utils'
import type { Locale } from '@/lib/i18n/config'
import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import AuthForm from '@/components/auth/AuthForm'
import AuthBackground from '@/components/auth/AuthBackground'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Brain, Target, Trophy } from 'lucide-react'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return {
    title: dict.auth?.title || 'Connexion - GoalCraftAI',
    description: dict.auth?.description || 'Connectez-vous pour transformer vos rêves en réalité',
    openGraph: {
      title: dict.auth?.title || 'Connexion - GoalCraftAI',
      description: dict.auth?.description || 'Transformez vos rêves en objectifs réalisables',
      images: ['/og-auth.png'],
    },
  }
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <AuthBackground />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <HeaderServer locale={locale} translations={dict.nav || { home: 'Accueil', pricing: 'Tarifs', login: 'Se connecter' }} />
        
        {/* SEO Content */}
        <div className="sr-only">
          <h1>{dict.auth?.title || 'Connexion à GoalCraftAI'}</h1>
          <p>{dict.auth?.description || 'Plateforme gamifiée pour atteindre vos objectifs'}</p>
          <h2>Pourquoi GoalCraftAI?</h2>
          <ul>
            <li>Planification d'objectifs par IA</li>
            <li>Suivi de progression gamifié</li>
            <li>Coaching personnalisé</li>
          </ul>
        </div>

        <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Side - Benefits */}
          <div className="hidden lg:flex flex-col justify-center space-y-8">
            <div>
              <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                Powered by GPT-4
              </Badge>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Transformez vos rêves en réalité
              </h1>
              <p className="text-muted-foreground text-lg">
                Rejoignez 50,000+ utilisateurs qui atteignent leurs objectifs avec notre IA
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Brain className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold">IA GPT-4 Avancée</h3>
                  <p className="text-sm text-muted-foreground">
                    Génération intelligente d'étapes personnalisées
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Target className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Arbres de Progression</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualisez votre parcours comme un jeu vidéo
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Trophy className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Gamification Complète</h3>
                  <p className="text-sm text-muted-foreground">
                    XP, niveaux, badges et achievements
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t">
              <div>
                <div className="text-2xl font-bold text-purple-500">50K+</div>
                <div className="text-sm text-muted-foreground">Utilisateurs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500">2M+</div>
                <div className="text-sm text-muted-foreground">Objectifs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">4.9/5</div>
                <div className="text-sm text-muted-foreground">Note</div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form (Client Component) */}
          <div className="flex items-center justify-center">
            <AuthForm locale={locale} />
          </div>
        </div>
        </main>
        
        <Footer />
      </div>
    </div>
  )
}