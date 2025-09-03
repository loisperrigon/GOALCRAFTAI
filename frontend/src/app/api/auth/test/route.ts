import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/server/mongodb-client"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Tester la connexion MongoDB
    const client = await clientPromise
    const db = client.db()
    
    // Récupérer les collections
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(c => c.name)
    
    // Compter les utilisateurs
    const userCount = await db.collection("users").countDocuments()
    const sessionCount = await db.collection("sessions").countDocuments()
    
    // Récupérer la session actuelle
    const session = await auth()
    
    // Récupérer quelques utilisateurs (sans mot de passe)
    const users = await db.collection("users").find({}, {
      projection: { password: 0 }
    }).limit(5).toArray()
    
    return NextResponse.json({
      success: true,
      mongodb: {
        connected: true,
        collections: collectionNames,
        userCount,
        sessionCount,
        sampleUsers: users
      },
      currentSession: session,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("[Auth Test] Erreur:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
      timestamp: new Date().toISOString()
    })
  }
}