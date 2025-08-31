import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "./mongodb"
import bcrypt from "bcryptjs"

// Validation des inputs
function validateEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return re.test(email)
}

function validatePassword(password: string): boolean {
  // Au moins 8 caractères
  return password.length >= 8
}

// Rate limiting simple en mémoire (en production utiliser Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

function checkRateLimit(email: string): boolean {
  const now = Date.now()
  const attempt = loginAttempts.get(email)
  
  if (!attempt) {
    loginAttempts.set(email, { count: 1, lastAttempt: now })
    return true
  }
  
  // Reset après 15 minutes
  if (now - attempt.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.set(email, { count: 1, lastAttempt: now })
    return true
  }
  
  // Max 5 tentatives
  if (attempt.count >= 5) {
    return false
  }
  
  attempt.count++
  attempt.lastAttempt = now
  return true
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Validation des inputs
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          if (!validateEmail(credentials.email)) {
            console.warn("Invalid email format:", credentials.email)
            return null
          }

          if (!validatePassword(credentials.password)) {
            return null
          }

          // Rate limiting
          if (!checkRateLimit(credentials.email)) {
            console.warn("Rate limit exceeded for:", credentials.email)
            await new Promise(resolve => setTimeout(resolve, 2000)) // Délai artificiel
            return null
          }

          // Connexion à MongoDB
          const client = await clientPromise
          const db = client.db()
          const user = await db.collection("users").findOne({ 
            email: credentials.email.toLowerCase() 
          })
          
          if (!user) {
            // Délai artificiel pour éviter timing attacks
            await bcrypt.compare("dummy", "$2a$10$dummyhash")
            return null
          }

          // Vérifier le mot de passe
          const isValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isValid) {
            return null
          }

          // Mettre à jour la dernière connexion
          await db.collection("users").updateOne(
            { _id: user._id },
            { $set: { lastLogin: new Date() } }
          )

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.avatar
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    }),
    
    // Google OAuth
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        }
      })
    ] : [])
  ],

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 jours (plus sécurisé que 30)
  },

  jwt: {
    maxAge: 7 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/auth",
    error: "/auth",
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }
      return session
    },

    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const client = await clientPromise
          const db = client.db()
          
          await db.collection("users").updateOne(
            { email: user.email },
            {
              $set: {
                email: user.email,
                name: user.name,
                avatar: user.image,
                provider: "google",
                lastLogin: new Date()
              },
              $setOnInsert: {
                createdAt: new Date(),
                level: 1,
                xp: 0,
                isPremium: false,
                badges: [],
                achievements: []
              }
            },
            { upsert: true }
          )
        } catch (error) {
          console.error("Error saving Google user:", error)
          return false
        }
      }
      return true
    }
  },

  // Sécurité supplémentaire
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  },

  debug: false, // Jamais en production !
}