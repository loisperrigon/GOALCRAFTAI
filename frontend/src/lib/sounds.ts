import { Howl, Howler } from 'howler'

type SoundName = 'click' | 'complete' | 'levelUp' | 'xpGain' | 'unlock' | 'notification' | 'whoosh'

class SoundManager {
  private sounds: Map<SoundName, Howl>
  private enabled: boolean
  private volume: number
  private backgroundMusic: Howl | null = null
  private musicEnabled: boolean

  constructor() {
    this.sounds = new Map()
    this.enabled = typeof window !== 'undefined' ? localStorage.getItem('soundEnabled') !== 'false' : true
    this.musicEnabled = typeof window !== 'undefined' ? localStorage.getItem('musicEnabled') === 'true' : false
    this.volume = typeof window !== 'undefined' ? parseFloat(localStorage.getItem('soundVolume') || '0.7') : 0.7
    
    // Set global volume
    Howler.volume(this.volume)
    
    // Load sounds on client side only
    if (typeof window !== 'undefined') {
      this.loadSounds()
    }
  }

  private loadSounds() {
    // Utilisation de l'Audio Context pour générer des sons temporaires
    if (typeof window !== 'undefined' && window.AudioContext) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Fonction pour créer un beep simple
      const createBeep = (frequency: number, duration: number, volume: number) => {
        return () => {
          if (!this.enabled) return
          
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)
          
          oscillator.frequency.value = frequency
          oscillator.type = 'sine'
          
          gainNode.gain.setValueAtTime(volume * this.volume, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
          
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + duration)
        }
      }
      
      // Créer des sons différents avec des fréquences différentes
      this.sounds.set('click', {
        play: createBeep(800, 0.05, 0.3)
      } as any)
      
      this.sounds.set('complete', {
        play: createBeep(600, 0.2, 0.4)
      } as any)
      
      this.sounds.set('levelUp', {
        play: () => {
          if (!this.enabled) return
          // Jouer plusieurs notes pour un effet fanfare
          createBeep(400, 0.1, 0.4)()
          setTimeout(() => createBeep(500, 0.1, 0.4)(), 100)
          setTimeout(() => createBeep(600, 0.2, 0.5)(), 200)
        }
      } as any)
      
      this.sounds.set('xpGain', {
        play: createBeep(1000, 0.1, 0.2)
      } as any)
      
      this.sounds.set('unlock', {
        play: createBeep(700, 0.15, 0.3)
      } as any)
      
      this.sounds.set('notification', {
        play: createBeep(900, 0.1, 0.3)
      } as any)
      
      this.sounds.set('whoosh', {
        play: createBeep(300, 0.1, 0.2)
      } as any)
      
      return
    }
    
    // Fallback avec des sons vides si AudioContext n'est pas disponible
    const emptySoundConfigs: Record<SoundName, { src: string, volume?: number }> = {
      click: { 
        src: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
        volume: 0.5 
      },
      complete: { 
        src: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
        volume: 0.6 
      },
      levelUp: { 
        src: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
        volume: 0.8 
      },
      xpGain: { 
        src: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
        volume: 0.4 
      },
      unlock: { 
        src: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
        volume: 0.5 
      },
      notification: { 
        src: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
        volume: 0.6 
      },
      whoosh: { 
        src: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
        volume: 0.3 
      }
    }

    // Load each sound
    Object.entries(emptySoundConfigs).forEach(([key, config]) => {
      this.sounds.set(key as SoundName, new Howl({
        src: [config.src],
        volume: config.volume || 0.5,
        preload: true,
        html5: true
      }))
    })
  }

  play(soundName: SoundName) {
    if (!this.enabled || typeof window === 'undefined') return
    
    const sound = this.sounds.get(soundName)
    if (sound) {
      // Stop any previous instance of this sound
      sound.stop()
      // Play the sound
      sound.play()
    }
  }

  // Convenient methods for common sounds
  playClick() {
    this.play('click')
  }

  playComplete() {
    this.play('complete')
  }

  playLevelUp() {
    this.play('levelUp')
  }

  playXpGain() {
    this.play('xpGain')
  }

  playUnlock() {
    this.play('unlock')
  }

  playNotification() {
    this.play('notification')
  }

  playWhoosh() {
    this.play('whoosh')
  }

  // Settings management
  setEnabled(enabled: boolean) {
    this.enabled = enabled
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundEnabled', String(enabled))
    }
  }

  isEnabled() {
    return this.enabled
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
    Howler.volume(this.volume)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundVolume', String(this.volume))
    }
  }

  getVolume() {
    return this.volume
  }

  // Background music management
  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled
    if (typeof window !== 'undefined') {
      localStorage.setItem('musicEnabled', String(enabled))
    }

    if (enabled && !this.backgroundMusic) {
      this.loadBackgroundMusic()
    } else if (!enabled && this.backgroundMusic) {
      this.backgroundMusic.stop()
    }
  }

  isMusicEnabled() {
    return this.musicEnabled
  }

  private loadBackgroundMusic() {
    // Placeholder for background music
    // Replace with actual music file
    this.backgroundMusic = new Howl({
      src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='],
      loop: true,
      volume: 0.3,
      html5: true
    })

    if (this.musicEnabled) {
      this.backgroundMusic.play()
    }
  }

  // Cleanup
  destroy() {
    this.sounds.forEach(sound => sound.unload())
    this.sounds.clear()
    
    if (this.backgroundMusic) {
      this.backgroundMusic.unload()
      this.backgroundMusic = null
    }
  }
}

// Create singleton instance
let soundManagerInstance: SoundManager | null = null

export const getSoundManager = () => {
  if (!soundManagerInstance) {
    soundManagerInstance = new SoundManager()
  }
  return soundManagerInstance
}

export type { SoundName }