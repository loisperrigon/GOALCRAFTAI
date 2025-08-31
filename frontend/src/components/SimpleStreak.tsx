"use client"

import { useEffect } from 'react'
import { Flame } from 'lucide-react'
import { useStreakStore } from '@/stores/streak-store'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function SimpleStreak() {
  const { 
    currentStreak, 
    streakMultiplier, 
    isStreakActive,
    checkStreak
  } = useStreakStore()

  useEffect(() => {
    checkStreak()
  }, [checkStreak])

  const getStreakColor = () => {
    if (!isStreakActive) return 'text-gray-500'
    if (currentStreak >= 30) return 'text-orange-500'
    if (currentStreak >= 7) return 'text-yellow-500'
    if (currentStreak >= 3) return 'text-orange-400'
    return 'text-orange-300'
  }

  return (
    <div className="flex items-center gap-3">
      {/* Flame avec animation subtile */}
      <div className="relative">
        <Flame 
          className={cn(
            "w-5 h-5 transition-all duration-300",
            getStreakColor(),
            isStreakActive && "drop-shadow-glow animate-pulse-subtle"
          )} 
        />
        {currentStreak > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {currentStreak}
          </span>
        )}
      </div>

      {/* Multiplicateur si actif */}
      {streakMultiplier > 1 && (
        <Badge 
          variant="outline" 
          className="text-xs bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30 text-yellow-400"
        >
          x{streakMultiplier}
        </Badge>
      )}
    </div>
  )
}