import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StreakState {
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
  streakMultiplier: number
  freezeTokens: number
  isStreakActive: boolean
  todayCompleted: boolean
  
  // Actions
  updateStreak: () => void
  checkStreak: () => void
  useFreeze: () => boolean
  addFreezeToken: () => void
  resetStreak: () => void
  calculateMultiplier: () => number
}

const STREAK_MULTIPLIERS = [
  { days: 0, multiplier: 1.0 },
  { days: 3, multiplier: 1.2 },
  { days: 7, multiplier: 1.5 },
  { days: 14, multiplier: 1.8 },
  { days: 30, multiplier: 2.0 },
  { days: 60, multiplier: 2.5 },
  { days: 100, multiplier: 3.0 },
]

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      streakMultiplier: 1.0,
      freezeTokens: 3, // Start with 3 freeze tokens
      isStreakActive: false,
      todayCompleted: false,

      updateStreak: () => {
        const today = new Date().toDateString()
        const state = get()
        
        if (state.lastActivityDate === today) {
          // Already completed today
          return
        }

        const newStreak = state.currentStreak + 1
        const newLongest = Math.max(newStreak, state.longestStreak)
        const multiplier = get().calculateMultiplier()

        set({
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastActivityDate: today,
          streakMultiplier: multiplier,
          isStreakActive: true,
          todayCompleted: true,
        })
      },

      checkStreak: () => {
        const state = get()
        if (!state.lastActivityDate) return

        const today = new Date()
        const lastActivity = new Date(state.lastActivityDate)
        const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

        if (daysDiff === 0) {
          // Same day
          set({ isStreakActive: true, todayCompleted: true })
        } else if (daysDiff === 1) {
          // Next day - streak continues
          set({ isStreakActive: true, todayCompleted: false })
        } else if (daysDiff > 1) {
          // Streak broken
          set({
            currentStreak: 0,
            streakMultiplier: 1.0,
            isStreakActive: false,
            todayCompleted: false,
          })
        }
      },

      useFreeze: () => {
        const state = get()
        if (state.freezeTokens <= 0) return false

        const today = new Date().toDateString()
        
        set({
          freezeTokens: state.freezeTokens - 1,
          lastActivityDate: today,
          isStreakActive: true,
        })
        
        return true
      },

      addFreezeToken: () => {
        set(state => ({ freezeTokens: state.freezeTokens + 1 }))
      },

      resetStreak: () => {
        set({
          currentStreak: 0,
          streakMultiplier: 1.0,
          isStreakActive: false,
          todayCompleted: false,
        })
      },

      calculateMultiplier: () => {
        const streak = get().currentStreak
        
        // Find the highest multiplier for current streak
        for (let i = STREAK_MULTIPLIERS.length - 1; i >= 0; i--) {
          if (streak >= STREAK_MULTIPLIERS[i].days) {
            return STREAK_MULTIPLIERS[i].multiplier
          }
        }
        
        return 1.0
      },
    }),
    {
      name: 'streak-storage',
    }
  )
)