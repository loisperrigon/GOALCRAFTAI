# Instructions Claude Code - Plateforme Gamifiée d'Objectifs

## 🎯 Contexte du Projet

Tu travailles sur une application web révolutionnaire qui transforme les objectifs personnels en parcours structurés inspirés des jeux vidéo. L'utilisateur décrit son rêve, l'IA génère un plan complet avec étapes séquentielles et système de déblocage.

## 🛠️ Directives Techniques

### Architecture Préférée (Séparation Frontend/Backend)
- **Frontend :** Next.js 15 avec App Router pour SEO optimal
- **Backend :** Node.js/Express avec architecture API REST
- **Styling :** Tailwind CSS v4 + shadcn/ui (canary) pour composants gaming
- **State Management :** Zustand pour la simplicité et performance
- **Base de données :** MongoDB avec Mongoose ODM
- **IA :** OpenAI GPT-4 pour génération de parcours personnalisés
- **SEO :** Métadonnées dynamiques, SSR/SSG, sitemap automatique
- **Composants UI :** shadcn/ui avec React 19 et Radix UI

### Standards de Code
- **TypeScript obligatoire** pour la robustesse
- **Components fonctionnels** avec hooks React
- **Nommage explicite** : `GameTree.tsx`, `XPProgressBar.tsx`, `ObjectiveChat.tsx`
- **Code modulaire** et réutilisable
- **Comments** pour la logique IA et gamification complexe
- **API RESTful** avec versioning (/api/v1/)

## 🎮 Priorités UX/UI

### Design Gaming
- **Animations fluides** avec Framer Motion
- **Couleurs motivantes** : système visuel étapes (grisé→disponible→complété)
- **Typographie gaming** : Inter pour le contenu, Orbitron pour les titres
- **Icons appropriés** : Lucide React pour cohérence
- **Responsive design** : mobile-first pour l'usage quotidien

### Expérience Utilisateur
- **Onboarding ultra-simple** : 3 écrans maximum
- **Interface intuitive** : boutons gros, actions claires
- **Feedback immédiat** : animations à chaque validation d'étape
- **Progression visible** : états clairement définis (verrouillé/disponible/complété)

## 🚀 Phases de Développement

### Phase 1 : MVP Core (Focus Actuel)
1. **Setup Frontend** Next.js avec configuration SEO optimale
2. **Setup Backend** Express avec architecture modulaire
3. **Interface de chat** pour saisir les objectifs
4. **Génération IA** basique des arbres d'étapes  
5. **Visualisation simple** de l'arbre de progression
6. **Système de déblocage** séquentiel des étapes
7. **Persistence des données** avec MongoDB/Mongoose

### Phase 2 : Expérience Avancée
8. Animations et effets visuels avec Framer Motion
9. Système de badges pour les accomplissements majeurs
10. Partage social avec Open Graph optimisé
11. Défis et objectifs communautaires

### Phase 3 : IA Avancée
12. Personnalisation des parcours selon les progrès
13. Coaching IA conversationnel
14. Optimisation automatique des objectifs

## 💡 Fonctionnalités Clés à Implémenter

### Chat d'Objectifs
```typescript
// Interface pour saisir les rêves/objectifs
interface ObjectiveInput {
  userMessage: string;
  aiResponse: GeneratedPath;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string; // Pour SEO et organisation
}
```

### Arbre d'Étapes
```typescript
interface StepNode {
  id: string;
  title: string;
  description: string;
  dependencies: string[];
  completed: boolean;
  unlocked: boolean;
  xpReward: number;
  estimatedTime: string;
  position: { x: number; y: number };
}
```

### Système de Progression
```typescript
interface UserProgress {
  userId: string;
  completedSteps: string[];
  activeObjectives: Objective[];
  unlockedSteps: string[];
  totalXP: number;
  level: number;
  badges: Badge[];
  streakDays: number;
}
```

## 🎨 Composants UI Essentiels

### Composants shadcn/ui Installés (React 19 compatible)
- `<Button />` : Variantes gaming (primary avec dégradé, effects hover/active)
- `<Card />` : Cartes avec fond dégradé et backdrop-blur
- `<Dialog />` : Modales avec animations zoom/slide
- `<Input />` : Inputs stylés avec focus states gaming
- `<Badge />` : Badges XP, achievements, levels avec animations
- `<Progress />` & `<GameProgress />` : Barres de progression animées
- `<Avatar />` & `<GameAvatar />` : Avatars avec indicateurs niveau/statut

