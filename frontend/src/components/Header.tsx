"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import SoundControl from "@/components/SoundControl"
import LanguageSelector from "@/components/LanguageSelector"

// Fonction pour essayer d'utiliser les hooks i18n
function useI18n() {
  try {
    const { useLocale, useTranslations } = require('@/lib/i18n/client')
    const locale = useLocale()
    const t = useTranslations('nav')
    return { locale, t, hasI18n: true }
  } catch {
    // Pas dans un contexte i18n, retourner des valeurs par défaut
    return { 
      locale: 'fr', 
      t: {
        home: 'Accueil',
        pricing: 'Tarifs',
        login: 'Se connecter'
      },
      hasI18n: false 
    }
  }
}

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { locale, t, hasI18n } = useI18n()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Simulation : vérifier si l'utilisateur est connecté
  const isAuthenticated = pathname.includes('/objectives') || pathname.includes('/dashboard') || pathname.includes('/profile')

  return (
    <>
      <header className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 relative z-20">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => router.push(hasI18n ? `/${locale}` : '/')}
        >
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg md:text-xl">G</span>
          </div>
          <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            GoalCraftAI
          </span>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 hover:bg-purple-500/10 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
        
      <nav className="hidden md:flex items-center gap-8">
        <a 
          href={hasI18n ? `/${locale}/` : '/'}
          className={`relative transition-colors ${
            pathname === '/' || pathname === `/${locale}` 
              ? 'text-foreground font-medium' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t?.home || 'Accueil'}
          {(pathname === '/' || pathname === `/${locale}`) && (
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500" />
          )}
        </a>
        <a 
          href={hasI18n ? `/${locale}/examples` : '#'}
          className={`relative transition-colors ${
            pathname.includes('/examples') 
              ? 'text-foreground font-medium' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t?.nav?.examples || 'Examples'}
          {pathname.includes('/examples') && (
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500" />
          )}
        </a>
        <a 
          href={hasI18n ? `/${locale}/pricing` : '/pricing'}
          className={`relative transition-colors ${
            pathname.includes('/pricing') 
              ? 'text-foreground font-medium' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t?.pricing || 'Tarifs'}
          {pathname.includes('/pricing') && (
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500" />
          )}
        </a>
        
        {/* Sound Controls & Language Selector */}
        <div className="flex items-center gap-2">
          <SoundControl />
          {hasI18n && <LanguageSelector />}
        </div>
        
        {pathname.includes('/objectives') ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">En ligne</span>
          </div>
        ) : pathname.includes('/auth') ? (
          <Button 
            variant="outline" 
            className="border-purple-500/50 bg-purple-500/10"
          >
            {t?.login || 'Connexion'}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="border-purple-500/50 hover:bg-purple-500/10"
            onClick={() => router.push(hasI18n ? `/${locale}/auth` : '/auth')}
          >
            {t?.login || 'Se connecter'}
          </Button>
        )}
        </nav>
      </header>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu */}
      <div className={`
        fixed top-0 right-0 h-full w-[280px] bg-background border-l border-border z-40 
        transform transition-transform duration-300 md:hidden
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-semibold">Menu</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-2">
          <a 
            href={hasI18n ? `/${locale}/` : '/'}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`px-4 py-3 rounded-lg transition-colors ${
              pathname === '/' || pathname === `/${locale}`
                ? 'bg-purple-500/10 text-foreground font-medium'
                : 'hover:bg-purple-500/10 text-muted-foreground'
            }`}
          >
            {t?.home || 'Accueil'}
          </a>
          <a 
            href={hasI18n ? `/${locale}/examples` : '#'}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`px-4 py-3 rounded-lg transition-colors ${
              pathname.includes('/examples')
                ? 'bg-purple-500/10 text-foreground font-medium'
                : 'hover:bg-purple-500/10 text-muted-foreground'
            }`}
          >
            {t?.nav?.examples || 'Examples'}
          </a>
          <a 
            href={hasI18n ? `/${locale}/pricing` : '/pricing'}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`px-4 py-3 rounded-lg transition-colors ${
              pathname.includes('/pricing')
                ? 'bg-purple-500/10 text-foreground font-medium'
                : 'hover:bg-purple-500/10 text-muted-foreground'
            }`}
          >
            {t?.pricing || 'Tarifs'}
          </a>
          
          <div className="pt-4 mt-4 border-t border-border">
            {/* Language Selector for mobile */}
            {hasI18n && (
              <div className="mb-4">
                <LanguageSelector />
              </div>
            )}
            {pathname.includes('/objectives') ? (
              <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">En ligne</span>
              </div>
            ) : (
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                onClick={() => {
                  router.push(hasI18n ? `/${locale}/auth` : '/auth')
                  setIsMobileMenuOpen(false)
                }}
              >
                {pathname.includes('/auth') ? (t?.login || 'Connexion') : (t?.login || 'Se connecter')}
              </Button>
            )}
          </div>
        </nav>
      </div>
    </>
  )
}