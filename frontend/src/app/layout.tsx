import { ReactNode } from 'react'

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  // Layout racine minimal - les vraies balises HTML/body sont dans [locale]/layout.tsx
  // Ce layout existe uniquement pour supporter not-found.tsx
  return children
}