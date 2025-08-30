import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
  isEmailVerified: boolean
  emailVerificationToken?: string
  passwordResetToken?: string
  passwordResetExpires?: Date
  preferences: {
    notifications: {
      email: boolean
      push: boolean
      goalReminders: boolean
      progressUpdates: boolean
    }
    timezone: string
    language: string
    theme: 'light' | 'dark' | 'system'
  }
  subscription: {
    plan: 'free' | 'pro' | 'enterprise'
    status: 'active' | 'inactive' | 'cancelled'
    startDate?: Date
    endDate?: Date
  }
  stats: {
    goalsCreated: number
    goalsCompleted: number
    totalSteps: number
    completedSteps: number
    streakDays: number
    longestStreak: number
  }
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      goalReminders: {
        type: Boolean,
        default: true
      },
      progressUpdates: {
        type: Boolean,
        default: true
      }
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'fr', 'es', 'de', 'zh', 'ja']
    },
    theme: {
      type: String,
      default: 'system',
      enum: ['light', 'dark', 'system']
    }
  },
  subscription: {
    plan: {
      type: String,
      default: 'free',
      enum: ['free', 'pro', 'enterprise']
    },
    status: {
      type: String,
      default: 'active',
      enum: ['active', 'inactive', 'cancelled']
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date
  },
  stats: {
    goalsCreated: {
      type: Number,
      default: 0
    },
    goalsCompleted: {
      type: Number,
      default: 0
    },
    totalSteps: {
      type: Number,
      default: 0
    },
    completedSteps: {
      type: Number,
      default: 0
    },
    streakDays: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password
      delete ret.emailVerificationToken
      delete ret.passwordResetToken
      delete ret.passwordResetExpires
      return ret
    }
  }
})

// Indexes
userSchema.index({ email: 1 })
userSchema.index({ username: 1 })
userSchema.index({ createdAt: -1 })
userSchema.index({ 'subscription.plan': 1 })

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`
  }
  return this.firstName || this.lastName || this.username
})

// Virtual for completion rate
userSchema.virtual('completionRate').get(function() {
  if (this.stats.totalSteps === 0) return 0
  return Math.round((this.stats.completedSteps / this.stats.totalSteps) * 100)
})

// Pre-remove middleware to clean up related data
userSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    // Here you would clean up related goals, steps, etc.
    // await Goal.deleteMany({ userId: this._id })
    next()
  } catch (error) {
    next(error as Error)
  }
})

export const User = mongoose.model<IUser>('User', userSchema)