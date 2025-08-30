// ============================================================================
// SHARED TYPES FOR GOALCRAFT AI
// ============================================================================

// User Related Types
// ----------------------------------------------------------------------------

export interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  avatar?: string
  createdAt: string
  updatedAt: string
  lastLogin?: string
  isEmailVerified: boolean
  preferences: UserPreferences
  subscription: UserSubscription
  stats: UserStats
}

export interface UserPreferences {
  notifications: {
    email: boolean
    push: boolean
    goalReminders: boolean
    progressUpdates: boolean
  }
  timezone: string
  language: 'en' | 'fr' | 'es' | 'de' | 'zh' | 'ja'
  theme: 'light' | 'dark' | 'system'
}

export interface UserSubscription {
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'inactive' | 'cancelled'
  startDate?: string
  endDate?: string
}

export interface UserStats {
  goalsCreated: number
  goalsCompleted: number
  totalSteps: number
  completedSteps: number
  streakDays: number
  longestStreak: number
}

// Goal Related Types
// ----------------------------------------------------------------------------

export interface ObjectiveInput {
  title: string
  description: string
  category: GoalCategory
  priority: GoalPriority
  deadline?: string
  estimatedDuration?: number // in days
  tags?: string[]
  isPublic?: boolean
}

export interface Goal {
  id: string
  userId: string
  title: string
  description: string
  category: GoalCategory
  priority: GoalPriority
  status: GoalStatus
  progress: number // 0-100
  deadline?: string
  estimatedDuration?: number
  actualDuration?: number
  tags: string[]
  isPublic: boolean
  createdAt: string
  updatedAt: string
  completedAt?: string
  steps: StepNode[]
  aiInsights?: AIInsight[]
}

export type GoalCategory = 
  | 'personal'
  | 'professional'
  | 'health'
  | 'education'
  | 'finance'
  | 'relationships'
  | 'hobbies'
  | 'travel'
  | 'other'

export type GoalPriority = 'low' | 'medium' | 'high' | 'urgent'

export type GoalStatus = 
  | 'draft'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'archived'

// Step Related Types
// ----------------------------------------------------------------------------

export interface StepNode {
  id: string
  goalId: string
  parentId?: string // for sub-steps
  title: string
  description?: string
  type: StepType
  status: StepStatus
  priority: StepPriority
  order: number
  estimatedDuration?: number // in hours
  actualDuration?: number
  deadline?: string
  dependencies?: string[] // step IDs this step depends on
  resources?: Resource[]
  tags?: string[]
  createdAt: string
  updatedAt: string
  completedAt?: string
  children?: StepNode[] // sub-steps
}

export type StepType = 
  | 'task'
  | 'milestone'
  | 'decision'
  | 'research'
  | 'meeting'
  | 'learning'
  | 'creative'
  | 'other'

export type StepStatus = 
  | 'pending'
  | 'in_progress'
  | 'blocked'
  | 'completed'
  | 'skipped'
  | 'cancelled'

export type StepPriority = 'low' | 'medium' | 'high' | 'critical'

// Progress Related Types
// ----------------------------------------------------------------------------

export interface UserProgress {
  userId: string
  goalId: string
  stepId?: string
  progressValue: number // 0-100
  notes?: string
  timeSpent?: number // in minutes
  createdAt: string
  metadata?: Record<string, any>
}

export interface ProgressSnapshot {
  id: string
  userId: string
  goalId: string
  date: string
  overallProgress: number
  stepsCompleted: number
  totalSteps: number
  timeSpent: number // total time in minutes
  notes?: string
  milestones: MilestoneProgress[]
}

export interface MilestoneProgress {
  stepId: string
  title: string
  completed: boolean
  completedAt?: string
  impact: 'low' | 'medium' | 'high'
}

// AI Related Types
// ----------------------------------------------------------------------------

export interface AIInsight {
  id: string
  goalId: string
  type: InsightType
  title: string
  description: string
  confidence: number // 0-1
  actionable: boolean
  recommendation?: string
  createdAt: string
  isRead: boolean
}

export type InsightType = 
  | 'progress_trend'
  | 'deadline_risk'
  | 'step_optimization'
  | 'resource_suggestion'
  | 'motivation_boost'
  | 'strategy_adjustment'
  | 'time_management'

export interface AIGenerationRequest {
  objective: string
  context?: string
  preferences?: {
    timeframe?: string
    complexity?: 'simple' | 'moderate' | 'detailed'
    focus_areas?: string[]
  }
  user_profile?: {
    experience_level?: 'beginner' | 'intermediate' | 'advanced'
    available_time?: string
    constraints?: string[]
  }
}

export interface AIGenerationResponse {
  goal: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  steps: Omit<StepNode, 'id' | 'goalId' | 'createdAt' | 'updatedAt'>[]
  insights: string[]
  estimated_completion_time: number // in days
  success_factors: string[]
  potential_challenges: string[]
}

// Resource Related Types
// ----------------------------------------------------------------------------

export interface Resource {
  id: string
  title: string
  type: ResourceType
  url?: string
  content?: string
  description?: string
  tags?: string[]
  isRequired: boolean
  estimatedTime?: number // in minutes
  createdAt: string
}

export type ResourceType = 
  | 'article'
  | 'video'
  | 'book'
  | 'course'
  | 'tool'
  | 'template'
  | 'checklist'
  | 'other'

// API Response Types
// ----------------------------------------------------------------------------

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Authentication Types
// ----------------------------------------------------------------------------

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
  expiresIn: number
}

// Filter and Search Types
// ----------------------------------------------------------------------------

export interface GoalFilters {
  status?: GoalStatus[]
  category?: GoalCategory[]
  priority?: GoalPriority[]
  tags?: string[]
  dateRange?: {
    start: string
    end: string
  }
  search?: string
}

export interface StepFilters {
  status?: StepStatus[]
  type?: StepType[]
  priority?: StepPriority[]
  tags?: string[]
  hasDeadline?: boolean
  overdue?: boolean
  search?: string
}

// Notification Types
// ----------------------------------------------------------------------------

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  isRead: boolean
  createdAt: string
  expiresAt?: string
}

export type NotificationType = 
  | 'goal_deadline'
  | 'step_reminder'
  | 'progress_milestone'
  | 'achievement_unlocked'
  | 'ai_insight'
  | 'system_update'
  | 'social_activity'

// Analytics Types
// ----------------------------------------------------------------------------

export interface AnalyticsData {
  userId: string
  period: 'day' | 'week' | 'month' | 'quarter' | 'year'
  metrics: {
    goalsCreated: number
    goalsCompleted: number
    stepsCompleted: number
    timeSpent: number // in minutes
    productivityScore: number // 0-100
    streakDays: number
  }
  trends: {
    completionRate: TrendData[]
    timeSpent: TrendData[]
    productivity: TrendData[]
  }
  categoryBreakdown: CategoryMetrics[]
}

export interface TrendData {
  date: string
  value: number
}

export interface CategoryMetrics {
  category: GoalCategory
  count: number
  completionRate: number
  averageTime: number
}

// Export all types
export * from './index'