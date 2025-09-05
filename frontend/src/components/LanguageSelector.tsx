'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'
import { locales, localeNames, localeFlags, type Locale } from '@/lib/i18n/config'

// Fonction pour essayer d'utiliser useLocale
function useLocaleOptional() {
  try {
    const { useLocale } = require('@/lib/i18n/client')
    return useLocale()
  } catch {
    return 'fr' // Valeur par défaut si pas dans un contexte i18n
  }
}

export default function LanguageSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocaleOptional()

  const switchLocale = (newLocale: Locale) => {
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')
    router.push(newPath)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{localeNames[currentLocale as Locale]}</span>
          <span className="sm:hidden">{localeFlags[currentLocale as Locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLocale(locale)}
            className={currentLocale === locale ? 'bg-accent/50' : ''}
          >
            <span className="mr-2">{localeFlags[locale]}</span>
            {localeNames[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}