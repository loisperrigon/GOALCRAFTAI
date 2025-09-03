import { NextResponse } from "next/server"
import clientPromise from "@/lib/server/mongodb-client"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()
    
    // Récupérer TOUS les utilisateurs
    const users = await db.collection("users").find({}, {
      projection: { password: 0 } // Ne pas exposer les mots de passe
    }).toArray()
    
    // Récupérer les comptes OAuth liés
    const accounts = await db.collection("accounts").find({}).toArray()
    
    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      users: users.map(u => ({
        id: u._id,
        email: u.email,
        name: u.name,
        createdAt: u.createdAt || "Non défini",
        emailVerified: u.emailVerified,
        provider: u.provider || "Non défini"
      })),
      oauthAccounts: accounts.map(a => ({
        userId: a.userId,
        provider: a.provider,
        type: a.type,
        createdAt: a.createdAt || "Non défini"
      }))
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erreur"
    })
  }
}