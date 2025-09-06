"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Check, X, Sparkles, Zap, Crown } from "lucide-react"

interface PricingCardsProps {
  locale: string
  billingPeriod: 'monthly' | 'yearly'
}

export default function PricingCards({ locale, billingPeriod }: PricingCardsProps) {
  const prices = {
    monthly: { free: 0, pro: 19, premium: 39 },
    yearly: { free: 0, pro: 190, premium: 390 }
  }

  const plans = [
    {
      id: 'free',
      name: 'Gratuit',
      price: prices[billingPeriod].free,
      description: 'Parfait pour débuter',
      features: [
        { text: '3 objectifs par mois', included: true },
        { text: 'IA basique', included: true },
        { text: 'Communauté', included: true },
        { text: 'Sauvegarde cloud', included: false },
        { text: 'Badges premium', included: false },
        { text: 'Support prioritaire', included: false }
      ],
      cta: 'Commencer gratuitement',
      icon: <Sparkles className="w-5 h-5" />
    },
    {
      id: 'pro',
      name: 'Pro',
      price: prices[billingPeriod].pro,
      description: 'Le choix de la majorité',
      popular: true,
      features: [
        { text: 'Objectifs illimités', included: true },
        { text: 'IA avancée GPT-4', included: true },
        { text: 'Sauvegarde cloud', included: true },
        { text: 'Badges exclusifs', included: true },
        { text: 'Support prioritaire', included: true },
        { text: 'Analytics avancés', included: false }
      ],
      cta: 'Passer à Pro',
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: 'premium',
      name: 'Premium',
      price: prices[billingPeriod].premium,
      description: 'Pour les plus ambitieux',
      features: [
        { text: 'Tout du plan Pro', included: true },
        { text: 'Coach IA personnel', included: true },
        { text: 'Analytics avancés', included: true },
        { text: 'API access', included: true },
        { text: 'Support VIP 24/7', included: true },
        { text: 'Formation exclusive', included: true }
      ],
      cta: 'Devenir Premium',
      icon: <Crown className="w-5 h-5" />
    }
  ]

  return (
    <div className="grid gap-6 md:grid-cols-3 md:gap-4 lg:gap-6 max-w-6xl mx-auto">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="relative group"
        >
          {/* Badge Populaire */}
          {plan.popular && (
            <div className="absolute -top-3 inset-x-0 flex justify-center z-10">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                ⭐ POPULAIRE
              </span>
            </div>
          )}

          <div
            className={`
              h-full rounded-xl p-6 transition-all duration-200
              ${plan.popular 
                ? 'bg-gradient-to-b from-purple-900/10 to-transparent border-2 border-purple-500 shadow-xl md:scale-105' 
                : 'bg-card border border-border hover:border-purple-500/50 hover:shadow-lg'
              }
            `}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className={`
                inline-flex p-3 rounded-full mb-4
                ${plan.popular ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20' : 'bg-muted'}
              `}>
                {plan.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>

            {/* Prix */}
            <div className="text-center mb-6">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">
                  {plan.price}
                </span>
                <span className="text-xl font-semibold">€</span>
                <span className="text-muted-foreground">
                  /{billingPeriod === 'monthly' ? 'mois' : 'an'}
                </span>
              </div>
              
              {/* Économie */}
              {billingPeriod === 'yearly' && plan.id !== 'free' && (
                <div className="mt-2">
                  <span className="text-xs text-green-500 font-medium">
                    Économisez {Math.round((prices.monthly[plan.id as keyof typeof prices.monthly] * 12 - prices.yearly[plan.id as keyof typeof prices.yearly]) / (prices.monthly[plan.id as keyof typeof prices.monthly] * 12) * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  {feature.included ? (
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${feature.included ? '' : 'text-muted-foreground'}`}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Button
              className={`
                w-full font-medium
                ${plan.popular 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white' 
                  : ''
                }
              `}
              variant={plan.popular ? 'default' : 'outline'}
              asChild
            >
              <a href={`/${locale}/auth`}>
                {plan.cta}
              </a>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}