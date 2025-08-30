"use client"

import { Badge } from '@/components/ui/badge'
import { Crown, Sparkles } from 'lucide-react'

interface PremiumBadgeProps {
  isPremium: boolean
  className?: string
}

export default function PremiumBadge({ isPremium, className = "" }: PremiumBadgeProps) {
  if (isPremium) {
    return (
      <Badge className={`bg-gradient-to-r from-purple-500 to-blue-500 text-white border-none ${className}`}>
        <Crown className="h-3 w-3 mr-1" />
        Premium
      </Badge>
    )
  }

  return (
    <Badge className={`bg-gray-600/50 text-gray-300 border-gray-600 ${className}`}>
      <Sparkles className="h-3 w-3 mr-1" />
      Free
    </Badge>
  )
}