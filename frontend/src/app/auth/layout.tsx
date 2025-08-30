import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous ou créez votre compte GoalCraftAI pour commencer à transformer vos objectifs en aventures épiques.',
  openGraph: {
    title: 'Connexion - GoalCraftAI',
    description: 'Rejoignez GoalCraftAI et commencez votre aventure gamifiée',
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}