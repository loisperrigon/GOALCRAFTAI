import { Metadata } from "next"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import HeaderServer from "@/components/HeaderServer"
import Footer from "@/components/Footer"
import { getDictionary } from "@/lib/i18n/utils"
import type { Locale } from "@/lib/i18n/config"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return {
    title: dict.seo?.home?.title || dict.metadata?.title,
    description: dict.seo?.home?.description || dict.metadata?.description,
    keywords: ['objectifs', 'gamification', 'IA', 'GPT-4', 'coaching', 'développement personnel', 'motivation', 'productivité'],
    openGraph: {
      title: dict.seo?.home?.title || dict.metadata?.title,
      description: dict.seo?.home?.description || dict.metadata?.description,
      type: 'website',
      siteName: 'GoalCraftAI',
      images: [{
        url: '/og-home.png',
        width: 1200,
        height: 630,
        alt: 'GoalCraftAI - Your AI-powered goal achievement platform'
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.seo?.home?.title || dict.metadata?.title,
      description: dict.seo?.home?.description || dict.metadata?.description,
      images: ['/twitter-home.png'],
    },
    alternates: {
      languages: {
        'fr': '/fr',
        'en': '/en',
        'es': '/es',
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

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  // Schema.org JSON-LD depuis les traductions
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'GoalCraftAI',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    description: dict.seo?.home?.intro || dict.metadata?.description,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      description: dict.pricing?.free?.description || 'Free to start',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '50000',
      bestRating: '5',
    },
    featureList: dict.seo?.home?.features || [],
    screenshot: 'https://goalcraftai.com/screenshot.png',
    softwareVersion: '2.0',
    creator: {
      '@type': 'Organization',
      name: 'GoalCraftAI',
      url: 'https://goalcraftai.com',
    }
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Schema.org JSON-LD pour Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-blue-900/20" />
      
      {/* Animated particles effect */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full filter blur-[128px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/30 rounded-full filter blur-[128px] animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/20 rounded-full filter blur-[128px] animate-pulse animation-delay-4000" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <HeaderServer locale={locale} translations={dict.nav || { home: 'Accueil', pricing: 'Tarifs', login: 'Se connecter' }} />

        {/* Contenu SEO invisible mais indexable depuis les traductions */}
        <div className="sr-only">
          <h1>{dict.seo?.home?.h1}</h1>
          
          <section>
            <h2>{dict.home?.hero?.title}</h2>
            <p>{dict.seo?.home?.intro}</p>
          </section>

          <section>
            <h2>{dict.home?.features?.title}</h2>
            <ul>
              {dict.seo?.home?.features?.map((feature: string, index: number) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Statistiques</h2>
            <ul>
              <li>{dict.seo?.home?.stats?.users}</li>
              <li>{dict.seo?.home?.stats?.goals}</li>
              <li>{dict.seo?.home?.stats?.rating}</li>
              <li>{dict.seo?.home?.stats?.success}</li>
            </ul>
          </section>

          <section itemScope itemType="https://schema.org/FAQPage">
            <h2>FAQ</h2>
            {dict.seo?.home?.faq?.map((item: { question: string; answer: string }, index: number) => (
              <div key={index} itemProp="mainEntity" itemScope itemType="https://schema.org/Question">
                <h3 itemProp="name">{item.question}</h3>
                <div itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
                  <p itemProp="text">{item.answer}</p>
                </div>
              </div>
            ))}
          </section>

          <section>
            <h2>Témoignages</h2>
            <div itemScope itemType="https://schema.org/Review">
              <span itemProp="author">{dict.seo?.home?.testimonial?.author}</span>
              <div itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                <meta itemProp="ratingValue" content="5" />
                <meta itemProp="bestRating" content="5" />
              </div>
              <p itemProp="reviewBody">{dict.seo?.home?.testimonial?.text}</p>
            </div>
          </section>
        </div>

        {/* Hero Section */}
        <main className="container mx-auto px-4 pt-12 md:pt-20 pb-16 md:pb-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6 md:mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              <span className="text-sm text-purple-300">
                {dict.home?.hero?.badge || 'Powered by GPT-4'}
              </span>
            </div>

            {/* Main heading with gradient */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                {dict.home?.hero?.title?.split('\n')[0] || dict.home?.hero?.title}
              </span>
              <br />
              <span className="text-foreground">
                {dict.home?.hero?.title?.split('\n')[1] || ""}
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto">
              {dict.home?.hero?.subtitle}
            </p>

            {/* CTA Buttons - Server rendered */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a href={`/${locale}/objectives`}>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all"
                >
                  {dict.home?.hero?.cta?.primary || 'Commencer l\'aventure'}
                </Button>
              </a>
              <a href={`/${locale}/pricing`}>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="px-8 py-6 text-lg rounded-xl"
                >
                  {dict.home?.hero?.cta?.secondary || 'Voir les tarifs'}
                </Button>
              </a>
            </div>

            {/* Suggestions - Server rendered */}
            <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
              <span className="text-sm text-muted-foreground">
                {dict.home?.hero?.suggestions?.label || 'Essayez :'}
              </span>
              {(dict.home?.hero?.suggestions?.items || ['Perdre 10kg', 'Apprendre React', 'Lancer un podcast']).map((suggestion: string, index: number) => (
                <a
                  key={index}
                  href={`/${locale}/objectives`}
                  className="text-sm px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  {suggestion}
                </a>
              ))}
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto mb-12 md:mb-20">
              <Card className="bg-card/50 backdrop-blur border-purple-500/20 p-6 hover:border-purple-500/40 transition-all group">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{dict.home?.features?.ai?.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {dict.home?.features?.ai?.description}
                </p>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-blue-500/20 p-6 hover:border-blue-500/40 transition-all group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{dict.home?.features?.gamification?.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {dict.home?.features?.gamification?.description}
                </p>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-pink-500/20 p-6 hover:border-pink-500/40 transition-all group">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{dict.home?.features?.tracking?.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {dict.home?.features?.tracking?.description}
                </p>
              </Card>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto py-8 md:py-12 border-y border-border/50">
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  50K+
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {dict.home?.hero?.stats?.users || 'Active users'}
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
                  2M+
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {dict.home?.hero?.stats?.goals || 'Goals achieved'}
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  4.9/5
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {dict.home?.hero?.stats?.rating || 'Average rating'}
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  93%
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {dict.home?.hero?.stats?.success || 'Success rate'}
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  )
}