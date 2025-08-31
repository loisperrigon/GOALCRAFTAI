// Système de sons simplifié utilisant Web Audio API
class SimpleSoundManager {
  private audioContext: AudioContext | null = null
  private enabled: boolean = true
  private volume: number = 0.7

  constructor() {
    if (typeof window !== 'undefined') {
      this.enabled = localStorage.getItem('soundEnabled') !== 'false'
      this.volume = parseFloat(localStorage.getItem('soundVolume') || '0.7')
      
      // Créer l'AudioContext au premier clic utilisateur
      if (typeof window !== 'undefined') {
        document.addEventListener('click', () => {
          if (!this.audioContext) {
            this.initAudioContext()
          }
        }, { once: true })
      }
    }
  }

  private initAudioContext() {
    if (typeof window !== 'undefined' && !this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.enabled || !this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.type = type
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)

      gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + duration)
    } catch (error) {
      console.error('Error playing sound:', error)
    }
  }

  // Sons spécifiques
  playClick() {
    this.playTone(800, 0.05, 'sine')
  }

  playComplete() {
    // Jouer deux notes pour un effet de succès
    this.playTone(523, 0.1, 'sine') // Do
    setTimeout(() => this.playTone(659, 0.15, 'sine'), 100) // Mi
  }

  playLevelUp() {
    // Arpège ascendant pour level up
    this.playTone(261, 0.1, 'sine') // Do
    setTimeout(() => this.playTone(329, 0.1, 'sine'), 100) // Mi
    setTimeout(() => this.playTone(392, 0.1, 'sine'), 200) // Sol
    setTimeout(() => this.playTone(523, 0.2, 'sine'), 300) // Do octave
  }

  playXpGain() {
    this.playTone(1047, 0.05, 'square') // Do aigu court
  }

  playUnlock() {
    this.playTone(698, 0.15, 'sine') // Fa
  }

  playNotification() {
    this.playTone(880, 0.1, 'sine') // La
  }

  playWhoosh() {
    // Son plus grave pour whoosh
    this.playTone(200, 0.1, 'sawtooth')
  }

  // Paramètres
  setEnabled(enabled: boolean) {
    this.enabled = enabled
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundEnabled', String(enabled))
    }
    // Initialiser le contexte audio si on active les sons
    if (enabled && !this.audioContext) {
      this.initAudioContext()
    }
  }

  isEnabled() {
    return this.enabled
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundVolume', String(this.volume))
    }
  }

  getVolume() {
    return this.volume
  }

  // Pas de musique de fond pour simplifier
  setMusicEnabled(enabled: boolean) {
    // Placeholder
  }

  isMusicEnabled() {
    return false
  }
}

// Singleton
let instance: SimpleSoundManager | null = null

export const getSimpleSoundManager = () => {
  if (!instance) {
    instance = new SimpleSoundManager()
  }
  return instance
}

export type { SimpleSoundManager }