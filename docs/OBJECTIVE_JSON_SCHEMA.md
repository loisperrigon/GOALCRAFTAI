# 📋 Documentation - Structure JSON pour les Objectifs Gamifiés

## Vue d'ensemble

Cette documentation définit la structure JSON attendue pour créer un parcours d'apprentissage gamifié. L'IA doit générer un arbre de compétences structuré avec des étapes progressives, des dépendances logiques et des informations détaillées pour chaque node.

## 🎯 Principes de conception

1. **Progression logique** : Les étapes doivent suivre un ordre naturel d'apprentissage
2. **Dépendances claires** : Chaque étape débloque les suivantes de manière cohérente
3. **Motivation intégrée** : XP, badges et milestones pour maintenir l'engagement
4. **Flexibilité** : Inclure des chemins optionnels et des défis bonus
5. **Réalisme** : Estimations de temps réalistes et difficultés appropriées

## 📊 Structure complète du JSON

```typescript
interface ObjectiveResponse {
  id: string                    // Identifiant unique de l'objectif
  title: string                 // Titre principal de l'objectif
  description: string           // Description motivante
  category: 'personal' | 'professional' | 'health' | 'learning' | 'creative' | 'social' | 'financial' | 'other'
  status: 'active' | 'completed' | 'paused' | 'abandoned'
  progress: number              // Pourcentage de progression (0-100)
  xpReward: number              // Total XP possible pour cet objectif
  xpEarned?: number             // XP déjà gagné
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  createdAt?: Date
  updatedAt?: Date
  completedAt?: Date
  totalSteps: number            // Nombre total d'étapes
  completedSteps: number        // Nombre d'étapes complétées
  aiGenerated?: boolean         // Si généré par l'IA
  userPrompt?: string           // Prompt original de l'utilisateur
  milestones: Milestone[]       // Jalons principaux de l'objectif
  skillTree: {
    nodes: SkillNode[]          // Array des étapes détaillées
    edges: Edge[]               // Connexions entre les nodes
  }
  metadata?: ObjectiveMetadata  // Métadonnées enrichies
}

interface SkillNode {
  // === CHAMPS OBLIGATOIRES ===
  id: string                   // Identifiant unique (ex: "basics_1", "advanced_5")
  title: string                // Titre court et accrocheur (max 50 caractères)
  description: string          // Description concise (max 150 caractères)
  xpReward: number            // Points d'XP gagnés (10-100 selon difficulté)
  requiredLevel: number       // Niveau requis pour débloquer (1-10)
  dependencies: string[]      // IDs des prérequis (peut être vide [])
  optional: boolean           // Si l'étape est optionnelle
  completed: boolean          // Toujours false au départ
  unlocked: boolean          // true si dependencies.length === 0
  category: 'main' | 'bonus' | 'challenge'  // Type d'étape
  
  // === CHAMPS OPTIONNELS MAIS RECOMMANDÉS ===
  estimatedTime?: string      // Durée estimée (ex: "2 heures", "1 semaine")
  icon?: string              // Emoji représentatif (optionnel)
  position?: {                // Position dans l'arbre (OPTIONNEL - géré automatiquement par dagre)
    x: number
    y: number
  }
  
  // === DÉTAILS ENRICHIS (OBLIGATOIRES pour une bonne UX) ===
  details: NodeDetails
}

interface NodeDetails {
  why: string                 // Pourquoi cette étape est importante (100-200 mots)
  howTo: string[]            // 4-6 étapes concrètes pour réussir
  difficulty: 'Facile' | 'Moyen' | 'Difficile'
  tools: Tool[]              // 2-4 ressources recommandées
  tips: string[]             // 3-5 conseils pratiques avec emojis
  milestones: Milestone[]    // 3-4 jalons de progression
}

interface Tool {
  name: string               // Nom de la ressource
  type: 'app' | 'website' | 'video' | 'article'
  url: string                // Lien vers la ressource
  description: string        // Description courte (max 100 caractères)
}

interface Milestone {
  id: string                 // Identifiant unique du milestone
  title: string              // Titre du jalon (max 50 caractères)
  description?: string       // Description détaillée optionnelle
  completed: boolean         // Toujours false au départ
  completedAt?: Date         // Date de complétion
  order: number              // Ordre d'affichage (1, 2, 3...)
}

interface Edge {
  id: string                 // Identifiant unique de la connexion
  source: string             // ID du node source
  target: string             // ID du node cible
}

interface ObjectiveMetadata {
  estimatedDuration?: string     // Durée totale estimée ("3 mois", "6 semaines")
  nextMilestone?: string        // Prochain jalon à atteindre
  category?: string             // Catégorie détaillée ("Musique & Arts")
  tags?: string[]               // Tags pour recherche et filtrage
  weeklyHours?: number          // Heures par semaine recommandées
  caloriesGoal?: number         // Pour objectifs fitness
  investmentNeeded?: string     // Budget nécessaire
  prerequisites?: string[]      // Prérequis avant de commencer
  targetAudience?: string       // Public cible
  [key: string]: any           // Champs personnalisés selon le domaine
}
```

