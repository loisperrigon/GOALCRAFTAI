import { usePathname } from 'next/navigation'
import { locales } from './config'

/**
 * Extrait la locale du pathname actuel
 */
export function useCurrentLocale() {
  const pathname = usePathname()
  
  // Extraire la locale du pathname (ex: /fr/objectives -> fr)
  const segments = pathname.split('/')
  const potentialLocale = segments[1]
  
  // Vérifier si c'est une locale valide
  if (locales.includes(potentialLocale as any)) {
    return potentialLocale
  }
  
  // Fallback sur 'fr' si pas de locale trouvée
  return 'fr'
}