import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "./server/mongodb-client"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.email) {
          return {
            id: credentials.email,
            email: credentials.email,
            name: credentials.email.split("@")[0],
          }
        }
        return null
      }
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Avec strategy database, user vient directement de la DB
      if (session?.user && user) {
        session.user.id = user.id
        // @ts-ignore
        session.user.level = user.level || 1
        // @ts-ignore
        session.user.xp = user.xp || 0
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Rediriger vers /objectives après connexion
      if (url.includes("/auth")) {
        return baseUrl + '/objectives'
      }
      if (url.startsWith(baseUrl)) {
        return url
      }
      return baseUrl + '/objectives'
    },
  },
  pages: {
    signIn: "/auth",
    error: "/auth/error",
  },
  session: {
    strategy: "database", // Utiliser database avec MongoDB Adapter
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60, // Mise à jour toutes les 24h
  },
})