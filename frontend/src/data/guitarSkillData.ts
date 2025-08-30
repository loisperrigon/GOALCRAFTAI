import { SkillNode } from '@/stores/skillTreeStore'

// Tous les nodes de l'arbre de compétences guitare avec leurs détails complets
export const guitarSkillNodes: SkillNode[] = [
  // ========== NIVEAU 1: DÉCOUVERTE ==========
  {
    id: 'first_guitar',
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
    position: { x: 600, y: 50 },
    details: {
      why: "Choisir la bonne guitare est crucial pour votre apprentissage. Une guitare adaptée à votre morphologie et vos goûts musicaux rendra la pratique plus agréable et efficace.",
      howTo: [
        "Définissez votre style musical préféré (classique, rock, folk)",
        "Testez plusieurs guitares en magasin pour sentir le confort",
        "Vérifiez l'action des cordes (hauteur par rapport au manche)",
        "Considérez votre budget (300-500€ pour débuter)"
      ],
      difficulty: 'Facile',
      tools: [
        {
          name: "Thomann Guide d'achat",
          type: 'website',
          url: "https://www.thomann.de/fr/guides/guitares-acoustiques",
          description: "Guide complet pour choisir sa première guitare"
        },
        {
          name: "Reverb Buying Guide",
          type: 'article',
          url: "https://reverb.com/news/buying-guide-how-to-choose-your-first-guitar",
          description: "Conseils détaillés sur le choix d'une guitare"
        }
      ],
      tips: [
        "🎸 Une guitare classique est plus facile pour débuter (cordes nylon)",
        "💰 Ne dépensez pas trop pour votre première guitare",
        "🛍️ Essayez toujours avant d'acheter si possible"
      ],
      milestones: [
        { title: "Rechercher les différents types de guitares", completed: false },
        { title: "Définir votre budget", completed: false },
        { title: "Tester au moins 3 guitares", completed: false },
        { title: "Acheter votre première guitare", completed: false }
      ]
    }
  },
  {
    id: 'holding_guitar',
    title: 'Posture & Tenue',
    description: 'Apprenez à tenir correctement votre guitare et votre médiator',
    xpReward: 15,
    requiredLevel: 1,
    dependencies: ['first_guitar'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'main',
    estimatedTime: '1 heure',
    position: { x: 400, y: 180 },
    details: {
      why: "Une bonne posture est la base de tout. Elle prévient les douleurs, améliore votre technique et vous permet de jouer plus longtemps sans fatigue.",
      howTo: [
        "Asseyez-vous droit, pieds à plat au sol",
        "Posez la guitare sur votre cuisse droite (ou gauche si classique)",
        "Gardez le manche légèrement incliné vers le haut",
        "Relâchez vos épaules et gardez les coudes près du corps"
      ],
      difficulty: 'Facile',
      tools: [
        {
          name: "JustinGuitar - Posture",
          type: 'video',
          url: "https://www.justinguitar.com/guitar-lessons/how-to-hold-a-guitar-bc-103",
          description: "Vidéo détaillée sur la posture correcte"
        },
        {
          name: "Guitar Tricks App",
          type: 'app',
          url: "https://www.guitartricks.com",
          description: "Application avec exercices de posture interactifs"
        }
      ],
      tips: [
        "📸 Filmez-vous pour vérifier votre posture",
        "🪑 Utilisez un tabouret sans accoudoirs",
        "⏱️ Faites des pauses toutes les 20 minutes au début"
      ],
      milestones: [
        { title: "Tenir la guitare confortablement assis", completed: false },
        { title: "Positionner correctement la main gauche", completed: false },
        { title: "Placer la main droite pour le picking", completed: false },
        { title: "Maintenir la posture 10 minutes sans douleur", completed: false }
      ]
    }
  },
  {
    id: 'tuning',
    title: 'Accorder sa guitare',
    description: 'Maîtrisez l\'accordage standard (E-A-D-G-B-E)',
    xpReward: 20,
    requiredLevel: 1,
    dependencies: ['first_guitar'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'main',
    estimatedTime: '30 min',
    position: { x: 600, y: 180 },
    details: {
      why: "Un instrument désaccordé rendra même les meilleures performances désagréables. Apprendre à accorder développe votre oreille musicale.",
      howTo: [
        "Mémorisez les notes: Mi-La-Ré-Sol-Si-Mi (EADGBE)",
        "Utilisez un accordeur électronique au début",
        "Apprenez la méthode de la 5ème frette",
        "Vérifiez l'accordage avant chaque session"
      ],
      difficulty: 'Facile',
      tools: [
        {
          name: "GuitarTuna",
          type: 'app',
          url: "https://yousician.com/guitartuna",
          description: "Application d'accordage gratuite et précise"
        },
        {
          name: "Fender Tune",
          type: 'app',
          url: "https://www.fender.com/tune",
          description: "Accordeur avec modes pour débutants"
        }
      ],
      tips: [
        "🎵 Toujours accorder en montant vers la note (pas en descendant)",
        "🔊 Accordez dans un endroit calme",
        "📱 Gardez un accordeur sur votre téléphone"
      ],
      milestones: [
        { title: "Mémoriser les notes des cordes", completed: false },
        { title: "Accorder avec un accordeur électronique", completed: false },
        { title: "Apprendre l'accordage à l'oreille", completed: false }
      ]
    }
  },
  {
    id: 'basic_chords',
    title: 'Accords de base',
    description: 'Apprenez les premiers accords essentiels (Em, G, C, D)',
    xpReward: 30,
    requiredLevel: 2,
    dependencies: ['holding_guitar', 'tuning'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'main',
    estimatedTime: '2 heures',
    position: { x: 500, y: 320 },
    details: {
      why: "Les accords de base sont le fondement de 90% des chansons. Maîtriser Do, Ré, Mi, Fa, Sol, La vous permettra de jouer des milliers de morceaux populaires.",
      howTo: [
        "Commencez par l'accord de Mi mineur (2 doigts seulement)",
        "Pratiquez les transitions Do-Sol 50 fois par jour",
        "Utilisez un métronome à 60 BPM pour les changements",
        "Grattez doucement pour entendre chaque corde clairement"
      ],
      difficulty: 'Moyen',
      tools: [
        {
          name: "Ultimate Guitar Chords",
          type: 'website',
          url: "https://www.ultimate-guitar.com/lessons",
          description: "Diagrammes d'accords interactifs"
        },
        {
          name: "Chord Bank App",
          type: 'app',
          url: "https://chordbank.com",
          description: "Application pour apprendre les accords avec feedback"
        },
        {
          name: "Marty Music",
          type: 'video',
          url: "https://www.youtube.com/c/MartyMusic",
          description: "Tutoriels vidéo pour accords débutants"
        }
      ],
      tips: [
        "🎯 Appuyez près des frettes pour un son clair",
        "💪 La douleur aux doigts est normale les 2 premières semaines",
        "🔄 Pratiquez les changements d'accords plus que les accords eux-mêmes"
      ],
      milestones: [
        { title: "Jouer un Mi mineur proprement", completed: false },
        { title: "Maîtriser les accords Do, Sol, Ré", completed: false },
        { title: "Enchaîner Do-Sol sans pause", completed: false },
        { title: "Jouer une progression I-V-vi-IV", completed: false }
      ]
    }
  },
  // Je vais continuer avec le reste des nodes...
  {
    id: 'strumming_patterns',
    title: 'Patterns de strumming',
    description: 'Maîtrisez différents rythmes et patterns',
    xpReward: 25,
    requiredLevel: 2,
    dependencies: ['basic_chords'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'main',
    estimatedTime: '3 heures',
    position: { x: 300, y: 460 },
    details: {
      why: "Le rythme est le cœur de la musique. Des patterns de strumming variés transforment des accords simples en musique captivante.",
      howTo: [
        "Commencez par bas-bas-haut-haut-bas-haut",
        "Comptez à voix haute: 1-2-3&4&",
        "Utilisez un métronome à 80 BPM",
        "Enregistrez-vous pour évaluer la régularité"
      ],
      difficulty: 'Moyen',
      tools: [
        {
          name: "Strumming Patterns Guide",
          type: 'website',
          url: "https://www.justinguitar.com/guitar-lessons/strumming-patterns",
          description: "Patterns progressifs avec exercices"
        },
        {
          name: "Rhythm Trainer",
          type: 'app',
          url: "https://www.rhythmtrainer.com",
          description: "Application pour développer le sens du rythme"
        }
      ],
      tips: [
        "🥁 Le mouvement du poignet doit être constant",
        "👻 Faites des 'ghost strums' (mouvements sans toucher)",
        "🎯 La régularité prime sur la vitesse"
      ],
      milestones: [
        { title: "Pattern basique down-up steady", completed: false },
        { title: "Jouer en croches régulières", completed: false },
        { title: "Maîtriser 5 patterns différents", completed: false },
        { title: "Improviser des variations rythmiques", completed: false }
      ]
    }
  },
  // Ajout des autres nodes avec leurs détails complets...
  {
    id: 'reading_tabs',
    title: 'Lecture de tablatures',
    description: 'Apprenez à lire et jouer des tablatures',
    xpReward: 20,
    requiredLevel: 2,
    dependencies: ['basic_chords'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'main',
    estimatedTime: '2 heures',
    position: { x: 700, y: 460 }
    // Les détails peuvent être ajoutés plus tard
  },
  {
    id: 'barre_chords_F',
    title: 'Accord Fa barré',
    description: 'Maîtrisez votre premier accord barré',
    xpReward: 40,
    requiredLevel: 3,
    dependencies: ['strumming_patterns', 'reading_tabs'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'main',
    estimatedTime: '1 semaine',
    position: { x: 500, y: 600 }
  },
  {
    id: 'fingerpicking',
    title: 'Fingerpicking',
    description: 'Technique de jeu aux doigts',
    xpReward: 35,
    requiredLevel: 3,
    dependencies: ['reading_tabs'],
    optional: true,
    completed: false,
    unlocked: false,
    category: 'bonus',
    estimatedTime: '2 semaines',
    position: { x: 800, y: 600 }
  },
  {
    id: 'power_chords',
    title: 'Power chords',
    description: 'Les accords du rock et du métal',
    xpReward: 30,
    requiredLevel: 3,
    dependencies: ['basic_chords'],
    optional: true,
    completed: false,
    unlocked: false,
    category: 'bonus',
    estimatedTime: '1 semaine',
    position: { x: 200, y: 600 }
  },
  {
    id: 'scales_pentatonic',
    title: 'Gamme pentatonique',
    description: 'Votre première gamme pour improviser',
    xpReward: 45,
    requiredLevel: 4,
    dependencies: ['barre_chords_F'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'main',
    estimatedTime: '3 semaines',
    position: { x: 400, y: 740 }
  },
  {
    id: 'blues_basics',
    title: 'Blues de base',
    description: 'Structure 12-bar et progression blues',
    xpReward: 35,
    requiredLevel: 4,
    dependencies: ['scales_pentatonic'],
    optional: true,
    completed: false,
    unlocked: false,
    category: 'bonus',
    estimatedTime: '2 semaines',
    position: { x: 150, y: 880 }
  },
  {
    id: 'music_theory',
    title: 'Théorie musicale',
    description: 'Comprendre la musique que vous jouez',
    xpReward: 50,
    requiredLevel: 5,
    dependencies: ['scales_pentatonic'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'main',
    estimatedTime: '1 mois',
    position: { x: 500, y: 880 }
  },
  {
    id: 'ear_training',
    title: 'Éducation de l\'oreille',
    description: 'Développez votre oreille musicale',
    xpReward: 45,
    requiredLevel: 5,
    dependencies: ['music_theory'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'main',
    estimatedTime: '6 semaines',
    position: { x: 650, y: 880 }
  },
  {
    id: 'recording_basics',
    title: 'Bases de l\'enregistrement',
    description: 'Enregistrez vos performances',
    xpReward: 30,
    requiredLevel: 4,
    dependencies: ['fingerpicking'],
    optional: true,
    completed: false,
    unlocked: false,
    category: 'bonus',
    estimatedTime: '1 semaine',
    position: { x: 850, y: 880 }
  },
  {
    id: 'speed_training',
    title: 'Entraînement vitesse',
    description: 'Développez votre technique et rapidité',
    xpReward: 60,
    requiredLevel: 6,
    dependencies: ['ear_training'],
    optional: true,
    completed: false,
    unlocked: false,
    category: 'challenge',
    estimatedTime: '2 mois',
    position: { x: 750, y: 1020 }
  },
  {
    id: 'final_concert',
    title: '🏆 Premier concert',
    description: 'Jouez en public pour la première fois !',
    xpReward: 100,
    requiredLevel: 6,
    dependencies: ['music_theory', 'ear_training'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'main',
    estimatedTime: '1 soirée',
    position: { x: 500, y: 1020 }
  }
]