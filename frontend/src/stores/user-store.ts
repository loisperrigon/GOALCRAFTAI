import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  badges: Badge[];
  createdAt: Date;
  isPremium: boolean;
  settings: UserSettings;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  rarity: "common" | "rare" | "epic" | "legendary";
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
  setPremium: (isPremium: boolean) => void;

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
          isPremium: false,
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
          isPremium: false,
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

      setPremium: (isPremium) => {
        const { user } = get();
        if (!user) return;

        set({
          user: { ...user, isPremium },
        });

        // Débloquer un badge premium
        if (isPremium) {
          get().unlockBadge({
            id: "premium",
            name: "Membre Premium",
            description: "Supporter de GoalCraftAI",
            icon: "👑",
            unlockedAt: new Date(),
            rarity: "legendary",
          });
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
