import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PremiumType = 'free' | 'starter' | 'pro';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  badges: Badge[];
  achievements?: Achievement[];
  createdAt: Date;
  premiumType: PremiumType;
  premiumExpiresAt?: Date;
  settings: UserSettings;
  // Stats depuis la BDD
  totalObjectives?: number;
  completedObjectives?: number;
  currentStreak?: number;
  longestStreak?: number;
  
  // Stripe
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'none';
  currentPeriodEnd?: Date;
  subscriptionSyncedAt?: Date;
  subscriptionUncertain?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export interface UserSettings {
  notifications: boolean;
  darkMode: boolean;
  language: "fr" | "en" | "es";
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
}

interface UserState {
  // État
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  addXP: (amount: number) => void;
  unlockBadge: (badge: Badge) => void;
  setPremiumType: (type: PremiumType, expiresAt?: Date) => void;
  getPremiumLimits: () => { maxObjectives: number; maxStepsPerObjective: number; features: string[] };
  
  // Stripe
  updateSubscription: (data: {
    stripeCustomerId?: string;
    subscriptionId?: string;
    subscriptionStatus?: string;
    currentPeriodEnd?: Date;
    plan?: PremiumType;
  }) => void;
  syncSubscription: (email: string) => Promise<void>;
  needsSubscriptionSync: () => boolean;

  // Helpers
  calculateLevel: (xp: number) => number;
  calculateXPProgress: () => number;
}

