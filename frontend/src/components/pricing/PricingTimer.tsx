"use client"

import React from "react"

function PricingTimer() {
  const [timeLeft, setTimeLeft] = React.useState({ hours: 23, minutes: 59, seconds: 59 })
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return { hours: 23, minutes: 59, seconds: 59 } // Reset
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  // Affichage statique côté serveur
  if (!mounted) {
    return (
      <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full">
        <span className="text-xs text-orange-300">Expire dans</span>
        <span className="font-mono text-sm font-bold text-white">
          23:59:59
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full">
      <span className="text-xs text-orange-300">Expire dans</span>
      <span className="font-mono text-sm font-bold text-white">
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  )
}

export default PricingTimer