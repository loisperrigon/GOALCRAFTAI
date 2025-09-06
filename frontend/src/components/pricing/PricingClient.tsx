"use client"

import React from "react"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Sparkles, Zap, Trophy, Crown, Star, ArrowRight, Rocket, ChevronDown } from "lucide-react"
import PricingTimer from "./PricingTimer"
import BillingToggle from "./BillingToggle"
import ActiveUsersCounter from "./ActiveUsersCounter"

const AnimatedBackground = dynamic(
  () => import("@/components/home/AnimatedBackground"),
  { ssr: false }
)

interface PricingClientProps {
  locale: string
  translations: any
}

function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)
  
  const faqs = [
    {
      question: "Puis-je annuler à tout moment ?",
      answer: "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. L'annulation prend effet à la fin de votre période de facturation actuelle."
    },
    {
      question: "Y a-t-il une période d'essai ?",
      answer: "Le plan gratuit vous permet de tester les fonctionnalités de base sans limite de temps. Vous pouvez créer jusqu'à 3 objectifs par mois et découvrir notre IA."
    },
    {
      question: "Comment fonctionne l'IA GPT-4 ?",
      answer: "Notre IA analyse vos objectifs et crée automatiquement un parcours personnalisé avec des étapes progressives. Elle s'adapte à votre rythme et vos préférences."
    },
    {
      question: "Puis-je changer de plan ?",
      answer: "Bien sûr ! Vous pouvez passer à un plan supérieur ou inférieur à tout moment. Le changement est proratisé selon votre utilisation."
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Absolument. Nous utilisons un chiffrement AES-256 pour toutes vos données. Vos informations ne sont jamais partagées avec des tiers."
    }
  ]

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <Card 
          key={index} 
          className="p-6 cursor-pointer hover:border-purple-500/50 transition-all"
          onClick={() => setOpenIndex(openIndex === index ? null : index)}
        >
          <div className="flex items-start justify-between">
            <h3 className="font-semibold pr-4">{faq.question}</h3>
            <ChevronDown 
              className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </div>
          
          <div className={`
            overflow-hidden transition-all duration-300
            ${openIndex === index ? 'max-h-40 mt-4' : 'max-h-0'}
          `}>
            <p className="text-muted-foreground">
              {faq.answer}
            </p>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default function PricingClient({ locale, translations }: PricingClientProps) {
  const [billingPeriod, setBillingPeriod] = React.useState<'monthly' | 'yearly'>('yearly')
  const [hoveredPlan, setHoveredPlan] = React.useState<string | null>(null)
  
  const prices = {
    monthly: { free: 0, pro: 19, premium: 39 },
    yearly: { free: 0, pro: 190, premium: 390 }
  }

  const plans = [
    {
      id: 'free',
      name: 'Gratuit',
      price: prices[billingPeriod].free,
      description: 'Pour commencer',
      features: [
        { text: '3 objectifs par mois', included: true },
        { text: 'IA basique', included: true },
        { text: 'Pas de sauvegarde', included: false },
        { text: 'Pas de badges premium', included: false }
      ],
      cta: 'Commencer gratuitement',
      variant: 'outline' as const,
      icon: <Sparkles className="w-6 h-6" />
    },
    {
      id: 'pro',
      name: 'Pro',
      price: prices[billingPeriod].pro,
      description: 'Pour progresser',
      popular: true,
      features: [
        { text: 'Objectifs illimités', included: true },
        { text: 'IA avancée GPT-4', included: true },
        { text: 'Sauvegarde cloud', included: true },
        { text: 'Badges exclusifs', included: true },
        { text: 'Support prioritaire', included: true }
      ],
      cta: 'Choisir Pro',
      variant: 'default' as const,
      icon: <Rocket className="w-6 h-6" />
    },
    {
      id: 'premium',
      name: 'Premium',
      price: prices[billingPeriod].premium,
      description: 'Pour exceller',
      features: [
        { text: 'Tout du plan Pro', included: true },
        { text: 'Coach IA personnel', included: true },
        { text: 'Analyses avancées', included: true },
        { text: 'API access', included: true },
        { text: 'Support VIP 24/7', included: true }
      ],
      cta: 'Choisir Premium',
      variant: 'outline' as const,
      icon: <Crown className="w-6 h-6 text-yellow-500" />
    }
  ]

  return (
    <div className="relative">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <AnimatedBackground />
      </div>

      {/* Bannière urgence avec timer */}
      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-y border-orange-500/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500 blur-xl opacity-50 animate-pulse"></div>
                <span className="relative text-sm font-medium text-orange-400">
                  🔥 Offre limitée : -25% sur l'abonnement annuel
                </span>
              </div>
            </div>
            <PricingTimer />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Header Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white animate-pulse">
            <Sparkles className="w-3 h-3 mr-1" />
            {translations?.badge || 'Plans & Tarifs'}
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
              {translations?.title || 'Choisissez votre plan'}
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {translations?.subtitle || 'Commencez gratuitement, évoluez à votre rythme'}
          </p>

          {/* Social Proof avec compteur dynamique */}
          <div className="mb-8">
            <ActiveUsersCounter />
          </div>
          
          {/* Billing Toggle */}
          <div className="mb-8">
            <BillingToggle onPeriodChange={setBillingPeriod} />
          </div>
        </div>

        {/* Pricing Cards avec animations */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className="relative"
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg">
                    <Star className="w-3 h-3 mr-1" />
                    Populaire
                  </Badge>
                </div>
              )}
              
              <Card className={`
                relative p-8 h-full transition-all duration-300 overflow-hidden
                ${plan.popular 
                  ? 'border-2 border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.3)] scale-105 bg-gradient-to-b from-purple-950/50 via-background to-background' 
                  : 'border border-white/10 hover:border-purple-500/50 bg-gradient-to-b from-white/5 to-background'
                }
                ${hoveredPlan === plan.id ? 'transform -translate-y-2 shadow-[0_20px_40px_rgba(168,85,247,0.2)]' : ''}
                backdrop-blur-sm
              `}>
                {/* Glow effect */}
                {plan.popular && (
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500 rounded-full filter blur-[100px]" />
                  </div>
                )}
                
                <div className="relative z-10">
                <div className="text-center mb-6">
                  <div className="mb-4 inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 shadow-lg">
                    <div className="text-white">
                      {plan.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                    {plan.name}
                  </h3>
                  
                  <div className="mb-2">
                    <span className="text-5xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      €
                    </span>
                    <span className="text-lg font-normal text-muted-foreground ml-1">
                      /{billingPeriod === 'monthly' ? 'mois' : 'an'}
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                  
                  {billingPeriod === 'yearly' && plan.id !== 'free' && (
                    <Badge className="mt-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30 animate-pulse">
                      💰 Économisez {Math.round((prices.monthly[plan.id as keyof typeof prices.monthly] * 12 - prices.yearly[plan.id as keyof typeof prices.yearly]) / (prices.monthly[plan.id as keyof typeof prices.monthly] * 12) * 100)}%
                    </Badge>
                  )}
                </div>
                
                <ul className="space-y-3 mb-8 py-6 border-y border-white/10">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 group">
                      <div className={`
                        p-1 rounded-full flex-shrink-0 mt-0.5
                        ${feature.included 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/10 text-red-400/50'
                        }
                      `}>
                        {feature.included ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                      </div>
                      <span className={`
                        text-sm
                        ${feature.included 
                          ? 'text-white/90 group-hover:text-white transition-colors' 
                          : 'text-muted-foreground/60 line-through'
                        }
                      `}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <a href={`/${locale}/auth`} className="block">
                  <Button 
                    className={`
                      w-full group transition-all font-semibold relative overflow-hidden
                      ${plan.popular 
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]' 
                        : plan.id === 'premium'
                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border-yellow-500/50 text-yellow-400'
                        : 'bg-white/5 hover:bg-white/10 border-white/20 text-white'
                      }
                    `}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    {plan.popular && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </Button>
                </a>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Trust Badges animés */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16">
          {[
            { icon: Trophy, value: '4.9/5', label: 'Note moyenne', color: 'text-yellow-500' },
            { icon: Zap, value: '50K+', label: 'Utilisateurs', color: 'text-purple-500' },
            { icon: Star, value: '2M+', label: 'Objectifs créés', color: 'text-blue-500' },
            { icon: Check, value: '93%', label: 'Taux de succès', color: 'text-green-500' }
          ].map((stat, index) => (
            <div 
              key={index} 
              className="text-center group hover:scale-105 transition-transform"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color} group-hover:animate-bounce`} />
              <div className="font-bold text-2xl">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Questions fréquentes
            </span>
          </h2>
          
          <FAQSection />
        </div>

        {/* Garantie */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-500/10 border border-green-500/30">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-green-400 font-medium">
              Garantie satisfait ou remboursé 30 jours
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}