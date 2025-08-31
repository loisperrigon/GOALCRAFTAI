import { Objective } from "@/stores/objectives-store";
import { guitarSkillNodes } from "./guitarSkillData";

// Convertir les nodes de guitare existants pour le nouveau format
const guitarSkillTree = {
  nodes: guitarSkillNodes.map((node) => ({
    ...node,
    position: node.position || { x: 0, y: 0 },
  })),
  edges: guitarSkillNodes.flatMap((node) =>
    node.dependencies.map((dep) => ({
      id: `${dep}-${node.id}`,
      source: dep,
      target: node.id,
    }))
  ),
};

export const mockObjectives: Objective[] = [
  {
    id: "1",
    title: "Apprendre la guitare",
    description: "Maîtriser les bases de la guitare acoustique en 3 mois",
    category: "learning",
    status: "active",
    progress: 35,
    xpReward: 500,
    difficulty: "medium",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date(),
    totalSteps: guitarSkillNodes.length,
    completedSteps: 3,
    aiGenerated: true,
    userPrompt: "Je veux apprendre à jouer de la guitare",
    skillTree: guitarSkillTree,
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
    description: "Perdre 10kg et gagner en endurance",
    category: "health",
    status: "active",
    progress: 60,
    xpReward: 400,
    difficulty: "hard",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date(),
    totalSteps: 12,
    completedSteps: 7,
    aiGenerated: false,
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
    title: "Projet entrepreneurial",
    description: "Lancer ma première application SaaS",
    category: "professional",
    status: "active",
    progress: 15,
    xpReward: 1000,
    difficulty: "expert",
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date(),
    totalSteps: 20,
    completedSteps: 3,
    aiGenerated: true,
    userPrompt: "Je veux créer une startup",
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
];
