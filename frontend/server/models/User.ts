import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  email: string
  name: string
  password?: string
  avatar?: string
  provider: 'local' | 'google' | 'github'
  level: number
  xp: number
  badges: Array<{
    id: string
    name: string
    description: string
    icon: string
    unlockedAt: Date
  }>
  achievements: Array<{
    id: string
    name: string
    description: string
    unlockedAt: Date
  }>
  isPremium: boolean
  premiumUntil?: Date
  settings: {
    notifications: boolean
    darkMode: boolean
    language: string
    soundEnabled: boolean
  }
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return this.provider === 'local'
    }
  },
  avatar: String,
  provider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local'
  },
  level: {
    type: Number,
    default: 1
  },
  xp: {
    type: Number,
    default: 0
  },
  badges: [{
    id: String,
    name: String,
    description: String,
    icon: String,
    unlockedAt: Date
  }],
  achievements: [{
    id: String,
    name: String,
    description: String,
    unlockedAt: Date
  }],
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumUntil: Date,
  settings: {
    notifications: {
      type: Boolean,
      default: true
    },
    darkMode: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'fr'
    },
    soundEnabled: {
      type: Boolean,
      default: true
    }
  },
  lastLogin: Date
}, {
  timestamps: true
})

// Hash le mot de passe avant de sauvegarder
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next()
  }
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Méthode pour comparer les mots de passe
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

// Méthode pour calculer le niveau basé sur l'XP
UserSchema.methods.calculateLevel = function(): number {
  const xpPerLevel = 1000
  return Math.floor(this.xp / xpPerLevel) + 1
}

// Indexes pour les performances
UserSchema.index({ email: 1 })
UserSchema.index({ createdAt: -1 })

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)