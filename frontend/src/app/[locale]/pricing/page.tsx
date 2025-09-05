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
    title: dict.seo?.pricing?.title || dict.metadata?.title,
    description: dict.seo?.pricing?.description || dict.metadata?.description,
    keywords: ['prix', 'tarifs', 'abonnement', 'premium', 'gratuit', 'coaching IA', 'GPT-4', 'gamification', 'objectifs'],
    openGraph: {
      title: dict.seo?.pricing?.title || dict.metadata?.title,
      description: dict.seo?.pricing?.description || dict.metadata?.description,
      images: [{
        url: '/og-pricing.png',
        width: 1200,
        height: 630,
        alt: 'GoalCraftAI Pricing'
      }],
      type: 'website',
      siteName: 'GoalCraftAI',
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.seo?.pricing?.title || dict.metadata?.title,
      description: dict.seo?.pricing?.description || dict.metadata?.description,
      images: ['/twitter-pricing.png'],
    },
    alternates: {
      languages: {
        'fr': '/fr/pricing',
        'en': '/en/pricing',
        'es': '/es/pricing',
      },
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
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

  // Données structurées JSON-LD pour Google depuis les traductions
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: dict.seo?.pricing?.h1 || dict.pricing?.title,
    description: dict.seo?.pricing?.intro || dict.metadata?.description,
    offers: [
      {
        '@type': 'Offer',
        name: dict.pricing?.free?.name || 'Free',
        price: '0',
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: `https://goalcraftai.com/${locale}/pricing`,
        description: dict.pricing?.free?.description,
      },
      {
        '@type': 'Offer',
        name: dict.pricing?.starter?.name || 'Starter',
        price: '9.99',
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: `https://goalcraftai.com/${locale}/pricing`,
        description: dict.pricing?.starter?.description,
        priceValidUntil: '2024-12-31',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '1247',
        }
      },
      {
        '@type': 'Offer',
        name: dict.pricing?.pro?.name || 'Pro',
        price: '19.99',
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: `https://goalcraftai.com/${locale}/pricing`,
        description: dict.pricing?.pro?.description,
      }
    ],
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Schema.org JSON-LD pour Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Header />
      
      {/* SEO Content - Tout le contenu important pour Google depuis les traductions */}
      <div className="sr-only">
        <h1>{dict.seo?.pricing?.h1 || dict.pricing?.title}</h1>
        <p>{dict.seo?.pricing?.intro || dict.pricing?.subtitle}</p>
        
        {/* Plan Gratuit avec prix */}
        <div itemScope itemType="https://schema.org/Product">
          <h2 itemProp="name">{dict.pricing?.free?.name}</h2>
          <p itemProp="description">{dict.pricing?.free?.description}</p>
          <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
            <meta itemProp="price" content="0" />
            <meta itemProp="priceCurrency" content="EUR" />
            <span itemProp="priceSpecification">{dict.pricing?.free?.price}</span>
          </div>
          <ul>
            {dict.pricing?.free?.features?.map((feature: string, index: number) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
        
        {/* Plan Starter avec prix */}
        <div itemScope itemType="https://schema.org/Product">
          <h2 itemProp="name">{dict.pricing?.starter?.name}</h2>
          <p itemProp="description">{dict.pricing?.starter?.description}</p>
          <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
            <meta itemProp="price" content="9.99" />
            <meta itemProp="priceCurrency" content="EUR" />
            <span itemProp="priceSpecification">{dict.pricing?.starter?.price}</span>
            <meta itemProp="availability" content="https://schema.org/InStock" />
          </div>
          <ul>
            {dict.pricing?.starter?.features?.map((feature: string, index: number) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
        
        {/* Plan Pro avec prix */}
        <div itemScope itemType="https://schema.org/Product">
          <h2 itemProp="name">{dict.pricing?.pro?.name}</h2>
          <p itemProp="description">{dict.pricing?.pro?.description}</p>
          <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
            <meta itemProp="price" content="19.99" />
            <meta itemProp="priceCurrency" content="EUR" />
            <span itemProp="priceSpecification">{dict.pricing?.pro?.price}</span>
            <meta itemProp="availability" content="https://schema.org/InStock" />
          </div>
          <ul>
            {dict.pricing?.pro?.features?.map((feature: string, index: number) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>

        {/* FAQ importante pour le SEO depuis les traductions */}
        <section itemScope itemType="https://schema.org/FAQPage">
          <h2>FAQ</h2>
          {dict.seo?.pricing?.faq?.map((item: { question: string; answer: string }, index: number) => (
            <div key={index} itemProp="mainEntity" itemScope itemType="https://schema.org/Question">
              <h3 itemProp="name">{item.question}</h3>
              <div itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
                <p itemProp="text">{item.answer}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Témoignages pour le SEO depuis les traductions */}
        <section>
          <h2>Témoignages</h2>
          <div itemScope itemType="https://schema.org/Review">
            <span itemProp="author">{dict.seo?.pricing?.testimonial?.author}</span>
            <div itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
              <meta itemProp="ratingValue" content="5" />
              <meta itemProp="bestRating" content="5" />
            </div>
            <p itemProp="reviewBody">{dict.seo?.pricing?.testimonial?.text}</p>
          </div>
        </section>
      </div>

      {/* Interactive Client Component */}
      <PricingClient translations={dict.pricing} locale={locale} />
      
      <Footer />
    </div>
  )
}