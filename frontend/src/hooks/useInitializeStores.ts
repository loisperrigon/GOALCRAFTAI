"use client"

import { useEffect } from 'react'
import { useObjectivesStore } from '@/stores/objectives-store'
import { useUserStore } from '@/stores/user-store'
import { mockObjectives } from '@/data/mockObjectives'

export function useInitializeStores() {
  const { objectives, createObjective, setActiveObjective } = useObjectivesStore()
  const { user, login } = useUserStore()

  useEffect(() => {
    // Initialiser l'utilisateur si pas connecté
    if (!user) {
      // Auto-login avec un utilisateur mock
      login('lois@example.com', 'password').catch(console.error)
    }
  }, [user, login])

  useEffect(() => {
    // Initialiser les objectifs s'ils sont vides
    if (objectives.length === 0) {
      console.log('Initialisation des objectifs mock...')
      
      // Ajouter les objectifs mock
      Promise.all(
        mockObjectives.map(obj => createObjective(obj))
      ).then(createdObjectives => {
        // Définir le premier objectif comme actif
        if (createdObjectives.length > 0) {
          setActiveObjective(createdObjectives[0].id)
        }
      })
    } else if (!objectives.find(o => o.id === useObjectivesStore.getState().activeObjectiveId)) {
      // Si aucun objectif actif, prendre le premier
      setActiveObjective(objectives[0]?.id || null)
    }
  }, [objectives, createObjective, setActiveObjective])
}