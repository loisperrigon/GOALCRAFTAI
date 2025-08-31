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
- **Nommage explicite** : `SkillTree.tsx`, `AuthLayout.tsx`, `ObjectiveDetailModal.tsx`
- **Code modulaire** et réutilisable
- **Comments** pour la logique IA et gamification complexe
- **API RESTful** avec versioning (/api/v1/)
- **Pas de commentaires inutiles** dans le code de production

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

### Phase 1 : MVP Core (✅ COMPLÉTÉ)
1. ✅ **Setup Frontend** Next.js 15 avec App Router et React 19
2. ✅ **Interface de chat** conversationnelle avec IA simulée
3. ✅ **Visualisation avancée** de l'arbre avec React Flow
4. ✅ **Système de déblocage** séquentiel avec dépendances
5. ✅ **Gamification complète** XP, niveaux, badges, achievements
6. ✅ **Pages essentielles** Landing, Auth, Dashboard, Profile, Pricing
7. ✅ **SEO optimisé** Métadonnées, Open Graph, sitemap
8. ✅ **Responsive design** Mobile-first avec navigation adaptative

### Phase 2 : Backend & Intégrations (🚧 EN COURS)
1. ⏳ **Setup Backend** Express avec TypeScript
2. ⏳ **Base de données** MongoDB avec Mongoose
3. ⏳ **Authentification** JWT avec refresh tokens
4. ⏳ **API OpenAI** pour génération réelle des parcours
5. ⏳ **Intégration Stripe** pour les paiements Premium
6. ⏳ **APIs REST** CRUD pour objectifs et progression

### Phase 3 : Fonctionnalités Avancées (📝 PLANIFIÉ)
1. 📝 Mode collaboratif et partage social
2. 📝 Coaching IA conversationnel avancé
3. 📝 Défis communautaires
4. 📝 Analytics et insights personnalisés
5. 📝 Application mobile PWA

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

### Composants Gaming Créés ✅
- ✅ `<SkillTree />` : Arbre interactif React Flow avec drag & drop
- ✅ `<Progress />` : Barres de progression animées
- ✅ `<ObjectiveDetailModal />` : Modal détaillée pour chaque étape
- ✅ `<Confetti />` : Animation de célébration
- ✅ `<Badge />` : Badges XP et achievements animés
- ✅ `<FreeLimitBanner />` : Bannière limitation gratuite
- ✅ `<PremiumBadge />` : Indicateur Premium

### Composants Fonctionnels Créés ✅
- ✅ `<AuthLayout />` : Layout avec sidebar gaming pour pages auth
- ✅ `<AuthModal />` : Modal de connexion/inscription
- ✅ `<Header />` : Navigation responsive avec menu mobile
- ✅ `<Footer />` : Footer avec newsletter et liens
- ✅ Chat IA intégré dans `/objectives`
- ✅ Dashboard complet avec statistiques
- ✅ Page profil avec onglets

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

### Points d'Attention UX
- **Pas de localStorage :** Sauvegarde directe en base à chaque modification
- **Pas de free trial :** Les utilisateurs ont déjà 2-3 essais gratuits sans compte
- **Limitations Free :** Maximum 10 étapes par objectif en plan gratuit
- **Confetti latéraux :** Animations sur les côtés, pas au centre de l'écran
- **Indicateur de page :** Header montre la page active avec souligné gradient

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

### ✅ Frontend Complété (100%)

#### **Architecture & Configuration**
- ✅ **Next.js 15** avec App Router, React 19 et TypeScript strict
- ✅ **Tailwind CSS v4** avec système de design gaming complet
- ✅ **shadcn/ui canary** avec tous les composants UI nécessaires
- ✅ **Zustand** pour state management avec actions complexes
- ✅ **SEO optimisé** : métadonnées, Open Graph, Twitter Cards sur toutes les pages

