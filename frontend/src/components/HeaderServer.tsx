import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Locale } from '@/lib/i18n/config'

interface HeaderServerProps {
  locale: Locale
  translations: {
    home?: string
    pricing?: string
    login?: string
    examples?: string
  }
}

export default function HeaderServer({ locale, translations }: HeaderServerProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">G</span>
          </div>
          <span className="font-bold text-xl hidden sm:inline">GoalCraftAI</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link 
            href={`/${locale}`}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            {translations.home || 'Accueil'}
          </Link>
          <Link 
            href={`/${locale}/pricing`}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            {translations.pricing || 'Tarifs'}
          </Link>
          <Link 
            href={`/${locale}/how-it-works`}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            {translations.examples || 'Exemples'}
          </Link>
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/auth`}>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              {translations.login || 'Se connecter'}
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  )
}