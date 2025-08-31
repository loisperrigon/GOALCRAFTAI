import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AppSettings {
  // Apparence
  theme: 'light' | 'dark' | 'system'
  accentColor: 'purple' | 'blue' | 'green' | 'orange' | 'pink'
  fontSize: 'small' | 'medium' | 'large'
  reducedMotion: boolean
  
  // Notifications
  notifications: {
    enabled: boolean
    dailyReminder: boolean
    reminderTime: string // "09:00"
    achievementAlerts: boolean
    weeklyReport: boolean
    soundOnNotification: boolean
  }
  
  // Sons (intégration avec le système existant)
  sound: {
    effectsEnabled: boolean
    musicEnabled: boolean
    effectsVolume: number // 0-1
    musicVolume: number // 0-1
  }
  
  // Langue et région
  locale: {
    language: 'fr' | 'en' | 'es'
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
    timeFormat: '12h' | '24h'
    currency: 'EUR' | 'USD' | 'GBP'
    timezone: string
  }
  
  // Confidentialité
  privacy: {
    shareProgress: boolean
    publicProfile: boolean
    allowAnalytics: boolean
    dataCollection: 'minimal' | 'standard' | 'full'
  }
  
  // Accessibilité
  accessibility: {
    screenReaderMode: boolean
    highContrast: boolean
    keyboardNavigation: boolean
    focusIndicator: boolean
  }
  
  // Expérience
  experience: {
    showTips: boolean
    showOnboarding: boolean
    autoSave: boolean
    autoSaveInterval: number // minutes
    confirmDelete: boolean
  }
}

interface SettingsState {
  settings: AppSettings
  
  // Actions globales
  updateSettings: (updates: Partial<AppSettings>) => void
  resetSettings: () => void
  
  // Actions spécifiques
  toggleTheme: () => void
  setTheme: (theme: AppSettings['theme']) => void
  setLanguage: (language: AppSettings['locale']['language']) => void
  toggleNotifications: () => void
  setSoundEnabled: (enabled: boolean) => void
  setMusicEnabled: (enabled: boolean) => void
  setSoundVolume: (volume: number) => void
  setMusicVolume: (volume: number) => void
  
  // Helpers
  exportSettings: () => string
  importSettings: (settingsJson: string) => boolean
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  accentColor: 'purple',
  fontSize: 'medium',
  reducedMotion: false,
  
  notifications: {
    enabled: true,
    dailyReminder: true,
    reminderTime: '09:00',
    achievementAlerts: true,
    weeklyReport: false,
    soundOnNotification: true
  },
  
  sound: {
    effectsEnabled: true,
    musicEnabled: false,
    effectsVolume: 0.7,
    musicVolume: 0.3
  },
  
  locale: {
    language: 'fr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'EUR',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  },
  
  privacy: {
    shareProgress: false,
    publicProfile: false,
    allowAnalytics: true,
    dataCollection: 'standard'
  },
  
  accessibility: {
    screenReaderMode: false,
    highContrast: false,
    keyboardNavigation: true,
    focusIndicator: true
  },
  
  experience: {
    showTips: true,
    showOnboarding: true,
    autoSave: true,
    autoSaveInterval: 5,
    confirmDelete: true
  }
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      updateSettings: (updates) => {
        set(state => ({
          settings: {
            ...state.settings,
            ...updates
          }
        }))
      },

      resetSettings: () => {
        set({ settings: defaultSettings })
      },

      toggleTheme: () => {
        set(state => {
          const themes: AppSettings['theme'][] = ['light', 'dark', 'system']
          const currentIndex = themes.indexOf(state.settings.theme)
          const nextIndex = (currentIndex + 1) % themes.length
          
          return {
            settings: {
              ...state.settings,
              theme: themes[nextIndex]
            }
          }
        })
      },

      setTheme: (theme) => {
        set(state => ({
          settings: {
            ...state.settings,
            theme
          }
        }))
      },

      setLanguage: (language) => {
        set(state => ({
          settings: {
            ...state.settings,
            locale: {
              ...state.settings.locale,
              language
            }
          }
        }))
      },

      toggleNotifications: () => {
        set(state => ({
          settings: {
            ...state.settings,
            notifications: {
              ...state.settings.notifications,
              enabled: !state.settings.notifications.enabled
            }
          }
        }))
      },

      setSoundEnabled: (enabled) => {
        set(state => ({
          settings: {
            ...state.settings,
            sound: {
              ...state.settings.sound,
              effectsEnabled: enabled
            }
          }
        }))
        
        // Synchroniser avec le système de sons existant
        if (typeof window !== 'undefined') {
          localStorage.setItem('soundEnabled', String(enabled))
        }
      },

      setMusicEnabled: (enabled) => {
        set(state => ({
          settings: {
            ...state.settings,
            sound: {
              ...state.settings.sound,
              musicEnabled: enabled
            }
          }
        }))
        
        // Synchroniser avec le système de sons existant
        if (typeof window !== 'undefined') {
          localStorage.setItem('musicEnabled', String(enabled))
        }
      },

      setSoundVolume: (volume) => {
        const clampedVolume = Math.max(0, Math.min(1, volume))
        
        set(state => ({
          settings: {
            ...state.settings,
            sound: {
              ...state.settings.sound,
              effectsVolume: clampedVolume
            }
          }
        }))
        
        // Synchroniser avec le système de sons existant
        if (typeof window !== 'undefined') {
          localStorage.setItem('soundVolume', String(clampedVolume))
        }
      },

      setMusicVolume: (volume) => {
        const clampedVolume = Math.max(0, Math.min(1, volume))
        
        set(state => ({
          settings: {
            ...state.settings,
            sound: {
              ...state.settings.sound,
              musicVolume: clampedVolume
            }
          }
        }))
      },

      exportSettings: () => {
        const { settings } = get()
        return JSON.stringify(settings, null, 2)
      },

      importSettings: (settingsJson) => {
        try {
          const importedSettings = JSON.parse(settingsJson)
          
          // Valider que c'est bien un objet de settings
          if (importedSettings && typeof importedSettings === 'object') {
            set({
              settings: {
                ...defaultSettings,
                ...importedSettings
              }
            })
            return true
          }
          return false
        } catch (error) {
          console.error('Erreur lors de l\'import des paramètres:', error)
          return false
        }
      }
    }),
    {
      name: 'app-settings',
      partialize: (state) => ({
        settings: state.settings
      })
    }
  )
)