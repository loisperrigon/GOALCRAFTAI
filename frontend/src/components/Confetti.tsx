"use client"

import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'

interface ConfettiProps {
  trigger: boolean
  onComplete?: () => void
}

export default function Confetti({ trigger, onComplete }: ConfettiProps) {
  useEffect(() => {
    if (trigger) {
      // Configuration des feux d'artifice
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          clearInterval(interval)
          if (onComplete) onComplete()
          return
        }

        const particleCount = 50 * (timeLeft / duration)

        // Créer des feux d'artifice depuis plusieurs points
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#a855f7', '#8b5cf6', '#7c3aed', '#22d3ee', '#06b6d4']
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#a855f7', '#8b5cf6', '#7c3aed', '#22d3ee', '#06b6d4']
        })
      }, 250)

      // Animation initiale plus intense
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#8b5cf6', '#7c3aed', '#22d3ee', '#06b6d4', '#10b981']
      })
    }
  }, [trigger, onComplete])

  return null
}

// Fonction utilitaire pour déclencher des confettis simples
export const triggerConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#a855f7', '#8b5cf6', '#7c3aed', '#22d3ee', '#06b6d4', '#10b981']
  })
}

// Fonction pour des confettis de milestone (sur les côtés)
export const triggerMilestoneConfetti = () => {
  const defaults = {
    colors: ['#a855f7', '#8b5cf6', '#7c3aed', '#22d3ee', '#06b6d4'],
    scalar: 0.6,  // Taille réduite
    gravity: 0.6,
    ticks: 50,
    startVelocity: 25,
    spread: 55
  }

  // Confettis depuis le côté gauche
  confetti({
    ...defaults,
    particleCount: 30,
    angle: 45,
    origin: { x: 0, y: 0.5 }
  })

  // Confettis depuis le côté droit
  confetti({
    ...defaults,
    particleCount: 30,
    angle: 135,
    origin: { x: 1, y: 0.5 }
  })

  // Petite salve supplémentaire en haut à gauche
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 15,
      angle: 60,
      spread: 40,
      origin: { x: 0.1, y: 0.3 },
      scalar: 0.5
    })
  }, 100)

  // Petite salve supplémentaire en haut à droite
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 15,
      angle: 120,
      spread: 40,
      origin: { x: 0.9, y: 0.3 },
      scalar: 0.5
    })
  }, 100)
}