import { Objective } from "@/stores/objective-store";

export const englishObjective: Objective = {
  id: "4",
  title: "🚀 Maîtriser l'anglais",
  description: "Passer de débutant complet à un niveau conversationnel solide en anglais",
  category: "learning",
  status: "active",
  progress: 0,
  xpReward: 2150,
  xpEarned: 0,
  difficulty: "medium",
  createdAt: new Date("2024-01-10"),
  updatedAt: new Date(),
  totalSteps: 17,
  completedSteps: 0,
  aiGenerated: true,
  userPrompt: "Je veux apprendre l'anglais de zéro",
  metadata: {
    estimatedDuration: "8-12 mois",
    nextMilestone: "Maîtriser l'alphabet et les sons",
    category: "Langues & Communication",
    tags: ["anglais", "langues", "communication", "international"],
    weeklyHours: 5,
    prerequisites: ["Aucun - conçu pour les vrais débutants"],
    finalReward: "Capacité à tenir une conversation de 20 minutes en anglais",
    motivation: "L'anglais va ouvrir des portes incroyables dans ta vie personnelle et professionnelle !"
  },
  milestones: [
    {
      id: "m1-eng",
      title: "🌱 Premiers mots magiques",
      description: "Maîtriser les bases absolues : alphabet, nombres, salutations",
      completed: false,
      order: 1
    },
    {
      id: "m2-eng",
      title: "🗣️ Premières conversations",
      description: "Pouvoir se présenter et poser des questions simples",
      completed: false,
      order: 2
    },
    {
      id: "m3-eng",
      title: "📚 Construction solide",
      description: "Comprendre et utiliser les temps de base correctement",
      completed: false,
      order: 3
    },
    {
      id: "m4-eng",
      title: "🎯 Communication fluide",
      description: "Tenir des conversations naturelles sur des sujets du quotidien",
      completed: false,
      order: 4
    }
  ],
  skillTree: {
    nodes: [
      {
        id: "alphabet-sounds",
        title: "🔤 Alphabet et sons anglais",
        description: "Apprendre l'alphabet anglais et la prononciation des lettres",
        xpReward: 50,
        requiredLevel: 1,
        dependencies: [],
        optional: false,
        completed: false,
        unlocked: true,
        category: "main",
        estimatedTime: "3-5 jours",
        position: { x: 100, y: 50 },
        details: {
          why: "L'alphabet anglais est la base de tout apprentissage de la langue",
          howTo: [
            "Écouter l'alphabet chanté 5 fois",
            "Répéter chaque lettre à voix haute",
            "Épeler ton prénom en anglais"
          ],
          difficulty: "Facile",
          tools: [
            {
              name: "YouTube - Alphabet Song",
              type: "video",
              url: "https://www.youtube.com/watch?v=75p-N9YKqNo",
              description: "Chanson de l'alphabet en anglais"
            },
            {
              name: "Duolingo",
              type: "app",
              url: "https://www.duolingo.com/course/en/fr",
              description: "Application gratuite d'apprentissage"
            }
          ],
          tips: ["🎵 Utilise la chanson de l'alphabet - c'est magique pour mémoriser !"],
          milestones: [
            { title: "Connaître les 26 lettres", completed: false },
            { title: "Épeler 5 mots simples", completed: false },
            { title: "Reconnaître les sons", completed: false }
          ]
        }
      },
      {
        id: "basic-greetings",
        title: "👋 Salutations et politesse",
        description: "Maîtriser les salutations de base et les formules de politesse",
        xpReward: 75,
        requiredLevel: 1,
        dependencies: ["alphabet-sounds"],
        optional: false,
        completed: false,
        unlocked: false,
        category: "main",
        estimatedTime: "1 semaine",
        position: { x: 250, y: 50 },
        details: {
          why: "Les salutations sont essentielles pour toute interaction sociale",
          howTo: [
            "Apprendre 10 salutations différentes",
            "Pratiquer 'Hello, how are you?' avec différentes intonations",
            "Utiliser 'please', 'thank you', 'excuse me' dans 5 situations"
          ],
          difficulty: "Facile",
          tools: [
            {
              name: "BBC Learning English",
              type: "website",
              url: "https://www.bbc.co.uk/learningenglish/course/lower-intermediate/unit-1",
              description: "Cours gratuit de la BBC"
            }
          ],
          tips: ["😊 Souris en parlant ! Ça rend l'anglais plus naturel et sympathique"],
          milestones: [
            { title: "10 salutations mémorisées", completed: false },
            { title: "Formules de politesse maîtrisées", completed: false }
          ]
        }
      },
      {
        id: "numbers-time",
        title: "🔢 Nombres et heure",
        description: "Compter, dire l'heure et utiliser les nombres dans la vie quotidienne",
        xpReward: 100,
        requiredLevel: 1,
        dependencies: ["basic-greetings"],
        optional: false,
        completed: false,
        unlocked: false,
        category: "main",
        estimatedTime: "1-2 semaines",
        position: { x: 400, y: 50 }
      },
      {
        id: "personal-intro",
        title: "🙋‍♂️ Se présenter",
        description: "Être capable de se présenter complètement en anglais",
        xpReward: 125,
        requiredLevel: 2,
        dependencies: ["numbers-time"],
        optional: false,
        completed: false,
        unlocked: false,
        category: "main",
        estimatedTime: "1 semaine",
        position: { x: 100, y: 150 }
      },
      {
        id: "basic-questions",
        title: "❓ Questions essentielles",
        description: "Poser et répondre aux questions de base (who, what, where, when, why, how)",
        xpReward: 150,
        requiredLevel: 2,
        dependencies: ["personal-intro"],
        optional: false,
        completed: false,
        unlocked: false,
        category: "main",
        estimatedTime: "2 semaines",
        position: { x: 250, y: 150 }
      },
      {
        id: "present-simple",
        title: "⏰ Present Simple",
        description: "Maîtriser le temps présent simple pour parler de ses habitudes",
        xpReward: 175,
        requiredLevel: 3,
        dependencies: ["basic-questions"],
        optional: false,
        completed: false,
        unlocked: false,
        category: "main",
        estimatedTime: "2-3 semaines",
        position: { x: 400, y: 150 }
      },
      {
        id: "vocabulary-daily",
        title: "🏠 Vocabulaire quotidien",
        description: "Apprendre 200 mots essentiels de la vie quotidienne",
        xpReward: 200,
        requiredLevel: 3,
        dependencies: ["present-simple"],
        optional: false,
        completed: false,
        unlocked: false,
        category: "main",
        estimatedTime: "3-4 semaines",
        position: { x: 100, y: 250 }
      },
      {
        id: "past-simple",
        title: "📅 Past Simple",
        description: "Raconter des événements passés avec le prétérit simple",
        xpReward: 200,
        requiredLevel: 4,
        dependencies: ["vocabulary-daily"],
        optional: false,
        completed: false,
        unlocked: false,
        category: "main",
        estimatedTime: "3 semaines",
        position: { x: 250, y: 250 }
      },
      {
        id: "future-plans",
        title: "🔮 Future et projets",
        description: "Parler de ses projets futurs avec 'will' et 'going to'",
        xpReward: 175,
        requiredLevel: 4,
        dependencies: ["past-simple"],
        optional: false,
        completed: false,
        unlocked: false,
        category: "main",
        estimatedTime: "2 semaines",
        position: { x: 400, y: 250 }
      },
      {
        id: "conversations-basics",
        title: "💬 Conversations de base",
        description: "Tenir des conversations simples sur des sujets familiers",
        xpReward: 250,
        requiredLevel: 5,
        dependencies: ["future-plans"],
        optional: false,
        completed: false,
        unlocked: false,
        category: "main",
        estimatedTime: "4 semaines",
        position: { x: 100, y: 350 }
      },
      {
        id: "listening-skills",
        title: "👂 Compréhension orale",
        description: "Comprendre l'anglais parlé à vitesse normale sur des sujets simples",
        xpReward: 200,
        requiredLevel: 5,
        dependencies: ["conversations-basics"],
        optional: false,
        completed: false,
        unlocked: false,
        category: "main",
        estimatedTime: "6 semaines",
        position: { x: 250, y: 350 }
      },
      {
        id: "reading-comprehension",
        title: "📖 Lecture et compréhension",
        description: "Lire et comprendre des textes simples sur des sujets variés",
        xpReward: 175,
        requiredLevel: 6,
        dependencies: ["listening-skills"],
        optional: false,
        completed: false,
        unlocked: false,
        category: "main",
        estimatedTime: "4 semaines",
        position: { x: 400, y: 350 }
      },
      {
        id: "writing-basics",
        title: "✍️ Expression écrite",
        description: "Écrire des textes courts et clairs sur des sujets personnels",
        xpReward: 200,
        requiredLevel: 6,
        dependencies: ["reading-comprehension"],
        optional: false,
        completed: false,
        unlocked: false,
        category: "main",
        estimatedTime: "5 semaines",
        position: { x: 100, y: 450 }
      },
      {
        id: "pronunciation-accent",
        title: "🎤 Prononciation et accent",
        description: "Améliorer sa prononciation pour être mieux compris",
        xpReward: 150,
        requiredLevel: 3,
        dependencies: ["basic-questions"],
        optional: true,
        completed: false,
        unlocked: false,
        category: "bonus",
        estimatedTime: "6 semaines",
        position: { x: 550, y: 200 }
      },
      {
        id: "cultural-knowledge",
        title: "🌍 Culture anglophone",
        description: "Découvrir les cultures des pays anglophones",
        xpReward: 100,
        requiredLevel: 4,
        dependencies: ["vocabulary-daily"],
        optional: true,
        completed: false,
        unlocked: false,
        category: "bonus",
        estimatedTime: "3 semaines",
        position: { x: 550, y: 300 }
      },
      {
        id: "business-english",
        title: "💼 Anglais professionnel",
        description: "Maîtriser l'anglais dans un contexte professionnel basique",
        xpReward: 175,
        requiredLevel: 7,
        dependencies: ["writing-basics"],
        optional: true,
        completed: false,
        unlocked: false,
        category: "bonus",
        estimatedTime: "4 semaines",
        position: { x: 550, y: 400 }
      },
      {
        id: "fluency-challenge",
        title: "🏆 Défi fluidité ultime",
        description: "Tenir une conversation de 20 minutes sur n'importe quel sujet courant",
        xpReward: 300,
        requiredLevel: 8,
        dependencies: ["writing-basics", "listening-skills"],
        optional: false,
        completed: false,
        unlocked: false,
        category: "challenge",
        estimatedTime: "2 mois",
        position: { x: 250, y: 550 }
      }
    ],
    edges: [
      { id: "e1", source: "alphabet-sounds", target: "basic-greetings" },
      { id: "e2", source: "basic-greetings", target: "numbers-time" },
      { id: "e3", source: "numbers-time", target: "personal-intro" },
      { id: "e4", source: "personal-intro", target: "basic-questions" },
      { id: "e5", source: "basic-questions", target: "present-simple" },
      { id: "e6", source: "basic-questions", target: "pronunciation-accent" },
      { id: "e7", source: "present-simple", target: "vocabulary-daily" },
      { id: "e8", source: "vocabulary-daily", target: "past-simple" },
      { id: "e9", source: "vocabulary-daily", target: "cultural-knowledge" },
      { id: "e10", source: "past-simple", target: "future-plans" },
      { id: "e11", source: "future-plans", target: "conversations-basics" },
      { id: "e12", source: "conversations-basics", target: "listening-skills" },
      { id: "e13", source: "listening-skills", target: "reading-comprehension" },
      { id: "e14", source: "reading-comprehension", target: "writing-basics" },
      { id: "e15", source: "writing-basics", target: "business-english" },
      { id: "e16", source: "writing-basics", target: "fluency-challenge" },
      { id: "e17", source: "listening-skills", target: "fluency-challenge" }
    ]
  }
};