## 🎮 Exemple complet d'un objectif

```json
{
  "id": "obj-guitar-2024",
  "title": "Apprendre la guitare",
  "description": "Maîtriser les bases de la guitare acoustique en 3 mois",
  "category": "learning",
  "status": "active",
  "progress": 25,
  "xpReward": 445,
  "xpEarned": 60,
  "difficulty": "medium",
  "totalSteps": 12,
  "completedSteps": 3,
  "aiGenerated": true,
  "userPrompt": "Je veux apprendre à jouer de la guitare",
  "metadata": {
    "estimatedDuration": "3 mois",
    "nextMilestone": "Jouer votre première chanson",
    "category": "Musique & Arts",
    "tags": ["musique", "guitare", "créativité", "instrument"],
    "weeklyHours": 7,
    "prerequisites": ["Avoir une guitare", "30min par jour disponible"],
    "targetAudience": "Débutants complets"
  },
  "milestones": [
    {
      "id": "m1",
      "title": "Premiers accords maîtrisés",
      "description": "Apprendre Do, Ré, Mi, Sol, La",
      "completed": true,
      "completedAt": "2024-02-01T10:00:00Z",
      "order": 1
    },
    {
      "id": "m2",
      "title": "Première chanson complète",
      "description": "Jouer une chanson simple du début à la fin",
      "completed": false,
      "order": 2
    }
  ],
  "skillTree": {
    "nodes": [/* Voir exemple de node ci-dessous */],
    "edges": [
      {
        "id": "edge-1",
        "source": "holding_guitar",
        "target": "basic_chords"
      }
    ]
  }
}
```

## 📦 Exemple d'un node dans le skillTree

```json
{
  "id": "basic_chords",
  "title": "Accords de base",
  "description": "Apprenez les premiers accords essentiels (Em, G, C, D)",
  "xpReward": 30,
  "requiredLevel": 2,
  "dependencies": ["holding_guitar", "tuning"],
  "optional": false,
  "completed": false,
  "unlocked": false,
  "category": "main",
  "estimatedTime": "2 semaines",
  "details": {
    "why": "Les accords de base sont le fondement de 90% des chansons. Maîtriser Do, Ré, Mi, Sol vous permettra de jouer des milliers de morceaux populaires et de rapidement impressionner vos amis.",
    "howTo": [
      "Commencez par l'accord de Mi mineur (2 doigts seulement)",
      "Pratiquez les transitions Do-Sol 50 fois par jour",
      "Utilisez un métronome à 60 BPM pour les changements",
      "Grattez doucement pour entendre chaque corde clairement",
      "Enregistrez-vous pour évaluer votre progression"
    ],
    "difficulty": "Moyen",
    "tools": [
      {
        "name": "Ultimate Guitar",
        "type": "website",
        "url": "https://www.ultimate-guitar.com",
        "description": "Diagrammes d'accords interactifs et tablatures"
      },
      {
        "name": "JustinGuitar",
        "type": "video",
        "url": "https://www.youtube.com/justinguitar",
        "description": "Cours vidéo gratuits pour débutants"
      }
    ],
    "tips": [
      "🎯 Appuyez près des frettes pour un son clair",
      "💪 La douleur aux doigts est normale les 2 premières semaines",
      "🔄 Pratiquez les changements d'accords plus que les accords eux-mêmes",
      "📱 Utilisez une app pour vérifier que vos accords sonnent juste"
    ],
    "milestones": [
      { "title": "Jouer un Mi mineur proprement", "completed": false },
      { "title": "Maîtriser les accords Do, Sol, Ré", "completed": false },
      { "title": "Enchaîner Do-Sol sans pause", "completed": false },
      { "title": "Jouer votre première chanson", "completed": false }
    ]
  }
}
```

