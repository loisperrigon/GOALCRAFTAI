import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tableau de bord',
  description: 'Suivez votre progression, gérez vos objectifs et débloquez des achievements sur GoalCraftAI.',
  robots: {
    index: false, // Page privée, pas d'indexation
    follow: false,
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}