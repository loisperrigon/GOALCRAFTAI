import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mon Profil',
  description: 'Gérez votre profil GoalCraftAI, vos achievements et vos paramètres personnels.',
  robots: {
    index: false, // Page privée
    follow: false,
  },
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}