// XP requis par niveau (progression exponentielle)
const XP_PER_LEVEL = (level: number) =>
  Math.floor(100 * Math.pow(1.5, level - 1));

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, _password: string) => {
        set({ isLoading: true });

        // Simulation de login - À remplacer par vraie API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockUser: User = {
          id: "1",
          email,
          name: email.split("@")[0],
          level: 1,
          xp: 0,
          xpToNextLevel: 100,
          badges: [],
          createdAt: new Date(),
          premiumType: 'free' as PremiumType,
          settings: {
            notifications: true,
            darkMode: true,
            language: "fr",
            soundEnabled: true,
            musicEnabled: false,
            soundVolume: 0.7,
          },
        };

        set({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true });

        // Simulation - À remplacer par vraie API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newUser: User = {
          id: Date.now().toString(),
          email,
          name,
          level: 1,
          xp: 0,
          xpToNextLevel: 100,
          badges: [
            {
              id: "welcome",
              name: "Bienvenue!",
              description: "Première connexion à GoalCraftAI",
              icon: "🎉",
              unlockedAt: new Date(),
              rarity: "common",
            },
          ],
          createdAt: new Date(),
          premiumType: 'free' as PremiumType,
          settings: {
            notifications: true,
            darkMode: true,
            language: "fr",
            soundEnabled: true,
            musicEnabled: false,
            soundVolume: 0.7,
          },
        };

        set({
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      updateProfile: (updates) => {
        const { user } = get();
        if (!user) return;

        set({
          user: { ...user, ...updates },
        });
      },

      updateSettings: (settings) => {
        const { user } = get();
        if (!user) return;

        set({
          user: {
            ...user,
            settings: { ...user.settings, ...settings },
          },
        });
      },

      addXP: (amount) => {
        const { user } = get();
        if (!user) return;

        const newXP = user.xp + amount;
        const currentLevel = user.level;
        let newLevel = currentLevel;
        let xpForNextLevel = user.xpToNextLevel;

        // Calculer le nouveau niveau
        while (newXP >= xpForNextLevel) {
          newLevel++;
          xpForNextLevel = XP_PER_LEVEL(newLevel);
        }

        // Si level up, déclencher des rewards
        const hasLeveledUp = newLevel > currentLevel;

        set({
          user: {
            ...user,
            xp: newXP,
            level: newLevel,
            xpToNextLevel: xpForNextLevel,
          },
        });

        // Débloquer des badges selon le niveau
        if (hasLeveledUp) {
          const levelBadges: Record<number, Badge> = {
            5: {
              id: "level5",
              name: "Novice",
              description: "Atteindre le niveau 5",
              icon: "⭐",
              unlockedAt: new Date(),
              rarity: "common",
            },
            10: {
              id: "level10",
              name: "Apprenti",
              description: "Atteindre le niveau 10",
              icon: "🌟",
              unlockedAt: new Date(),
              rarity: "rare",
            },
            25: {
              id: "level25",
              name: "Expert",
              description: "Atteindre le niveau 25",
              icon: "💫",
              unlockedAt: new Date(),
              rarity: "epic",
            },
            50: {
              id: "level50",
              name: "Maître",
              description: "Atteindre le niveau 50",
              icon: "🏆",
              unlockedAt: new Date(),
              rarity: "legendary",
            },
          };

          if (levelBadges[newLevel]) {
            get().unlockBadge(levelBadges[newLevel]);
          }
        }
      },

      unlockBadge: (badge) => {
        const { user } = get();
        if (!user) return;

        // Vérifier si le badge n'est pas déjà débloqué
        const alreadyUnlocked = user.badges.some((b) => b.id === badge.id);
        if (alreadyUnlocked) return;

        set({
          user: {
            ...user,
            badges: [...user.badges, badge],
          },
        });
      },

      setPremiumType: (type, expiresAt) => {
        const { user, unlockBadge } = get();
        if (!user) return;

        set({
          user: { 
            ...user, 
            premiumType: type,
            premiumExpiresAt: expiresAt
          },
        });

        // Si passage en premium, débloquer le badge correspondant
        if (type === 'starter') {
          unlockBadge({
            id: "premium_starter",
            name: "Membre Starter",
            description: "Devenir membre Starter",
            icon: "⭐",
            rarity: "rare",
            unlockedAt: new Date(),
          });
        } else if (type === 'pro') {
          unlockBadge({
            id: "premium_pro",
            name: "Membre Pro",
            description: "Devenir membre Pro",
            icon: "👑",
            rarity: "legendary",
            unlockedAt: new Date(),
          });
        }
      },

      getPremiumLimits: () => {
        const { user } = get();
        const type = user?.premiumType || 'free';
        
        switch(type) {
          case 'free':
            return {
              maxObjectives: 3,
              maxStepsPerObjective: 10,
              features: ['3 objectifs maximum', '10 étapes par objectif', 'Chat IA basique limité'],
              canUseAI: false,
              canUseGPT4: false,
              canExport: false,
              canCollaborate: false,
              prioritySupport: false,
            };
          case 'starter':
            return {
              maxObjectives: 10,
              maxStepsPerObjective: 20,
              features: ['10 objectifs actifs', '20 étapes par objectif', 'IA GPT-3.5 illimitée', 'Export PDF', 'Rappels'],
              canUseAI: true,
              canUseGPT4: false, // GPT-3.5 seulement
              canExport: true,
              canCollaborate: false,
              prioritySupport: false,
            };
          case 'pro':
            return {
              maxObjectives: -1, // Illimité
              maxStepsPerObjective: -1,
              features: ['Objectifs illimités', 'Étapes illimitées', 'IA GPT-4 illimitée', 'Coaching personnalisé', 'Mode collaboratif', 'Support prioritaire'],
              canUseAI: true,
              canUseGPT4: true,
              canExport: true,
              canCollaborate: true,
              prioritySupport: true,
            };
          default:
            return {
              maxObjectives: 3,
              maxStepsPerObjective: 10,
              features: [],
              canUseAI: false,
              canUseGPT4: false,
              canExport: false,
              canCollaborate: false,
              prioritySupport: false,
            };
        }
      },

      calculateLevel: (xp) => {
        let level = 1;
        let totalXPNeeded = 0;

        while (xp >= totalXPNeeded) {
          totalXPNeeded += XP_PER_LEVEL(level);
          if (xp >= totalXPNeeded) level++;
        }

        return level;
      },

      calculateXPProgress: () => {
        const { user } = get();
        if (!user) return 0;

        const currentLevelXP = XP_PER_LEVEL(user.level - 1);
        const xpInCurrentLevel = user.xp - currentLevelXP;
        const xpNeededForLevel = user.xpToNextLevel - currentLevelXP;

        return (xpInCurrentLevel / xpNeededForLevel) * 100;
      },
      
      updateSubscription: (data) => {
        const { user } = get();
        if (!user) return;
        
        // Déterminer le plan depuis le status
        let premiumType = user.premiumType;
        if (data.plan) {
          premiumType = data.plan;
        } else if (data.subscriptionStatus === 'canceled' || data.subscriptionStatus === 'none') {
          premiumType = 'free';
        }
        
        set({
          user: {
            ...user,
            stripeCustomerId: data.stripeCustomerId || user.stripeCustomerId,
            subscriptionId: data.subscriptionId || user.subscriptionId,
            subscriptionStatus: data.subscriptionStatus as any || user.subscriptionStatus,
            currentPeriodEnd: data.currentPeriodEnd || user.currentPeriodEnd,
            premiumType,
            subscriptionSyncedAt: new Date(),
            subscriptionUncertain: false,
          },
        });
      },
      
      syncSubscription: async (email: string) => {
        try {
          const response = await fetch('/api/stripe/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          
          if (!response.ok) throw new Error('Sync failed');
          
          const data = await response.json();
          
          if (data.success) {
            get().updateSubscription({
              stripeCustomerId: data.data.customerId,
              subscriptionId: data.data.subscriptionId,
              subscriptionStatus: data.data.status,
              currentPeriodEnd: data.data.currentPeriodEnd ? new Date(data.data.currentPeriodEnd) : undefined,
              plan: data.data.plan,
            });
          }
        } catch (error) {
          console.error('Failed to sync subscription:', error);
          // Marquer comme incertain
          const { user } = get();
          if (user) {
            set({
              user: { ...user, subscriptionUncertain: true },
            });
          }
        }
      },
      
      needsSubscriptionSync: () => {
        const { user } = get();
        if (!user) return false;
        
        // Sync nécessaire si:
        // 1. Pas de dernière sync
        if (!user.subscriptionSyncedAt) return true;
        
        // 2. Dernière sync > 24h
        const daysSinceSync = (Date.now() - new Date(user.subscriptionSyncedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceSync > 1) return true;
        
        // 3. Marqué comme incertain
        if (user.subscriptionUncertain) return true;
        
        // 4. Près de l'expiration (< 3 jours)
        if (user.currentPeriodEnd) {
          const daysUntilExpiry = (new Date(user.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          if (daysUntilExpiry < 3) return true;
        }
        
        return false;
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