## 🌳 Règles de construction de l'arbre

### 1. Structure hiérarchique
- **Niveau 1** : Découverte (1-3 nodes fondamentaux)
- **Niveau 2-3** : Bases (4-6 nodes essentiels)
- **Niveau 4-5** : Intermédiaire (5-7 nodes de développement)
- **Niveau 6+** : Avancé (nodes de perfectionnement)

### 2. Positionnement des nodes
> **Note importante** : Le positionnement est géré automatiquement par la librairie dagre. 
> NE PAS inclure le champ `position` dans le JSON - il sera calculé automatiquement 
> en fonction des dépendances pour créer un arbre visuellement optimal.

### 3. Attribution des XP
- **Facile** : 10-20 XP
- **Moyen** : 25-40 XP
- **Difficile** : 45-60 XP
- **Challenge** : 70-100 XP
- **Étape finale** : 100+ XP

### 4. Dépendances
- Maximum 3 dépendances par node
- Éviter les dépendances circulaires
- Les nodes bonus ont généralement 1 seule dépendance
- Les challenges nécessitent plusieurs prérequis

## 🎯 Prompt pour l'IA

```markdown
Tu es un expert en gamification et développement personnel. Crée un parcours d'apprentissage complet et motivant.

OBJECTIF : [OBJECTIF_UTILISATEUR]

Génère EXACTEMENT cette structure JSON (format englishSkillData) :

{
  "objective": {
    "id": "learn-[domaine]-[niveau]",
    "title": "🚀 [Titre inspirant avec emoji]",
    "description": "[Description complète de ce que l'utilisateur va accomplir]",
    "category": "learning", // ou health, professional, personal, creative, social, financial
    "difficulty": "medium", // easy, medium, hard, expert
    "totalXP": 2000, // Somme totale des XP de tous les nodes
    "estimatedDuration": "3-6 mois",
    "hoursPerWeek": "5-10 heures",
    "prerequisites": "Aucun - adapté aux débutants", // ou liste des prérequis
    "finalReward": "Capacité à [accomplissement final concret]",
    "motivation": "Phrase inspirante personnalisée qui motive !",
    "progress": 0,
    "totalSteps": 18, // Nombre total de nodes
    "completedSteps": 0
  },
  "milestones": [
    {
      "id": "milestone-1",
      "title": "🌱 [Premier palier]",
      "description": "[Ce qui sera accompli à ce stade]",
      "order": 1
    },
    // 3-5 milestones qui marquent les grandes étapes
  ],
  "skillTree": {
    "nodes": [
      {
        "id": "unique-node-id",
        "title": "🎯 Titre avec emoji",
        "description": "Description claire de l'étape",
        "xp": 50, // 10-300 selon difficulté
        "difficulty": "easy", // easy, medium, hard, expert
        "category": "core", // core (principal), bonus (optionnel), challenge (défi)
        "estimatedTime": "1 semaine",
        "dependencies": [], // IDs des nodes prérequis (vide pour le premier)
        "unlocked": true, // true si pas de dependencies
        "completed": false, // Toujours false au départ
        "position": { "x": 100, "y": 50 }, // Position visuelle
        "resources": [
          "https://exemple.com/ressource1",
          "https://youtube.com/watch?v=xxx"
        ],
        "practiceSteps": [
          "Action concrète 1 à faire",
          "Action concrète 2 mesurable",
          "Action concrète 3 avec objectif clair"
        ],
        "tips": "💡 Conseil pratique avec emoji pour réussir cette étape !"
      },
      // Total : 15-20 nodes
      // - 12-15 nodes "core" (parcours principal)
      // - 2-3 nodes "bonus" (optionnels pour approfondir)
      // - 1-2 nodes "challenge" (défis ultimes)
    ],
    "edges": [
      { "from": "node-source", "to": "node-target" },
      // Créer une connexion pour chaque dependency
    ]
  }
}

RÈGLES CRITIQUES :
1. Structure EXACTE avec objective, milestones, skillTree
2. Champs obligatoires dans objective : totalXP, estimatedDuration, hoursPerWeek, prerequisites, finalReward, motivation
3. Nodes avec practiceSteps (3 actions concrètes) et tips (conseil avec emoji)
4. Position des nodes pour créer un arbre visuel cohérent (x: 100-600, y: 50-550)
5. Resources avec vraies URLs fonctionnelles
6. XP proportionnel : easy(10-75), medium(100-175), hard(200-250), expert(300+)
7. Premier node TOUJOURS avec dependencies: [] et unlocked: true
8. Edges : créer un edge pour chaque dependency (from: source, to: target)

RETOURNE UNIQUEMENT LE JSON VALIDE, sans commentaires.
```

