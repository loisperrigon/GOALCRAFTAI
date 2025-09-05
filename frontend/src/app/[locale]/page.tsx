import { Card } from "@/components/ui/card"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import HomeClient from "@/components/HomeClient"
import { getDictionary } from "@/lib/i18n/utils"
import type { Locale } from "@/lib/i18n/config"

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-blue-900/20" />
      
      {/* Animated particles effect */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full filter blur-[128px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/30 rounded-full filter blur-[128px] animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/20 rounded-full filter blur-[128px] animate-pulse animation-delay-4000" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />

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
                {locale === 'fr' ? 'Propulsé par GPT-4' : 
                 locale === 'es' ? 'Impulsado por GPT-4' : 
                 'Powered by GPT-4'}
              </span>
            </div>

            {/* Main heading with gradient */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                {dict.home?.hero?.title?.split('\n')[0] || "Transform your goals"}
              </span>
              <br />
              <span className="text-foreground">
                {dict.home?.hero?.title?.split('\n')[1] || "into an epic adventure"}
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto">
              {dict.home?.hero?.subtitle}
            </p>

            {/* Client Component for interactive parts */}
            <HomeClient locale={locale} translations={dict} />

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
                  {locale === 'fr' ? 'Utilisateurs actifs' : 
                   locale === 'es' ? 'Usuarios activos' : 
                   'Active users'}
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
                  2M+
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {locale === 'fr' ? 'Objectifs atteints' : 
                   locale === 'es' ? 'Objetivos alcanzados' : 
                   'Goals achieved'}
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  4.9/5
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {locale === 'fr' ? 'Note moyenne' : 
                   locale === 'es' ? 'Calificación promedio' : 
                   'Average rating'}
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  93%
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {locale === 'fr' ? 'Taux de réussite' : 
                   locale === 'es' ? 'Tasa de éxito' : 
                   'Success rate'}
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