"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Check, 
  X, 
  Sparkles, 
  Zap, 
  Trophy, 
  Crown,
  Rocket,
  Lock,
  Unlock,
  Star,
  Gift,
  Brain,
  Users,
  Download,
  Globe,
  Shield,
  Heart,
  ChevronRight,
  Gamepad2
} from 'lucide-react'
import Link from 'next/link'

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  
  const monthlyPrice = 9.99
  const yearlyPrice = 89.99 // 25% de réduction
  const currentPrice = billingPeriod === 'monthly' ? monthlyPrice : yearlyPrice / 12

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Gamepad2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">GoalCraft AI</span>
            </Link>
            <Link href="/create">
              <Button variant="outline">
                Retour à l'app
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-none">
            <Sparkles className="h-3 w-3 mr-1" />
            Transformez vos rêves en réalité
          </Badge>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Choisissez votre aventure
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Commencez gratuitement ou débloquez la puissance complète de l'IA pour accélérer votre progression
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
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
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Free Plan */}
          <Card className="relative p-8 border-2 border-border hover:border-purple-500/30 transition-all">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-muted-foreground mb-4">
                Parfait pour découvrir et commencer votre transformation
              </p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">0€</span>
                <span className="text-muted-foreground">/mois</span>
              </div>
              <Button 
                className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                size="lg"
                asChild
              >
                <Link href="/create">
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
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">3 objectifs actifs maximum</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Parcours d'apprentissage basiques</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Système de progression XP</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Badges et achievements de base</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">IA limitée (5 générations/mois)</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Personnalisation avancée</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Export et partage</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Coaching IA personnalisé</span>
                </li>
              </ul>
            </div>
          </Card>

          {/* Premium Plan */}
          <Card className="relative p-8 border-2 border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-blue-500/10 hover:border-purple-500 transition-all">
            {/* Badge populaire */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-none px-4 py-1">
                <Star className="h-3 w-3 mr-1" />
                PLUS POPULAIRE
              </Badge>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold">Premium</h3>
                <Crown className="h-6 w-6 text-yellow-400" />
              </div>
              <p className="text-muted-foreground mb-4">
                Débloquez votre plein potentiel avec l'IA illimitée
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold">
                  {billingPeriod === 'monthly' ? `${monthlyPrice}€` : `${currentPrice.toFixed(2)}€`}
                </span>
                <span className="text-muted-foreground">/mois</span>
              </div>
              {billingPeriod === 'yearly' && (
                <p className="text-sm text-green-400 mb-4">
                  Économisez {((monthlyPrice * 12) - yearlyPrice).toFixed(2)}€ par an
                </p>
              )}
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg"
                size="lg"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Débloquer Premium
              </Button>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-purple-400 uppercase tracking-wide">
                Tout du plan gratuit, plus :
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-semibold">Objectifs illimités</span>
                    <p className="text-xs text-muted-foreground">Créez autant de parcours que vous voulez</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-semibold">IA GPT-4 illimitée</span>
                    <p className="text-xs text-muted-foreground">Générations et personnalisations infinies</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-semibold">Coaching IA personnalisé</span>
                    <p className="text-xs text-muted-foreground">Conseils adaptés à votre progression</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Trophy className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-semibold">Défis exclusifs & récompenses</span>
                    <p className="text-xs text-muted-foreground">Badges premium et achievements spéciaux</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-semibold">Mode collaboration</span>
                    <p className="text-xs text-muted-foreground">Partagez vos objectifs avec amis/coach</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Download className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-semibold">Export complet</span>
                    <p className="text-xs text-muted-foreground">PDF, JSON, images haute résolution</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-semibold">Accès communautaire</span>
                    <p className="text-xs text-muted-foreground">Parcours partagés par la communauté</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-semibold">Support prioritaire</span>
                    <p className="text-xs text-muted-foreground">Assistance dédiée sous 24h</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Badge économie */}
            {billingPeriod === 'yearly' && (
              <div className="mt-6 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-green-400" />
                  <span className="text-sm text-green-400 font-medium">
                    2 mois offerts avec l'abonnement annuel !
                  </span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Trust badges */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span className="text-sm">Paiement sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-400" />
              <span className="text-sm">Satisfait ou remboursé 30j</span>
            </div>
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-blue-400" />
              <span className="text-sm">+10 000 utilisateurs</span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Questions fréquentes
          </h2>
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Puis-je changer de plan à tout moment ?</h3>
              <p className="text-muted-foreground text-sm">
                Oui ! Vous pouvez passer au plan Premium quand vous voulez et annuler à tout moment. 
                Aucun engagement, aucune question posée.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Qu'est-ce qui rend l'IA Premium si spéciale ?</h3>
              <p className="text-muted-foreground text-sm">
                L'IA Premium utilise GPT-4 pour créer des parcours ultra-personnalisés, s'adapte à votre 
                progression en temps réel, et offre un coaching conversationnel pour vous motiver et vous débloquer.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Vais-je perdre mes données si je passe de Premium à Gratuit ?</h3>
              <p className="text-muted-foreground text-sm">
                Non ! Tous vos objectifs et progrès sont conservés. Vous gardez l'accès à vos 3 objectifs 
                les plus récents en plan gratuit.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}