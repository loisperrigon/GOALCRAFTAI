"use client"

import { useCallback, useEffect, useState, useMemo } from 'react'
import { getLazySoundManager } from '@/lib/real-sounds-lazy'

export function useSound() {
  const [soundEnabled, setSoundEnabledState] = useState(true)
  const [musicEnabled, setMusicEnabledState] = useState(false)
  const [volume, setVolumeState] = useState(0.7)
  
  // Créer soundManager une seule fois (version lazy)
  const soundManager = useMemo(() => getLazySoundManager(), [])

  useEffect(() => {
    setSoundEnabledState(soundManager.isEnabled())
    setMusicEnabledState(soundManager.isMusicEnabled())
    setVolumeState(soundManager.getVolume())
  }, [soundManager])

  const playSound = useCallback((soundName: string) => {
    switch(soundName) {
      case 'click': soundManager.playClick(); break
      case 'complete': soundManager.playComplete(); break
      case 'levelUp': soundManager.playLevelUp(); break
      case 'xpGain': soundManager.playXpGain(); break
      case 'unlock': soundManager.playUnlock(); break
      case 'notification': soundManager.playNotification(); break
      case 'whoosh': soundManager.playWhoosh(); break
    }
  }, [soundManager])

  const playClick = useCallback(() => {
    soundManager.playClick()
  }, [soundManager])

  const playComplete = useCallback(() => {
    soundManager.playComplete()
  }, [soundManager])

  const playLevelUp = useCallback(() => {
    soundManager.playLevelUp()
  }, [soundManager])

  const playXpGain = useCallback(() => {
    soundManager.playXpGain()
  }, [soundManager])

  const playUnlock = useCallback(() => {
    soundManager.playUnlock()
  }, [soundManager])

  const playNotification = useCallback(() => {
    soundManager.playNotification()
  }, [soundManager])

  const playWhoosh = useCallback(() => {
    soundManager.playWhoosh()
  }, [soundManager])

  const setSoundEnabled = useCallback((enabled: boolean) => {
    soundManager.setEnabled(enabled)
    setSoundEnabledState(enabled)
  }, [soundManager])

  const setMusicEnabled = useCallback((enabled: boolean) => {
    soundManager.setMusicEnabled(enabled)
    setMusicEnabledState(enabled)
  }, [soundManager])

  const setVolume = useCallback((newVolume: number) => {
    soundManager.setVolume(newVolume)
    setVolumeState(newVolume)
  }, [soundManager])

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