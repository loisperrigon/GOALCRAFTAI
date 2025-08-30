import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mes Objectifs',
  description: 'Créez et gérez vos objectifs gamifiés avec l\'IA. Transformez vos rêves en parcours structurés.',
  robots: {
    index: false, // Page privée
    follow: false,
  },
}

export default function ObjectivesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}