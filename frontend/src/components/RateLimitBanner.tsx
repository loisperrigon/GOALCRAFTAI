"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Zap, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface RateLimitBannerProps {
  remaining: number
  limit: number
  userType: "anon" | "free" | "premium"
  resetTime?: number
}

export function RateLimitBanner({ remaining, limit, userType, resetTime }: RateLimitBannerProps) {
  const router = useRouter()
  const [timeUntilReset, setTimeUntilReset] = useState(resetTime || 0)
  
  useEffect(() => {
    if (resetTime) {
      const interval = setInterval(() => {
        setTimeUntilReset(prev => Math.max(0, prev - 1))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [resetTime])
  
  // Ne pas afficher si on a encore beaucoup de messages
  if (remaining > limit * 0.3) return null
  
  const percentage = (remaining / limit) * 100
  const isExhausted = remaining === 0
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}min`
    return `${minutes} min`
  }
  
  const messages = {
    anon: {
      title: isExhausted ? "Limite atteinte" : `${remaining} messages restants`,
      description: isExhausted 
        ? "Cr\u00e9ez un compte gratuit pour continuer"
        : "Cr\u00e9ez un compte pour plus de messages",
      action: "Cr\u00e9er un compte",
      color: "bg-orange-500"
    },
    free: {
      title: isExhausted ? "Limite quotidienne atteinte" : `${remaining}/${limit} messages aujourd'hui`,
      description: isExhausted
        ? `R\u00e9initialisation dans ${formatTime(timeUntilReset)}`
        : "Passez Premium pour 50 messages/jour",
      action: "Passer Premium",
      color: "bg-purple-500"
    },
    premium: {
      title: `${remaining}/${limit} messages restants`,
      description: `R\u00e9initialisation dans ${formatTime(timeUntilReset)}`,
      action: null,
      color: "bg-blue-500"
    }
  }
  
  const config = messages[userType]
  
  return (
    <div className={`${config.color} text-white p-3 rounded-lg mb-4 animate-pulse`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isExhausted ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <Clock className="w-5 h-5" />
          )}
          <div>
            <p className="font-semibold">{config.title}</p>
            <p className="text-sm opacity-90">{config.description}</p>
          </div>
        </div>
        
        {config.action && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(userType === "anon" ? "/auth" : "/pricing")}
            className="bg-white text-black hover:bg-gray-100"
          >
            <Zap className="w-4 h-4 mr-1" />
            {config.action}
          </Button>
        )}
      </div>
      
      {/* Barre de progression */}
      <div className="mt-2 bg-white/20 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-white h-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}