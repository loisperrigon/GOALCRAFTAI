"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame } from 'lucide-react'
import { useSound } from '@/hooks/useSound'

interface SimpleStreakNotificationProps {
  show: boolean
  days: number
}

export function SimpleStreakNotification({ show, days }: SimpleStreakNotificationProps) {
  const { playNotification } = useSound()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show && days > 0) {
      setIsVisible(true)
      playNotification()

      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 2500)

      return () => clearTimeout(timer)
    }
  }, [show, days, playNotification])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-lg border border-orange-500/30 rounded-lg px-4 py-3 shadow-xl flex items-center gap-3">
            <Flame className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm font-medium text-white">
                Série de {days} {days === 1 ? 'jour' : 'jours'} ! 🔥
              </p>
              <p className="text-xs text-gray-300">
                Continue comme ça !
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}