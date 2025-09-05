import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Mes Objectifs',
  description: 'Créez et gérez vos objectifs gamifiés avec l\'IA. Transformez vos rêves en parcours structurés.',
  robots: {
    index: false, // Page privée
    follow: false,
  },
}

export default async function ObjectivesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session) {
    redirect('/auth?callbackUrl=/objectives')
  }
  
  return children
}