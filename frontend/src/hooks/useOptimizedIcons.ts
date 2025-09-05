/**
 * Hook pour charger les icons de manière optimisée
 * Au lieu d'importer toutes les icônes, on les charge à la demande
 */
import { lazy, Suspense, ComponentType } from 'react'
import { LucideProps } from 'lucide-react'

// Cache pour les icônes déjà chargées
const iconCache: Map<string, ComponentType<LucideProps>> = new Map()

export function useOptimizedIcon(iconName: string): ComponentType<LucideProps> | null {
  // Vérifier le cache d'abord
  if (iconCache.has(iconName)) {
    return iconCache.get(iconName)!
  }

  // Charger l'icône dynamiquement
  try {
    const Icon = lazy(() => 
      import(`lucide-react`).then(module => ({ 
        default: module[iconName] 
      }))
    )
    
    // Mettre en cache
    iconCache.set(iconName, Icon as any)
    return Icon as any
  } catch {
    console.warn(`Icon ${iconName} not found`)
    return null
  }
}

// Export des icônes les plus utilisées pré-chargées
export { 
  Trophy,
  Star,
  Zap,
  Lock,
  CheckCircle2,
  Circle
} from 'lucide-react'