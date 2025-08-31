import { SkillNode } from '@/stores/objective-store'

export const fitnessSkillNodes: SkillNode[] = [
  // Semaine 1-2 : Fondations
  {
    id: 'health_assessment',
    title: '🏥 Bilan de santé',
    description: 'Faire un check-up et définir vos objectifs',
    xpReward: 15,
    requiredLevel: 1,
    dependencies: [],
    optional: false,
    completed: true,
    unlocked: true,
    category: 'main',
    estimatedTime: '1 jour',
    position: { x: 250, y: 50 },
    details: {
      why: "Connaître votre état de santé initial est essentiel pour un programme sûr et efficace",
      howTo: [
        "Prendre rendez-vous avec votre médecin",
        "Mesurer votre poids, taille, tour de taille",
        "Noter vos habitudes alimentaires actuelles",
        "Définir des objectifs réalistes"
      ],
      difficulty: 'Facile',
      tools: [
        {
          name: "MyFitnessPal",
          type: 'app',
          url: "https://www.myfitnesspal.com",
          description: "Application de suivi nutritionnel"
        },
        {
          name: "Calculateur IMC",
          type: 'website',
          url: "https://www.calculersonimc.fr",
          description: "Calculez votre indice de masse corporelle"
        }
      ],
      tips: [
        "📷 Prenez des photos 'avant' pour votre motivation",
        "📊 Notez toutes vos mesures dans un carnet",
        "🎯 Fixez-vous des objectifs SMART"
      ],
      milestones: [
        { title: "Rendez-vous médical pris", completed: true },
        { title: "Mesures initiales notées", completed: true },
        { title: "Objectifs définis", completed: false }
      ]
    }
  },
  {
    id: 'nutrition_basics',
    title: '🥗 Bases de la nutrition',
    description: 'Comprendre les macronutriments et créer un plan alimentaire',
    xpReward: 20,
    requiredLevel: 1,
    dependencies: ['health_assessment'],
    optional: false,
    completed: true,
    unlocked: true,
    category: 'main',
    estimatedTime: '3 jours',
    position: { x: 250, y: 150 }
  },
  {
    id: 'first_workout',
    title: '💪 Premier entraînement',
    description: 'Découvrir les exercices de base',
    xpReward: 25,
    requiredLevel: 1,
    dependencies: ['health_assessment'],
    optional: false,
    completed: false,
    unlocked: true,
    category: 'main',
    estimatedTime: '1 heure',
    position: { x: 450, y: 150 }
  },
  
  // Semaine 3-4 : Routine
  {
    id: 'workout_routine',
    title: '📅 Créer une routine',
    description: 'Établir un programme d\'entraînement hebdomadaire',
    xpReward: 30,
    requiredLevel: 2,
    dependencies: ['first_workout', 'nutrition_basics'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'main',
    estimatedTime: '1 semaine',
    position: { x: 350, y: 250 }
  },
  {
    id: 'cardio_intro',
    title: '🏃 Introduction au cardio',
    description: 'Commencer avec 20 minutes de cardio',
    xpReward: 20,
    requiredLevel: 2,
    dependencies: ['first_workout'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'main',
    estimatedTime: '30 minutes',
    position: { x: 550, y: 250 }
  },
  {
    id: 'meal_prep',
    title: '🍱 Meal Prep',
    description: 'Préparer vos repas pour la semaine',
    xpReward: 25,
    requiredLevel: 2,
    dependencies: ['nutrition_basics'],
    optional: true,
    completed: false,
    unlocked: false,
    category: 'bonus',
    estimatedTime: '2 heures',
    position: { x: 150, y: 250 }
  },
  
  // Mois 2 : Intensification
  {
    id: 'strength_training',
    title: '🏋️ Musculation',
    description: 'Ajouter des poids à votre routine',
    xpReward: 35,
    requiredLevel: 3,
    dependencies: ['workout_routine'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'main',
    estimatedTime: '2 semaines',
    position: { x: 350, y: 350 }
  },
  {
    id: 'hiit_training',
    title: '⚡ HIIT Training',
    description: 'Entraînement par intervalles haute intensité',
    xpReward: 40,
    requiredLevel: 4,
    dependencies: ['cardio_intro'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'challenge',
    estimatedTime: '45 minutes',
    position: { x: 550, y: 350 }
  },
  {
    id: 'flexibility',
    title: '🧘 Flexibilité',
    description: 'Ajouter du yoga ou des étirements',
    xpReward: 20,
    requiredLevel: 3,
    dependencies: ['workout_routine'],
    optional: true,
    completed: false,
    unlocked: false,
    category: 'bonus',
    estimatedTime: '30 minutes/jour',
    position: { x: 150, y: 350 }
  },
  
  // Mois 3 : Objectif final
  {
    id: 'first_5k',
    title: '🏃‍♂️ Courir 5km',
    description: 'Participer à votre première course',
    xpReward: 50,
    requiredLevel: 5,
    dependencies: ['hiit_training'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'challenge',
    estimatedTime: '35 minutes',
    position: { x: 550, y: 450 }
  },
  {
    id: 'goal_weight',
    title: '⚖️ Poids cible atteint',
    description: 'Atteindre votre objectif de poids',
    xpReward: 100,
    requiredLevel: 6,
    dependencies: ['strength_training', 'first_5k'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'main',
    estimatedTime: '3 mois total',
    position: { x: 450, y: 550 }
  }
]