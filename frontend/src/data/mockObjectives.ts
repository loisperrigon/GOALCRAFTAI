import { Objective } from "@/stores/objective-store";
import { guitarSkillNodes } from "./guitarSkillData";
import { fitnessSkillNodes } from "./fitnessSkillData";
import { startupSkillNodes } from "./startupSkillData";
import { englishObjective } from "./englishObjective";

// Fonction helper pour créer les skill trees
const createSkillTree = (nodes: any[]) => ({
  nodes: nodes.map((node) => ({
    ...node,
    position: node.position || { x: 0, y: 0 },
  })),
  edges: nodes.flatMap((node) =>
    node.dependencies.map((dep) => ({
      id: `${dep}-${node.id}`,
      source: dep,
      target: node.id,
    }))
  ),
});

const guitarSkillTree = createSkillTree(guitarSkillNodes);
const fitnessSkillTree = createSkillTree(fitnessSkillNodes);
const startupSkillTree = createSkillTree(startupSkillNodes);

export const mockObjectives: Objective[] = [
  {
    id: "1",
    title: "Apprendre la guitare",
    description: "Maîtriser les bases de la guitare acoustique en 3 mois",
    category: "learning",
    status: "active",
    progress: 25, // 3 étapes sur 12 complétées
    xpReward: 445, // Total XP possible
    xpEarned: 60, // XP déjà gagné
    difficulty: "medium",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date(),
    totalSteps: 12,
    completedSteps: 3,
    aiGenerated: true,
    userPrompt: "Je veux apprendre à jouer de la guitare",
    skillTree: guitarSkillTree,
    metadata: {
      estimatedDuration: "3 mois",
      nextMilestone: "Jouer votre première chanson",
      category: "Musique & Arts",
      tags: ["musique", "guitare", "créativité"],
      weeklyHours: 7
    },
    milestones: [
      {
        id: "m1",
        title: "Premiers accords maîtrisés",
        description: "Apprendre Do, Ré, Mi, Sol, La",
        completed: true,
        completedAt: new Date("2024-02-01"),
        order: 1,
      },
      {
        id: "m2",
        title: "Première chanson complète",
        description: "Jouer une chanson simple du début à la fin",
        completed: false,
        order: 2,
      },
      {
        id: "m3",
        title: "Techniques avancées",
        description: "Maîtriser le fingerpicking et les barrés",
        completed: false,
        order: 3,
      },
    ],
  },
  {
    id: "2",
    title: "Remise en forme",
    description: "Perdre 10kg et gagner en endurance en 3 mois",
    category: "health",
    status: "active",
    progress: 18, // 2 étapes sur 11
    xpReward: 365, // Total XP possible
    xpEarned: 35, // XP déjà gagné
    difficulty: "hard",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date(),
    totalSteps: 11,
    completedSteps: 2,
    aiGenerated: true,
    userPrompt: "Je veux perdre 10kg et être en meilleure forme",
    skillTree: fitnessSkillTree,
    metadata: {
      estimatedDuration: "3 mois",
      nextMilestone: "Premier entraînement",
      category: "Santé & Fitness",
      tags: ["fitness", "santé", "nutrition"],
      weeklyHours: 10,
      caloriesGoal: -500
    },
    milestones: [
      {
        id: "m4",
        title: "Routine établie",
        description: "3 séances par semaine pendant 1 mois",
        completed: true,
        completedAt: new Date("2024-02-20"),
        order: 1,
      },
      {
        id: "m5",
        title: "5kg perdus",
        description: "Atteindre le premier palier",
        completed: true,
        order: 2,
      },
      {
        id: "m6",
        title: "Objectif final",
        description: "Atteindre le poids cible",
        completed: false,
        order: 3,
      },
    ],
  },
  {
    id: "3",
    title: "Lancer ma startup",
    description: "Créer et lancer une application SaaS de A à Z",
    category: "professional",
    status: "active",
    progress: 8, // 1 étape sur 13
    xpReward: 450, // Total XP possible
    xpEarned: 20, // XP déjà gagné
    difficulty: "expert",
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date(),
    totalSteps: 13,
    completedSteps: 1,
    aiGenerated: true,
    userPrompt: "Je veux créer une startup SaaS",
    skillTree: startupSkillTree,
    metadata: {
      estimatedDuration: "6 mois",
      nextMilestone: "Proposition de valeur définie",
      category: "Business & Entrepreneuriat",
      tags: ["startup", "saas", "business"],
      weeklyHours: 20,
      investmentNeeded: "10000€"
    },
    milestones: [
      {
        id: "m7",
        title: "Idée validée",
        description: "Validation du concept avec 10 utilisateurs potentiels",
        completed: true,
        order: 1,
      },
      {
        id: "m8",
        title: "MVP développé",
        description: "Version minimale fonctionnelle",
        completed: false,
        order: 2,
      },
      {
        id: "m9",
        title: "Premiers clients",
        description: "Obtenir 5 clients payants",
        completed: false,
        order: 3,
      },
    ],
  },
  englishObjective, // Ajouter l'objectif anglais directement
];
