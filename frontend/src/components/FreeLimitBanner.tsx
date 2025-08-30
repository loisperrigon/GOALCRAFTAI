"use client"

import { AlertTriangle, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface FreeLimitBannerProps {
  currentSteps: number
  maxSteps: number
  show: boolean
}

export default function FreeLimitBanner({ currentSteps, maxSteps, show }: FreeLimitBannerProps) {
  if (!show) return null
  
  const isAtLimit = currentSteps >= maxSteps
  
  return (
    <div className={`
      absolute top-4 left-1/2 -translate-x-1/2 z-20
      px-4 py-2 rounded-lg border backdrop-blur-sm
      ${isAtLimit 
        ? 'bg-red-500/20 border-red-500/50' 
        : 'bg-orange-500/20 border-orange-500/50'
      }
      flex items-center gap-3
    `}>
      <AlertTriangle className={`h-4 w-4 ${isAtLimit ? 'text-red-400' : 'text-orange-400'}`} />
      <span className="text-sm font-medium">
        {isAtLimit 
          ? `Limite atteinte : ${currentSteps}/${maxSteps} étapes (Plan gratuit)`
          : `${currentSteps}/${maxSteps} étapes utilisées (Plan gratuit)`
        }
      </span>
      <Link href="/pricing">
        <Button size="sm" variant="ghost" className="h-7 px-2">
          <Crown className="h-3 w-3 mr-1" />
          Débloquer
        </Button>
      </Link>
    </div>
  )
}