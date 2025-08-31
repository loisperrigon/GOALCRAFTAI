"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Volume2, 
  VolumeX, 
  Music,
  Music2,
  Settings2
} from 'lucide-react'
import { useSound } from '@/hooks/useSound'

export default function SoundControl() {
  const [showSettings, setShowSettings] = useState(false)
  const { 
    soundEnabled, 
    setSoundEnabled, 
    musicEnabled,
    setMusicEnabled,
    volume, 
    setVolume,
    playClick 
  } = useSound()

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    if (!soundEnabled) {
      playClick() // Play a sound when enabling
    }
  }

  const toggleMusic = () => {
    setMusicEnabled(!musicEnabled)
    playClick()
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (soundEnabled) {
      playClick()
    }
  }

  return (
    <div className="relative">
      {/* Main Sound Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          toggleSound()
          setShowSettings(false)
        }}
        className="hover:bg-purple-500/10"
      >
        {soundEnabled ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>

      {/* Settings Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setShowSettings(!showSettings)
          playClick()
        }}
        className="hover:bg-purple-500/10"
      >
        <Settings2 className="h-4 w-4" />
      </Button>

      {/* Settings Dropdown */}
      {showSettings && (
        <Card className="absolute top-10 right-0 p-4 w-64 z-50 bg-card/95 backdrop-blur border-purple-500/20">
          <h3 className="font-semibold text-sm mb-3">Paramètres Audio</h3>
          
          {/* Sound Effects Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Effets sonores</span>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSound}
                className={soundEnabled ? "border-purple-500/50 bg-purple-500/10" : ""}
              >
                {soundEnabled ? (
                  <Volume2 className="h-3 w-3" />
                ) : (
                  <VolumeX className="h-3 w-3" />
                )}
              </Button>
            </div>

            {/* Background Music Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Musique de fond</span>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMusic}
                className={musicEnabled ? "border-purple-500/50 bg-purple-500/10" : ""}
              >
                {musicEnabled ? (
                  <Music className="h-3 w-3" />
                ) : (
                  <Music2 className="h-3 w-3" />
                )}
              </Button>
            </div>

            {/* Volume Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Volume</span>
                <span className="text-xs text-muted-foreground">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, rgb(168 85 247) 0%, rgb(168 85 247) ${volume * 100}%, rgb(30 30 30) ${volume * 100}%, rgb(30 30 30) 100%)`
                }}
              />
            </div>

            {/* Sound Test */}
            <Button
              variant="outline"
              size="sm"
              className="w-full border-purple-500/30 hover:bg-purple-500/10"
              onClick={() => {
                playClick()
              }}
            >
              Tester le son
            </Button>
          </div>
        </Card>
      )}

      {/* Click outside to close */}
      {showSettings && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}