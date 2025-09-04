"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface StorageData {
  soundEnabled: boolean
  musicEnabled: boolean
  soundVolume: number
  theme: 'light' | 'dark' | 'auto'
  language: string
  notifications: boolean
  streakDays: number
  lastActiveDate: string | null
}

interface StorageContextValue {
  data: StorageData
  updateStorage: (key: keyof StorageData, value: any) => void
  clearStorage: () => void
  isHydrated: boolean
}

const defaultData: StorageData = {
  soundEnabled: true,
  musicEnabled: false,
  soundVolume: 0.7,
  theme: 'auto',
  language: 'fr',
  notifications: true,
  streakDays: 0,
  lastActiveDate: null
}

const StorageContext = createContext<StorageContextValue>({
  data: defaultData,
  updateStorage: () => {},
  clearStorage: () => {},
  isHydrated: false
})

export function StorageProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StorageData>(defaultData)
  const [isHydrated, setIsHydrated] = useState(false)

  // Charger toutes les données localStorage en une seule fois au montage
  useEffect(() => {
    if (typeof window === 'undefined') return

    const loadedData: StorageData = {
      soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
      musicEnabled: localStorage.getItem('musicEnabled') === 'true',
      soundVolume: parseFloat(localStorage.getItem('soundVolume') || '0.7'),
      theme: (localStorage.getItem('theme') as StorageData['theme']) || 'auto',
      language: localStorage.getItem('language') || 'fr',
      notifications: localStorage.getItem('notifications') !== 'false',
      streakDays: parseInt(localStorage.getItem('streakDays') || '0', 10),
      lastActiveDate: localStorage.getItem('lastActiveDate')
    }

    setData(loadedData)
    setIsHydrated(true)
  }, [])

  const updateStorage = (key: keyof StorageData, value: any) => {
    setData(prev => {
      const newData = { ...prev, [key]: value }
      
      // Sauvegarder dans localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, String(value))
      }
      
      return newData
    })
  }

  const clearStorage = () => {
    if (typeof window !== 'undefined') {
      // Effacer toutes les clés liées au storage centralisé
      Object.keys(defaultData).forEach(key => {
        localStorage.removeItem(key)
      })
    }
    setData(defaultData)
  }

  return (
    <StorageContext.Provider value={{ data, updateStorage, clearStorage, isHydrated }}>
      {children}
    </StorageContext.Provider>
  )
}

export function useStorage() {
  const context = useContext(StorageContext)
  if (!context) {
    throw new Error('useStorage must be used within StorageProvider')
  }
  return context
}