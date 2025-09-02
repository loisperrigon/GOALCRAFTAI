import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "./mongodb-client"

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
        // Pour l'instant, on simule la connexion
        // À remplacer par une vraie vérification en base de données
        if (credentials?.email) {
          return {
            id: "temp-" + Date.now(),
            email: credentials.email,
            name: credentials.email.split("@")[0],
          }
        }
        return null
      }
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      // Ajouter des données personnalisées à la session
      if (session?.user) {
        session.user.id = user.id
        // @ts-ignore
        session.user.level = user.level || 1
        // @ts-ignore
        session.user.xp = user.xp || 0
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Logique personnalisée lors de la connexion
      // Par exemple, créer des données initiales pour l'utilisateur
      return true
    },
    async redirect({ url, baseUrl }) {
      // Toujours rediriger vers /objectives après connexion
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
    strategy: "database",
  },
})