'use client'

import { useEffect } from 'react'
import { useSettingsStore } from '@/stores/settings-store'

export default function SettingsInitializer() {
  const { settings } = useSettingsStore()
  
  useEffect(() => {
    // Appliquer le thème au chargement
    const applyTheme = () => {
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else if (settings.theme === 'light') {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
      } else {
        // Mode système
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          document.documentElement.classList.add('dark')
          document.documentElement.classList.remove('light')
        } else {
          document.documentElement.classList.remove('dark')
          document.documentElement.classList.add('light')
        }
      }
    }
    
    // Appliquer la couleur d'accent
    document.documentElement.setAttribute('data-accent', settings.accentColor || 'purple')
    
    applyTheme()
    
    // Écouter les changements de préférence système
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme()
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [settings.theme, settings.accentColor])
  
  return null
}