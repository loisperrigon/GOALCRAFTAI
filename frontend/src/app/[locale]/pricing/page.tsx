import { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/utils'
import type { Locale } from '@/lib/i18n/config'
import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import PricingClientSimple from '@/components/pricing/PricingClientSimple'

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
      
      <div className="min-h-screen bg-background flex flex-col">
        <HeaderServer locale={locale} translations={dict.nav || {}} />
        
        <main className="flex-1">
          {/* Client component avec toutes les interactions */}
          <PricingClientSimple locale={locale} translations={dict.pricing} />
        </main>
        
        <Footer />
      </div>
    </>
  )
}