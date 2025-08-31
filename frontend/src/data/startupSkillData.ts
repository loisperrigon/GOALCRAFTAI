import { SkillNode } from '@/stores/objective-store'

export const startupSkillNodes: SkillNode[] = [
  // Phase 1 : Idéation et Validation
  {
    id: 'market_research',
    title: '🔍 Étude de marché',
    description: 'Analyser le marché et identifier les opportunités',
    xpReward: 20,
    requiredLevel: 1,
    dependencies: [],
    optional: false,
    completed: true,
    unlocked: true,
    category: 'main',
    estimatedTime: '1 semaine',
    position: { x: 300, y: 50 },
    details: {
      why: "Comprendre le marché est crucial pour identifier une vraie opportunité business",
      howTo: [
        "Analyser les tendances du marché",
        "Identifier les concurrents principaux",
        "Définir votre avantage compétitif",
        "Estimer la taille du marché"
      ],
      difficulty: 'Moyen',
      tools: [
        {
          name: "Google Trends",
          type: 'website',
          url: "https://trends.google.com",
          description: "Analyser les tendances de recherche"
        },
        {
          name: "Statista",
          type: 'website',
          url: "https://www.statista.com",
          description: "Statistiques et données de marché"
        },
        {
          name: "SimilarWeb",
          type: 'website',
          url: "https://www.similarweb.com",
          description: "Analyser le trafic des concurrents"
        }
      ],
      tips: [
        "🎯 Focalisez-vous sur un problème spécifique",
        "💬 Parlez à au moins 20 clients potentiels",
        "📊 Documentez toutes vos découvertes"
      ],
      milestones: [
        { title: "Analyse concurrentielle complète", completed: true },
        { title: "20 interviews clients", completed: false },
        { title: "Business model défini", completed: false }
      ]
    }
  },
  {
    id: 'value_proposition',
    title: '💡 Proposition de valeur',
    description: 'Définir votre proposition de valeur unique',
    xpReward: 25,
    requiredLevel: 1,
    dependencies: ['market_research'],
    optional: false,
    completed: false,
    unlocked: true,
    category: 'main',
    estimatedTime: '3 jours',
    position: { x: 200, y: 150 }
  },
  {
    id: 'target_audience',
    title: '🎯 Persona client',
    description: 'Créer des personas détaillés de vos clients cibles',
    xpReward: 20,
    requiredLevel: 1,
    dependencies: ['market_research'],
    optional: false,
    completed: false,
    unlocked: true,
    category: 'main',
    estimatedTime: '2 jours',
    position: { x: 400, y: 150 }
  },
  
  // Phase 2 : Business Plan
  {
    id: 'business_plan',
    title: '📋 Business Plan',
    description: 'Rédiger un business plan complet',
    xpReward: 35,
    requiredLevel: 2,
    dependencies: ['value_proposition', 'target_audience'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'main',
    estimatedTime: '1 semaine',
    position: { x: 300, y: 250 }
  },
  {
    id: 'financial_model',
    title: '💰 Modèle financier',
    description: 'Créer des projections financières sur 3 ans',
    xpReward: 30,
    requiredLevel: 2,
    dependencies: ['business_plan'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'main',
    estimatedTime: '3 jours',
    position: { x: 200, y: 350 }
  },
  {
    id: 'pitch_deck',
    title: '🎤 Pitch Deck',
    description: 'Créer une présentation pour les investisseurs',
    xpReward: 25,
    requiredLevel: 2,
    dependencies: ['business_plan'],
    optional: true,
    completed: false,
    unlocked: false,
    category: 'bonus',
    estimatedTime: '2 jours',
    position: { x: 400, y: 350 }
  },
  
  // Phase 3 : MVP
  {
    id: 'wireframes',
    title: '🎨 Wireframes',
    description: 'Dessiner les maquettes de votre produit',
    xpReward: 25,
    requiredLevel: 3,
    dependencies: ['business_plan'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'main',
    estimatedTime: '3 jours',
    position: { x: 150, y: 450 }
  },
  {
    id: 'tech_stack',
    title: '⚙️ Stack technique',
    description: 'Choisir les technologies pour votre MVP',
    xpReward: 20,
    requiredLevel: 3,
    dependencies: ['wireframes'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'main',
    estimatedTime: '1 jour',
    position: { x: 300, y: 450 }
  },
  {
    id: 'mvp_development',
    title: '🚀 Développement MVP',
    description: 'Construire votre Minimum Viable Product',
    xpReward: 50,
    requiredLevel: 4,
    dependencies: ['tech_stack'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'main',
    estimatedTime: '1 mois',
    position: { x: 450, y: 450 }
  },
  
  // Phase 4 : Launch
  {
    id: 'beta_testing',
    title: '🧪 Beta Testing',
    description: 'Tester avec un groupe de beta testeurs',
    xpReward: 30,
    requiredLevel: 5,
    dependencies: ['mvp_development'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'main',
    estimatedTime: '2 semaines',
    position: { x: 300, y: 550 }
  },
  {
    id: 'marketing_campaign',
    title: '📢 Campagne marketing',
    description: 'Lancer votre première campagne marketing',
    xpReward: 35,
    requiredLevel: 5,
    dependencies: ['beta_testing'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'main',
    estimatedTime: '1 semaine',
    position: { x: 200, y: 650 }
  },
  {
    id: 'product_launch',
    title: '🎉 Lancement officiel',
    description: 'Lancer officiellement votre produit',
    xpReward: 100,
    requiredLevel: 6,
    dependencies: ['marketing_campaign'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'main',
    estimatedTime: '1 jour',
    position: { x: 300, y: 750 }
  },
  {
    id: 'first_customers',
    title: '💎 Premiers clients',
    description: 'Obtenir vos 5 premiers clients payants',
    xpReward: 75,
    requiredLevel: 6,
    dependencies: ['product_launch'],
    optional: false,
    completed: false,
    unlocked: false,
    category: 'challenge',
    estimatedTime: '2 semaines',
    position: { x: 400, y: 650 }
  }
]