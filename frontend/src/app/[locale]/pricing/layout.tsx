import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tarifs',
  description: 'Découvrez nos offres GoalCraftAI. Plan gratuit ou Premium avec IA illimitée, coaching personnalisé et objectifs illimités. À partir de 7,49€/mois.',
  keywords: ['prix', 'tarifs', 'abonnement', 'premium', 'gratuit', 'coaching IA', 'GPT-4'],
  openGraph: {
    title: 'Tarifs - GoalCraftAI', 
    description: 'Plan gratuit ou Premium à partir de 7,49€/mois. IA illimitée et coaching personnalisé.',
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}