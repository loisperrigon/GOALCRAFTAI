import { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/utils'
import type { Locale } from '@/lib/i18n/config'
import AuthClient from './AuthClient'
import dynamic from 'next/dynamic'
const HeaderClient = dynamic(() => import('@/components/HeaderClient'), { ssr: true })
import Footer from '@/components/Footer'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return {
    title: dict.auth?.title || 'Sign In - GoalCraftAI',
    description: dict.auth?.description || 'Sign in to start achieving your goals with AI-powered guidance',
    openGraph: {
      title: dict.auth?.title || 'Sign In - GoalCraftAI',
      description: dict.auth?.description || 'Transform your dreams into achievable goals',
      images: ['/og-auth.png'],
    },
  }
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeaderClient locale="fr" translations={{ home: 'Accueil', pricing: 'Tarifs', login: 'Se connecter' }} />
      
      {/* SEO Content */}
      <div className="sr-only">
        <h1>{dict.auth?.title}</h1>
        <p>{dict.auth?.description}</p>
        <h2>{dict.auth?.benefits?.title || 'Why GoalCraftAI?'}</h2>
        <ul>
          <li>{dict.auth?.benefits?.item1 || 'AI-powered goal planning'}</li>
          <li>{dict.auth?.benefits?.item2 || 'Gamified progress tracking'}</li>
          <li>{dict.auth?.benefits?.item3 || 'Personalized coaching'}</li>
        </ul>
      </div>

      {/* Interactive Client Component */}
      <AuthClient translations={dict.auth} locale={locale} />
      
      <Footer />
    </div>
  )
}