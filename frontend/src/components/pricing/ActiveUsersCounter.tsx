"use client"

import React from "react"
import { Users } from "lucide-react"

function ActiveUsersCounter() {
  const [activeUsers, setActiveUsers] = React.useState(1247)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    
    // Simuler des changements d'utilisateurs actifs
    const interval = setInterval(() => {
      setActiveUsers(prev => {
        const change = Math.floor(Math.random() * 5) - 2 // Entre -2 et +2
        const newValue = prev + change
        // Garder entre 1200 et 1300 pour que ce soit réaliste
        return Math.max(1200, Math.min(1300, newValue))
      })
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  // Valeur statique côté serveur
  if (!mounted) {
    return (
      <div className="flex items-center justify-center gap-2">
        <div className="flex -space-x-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 border-2 border-background" />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          <span className="text-purple-400 font-semibold">1247</span> utilisateurs actifs
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <div className="flex -space-x-2">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 border-2 border-background transition-all hover:scale-110"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        <span className="text-purple-400 font-semibold transition-all">
          {activeUsers}
        </span> utilisateurs actifs
      </span>
    </div>
  )
}

export default ActiveUsersCounter