## ✅ Checklist de validation

Avant de retourner le JSON, vérifier :

- [ ] Tous les IDs sont uniques
- [ ] Les dependencies référencent des IDs existants
- [ ] Au moins 1 node a `unlocked: true` et `dependencies: []`
- [ ] Les XP rewards sont proportionnels à la difficulté
- [ ] Chaque node a des details complets
- [ ] Les URLs des tools sont valides
- [ ] Les milestones sont mesurables et progressifs
- [ ] Les estimatedTime sont réalistes

## 🚫 Erreurs à éviter

1. **Dépendances impossibles** : Un node qui dépend de lui-même
2. **Progression bloquée** : Aucun node débloqué au départ
3. **Sauts de difficulté** : Passer de Facile à Difficile sans intermédiaire
4. **Descriptions vagues** : "Apprenez ceci" au lieu d'actions concrètes
5. **URLs cassées** : Toujours utiliser des sites reconnus et stables
6. **Temps irréalistes** : "Maîtriser le piano" en "2 jours"

## 📈 Exemple de progression type

```
Niveau 1: Découverte → 2 nodes (20 XP chacun)
    ↓
Niveau 2: Fondamentaux → 3 nodes (30 XP chacun)
    ↓
Niveau 3: Développement → 4 nodes (40 XP) + 1 bonus (35 XP)
    ↓
Niveau 4: Consolidation → 3 nodes (50 XP) + 1 challenge (75 XP)
    ↓
Niveau 5: Maîtrise → 2 nodes (60 XP)
    ↓
Niveau 6: Accomplissement → 1 node final (100 XP)
```

## 🔄 Adaptation selon le contexte

L'IA doit adapter la structure selon :
- **Domaine** : Technique, créatif, physique, intellectuel
- **Durée** : Court terme (1 mois), moyen (3-6 mois), long (1 an+)
- **Niveau initial** : Débutant complet, faux débutant, intermédiaire
- **Objectif** : Loisir, professionnel, compétition
- **Contraintes** : Temps disponible, budget, matériel nécessaire

## 🌐 Architecture API

### Endpoints principaux

```typescript
// Liste des objectifs de l'utilisateur
GET /api/objectives
Response: Objective[] (sans skillTree complet, juste les métadonnées)

// Détail d'un objectif avec son skillTree
GET /api/objectives/:id
Response: Objective (avec skillTree complet)

// Créer un nouvel objectif via IA
POST /api/objectives/generate
Body: { prompt: string, category?: string, difficulty?: string }
Response: Objective

// Mettre à jour la progression
PATCH /api/objectives/:id/nodes/:nodeId/complete
Response: { xpEarned: number, newLevel?: number, unlockedNodes: string[] }

// Compléter un milestone
PATCH /api/objectives/:id/milestones/:milestoneId/complete
Response: { completed: boolean }
```

### Flow de données

1. **Liste des objectifs** : La sidebar charge uniquement les métadonnées
2. **Sélection d'objectif** : Click → fetch détail complet avec skillTree
3. **Progression** : Mise à jour en temps réel via WebSocket ou polling
4. **Génération IA** : Stream de la réponse pour feedback immédiat

### Optimisations

- **Lazy loading** : Ne charger le skillTree que quand nécessaire
- **Cache** : Mettre en cache les objectifs consultés récemment
- **Pagination** : Pour les utilisateurs avec beaucoup d'objectifs
- **Compression** : Les skillTrees peuvent être volumineux, utiliser gzip

---

*Cette structure garantit une expérience utilisateur engageante et motivante, transformant n'importe quel objectif en aventure gamifiée.*