"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Zap, Trophy, Star, Check } from "lucide-react"
import PricingTimer from "./PricingTimer"
import BillingToggle from "./BillingToggle"
import ActiveUsersCounter from "./ActiveUsersCounter"
import PricingCards from "./PricingCards"

interface PricingClientProps {
  locale: string
  translations: any
}

export default function PricingClientSimple({ locale, translations }: PricingClientProps) {
  const [billingPeriod, setBillingPeriod] = React.useState<'monthly' | 'yearly'>('yearly')
  
  return (
    <>
      {/* Bannière urgence avec timer */}
      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-b border-orange-500/20">
        <div className="container mx-auto px-4 py-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm font-medium text-orange-400">
              🔥 Offre limitée : -25% sur l'abonnement annuel
            </span>
            <PricingTimer />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Header Section */}
        <div className="text-center mb-12">
          <Badge className="inline-flex mb-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            <Sparkles className="w-3 h-3 mr-1" />
            {translations?.badge || 'Plans & Tarifs'}
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {translations?.title || 'Choisissez votre plan'}
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            {translations?.subtitle || 'Commencez gratuitement, évoluez à votre rythme'}
          </p>

          {/* Social Proof */}
          <div className="mb-6">
            <ActiveUsersCounter />
          </div>
          
          {/* Billing Toggle */}
          <div>
            <BillingToggle onPeriodChange={setBillingPeriod} />
          </div>
        </div>

        {/* Pricing Cards */}
        <PricingCards locale={locale} billingPeriod={billingPeriod} />

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto mt-12">
          <div className="text-center p-4">
            <Trophy className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-yellow-500" />
            <div className="font-bold text-xl md:text-2xl">4.9/5</div>
            <div className="text-xs md:text-sm text-muted-foreground">Note moyenne</div>
          </div>
          <div className="text-center p-4">
            <Zap className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-purple-500" />
            <div className="font-bold text-xl md:text-2xl">50K+</div>
            <div className="text-xs md:text-sm text-muted-foreground">Utilisateurs</div>
          </div>
          <div className="text-center p-4">
            <Star className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-blue-500" />
            <div className="font-bold text-xl md:text-2xl">2M+</div>
            <div className="text-xs md:text-sm text-muted-foreground">Objectifs créés</div>
          </div>
          <div className="text-center p-4">
            <Check className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-green-500" />
            <div className="font-bold text-xl md:text-2xl">93%</div>
            <div className="text-xs md:text-sm text-muted-foreground">Taux de succès</div>
          </div>
        </div>

        {/* FAQ Simple */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Questions fréquentes
          </h2>
          
          <div className="grid gap-6">
            <div className="p-6 rounded-lg bg-card/50 backdrop-blur border border-border">
              <h3 className="font-semibold mb-2">Puis-je annuler à tout moment ?</h3>
              <p className="text-muted-foreground">
                Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord.
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card/50 backdrop-blur border border-border">
              <h3 className="font-semibold mb-2">Y a-t-il une période d'essai ?</h3>
              <p className="text-muted-foreground">
                Le plan gratuit vous permet de tester les fonctionnalités de base sans limite de temps.
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card/50 backdrop-blur border border-border">
              <h3 className="font-semibold mb-2">Comment fonctionne l'IA GPT-4 ?</h3>
              <p className="text-muted-foreground">
                Notre IA analyse vos objectifs et crée automatiquement un parcours personnalisé avec des étapes progressives.
              </p>
            </div>
          </div>
        </div>

        {/* Garantie */}
        <div className="text-center mt-12 pb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full bg-green-500/10 border border-green-500/30">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            <span className="text-green-400 text-sm sm:text-base font-medium">
              Garantie satisfait ou remboursé 30 jours
            </span>
          </div>
        </div>
      </div>
    </>
  )
}