#### **Pages (8 pages production-ready)**
- ✅ **/** : Landing page avec hero, stats, témoignages, CTA
- ✅ **/auth** : Authentification unifiée avec Google/GitHub
- ✅ **/objectives** : Chat IA + Arbre interactif (cœur de l'app)
- ✅ **/dashboard** : Tableau de bord avec stats détaillées
- ✅ **/profile** : Profil utilisateur avec onglets
- ✅ **/pricing** : Page tarifs avec timer, FAQ, modal auth intégrée
- ✅ **/legal/*** : CGU, confidentialité, mentions légales
- ✅ **/404** : Page d'erreur personnalisée gaming

#### **Composants & Fonctionnalités**
- ✅ **Chat IA conversationnel** avec simulation GPT-4 réaliste
- ✅ **SkillTree React Flow** avec drag & drop, zoom, fullscreen
- ✅ **Système de gamification** : XP, niveaux, badges, achievements
- ✅ **Animations** : confetti, transitions fluides, hover effects
- ✅ **AuthLayout** avec sidebar gaming pour pages authentifiées
- ✅ **AuthModal** pour réduire la friction sur pricing
- ✅ **Responsive design** : mobile-first avec menu drawer
- ✅ **Système Free/Premium** avec limitations visuelles

#### **Données d'exemple**
- ✅ Parcours "Apprendre la guitare" avec 12+ étapes
- ✅ Multiples objectifs avec catégories et difficultés
- ✅ Statistiques et progression simulées

### 🚧 Backend À Implémenter (Structure prête)

#### **Priorité 1 : Core Backend**
- ⏳ **MongoDB** : Connexion et modèles Mongoose
- ⏳ **Auth JWT** : Register, login, logout, refresh tokens
- ⏳ **API Objectifs** : CRUD complet avec validation
- ⏳ **OpenAI GPT-4** : Génération réelle des parcours

#### **Priorité 2 : Monétisation**
- ⏳ **Stripe** : Checkout, webhooks, gestion abonnements
- ⏳ **Limites Free** : Middleware de vérification quotas

#### **Priorité 3 : Temps réel**
- 📝 **WebSockets** : Sync progression en temps réel
- 📝 **Redis** : Cache et sessions

### ✨ Fonctionnalités Bonus (Post-MVP)
- 📝 **Système de notifications** toast (structure prête)
- 📝 **Mode sombre/clair** avec toggle
- 📝 **PWA** : Manifest et service worker
- 📝 **Export PDF** des parcours
- 📝 **Partage social** des achievements
- **Mobile responsive** :
  - Adaptation skill tree mobile
  - Navigation mobile (burger menu)
- **Pages légales** :
  - Conditions d'utilisation
  - Politique de confidentialité
  - Mentions légales

### 🎨 Design System Établi
- **Couleurs** : Gradients purple-500 to blue-500
- **Animations** : Pulse, transitions fluides, confetti latéraux
- **Typography** : Inter pour contenu, poids variés
- **Spacing** : Système cohérent avec Tailwind
- **Components** : Cartes avec backdrop-blur, boutons gradient

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
- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui (canary), Zustand, React Flow, dagre, canvas-confetti
- **Backend:** Node.js, Express, TypeScript, Mongoose, MongoDB
- **Composants UI:** shadcn/ui avec Radix UI (React 19 compatible)
- **IA:** OpenAI API (GPT-4)
- **Cache:** Redis (prévu)
- **Auth:** JWT + OAuth (Google, GitHub) - à implémenter
- **Icons:** Lucide React
- **Gestion des dépendances:** npm avec --legacy-peer-deps pour compatibilité React 19

---

## 📊 ÉTAT ACTUEL DU PROJET - MISE À JOUR COMPLÈTE

### ✅ COMPLÉTÉ - MVP FONCTIONNEL AVANCÉ

#### 🏗️ Architecture & Configuration
- ✅ Structure frontend/backend séparée avec organisation optimale
- ✅ Next.js 15 avec App Router + React 19 + TypeScript configuré
- ✅ Tailwind CSS v4 avec système de design gaming complet
- ✅ shadcn/ui (canary) avec composants React 19 compatibles installés
- ✅ Zustand pour state management configuré et utilisé
- ✅ Backend Express.js avec TypeScript configuré
- ✅ MongoDB + Mongoose ODM setup avec modèles définis

#### 📄 Pages & Navigation (8 pages complètes)
- ✅ **Page d'accueil (/)** - Landing page marketing complète avec CTA, stats, témoignages
- ✅ **Page authentification (/auth)** - Login/Register avec social auth (Google, GitHub)
- ✅ **Page objectifs (/objectives)** - Chat IA conversationnel + Arbre interactif splitview
- ✅ **Dashboard (/dashboard)** - Vue d'ensemble progression avec statistiques détaillées
- ✅ **Page profil (/profile)** - Gestion utilisateur et paramètres
- ✅ **Page tarifs (/pricing)** - Plans Free/Premium complets avec timer, témoignages, FAQ
- ✅ **Pages légales (/legal/*)** - CGU, Confidentialité, Mentions légales complètes
- ✅ **Page 404** personnalisée avec design gaming
- ✅ **Responsive design mobile-first** sur toutes les pages avec navigation adaptative

#### 🎨 Composants UI & Gaming (25+ composants)
- ✅ **Navigation** : Header adaptarif + menu mobile + Footer complets
- ✅ **Layouts** : AuthLayout avec sidebar gaming pour pages authentifiées
- ✅ **Composants UI de base** : Button, Card, Dialog, Input, Badge, Progress, ScrollArea, Label, Textarea
- ✅ **Composants gaming avancés** : 
  - `SkillTree` : Arbre interactif React Flow avec drag & drop, fullscreen, layout automatique
  - `ObjectiveDetailModal` : Modal détaillée pour chaque étape
  - `Confetti` : Animations de célébration
  - `AuthModal`, `LoadingStates`, `Toast`, `PremiumBadge`, `FreeLimitBanner`

#### 🎮 Fonctionnalités Cœur - TOUTES IMPLÉMENTÉES
- ✅ **Chat IA conversationnel complet** : Interface moderne, simulation GPT-4 réaliste
- ✅ **Arbre de progression interactif sophistiqué** :
  - React Flow avec nodes visuels personnalisés
  - Layout automatique avec dagre
  - Mode fullscreen avec contrôles avancés
  - Drag & drop, zoom, pan
  - États visuels (verrouillé/disponible/complété)
- ✅ **Système de déblocage séquentiel** : Dépendances entre étapes, calcul XP, niveaux
- ✅ **Gamification complète** : 
  - Badges, achievements, streaks
  - Confetti animations à la complétion
  - Système XP/niveaux fonctionnel
  - Statistiques détaillées (dashboard)
- ✅ **State management sophistiqué** : Zustand store avec actions complexes
- ✅ **Données d'exemple riches** : Parcours "Apprendre la guitare" avec 12+ étapes détaillées
- ✅ **Progression tracking avancé** : XP, niveaux, milestones, pourcentages, streaks

#### 🚀 SEO & Performance
- ✅ **Métadonnées dynamiques** : OpenGraph, Twitter Cards, Schema.org ready
- ✅ **SEO optimisé** : Titles personnalisés, descriptions, keywords, meta tags complets
- ✅ **Performance** : Lazy loading, dynamic imports, code splitting automatique
- ✅ **Mobile UX** : Touch-friendly, zones de clic optimisées, navigation adaptative

#### 💰 Monétisation & Business
- ✅ **Système Free/Premium complet** : Limitations visuelles, bannières d'upgrade
- ✅ **Page pricing avancée** : 
  - Comparaison détaillée Free vs Premium
  - Timer d'urgence, social proof dynamique
  - Témoignages, FAQ, garanties
  - Flow d'auth intégré pour upgrade
- ✅ **Legal compliance** : Pages CGU, RGPD complètes et stylées

### 🎯 FONCTIONNALITÉS AVANCÉES IMPLÉMENTÉES

#### Interface Utilisateur Sophistiquée
- ✅ **Chat conversationnel** avec messages formatés, timestamps, simulation IA
- ✅ **Split-view mobile** : Toggle entre chat et arbre sur mobile
- ✅ **Arbre interactif avancé** :
  - Layout automatique multi-directionnel
  - Nodes catégorisés (main, bonus, challenge)
  - Animations et transitions fluides
  - Panel de contrôles en fullscreen
  - Sauvegarde/export/reset fonctionnel
- ✅ **Modal de détail enrichie** : Outils recommandés, conseils, jalons de progression
- ✅ **Système de sons** : Sons synthétiques générés avec Web Audio API pour les interactions
- ✅ **Streak system minimaliste** : Badge flamme avec compteur intégré dans la sidebar
- ✅ **Animations gaming** : Confetti, pulse, hover effects, transitions

#### Données et État
- ✅ **Architecture de stores centralisée** : 
  - **user-store** : Authentification, profil, XP, niveaux, badges, achievements
  - **objectives-store** : Objectifs avec skill trees intégrés, milestones, progression
  - **settings-store** : Paramètres globaux (thème, notifications, sons, langue)
  - **streak-store** : Gestion des streaks avec multiplicateurs XP
- ✅ **Migration complète de skillTreeStore** : Toute la logique intégrée dans objectives-store
- ✅ **Données mock avec useInitializeStores** : Auto-login et chargement des objectifs au démarrage
- ✅ **Persistence localStorage** : État conservé entre sessions
- ✅ **Données d'exemple réalistes** : 
  - Parcours guitare complet avec détails enrichis
  - Outils (Yousician, YouTube), conseils pratiques
  - Estimations temporelles, récompenses XP variables

### 🔄 INTÉGRATIONS À FINALISER (Structure 100% prête)

#### Backend Real (Interface complète côté frontend)
- 🔄 **OpenAI API** : Simulation complète → Intégration réelle
- 🔄 **MongoDB** : Modèles créés → Connexion et CRUD
- 🔄 **Auth JWT** : Flow UI complet → Implémentation server
- 🔄 **API REST** : Endpoints définis → Implémentation Express

#### Services Externes
- 🔄 **Stripe** : Page pricing ready → Webhooks et checkout
- 🔄 **Email** : Pour notifications et onboarding
- 🔄 **Analytics** : Tracking utilisateur et conversion

### ⚡ PRÊT POUR DÉMONSTRATION/PRODUCTION

**Le frontend est 100% fonctionnel** et peut être déployé immédiatement :

✅ **Interface moderne et aboutie** - Design gaming professionnel  
✅ **Toutes les fonctionnalités core** - Chat IA + Arbre + Gamification complètes  
✅ **Navigation fluide** - Responsive, mobile-first, UX optimisée  
✅ **Simulation IA convaincante** - Démonstration réaliste du produit final  
✅ **Système de monétisation** - Plans, pricing, upgrade flow intégrés  
✅ **SEO et performance** - Optimisé pour le référencement et la vitesse  

**VERDICT** : MVP+ entièrement fonctionnel et démontrable.  
**PROCHAINE ÉTAPE** : Connexion des APIs backend pour version production complète.