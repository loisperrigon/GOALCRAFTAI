// Lazy-loaded components for better performance
import dynamic from 'next/dynamic'
import { Loader } from '@/components/ui/loader'

// Modal Components - Lazy loaded since they're not immediately visible
export const AuthModal = dynamic(() => import('@/components/AuthModal'), {
  loading: () => <Loader size="sm" />,
  ssr: false
})

export const ObjectiveDetailModal = dynamic(() => import('@/components/ObjectiveDetailModal'), {
  loading: () => <Loader size="sm" />,
  ssr: false
})

export const DeleteAccountModal = dynamic(() => import('@/components/DeleteAccountModal'), {
  loading: () => <Loader size="sm" />,
  ssr: false
})

export const PricingModal = dynamic(() => import('@/components/PricingModal'), {
  loading: () => <Loader size="sm" />,
  ssr: false
})

// Animation Components - Heavy libraries
export const Confetti = dynamic(() => import('@/components/Confetti'), {
  ssr: false
})

export const SimpleStreakNotification = dynamic(() => import('@/components/SimpleStreakNotification'), {
  ssr: false
})

// Heavy UI Components
export const GenerationProgress = dynamic(() => import('@/components/GenerationProgress'), {
  loading: () => <Loader size="sm" text="Chargement..." />,
  ssr: false
})

// For components that are always visible, export them normally
export { default as HeaderClient } from '@/components/HeaderClient'
export { default as Footer } from '@/components/Footer'
export { default as AuthLayout } from '@/components/AuthLayout'