import { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/utils'
import type { Locale } from '@/lib/i18n/config'
import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Sparkles, Zap, Trophy, Crown, Star } from 'lucide-react'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return {
    title: dict.seo?.pricing?.title || 'Tarifs - GoalCraftAI',
    description: dict.seo?.pricing?.description || 'Découvrez nos plans gratuit et premium',
    keywords: ['prix', 'tarifs', 'abonnement', 'premium', 'gratuit', 'coaching IA', 'GPT-4'],
    openGraph: {
      title: dict.seo?.pricing?.title || 'Tarifs - GoalCraftAI',
      description: dict.seo?.pricing?.description,
      images: [{ url: '/og-pricing.png', width: 1200, height: 630 }],
      type: 'website',
    },
  }
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  // Prix fixes côté serveur
  const prices = {
    monthly: { free: 0, pro: 19, premium: 39 },
    yearly: { free: 0, pro: 190, premium: 390 }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'GoalCraftAI Premium',
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'EUR',
              lowPrice: '0',
              highPrice: '39',
              offerCount: '3'
            }
          })
        }}
      />
      
      <div className="min-h-screen bg-background">
        <HeaderServer locale={locale} translations={dict.nav || {}} />
      
        <main className="container mx-auto px-4 py-16 md:py-24">
          {/* Header Section */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              {dict.pricing?.badge || 'Plans & Tarifs'}
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {dict.pricing?.title || 'Choisissez votre plan'}
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {dict.pricing?.subtitle || 'Commencez gratuitement, évoluez à votre rythme'}
            </p>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <div className="flex -space-x-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 border-2 border-background" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                +1000 utilisateurs actifs
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <Card className="p-8 border-2 hover:border-purple-500/50 transition-all">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Gratuit</h3>
                <div className="text-4xl font-bold mb-2">0€</div>
                <p className="text-muted-foreground">Pour commencer</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>3 objectifs par mois</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>IA basique</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Pas de sauvegarde</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Pas de badges premium</span>
                </li>
              </ul>
              
              <a href={`/${locale}/auth`} className="block">
                <Button className="w-full" variant="outline">
                  Commencer gratuitement
                </Button>
              </a>
            </Card>

            {/* Pro Plan */}
            <Card className="p-8 border-2 border-purple-500 relative transform scale-105 shadow-xl">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <Star className="w-3 h-3 mr-1" />
                Populaire
              </Badge>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="text-4xl font-bold mb-2">
                  19€
                  <span className="text-lg font-normal text-muted-foreground">/mois</span>
                </div>
                <p className="text-muted-foreground">Pour progresser</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Objectifs illimités</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>IA avancée GPT-4</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Sauvegarde cloud</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Badges exclusifs</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Support prioritaire</span>
                </li>
              </ul>
              
              <a href={`/${locale}/auth`} className="block">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
                  Choisir Pro
                </Button>
              </a>
            </Card>

            {/* Premium Plan */}
            <Card className="p-8 border-2 hover:border-purple-500/50 transition-all">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                  Premium <Crown className="w-5 h-5 text-yellow-500" />
                </h3>
                <div className="text-4xl font-bold mb-2">
                  39€
                  <span className="text-lg font-normal text-muted-foreground">/mois</span>
                </div>
                <p className="text-muted-foreground">Pour exceller</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Tout du plan Pro</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Coach IA personnel</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Analyses avancées</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>API access</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Support VIP 24/7</span>
                </li>
              </ul>
              
              <a href={`/${locale}/auth`} className="block">
                <Button className="w-full" variant="outline">
                  Choisir Premium
                </Button>
              </a>
            </Card>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16">
            <div className="text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <div className="font-bold">4.9/5</div>
              <div className="text-sm text-muted-foreground">Note moyenne</div>
            </div>
            <div className="text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <div className="font-bold">50K+</div>
              <div className="text-sm text-muted-foreground">Utilisateurs</div>
            </div>
            <div className="text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="font-bold">2M+</div>
              <div className="text-sm text-muted-foreground">Objectifs créés</div>
            </div>
            <div className="text-center">
              <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="font-bold">93%</div>
              <div className="text-sm text-muted-foreground">Taux de succès</div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mt-20">
            <h2 className="text-3xl font-bold text-center mb-12">Questions fréquentes</h2>
            
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Puis-je annuler à tout moment ?</h3>
                <p className="text-muted-foreground">
                  Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord.
                </p>
              </Card>
              
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Y a-t-il une période d'essai ?</h3>
                <p className="text-muted-foreground">
                  Le plan gratuit vous permet de tester les fonctionnalités de base sans limite de temps.
                </p>
              </Card>
              
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Comment fonctionne l'IA GPT-4 ?</h3>
                <p className="text-muted-foreground">
                  Notre IA analyse vos objectifs et crée automatiquement un parcours personnalisé avec des étapes progressives.
                </p>
              </Card>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  )
}