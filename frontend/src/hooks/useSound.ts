"use client"

import { useCallback, useEffect, useState } from 'react'
import { getRealSoundManager } from '@/lib/real-sounds'

export function useSound() {
  const [soundEnabled, setSoundEnabledState] = useState(true)
  const [musicEnabled, setMusicEnabledState] = useState(false)
  const [volume, setVolumeState] = useState(0.7)

  useEffect(() => {
    const soundManager = getRealSoundManager()
    setSoundEnabledState(soundManager.isEnabled())
    setMusicEnabledState(soundManager.isMusicEnabled())
    setVolumeState(soundManager.getVolume())
  }, [])

  const playSound = useCallback((soundName: string) => {
    // Pour compatibilité, mais on utilise les méthodes directes
    const soundManager = getRealSoundManager()
    switch(soundName) {
      case 'click': soundManager.playClick(); break
      case 'complete': soundManager.playComplete(); break
      case 'levelUp': soundManager.playLevelUp(); break
      case 'xpGain': soundManager.playXpGain(); break
      case 'unlock': soundManager.playUnlock(); break
      case 'notification': soundManager.playNotification(); break
      case 'whoosh': soundManager.playWhoosh(); break
    }
  }, [])

  const playClick = useCallback(() => {
    const soundManager = getRealSoundManager()
    soundManager.playClick()
  }, [])

  const playComplete = useCallback(() => {
    const soundManager = getRealSoundManager()
    soundManager.playComplete()
  }, [])

  const playLevelUp = useCallback(() => {
    const soundManager = getRealSoundManager()
    soundManager.playLevelUp()
  }, [])

  const playXpGain = useCallback(() => {
    const soundManager = getRealSoundManager()
    soundManager.playXpGain()
  }, [])

  const playUnlock = useCallback(() => {
    const soundManager = getRealSoundManager()
    soundManager.playUnlock()
  }, [])

  const playNotification = useCallback(() => {
    const soundManager = getRealSoundManager()
    soundManager.playNotification()
  }, [])

  const playWhoosh = useCallback(() => {
    const soundManager = getRealSoundManager()
    soundManager.playWhoosh()
  }, [])

  const setSoundEnabled = useCallback((enabled: boolean) => {
    const soundManager = getRealSoundManager()
    soundManager.setEnabled(enabled)
    setSoundEnabledState(enabled)
  }, [])

  const setMusicEnabled = useCallback((enabled: boolean) => {
    const soundManager = getRealSoundManager()
    soundManager.setMusicEnabled(enabled)
    setMusicEnabledState(enabled)
  }, [])

  const setVolume = useCallback((newVolume: number) => {
    const soundManager = getRealSoundManager()
    soundManager.setVolume(newVolume)
    setVolumeState(newVolume)
  }, [])

  return {
    // Play functions
    playSound,
    playClick,
    playComplete,
    playLevelUp,
    playXpGain,
    playUnlock,
    playNotification,
    playWhoosh,
    
    // Settings
    soundEnabled,
    setSoundEnabled,
    musicEnabled,
    setMusicEnabled,
    volume,
    setVolume
  }
}