"use client"

// Lazy loading wrapper pour le système de sons
let soundManagerInstance: any = null
let soundManagerLoading = false
let soundManagerPromise: Promise<any> | null = null

interface SoundManager {
  playClick: () => void
  playComplete: () => void
  playLevelUp: () => void
  playXpGain: () => void
  playUnlock: () => void
  playNotification: () => void
  playWhoosh: () => void
  setEnabled: (enabled: boolean) => void
  isEnabled: () => boolean
  setMusicEnabled: (enabled: boolean) => void
  isMusicEnabled: () => boolean
  setVolume: (volume: number) => void
  getVolume: () => number
}

// Créer un manager de sons factice qui charge le vrai de manière lazy
class LazySoundManager implements SoundManager {
  private realManager: SoundManager | null = null
  
  private async loadRealManager() {
    if (this.realManager) return this.realManager
    
    if (!soundManagerLoading) {
      soundManagerLoading = true
      soundManagerPromise = import('./real-sounds').then(module => {
        soundManagerInstance = module.getRealSoundManager()
        this.realManager = soundManagerInstance
        return soundManagerInstance
      })
    }
    
    if (soundManagerPromise) {
      await soundManagerPromise
      this.realManager = soundManagerInstance
    }
    
    return this.realManager
  }
  
  // Méthodes qui chargent le vrai manager si nécessaire
  playClick() {
    if (this.realManager) {
      this.realManager.playClick()
    } else if (this.isEnabled()) {
      // Charger uniquement si les sons sont activés
      this.loadRealManager().then(m => m?.playClick())
    }
  }
  
  playComplete() {
    if (this.realManager) {
      this.realManager.playComplete()
    } else if (this.isEnabled()) {
      this.loadRealManager().then(m => m?.playComplete())
    }
  }
  
  playLevelUp() {
    if (this.realManager) {
      this.realManager.playLevelUp()
    } else if (this.isEnabled()) {
      this.loadRealManager().then(m => m?.playLevelUp())
    }
  }
  
  playXpGain() {
    if (this.realManager) {
      this.realManager.playXpGain()
    } else if (this.isEnabled()) {
      this.loadRealManager().then(m => m?.playXpGain())
    }
  }
  
  playUnlock() {
    if (this.realManager) {
      this.realManager.playUnlock()
    } else if (this.isEnabled()) {
      this.loadRealManager().then(m => m?.playUnlock())
    }
  }
  
  playNotification() {
    if (this.realManager) {
      this.realManager.playNotification()
    } else if (this.isEnabled()) {
      this.loadRealManager().then(m => m?.playNotification())
    }
  }
  
  playWhoosh() {
    if (this.realManager) {
      this.realManager.playWhoosh()
    } else if (this.isEnabled()) {
      this.loadRealManager().then(m => m?.playWhoosh())
    }
  }
  
  setEnabled(enabled: boolean) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundEnabled', String(enabled))
    }
    if (this.realManager) {
      this.realManager.setEnabled(enabled)
    } else if (enabled) {
      // Si on active les sons, charger le manager
      this.loadRealManager().then(m => m?.setEnabled(enabled))
    }
  }
  
  isEnabled(): boolean {
    if (this.realManager) {
      return this.realManager.isEnabled()
    }
    // Lire directement depuis localStorage pour éviter les dépendances circulaires
    return typeof window !== 'undefined' 
      ? localStorage.getItem('soundEnabled') !== 'false' 
      : true
  }
  
  setMusicEnabled(enabled: boolean) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('musicEnabled', String(enabled))
    }
    if (this.realManager) {
      this.realManager.setMusicEnabled(enabled)
    } else if (enabled) {
      // Si on active la musique, charger le manager
      this.loadRealManager().then(m => m?.setMusicEnabled(enabled))
    }
  }
  
  isMusicEnabled(): boolean {
    if (this.realManager) {
      return this.realManager.isMusicEnabled()
    }
    // Lire directement depuis localStorage pour éviter les dépendances circulaires
    return typeof window !== 'undefined' 
      ? localStorage.getItem('musicEnabled') === 'true' 
      : false
  }
  
  setVolume(volume: number) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundVolume', String(volume))
    }
    if (this.realManager) {
      this.realManager.setVolume(volume)
    }
  }
  
  getVolume(): number {
    if (this.realManager) {
      return this.realManager.getVolume()
    }
    // Lire directement depuis localStorage pour éviter les dépendances circulaires
    return typeof window !== 'undefined' 
      ? parseFloat(localStorage.getItem('soundVolume') || '0.7') 
      : 0.7
  }
}

// Instance singleton lazy
let lazyInstance: LazySoundManager | null = null

export function getLazySoundManager() {
  if (!lazyInstance) {
    lazyInstance = new LazySoundManager()
  }
  return lazyInstance
}