### Composants Gaming à Créer
- `<ProgressionBar />` : Barre de progression avec animations
- `<StepTree />` : Arbre interactif des étapes (React Flow)
- `<StepCompleteModal />` : Célébration des étapes terminées
- `<BadgeGrid />` : Affichage des accomplissements
- `<ObjectiveCard />` : Carte d'objectif avec progression
- `<LevelUpAnimation />` : Animation de montée de niveau
- `<XPCounter />` : Compteur d'XP animé

### Composants Fonctionnels
- `<ChatInterface />` : Chat pour saisir les objectifs
- `<Dashboard />` : Vue d'ensemble des progrès
- `<ProfileStats />` : Statistiques utilisateur
- `<NotificationSystem />` : Système d'encouragements
- `<OnboardingFlow />` : Flux d'inscription gamifié

## 🤖 Intégration IA

### Prompts OpenAI Optimisés
```typescript
const OBJECTIVE_PROMPT = `
Tu es un expert en développement personnel et gamification. 
Transforme cet objectif en arbre de compétences gaming :
- Découpe en 8-15 étapes logiques et progressives
- Crée des dépendances réalistes entre étapes
- Attribue des XP proportionnels à la difficulté (10-100 XP)
- Estime le temps nécessaire pour chaque étape
- Rends chaque étape motivante et actionnable
- Format: JSON avec structure StepNode[]

Objectif utilisateur: {userObjective}
Difficulté: {difficulty}
`;
```

### Gestion des Erreurs
- **Fallbacks** si l'API IA échoue
- **Retry logic** avec backoff exponentiel  
- **Validation** des réponses IA avant affichage
- **Exemples prédéfinis** en cas de problème

## 📱 SEO & Performance

### Optimisation SEO
- **Métadonnées dynamiques** pour chaque page
- **Schema.org** pour le contenu structuré
- **Sitemap XML** généré automatiquement
- **Open Graph** et Twitter Cards
- **URLs propres** : /objectifs/[slug], /profil/[username]
- **SSG/ISR** pour les pages statiques
- **SSR** pour le contenu dynamique

### Mobile First
- **Touch-friendly** : zones de clic généreuses (min 44px)
- **Scroll naturel** dans les arbres de compétences
- **Orientation** : fonctionnel portrait et paysage
- **PWA ready** : manifest.json, service worker

### Performance
- **Lazy loading** avec next/dynamic
- **Optimisation images** : next/image, formats modernes
- **Bundle splitting** automatique Next.js
- **Caching intelligent** : SWR pour les données
- **Core Web Vitals** : LCP < 2.5s, FID < 100ms, CLS < 0.1

## 🔐 Sécurité & Données

### Protection Utilisateur
- **Validation** avec Zod côté client ET serveur
- **Sanitization** des inputs utilisateur
- **Rate limiting** sur les appels IA (10 req/min)
- **GDPR compliant** : données minimales
- **Auth** avec JWT et refresh tokens
- **CORS** configuré correctement

### Gestion d'État
- **Zustand** pour l'état global frontend
- **Redis** pour cache et sessions backend
- **Local storage** pour la persistence hors ligne
- **WebSockets** pour temps réel
- **Backup automatique** des progrès
- **Migration de données** entre versions

## 🎯 Métriques de Succès

### Engagement
- Temps passé sur l'app quotidiennement
- Taux de complétion des étapes
- Nombre d'objectifs créés par utilisateur
- Retention 7/30 jours
- Streak moyen

### Performance Technique
- Time to Interactive < 3s
- First Contentful Paint < 1s
- 95%+ de score Lighthouse
- 0 erreurs JavaScript critiques
- Uptime 99.9%
- Response time API < 200ms

## ⚠️ Notes Importantes & Solutions

### Compatibilité React 19 avec les librairies
- **Problème :** Certaines librairies (lucide-react, Radix UI) n'ont pas encore de support officiel pour React 19
- **Solution :** Utiliser `npm install --legacy-peer-deps` pour installer les dépendances
- **Configuration :** `npm config set legacy-peer-deps true` pour le rendre permanent
- **shadcn/ui :** Utiliser la version canary `npx shadcn@canary` pour React 19 et Tailwind v4

### Composants React 19
- **Plus de forwardRef :** React 19 n'a plus besoin de forwardRef
- **data-slot :** Ajouter des attributs data-slot pour le styling Tailwind v4
- **Types :** Utiliser les types @types/react@19 et @types/react-dom@19

