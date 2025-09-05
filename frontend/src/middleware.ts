import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { defaultLocale, locales, isValidLocale } from '@/lib/i18n/config'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Vérifier si la route commence par une locale valide
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    return NextResponse.next()
  }

  // Détecter la langue préférée du navigateur
  const acceptLanguage = request.headers.get('accept-language') || ''
  const detectedLocale = detectLocale(acceptLanguage)
  
  // Rediriger vers la version avec locale
  const newUrl = new URL(`/${detectedLocale}${pathname}`, request.url)
  return NextResponse.redirect(newUrl)
}

function detectLocale(acceptLanguage: string): string {
  // Parser l'header Accept-Language
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, priority = '1'] = lang.trim().split(';q=')
      return {
        code: code.split('-')[0], // Prendre seulement le code de langue (fr au lieu de fr-FR)
        priority: parseFloat(priority)
      }
    })
    .sort((a, b) => b.priority - a.priority)

  // Chercher une correspondance avec nos locales supportées
  for (const lang of languages) {
    if (isValidLocale(lang.code)) {
      return lang.code
    }
  }

  return defaultLocale
}

export const config = {
  matcher: [
    // Ignorer les fichiers statiques et les routes API
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}