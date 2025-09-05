export const locales = ['fr', 'en', 'es'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'fr'

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español'
}

export const localeFlags: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  es: '🇪🇸'
}

// Vérifier si une locale est valide
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}