### Installation des composants shadcn/ui
- **Méthode manuelle recommandée :** Créer les composants manuellement pour éviter les conflits
- **Radix UI :** Installer avec `--legacy-peer-deps`
- **Personnalisation gaming :** Adapter les composants avec animations et styles gaming

## 💬 Communication avec Claude Code

### Lors des Demandes
- **Contexte gaming** toujours présent dans les réponses
- **Exemples concrets** : montre avec de vraies données utilisateur
- **Code commenté** : explique la logique gamification
- **Alternatives proposées** : plusieurs approches si pertinent

### Format de Réponses Préféré
1. **Explication rapide** de l'approche choisie
2. **Code complet** et fonctionnel
3. **Instructions d'intégration** claires
4. **Next steps** suggérés pour la suite

### Questions à Poser
- "Comment veux-tu gérer [fonctionnalité] ?"
- "Préfères-tu une approche simple ou plus sophistiquée ?"
- "As-tu des contraintes techniques particulières ?"
- "Veux-tu que j'ajoute des animations à cette partie ?"

## 📂 Structure de Projet Préférée

```
GoalCraftAI/
├── frontend/                    # Application Next.js
│   ├── src/
│   │   ├── app/                # App Router Next.js
│   │   │   ├── (auth)/         # Routes authentifiées
│   │   │   ├── (public)/       # Routes publiques
│   │   │   └── layout.tsx      # Layout principal
│   │   ├── components/
│   │   │   ├── ui/             # Composants UI de base
│   │   │   ├── gaming/         # Composants gaming
│   │   │   └── features/       # Composants métier
│   │   ├── lib/
│   │   │   ├── api.ts          # Client API
│   │   │   └── utils.ts        # Fonctions utilitaires
│   │   ├── hooks/              # Custom hooks
│   │   ├── stores/             # Stores Zustand
│   │   └── types/              # Types TypeScript partagés
│   ├── public/                 # Assets statiques
│   └── package.json
│
├── backend/                     # API Express
│   ├── src/
│   │   ├── controllers/        # Contrôleurs API
│   │   ├── routes/             # Routes Express
│   │   ├── services/           # Logique métier
│   │   │   ├── openai.service.ts
│   │   │   └── gamification.service.ts
│   │   ├── middleware/         # Middlewares Express
│   │   ├── models/             # Modèles Mongoose
│   │   │   ├── User.ts
│   │   │   ├── Objective.ts
│   │   │   └── Progress.ts
│   │   ├── utils/              # Utilitaires
│   │   └── server.ts           # Point d'entrée
│   └── package.json
│
├── shared/                      # Code partagé
│   └── types/                  # Types TypeScript communs
│
└── docker-compose.yml          # Pour le développement local
```

## 📊 État Actuel du Projet

### ✅ Complété
- Structure frontend/backend séparée créée
- Next.js 15 avec React 19 et TypeScript configuré
- Tailwind CSS v4 avec configuration gaming
- shadcn/ui initialisé avec composants de base
- Composants UI gaming créés (Button, Card, Dialog, Input, Badge, Progress, Avatar)
- Backend Express.js avec TypeScript configuré
- Modèle MongoDB User avec Mongoose
- Types TypeScript partagés définis

### 🚧 En Cours
- Interface de chat pour saisir les objectifs
- Intégration OpenAI pour génération d'arbres d'étapes

### 📝 À Faire
- Visualisation de l'arbre de progression (React Flow)
- Système de déblocage séquentiel
- Animations Framer Motion
- Authentification JWT
- WebSockets pour temps réel
- Tests unitaires et E2E

## 🔧 Configuration Environnement

### Variables Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Variables Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/goalcraft
OPENAI_API_KEY=sk-...
JWT_SECRET=...
REDIS_URL=...
PORT=3001
```

---

**Objectif :** Créer une expérience magique où transformer sa vie devient aussi addictif qu'un jeu vidéo ! 🎮✨

**Tech Stack Résumé :**
- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui (canary), Framer Motion, Zustand
- **Backend:** Node.js, Express, TypeScript, Mongoose, MongoDB
- **Composants UI:** shadcn/ui avec Radix UI (React 19 compatible)
- **IA:** OpenAI API
- **Cache:** Redis
- **Auth:** JWT
- **Icons:** Lucide React
- **Gestion des dépendances:** npm avec --legacy-peer-deps pour compatibilité