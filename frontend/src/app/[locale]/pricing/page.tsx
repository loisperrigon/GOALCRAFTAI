import { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/utils'
import type { Locale } from '@/lib/i18n/config'
import PricingClient from './PricingClient'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return {
    title: dict.pricing?.title || 'Pricing',
    description: dict.pricing?.subtitle || 'Choose the plan that fits your needs',
    openGraph: {
      title: dict.pricing?.title || 'Pricing - GoalCraftAI',
      description: dict.pricing?.subtitle || 'Start free, grow at your own pace',
      images: ['/og-pricing.png'],
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
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* SEO Content */}
      <div className="sr-only">
        <h1>{dict.pricing?.title}</h1>
        <p>{dict.pricing?.subtitle}</p>
        <div>
          <h2>{dict.pricing?.free?.name}</h2>
          <p>{dict.pricing?.free?.description}</p>
          <ul>
            {dict.pricing?.free?.features?.map((feature: string, index: number) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2>{dict.pricing?.starter?.name}</h2>
          <p>{dict.pricing?.starter?.description}</p>
          <ul>
            {dict.pricing?.starter?.features?.map((feature: string, index: number) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2>{dict.pricing?.pro?.name}</h2>
          <p>{dict.pricing?.pro?.description}</p>
          <ul>
            {dict.pricing?.pro?.features?.map((feature: string, index: number) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Interactive Client Component */}
      <PricingClient translations={dict.pricing} locale={locale} />
      
      <Footer />
    </div>
  )
}