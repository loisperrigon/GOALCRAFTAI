"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AuthModal } from '@/components/lazy'
import { useStripeCheckout } from '@/hooks/use-subscription'
import { useUserStore } from '@/stores/user-store'
import toast from 'react-hot-toast'
import { 
  Check, 
  X, 
  Sparkles, 
  Zap, 
  Trophy, 
  Crown,
  Unlock,
  Star,
  Gift,
  Brain,
  Users,
  Download,
  Globe,
  Shield,
  Heart,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

interface PricingClientProps {
  translations: {
    free?: { features?: string[], limitations?: string[] }
    pro?: { features?: string[], yearlyBonus?: string }
    faq?: { items?: { question: string, answer: string }[] }
  }
  locale: string
}

export default function PricingClient({ translations: t }: PricingClientProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly') // Yearly par défaut pour montrer l'économie
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 })
  const [activeUsers, setActiveUsers] = useState(1247)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user, isAuthenticated } = useUserStore()
  const { createCheckout } = useStripeCheckout()
  const [isLoading, setIsLoading] = useState(false)
  
  // Prix pour chaque plan
  const prices = {
    starter: {
      monthly: 9,
      yearly: 81, // 9 mois au lieu de 12
    },
    pro: {
      monthly: 19,
      yearly: 171, // 9 mois au lieu de 12
    }
  }
  
  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return { hours: 23, minutes: 59, seconds: 59 } // Reset
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  // Simuler des utilisateurs actifs
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 3) - 1)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Plus besoin de cette vérification, on utilise le store

  const handlePremiumClick = async (plan: 'starter' | 'pro') => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    
    // Si déjà abonné au même plan
    if (user?.premiumType === plan) {
      toast.info('Vous avez déjà ce plan')
      return
    }
    
    setIsLoading(true)
    try {
      await createCheckout(plan, billingPeriod)
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Erreur lors de la création de la session de paiement')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthSuccess = async () => {
    // Après connexion réussie, on peut continuer vers Stripe
    // Le composant va se re-render avec isAuthenticated = true
    toast.success('Connexion réussie ! Vous pouvez maintenant choisir votre plan.')
  }

  return (
    <div className="flex-1 overflow-x-auto">
      {/* Bannière urgence */}
      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-y border-orange-500/30">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm font-medium text-orange-400">
              🔥 Offre limitée : -25% sur l&apos;abonnement annuel
            </span>
            <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full">
              <span className="text-xs text-orange-300">Expire dans</span>
              <span className="font-mono text-sm font-bold text-white">
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section - Plus compact */}
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="text-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Débloquez l&apos;IA illimitée
          </h1>
          <p className="text-muted-foreground">
            Transformez vos objectifs en réalité avec un coaching personnalisé
          </p>
          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 border-2 border-background" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              <span className="text-purple-400 font-semibold">{activeUsers}</span> utilisateurs actifs cette semaine
            </span>
          </div>
        </div>
        
        {/* Points clés Premium */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Brain className="h-4 w-4 text-purple-400" />
            </div>
            <span className="text-sm font-medium">IA GPT-4 illimitée</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Zap className="h-4 w-4 text-blue-400" />
            </div>
            <span className="text-sm font-medium">Coaching personnalisé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Trophy className="h-4 w-4 text-green-400" />
            </div>
            <span className="text-sm font-medium">Objectifs illimités</span>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={billingPeriod === 'monthly' ? 'text-white' : 'text-muted-foreground'}>
            Mensuel
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
            className="relative w-16 h-8 bg-purple-500/20 rounded-full transition-colors hover:bg-purple-500/30"
          >
            <div className={`absolute top-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-transform ${
              billingPeriod === 'yearly' ? 'translate-x-8' : 'translate-x-1'
            }`} />
          </button>
          <span className={billingPeriod === 'yearly' ? 'text-white' : 'text-muted-foreground'}>
            Annuel
          </span>
          {billingPeriod === 'yearly' && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              -25% 🎉
            </Badge>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="px-4 pb-8">
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 max-w-7xl mx-auto">
          
          {/* Free Plan */}
          <Card className="relative flex-1 md:max-w-sm p-4 md:p-6 border-2 border-border hover:border-purple-500/30 transition-all">
            <div className="mb-4">
              <h3 className="text-2xl font-bold mb-1">Free</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Pour découvrir la plateforme
              </p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-5xl font-bold">0€</span>
                <span className="text-muted-foreground">/mois</span>
              </div>
              <Button 
                className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                size="lg"
                asChild
              >
                <Link href="/objectives">
                  Commencer gratuitement
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Inclus dans le plan gratuit
              </h4>
              <ul className="space-y-3">
                {t?.free?.features?.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
                {t?.free?.limitations?.map((limitation: string, index: number) => (
                  <li key={`limit-${index}`} className="flex items-start gap-3">
                    <X className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{limitation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Starter Plan */}
          <Card className="relative flex-1 md:max-w-sm p-4 md:p-6 border-2 border-blue-500/50 bg-gradient-to-br from-blue-500/10 to-purple-500/10 hover:border-blue-500 transition-all">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-bold">Starter</h3>
                <Zap className="h-5 w-5 text-blue-400" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Pour progresser sérieusement
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-bold text-blue-400">
                  {billingPeriod === 'monthly' ? '9€' : '6.75€'}
                </span>
                <span className="text-muted-foreground">/mois</span>
              </div>
              {billingPeriod === 'yearly' && (
                <p className="text-sm text-green-400 mb-4">
                  Économisez 27€ par an
                </p>
              )}
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
                size="lg"
                onClick={() => handlePremiumClick('starter')}
                disabled={isLoading}
              >
                <Zap className="h-4 w-4 mr-2" />
                Choisir Starter
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                🔒 Paiement 100% sécurisé • Annulation immédiate
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-blue-400 uppercase tracking-wide">
                Inclus dans Starter :
              </h4>
              <ul className="space-y-3">
                {t?.starter?.features?.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Pro Plan */}
          <Card className="relative flex-1 md:max-w-sm p-4 md:p-6 border-2 border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-blue-500/10 hover:border-purple-500 transition-all">
            {/* Badge populaire */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-none px-3 py-1 text-xs animate-pulse">
                <Star className="h-3 w-3 mr-1" />
                LE PLUS POPULAIRE
              </Badge>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-bold">Pro</h3>
                <Crown className="h-5 w-5 text-yellow-400" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                IA GPT-4 + Coaching illimité
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-bold text-purple-400">
                  {billingPeriod === 'monthly' ? '19€' : '14.25€'}
                </span>
                <span className="text-muted-foreground">/mois</span>
              </div>
              {billingPeriod === 'yearly' && (
                <p className="text-sm text-green-400 mb-4">
                  Économisez 57€ par an
                </p>
              )}
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg relative overflow-hidden group"
                size="lg"
                onClick={() => handlePremiumClick('pro')}
                disabled={isLoading}
              >
                <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                <Crown className="h-4 w-4 mr-2" />
                Devenir Pro
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                🔒 Paiement 100% sécurisé • Annulation immédiate
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-purple-400 uppercase tracking-wide">
                Inclus dans Pro :
              </h4>
              <ul className="space-y-3">
                {t?.pro?.features?.map((feature: string, index: number) => {
                  const icons = [Sparkles, Brain, Trophy, Unlock, Users, Shield]
                  const Icon = icons[index] || Sparkles
                  return (
                    <li key={index} className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-medium">{feature}</span>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Badge économie */}
            {billingPeriod === 'yearly' && (
              <div className="mt-6 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-green-400" />
                  <span className="text-sm text-green-400 font-medium">
                    3 mois offerts avec l'abonnement annuel !
                  </span>
                </div>
              </div>
            )}
          </Card>
          </div>
        </div>

        {/* Comparaison visuelle */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="p-6 bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/20">
            <h3 className="text-xl font-bold text-center mb-6">
              💡 Savez-vous combien coûte un coach privé ?
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <p className="text-3xl font-bold text-gray-400 line-through">150€/mois</p>
                <p className="text-sm text-muted-foreground">Coach personnel</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-gray-400 line-through">89€/mois</p>
                <p className="text-sm text-muted-foreground">Apps concurrentes</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-purple-400">
                  {billingPeriod === 'monthly' ? '19€' : '14.25€'}/mois
                </p>
                <p className="text-sm font-medium">GoalCraft Pro</p>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  87% moins cher
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Trust badges */}
        <div className="mt-8 md:mt-12 text-center">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-8">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span className="text-sm">Paiement sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-400" />
              <span className="text-sm">Satisfait ou remboursé 30j</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-semibold">+{Math.floor(activeUsers * 8)} utilisateurs</span>
            </div>
          </div>
          
          {/* Témoignages */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
            <Card className="p-4 bg-card/50">
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm italic mb-2">
                &quot;L&apos;IA m&apos;a aidé à structurer mes objectifs comme jamais. J&apos;ai appris la guitare en 3 mois !&quot;
              </p>
              <p className="text-xs text-muted-foreground">- Marie, 28 ans</p>
            </Card>
            <Card className="p-4 bg-card/50">
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm italic mb-2">
                "Le coaching personnalisé fait toute la différence. Je reste motivé chaque jour."
              </p>
              <p className="text-xs text-muted-foreground">- Thomas, 35 ans</p>
            </Card>
            <Card className="p-4 bg-card/50">
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm italic mb-2">
                &quot;Meilleur investissement de l&apos;année. J&apos;ai atteint 3 objectifs majeurs en 6 mois.&quot;
              </p>
              <p className="text-xs text-muted-foreground">- Sophie, 42 ans</p>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 md:mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Questions fréquentes
          </h2>
          <div className="space-y-6">
            {t?.faq?.items?.map((item: { question: string; answer: string }, index: number) => (
              <Card key={index} className="p-6">
                <h3 className="font-semibold mb-2">{item.question}</h3>
                <p className="text-muted-foreground text-sm">{item.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
}