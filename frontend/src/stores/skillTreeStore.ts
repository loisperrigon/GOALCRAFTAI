import { create } from 'zustand'

export interface SkillNode {
  id: string
  title: string
  description: string
  xpReward: number
  requiredLevel: number
  dependencies: string[] // IDs des nœuds prérequis
  optional: boolean
  completed: boolean
  unlocked: boolean
  category: 'main' | 'bonus' | 'challenge'
  icon?: string
  estimatedTime?: string
  position: {
    x: number
    y: number
  }
}

export interface SkillTreeState {
  nodes: SkillNode[]
  userXP: number
  userLevel: number
  completedNodes: string[]
  activeNodeId: string | null
  
  // Actions
  completeNode: (nodeId: string) => void
  unlockNode: (nodeId: string) => void
  setActiveNode: (nodeId: string | null) => void
  addXP: (amount: number) => void
  resetProgress: () => void
  loadMockData: () => void
}

const useSkillTreeStore = create<SkillTreeState>((set, get) => ({
  nodes: [],
  userXP: 0,
  userLevel: 1,
  completedNodes: [],
  activeNodeId: null,

  completeNode: (nodeId) => {
    set((state) => {
      const node = state.nodes.find(n => n.id === nodeId)
      if (!node || !node.unlocked) return state

      const updatedNodes = state.nodes.map(n => {
        if (n.id === nodeId) {
          return { ...n, completed: true }
        }
        // Débloquer les nœuds qui dépendent de celui-ci
        if (n.dependencies.includes(nodeId)) {
          const allDepsCompleted = n.dependencies.every(depId => 
            depId === nodeId || state.completedNodes.includes(depId)
          )
          if (allDepsCompleted) {
            return { ...n, unlocked: true }
          }
        }
        return n
      })

      return {
        ...state,
        nodes: updatedNodes,
        completedNodes: [...state.completedNodes, nodeId],
        userXP: state.userXP + (node?.xpReward || 0),
        userLevel: Math.floor((state.userXP + (node?.xpReward || 0)) / 100) + 1
      }
    })
  },

  unlockNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.map(n => 
        n.id === nodeId ? { ...n, unlocked: true } : n
      )
    }))
  },

  setActiveNode: (nodeId) => {
    set({ activeNodeId: nodeId })
  },

  addXP: (amount) => {
    set((state) => ({
      userXP: state.userXP + amount,
      userLevel: Math.floor((state.userXP + amount) / 100) + 1
    }))
  },

  resetProgress: () => {
    set((state) => ({
      nodes: state.nodes.map(n => ({
        ...n,
        completed: false,
        unlocked: n.dependencies.length === 0
      })),
      userXP: 0,
      userLevel: 1,
      completedNodes: [],
      activeNodeId: null
    }))
  },

  loadMockData: () => {
    const mockNodes: SkillNode[] = [
      // === NIVEAU 1 - DÉCOUVERTE ===
      {
        id: 'start',
        title: '🎸 Choisir sa guitare',
        description: 'Sélectionnez votre première guitare (acoustique ou électrique)',
        xpReward: 10,
        requiredLevel: 1,
        dependencies: [],
        optional: false,
        completed: false,
        unlocked: true,
        category: 'main',
        estimatedTime: '2 heures',
        position: { x: 600, y: 50 }
      },

      // === NIVEAU 2 - BASES ESSENTIELLES ===
      {
        id: 'posture',
        title: 'Posture & Tenue',
        description: 'Apprenez à tenir correctement votre guitare et votre médiator',
        xpReward: 15,
        requiredLevel: 1,
        dependencies: ['start'],
        optional: false,
        completed: false,
        unlocked: false,
        category: 'main',
        estimatedTime: '1 heure',
        position: { x: 400, y: 180 }
      },
      {
        id: 'tuning',
        title: 'Accorder sa guitare',
        description: 'Maîtrisez l\'accordage standard (E-A-D-G-B-E)',
        xpReward: 20,
        requiredLevel: 1,
        dependencies: ['start'],
        optional: false,
        completed: false,
        unlocked: false,
        category: 'main',
        estimatedTime: '30 min',
        position: { x: 600, y: 180 }
      },
      {
        id: 'anatomy',
        title: 'Anatomie de la guitare',
        description: 'Découvrez les parties de l\'instrument (chevalet, frettes, manche...)',
        xpReward: 10,
        requiredLevel: 1,
        dependencies: ['start'],
        optional: true,
        completed: false,
        unlocked: false,
        category: 'bonus',
        estimatedTime: '45 min',
        position: { x: 800, y: 180 }
      },
      {
        id: 'music_theory_basics',
        title: 'Théorie musicale',
        description: 'Comprenez les notes, le rythme et les tablatures',
        xpReward: 25,
        requiredLevel: 1,
        dependencies: ['start'],
        optional: true,
        completed: false,
        unlocked: false,
        category: 'bonus',
        estimatedTime: '2 heures',
        position: { x: 200, y: 180 }
      },

      // === NIVEAU 3 - PREMIERS ACCORDS ===
      {
        id: 'first_chord_em',
        title: 'Mi mineur (Em)',
        description: 'Votre premier accord ! Le plus facile à jouer',
        xpReward: 30,
        requiredLevel: 2,
        dependencies: ['posture', 'tuning'],
        optional: false,
        completed: false,
        unlocked: false,
        category: 'main',
        estimatedTime: '2 heures',
        position: { x: 500, y: 320 }
      },
      {
        id: 'chord_g',
        title: 'Sol majeur (G)',
        description: 'Un accord fondamental utilisé dans des milliers de chansons',
        xpReward: 25,
        requiredLevel: 2,
        dependencies: ['first_chord_em'],
        optional: false,
        completed: false,
        unlocked: false,
        category: 'main',
        estimatedTime: '3 heures',
        position: { x: 350, y: 400 }
      },
      {
        id: 'chord_c',
        title: 'Do majeur (C)',
        description: 'Accord classique, parfait pour les progressions',
        xpReward: 25,
        requiredLevel: 2,
        dependencies: ['first_chord_em'],
        optional: false,
        completed: false,
        unlocked: false,
        category: 'main',
        estimatedTime: '3 heures',
        position: { x: 500, y: 400 }
      },
      {
        id: 'chord_d',
        title: 'Ré majeur (D)',
        description: 'Complétez le quatuor magique G-C-D-Em',
        xpReward: 25,
        requiredLevel: 2,
        dependencies: ['first_chord_em'],
        optional: false,
        completed: false,
        unlocked: false,
        category: 'main',
        estimatedTime: '3 heures',
        position: { x: 650, y: 400 }
      },
      {
        id: 'chord_am',
        title: 'La mineur (Am)',
        description: 'Accord mélancolique très utilisé',
        xpReward: 20,
        requiredLevel: 2,
        dependencies: ['first_chord_em'],
        optional: true,
        completed: false,
        unlocked: false,
        category: 'bonus',
        estimatedTime: '2 heures',
        position: { x: 800, y: 320 }
      },
      {
        id: 'strumming_basics',
        title: 'Rythmiques de base',
        description: 'Apprenez les patterns de strumming bas-haut',
        xpReward: 35,
        requiredLevel: 2,
        dependencies: ['first_chord_em'],
        optional: false,
        completed: false,
        unlocked: false,
        category: 'main',
        estimatedTime: '1 semaine',
        position: { x: 200, y: 320 }
      },

      // === NIVEAU 4 - PREMIÈRE CHANSON ===
      {
        id: 'chord_transitions',
        title: 'Transitions fluides',
        description: 'Passez d\'un accord à l\'autre sans pause',
        xpReward: 40,
        requiredLevel: 3,
        dependencies: ['chord_g', 'chord_c', 'chord_d'],
        optional: false,
        completed: false,
        unlocked: false,
        category: 'main',
        estimatedTime: '1 semaine',
        position: { x: 500, y: 520 }
      },
      {
        id: 'first_song',
        title: '🎵 Wonderwall',
        description: 'Jouez votre première chanson complète (Oasis)',
        xpReward: 60,
        requiredLevel: 3,
        dependencies: ['chord_transitions', 'strumming_basics'],
        optional: false,
        completed: false,
        unlocked: false,
        category: 'main',
        estimatedTime: '2 semaines',
        position: { x: 350, y: 620 }
      },
      {
        id: 'second_song',
        title: '🎵 Let It Be',
        description: 'Maîtrisez un classique des Beatles',
        xpReward: 50,
        requiredLevel: 3,
        dependencies: ['chord_transitions'],
        optional: true,
        completed: false,
        unlocked: false,
        category: 'bonus',
        estimatedTime: '1 semaine',
        position: { x: 650, y: 620 }
      },
      {
        id: 'fingerpicking_intro',
        title: 'Introduction au fingerpicking',
        description: 'Jouez avec les doigts plutôt qu\'au médiator',
        xpReward: 45,
        requiredLevel: 3,
        dependencies: ['chord_transitions'],
        optional: true,
        completed: false,
        unlocked: false,
        category: 'bonus',
        estimatedTime: '2 semaines',
        position: { x: 200, y: 520 }
      },
      {
        id: 'challenge_speed',
        title: '⚡ Défi: 60 BPM → 120 BPM',
        description: 'Doublez votre vitesse de jeu en 7 jours',
        xpReward: 70,
        requiredLevel: 3,
        dependencies: ['chord_transitions'],
        optional: true,
        completed: false,
        unlocked: false,
        category: 'challenge',
        estimatedTime: '7 jours',
        position: { x: 800, y: 520 }
      },

      // === NIVEAU 5 - TECHNIQUES INTERMÉDIAIRES ===
      {
        id: 'barre_chords',
        title: 'Accords barrés',
        description: 'Débloquez des centaines d\'accords avec la technique du barré (F, Bm...)',
        xpReward: 80,
        requiredLevel: 4,
        dependencies: ['first_song'],
        optional: false,
        completed: false,
        unlocked: false,
        category: 'main',
        estimatedTime: '3 semaines',
        position: { x: 300, y: 750 }
      },
      {
        id: 'power_chords',
        title: 'Power chords',
        description: 'Les accords du rock ! Jouez du Nirvana, AC/DC...',
        xpReward: 50,
        requiredLevel: 4,
        dependencies: ['first_song'],
        optional: true,
        completed: false,
        unlocked: false,
        category: 'bonus',
        estimatedTime: '1 semaine',
        position: { x: 150, y: 750 }
      },
      {
        id: 'scales_pentatonic',
        title: 'Gamme pentatonique',
        description: 'La base pour improviser et jouer des solos',
        xpReward: 70,
        requiredLevel: 4,
        dependencies: ['first_song'],
        optional: false,
        completed: false,
        unlocked: false,
        category: 'main',
        estimatedTime: '2 semaines',
        position: { x: 500, y: 750 }
      },
      {
        id: 'hammer_pull',
        title: 'Hammer-on & Pull-off',
        description: 'Techniques de legato pour un jeu plus fluide',
        xpReward: 45,
        requiredLevel: 4,
        dependencies: ['scales_pentatonic'],
        optional: true,
        completed: false,
        unlocked: false,
        category: 'bonus',
        estimatedTime: '1 semaine',
        position: { x: 700, y: 750 }
      },
      {
        id: 'reading_tabs',
        title: 'Lire les tablatures',
        description: 'Déchiffrez n\'importe quelle chanson',
        xpReward: 30,
        requiredLevel: 2,
        dependencies: ['music_theory_basics'],
        optional: true,
        completed: false,
        unlocked: false,
        category: 'bonus',
        estimatedTime: '3 heures',
        position: { x: 50, y: 320 }
      },

      // === NIVEAU 6 - EXPERTISE ===
      {
        id: 'first_solo',
        title: '🎸 Premier solo',
        description: 'Jouez le solo de "Nothing Else Matters" ou "Hotel California"',
        xpReward: 100,
        requiredLevel: 5,
        dependencies: ['scales_pentatonic', 'hammer_pull'],
        optional: false,
        completed: false,
        unlocked: false,
        category: 'main',
        estimatedTime: '1 mois',
        position: { x: 600, y: 880 }
      },
      {
        id: 'improvisation',
        title: 'Improvisation blues',
        description: 'Créez vos propres mélodies sur une grille de blues',
        xpReward: 90,
        requiredLevel: 5,
        dependencies: ['scales_pentatonic'],
        optional: false,
        completed: false,
        unlocked: false,
        category: 'main',
        estimatedTime: '3 semaines',
        position: { x: 400, y: 880 }
      },
      {
        id: 'band_play',
        title: 'Jouer en groupe',
        description: 'Trouvez des musiciens et jouez ensemble',
        xpReward: 75,
        requiredLevel: 5,
        dependencies: ['first_song'],
        optional: true,
        completed: false,
        unlocked: false,
        category: 'bonus',
        estimatedTime: '2 semaines',
        position: { x: 200, y: 880 }
      },
      {
        id: 'recording',
        title: 'Enregistrement',
        description: 'Enregistrez votre première démo',
        xpReward: 60,
        requiredLevel: 5,
        dependencies: ['first_solo', 'improvisation'],
        optional: true,
        completed: false,
        unlocked: false,
        category: 'bonus',
        estimatedTime: '1 semaine',
        position: { x: 800, y: 880 }
      },

      // === CHALLENGES SPÉCIAUX ===
      {
        id: 'challenge_30days',
        title: '🔥 30 jours de pratique',
        description: 'Jouez au moins 30 minutes par jour pendant 30 jours',
        xpReward: 100,
        requiredLevel: 2,
        dependencies: ['first_chord_em'],
        optional: true,
        completed: false,
        unlocked: false,
        category: 'challenge',
        estimatedTime: '30 jours',
        position: { x: 900, y: 400 }
      },
      {
        id: 'challenge_10songs',
        title: '📚 Répertoire de 10 chansons',
        description: 'Maîtrisez 10 chansons complètes de bout en bout',
        xpReward: 150,
        requiredLevel: 4,
        dependencies: ['first_song'],
        optional: true,
        completed: false,
        unlocked: false,
        category: 'challenge',
        estimatedTime: '2 mois',
        position: { x: 50, y: 620 }
      },

      // === BOSS FINAL ===
      {
        id: 'final_concert',
        title: '🏆 Concert live',
        description: 'Jouez devant un public (amis, famille, open mic...)',
        xpReward: 200,
        requiredLevel: 6,
        dependencies: ['first_solo', 'improvisation'],
        optional: false,
        completed: false,
        unlocked: false,
        category: 'main',
        estimatedTime: 'Quand vous êtes prêt',
        position: { x: 500, y: 1000 }
      },

      // === BRANCHES OPTIONNELLES ===
      {
        id: 'acoustic_fingerstyle',
        title: 'Fingerstyle avancé',
        description: 'Techniques percussives et mélodies complexes',
        xpReward: 85,
        requiredLevel: 4,
        dependencies: ['fingerpicking_intro'],
        optional: true,
        completed: false,
        unlocked: false,
        category: 'bonus',
        estimatedTime: '1 mois',
        position: { x: 50, y: 450 }
      },
      {
        id: 'music_theory_advanced',
        title: 'Théorie avancée',
        description: 'Modes, harmonisation, composition',
        xpReward: 65,
        requiredLevel: 3,
        dependencies: ['music_theory_basics', 'scales_pentatonic'],
        optional: true,
        completed: false,
        unlocked: false,
        category: 'bonus',
        estimatedTime: '3 semaines',
        position: { x: 950, y: 750 }
      },
      {
        id: 'guitar_maintenance',
        title: 'Entretien guitare',
        description: 'Changement de cordes, réglages, nettoyage',
        xpReward: 25,
        requiredLevel: 2,
        dependencies: ['anatomy'],
        optional: true,
        completed: false,
        unlocked: false,
        category: 'bonus',
        estimatedTime: '2 heures',
        position: { x: 950, y: 250 }
      }
    ]

    set({
      nodes: mockNodes,
      userXP: 0,
      userLevel: 1,
      completedNodes: [],
      activeNodeId: null
    })
  }
}))

export default useSkillTreeStore