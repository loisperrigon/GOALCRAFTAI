import { Metadata } from 'next'
import ObjectivesClient from './ObjectivesClient'
import { getDictionary } from '@/lib/i18n/utils'
import type { Locale } from '@/lib/i18n/config'

export const metadata: Metadata = {
  title: 'Mes Objectifs',
  description: 'Créez et suivez vos objectifs gamifiés avec l\'IA',
}

export default async function ObjectivesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return <ObjectivesClient translations={dict.objectives || {}} locale={locale} />
}