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
  objective: {
    title: string              // Titre principal de l'objectif
    description: string         // Description motivante
    category: string           // Catégorie (music, fitness, dev, business, etc.)
    totalEstimatedTime: string // Temps total estimé
    difficulty: string         // Niveau global (Débutant, Intermédiaire, Avancé)
  }
  nodes: SkillNode[]          // Array des étapes
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
  title: string              // Titre du jalon (max 50 caractères)
  completed: boolean         // Toujours false au départ
}
```

## 🎮 Exemple complet d'un node

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
Tu dois créer un parcours d'apprentissage gamifié pour : [OBJECTIF_UTILISATEUR]

Génère un JSON avec :
- 12-20 nodes progressifs
- 3-4 nodes bonus optionnels
- 1-2 challenges difficiles
- 1 node final épique (boss final)

Pour chaque node, inclus :
1. Des détails pratiques et motivants
2. Des ressources réelles et accessibles
3. Des milestones mesurables
4. Des conseils avec emojis motivants
5. Une progression logique et réaliste

Structure l'arbre pour que :
- Les premiers nodes soient accessibles (unlocked: true)
- Chaque niveau débloque progressivement
- Les chemins alternatifs soient possibles
- La difficulté augmente graduellement

Retourne UNIQUEMENT le JSON valide, sans commentaires.
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

---

*Cette structure garantit une expérience utilisateur engageante et motivante, transformant n'importe quel objectif en aventure gamifiée.*