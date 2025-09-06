import { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/utils'
import type { Locale } from '@/lib/i18n/config'
import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Shield, Zap, Trophy, Brain, Target, Users, Star } from 'lucide-react'

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
    <div className="min-h-screen bg-background flex flex-col">
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

          {/* Right Side - Auth Form */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md p-8 backdrop-blur-xl bg-white/5 border-white/10">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">G</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">Bienvenue</h2>
                <p className="text-muted-foreground">
                  Connectez-vous pour continuer
                </p>
              </div>

              <form action={`/${locale}/api/auth/signin`} method="POST" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email" 
                    placeholder="vous@exemple.com"
                    required
                    className="bg-white/10 border-white/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input 
                    id="password"
                    name="password"
                    type="password" 
                    placeholder="••••••••"
                    required
                    className="bg-white/10 border-white/20"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="remember" className="rounded" />
                    <span>Se souvenir de moi</span>
                  </label>
                  <a href="#" className="text-purple-400 hover:text-purple-300">
                    Mot de passe oublié ?
                  </a>
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                >
                  Se connecter
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Ou</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <a href={`/${locale}/api/auth/google`} className="block">
                    <Button 
                      type="button"
                      variant="outline" 
                      className="w-full"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continuer avec Google
                    </Button>
                  </a>

                  <a href={`/${locale}/api/auth/github`} className="block">
                    <Button 
                      type="button"
                      variant="outline" 
                      className="w-full"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                      </svg>
                      Continuer avec GitHub
                    </Button>
                  </a>
                </div>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  Pas encore de compte ?{' '}
                  <a href={`/${locale}/auth?mode=register`} className="text-purple-400 hover:text-purple-300 font-semibold">
                    Créer un compte
                  </a>
                </p>
              </form>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}