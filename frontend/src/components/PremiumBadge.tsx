"use client"

import { Badge } from '@/components/ui/badge'
import { Crown, Star, Sparkles } from 'lucide-react'
import { cn } from "@/lib/utils"
import type { PremiumType } from "@/stores/user-store"

interface PremiumBadgeProps {
  premiumType?: PremiumType
  className?: string
  showDetails?: boolean
}

export default function PremiumBadge({ premiumType = 'free', className = "", showDetails = false }: PremiumBadgeProps) {
  const configs = {
    free: {
      label: "Free",
      icon: Sparkles,
      className: "bg-gray-600/50 text-gray-300 border-gray-600",
      details: "3 objectifs max • 10 étapes/objectif"
    },
    starter: {
      label: "Starter",
      icon: Star,
      className: "bg-gradient-to-r from-blue-400 to-cyan-500 text-white border-0",
      details: "10 objectifs • Étapes illimitées • Support prioritaire"
    },
    pro: {
      label: "Pro",
      icon: Crown,
      className: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0",
      details: "Tout illimité • IA avancée • Coaching personnalisé"
    }
  }
  
  const config = configs[premiumType] || configs.free
  const Icon = config.icon
  
  return (
    <div className={cn("inline-flex flex-col gap-1", className)}>
      <Badge className={cn("px-3 py-1", config.className)}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
      {showDetails && (
        <p className="text-xs text-muted-foreground">
          {config.details}
        </p>
      )}
    </div>
  )
}