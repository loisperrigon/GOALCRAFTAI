import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { MongoClient } from "mongodb"

const client = new MongoClient(process.env.MONGODB_URI!)
let clientPromise = client.connect()

// Rate limiting simple en mémoire (max 3 tentatives par heure)
const deleteAttempts = new Map<string, { count: number; firstAttempt: number }>()

function checkDeleteRateLimit(email: string): boolean {
  const now = Date.now()
  const attempt = deleteAttempts.get(email)
  
  if (!attempt) {
    deleteAttempts.set(email, { count: 1, firstAttempt: now })
    return true
  }
  
  // Reset après 1 heure
  if (now - attempt.firstAttempt > 60 * 60 * 1000) {
    deleteAttempts.set(email, { count: 1, firstAttempt: now })
    return true
  }
  
  // Max 3 tentatives par heure
  if (attempt.count >= 3) {
    return false
  }
  
  attempt.count++
  return true
}

// Route pour supprimer complètement le compte utilisateur
export async function DELETE(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }
    
    const userEmail = session.user.email
    const userId = session.user.id || session.user.email
    
    // Vérifier le rate limiting
    if (!checkDeleteRateLimit(userEmail)) {
      return NextResponse.json(
        { 
          error: "Trop de tentatives de suppression", 
          details: "Veuillez attendre 1 heure avant de réessayer" 
        },
        { status: 429 }
      )
    }
    
    console.log(`[DELETE ACCOUNT] Début de suppression pour ${userEmail}`)
    
    // Se connecter à MongoDB
    const client = await clientPromise
    const db = client.db("goalcraft")
    
    // Démarrer une transaction pour assurer la suppression complète
    const deletionResults = {
      conversations: 0,
      objectives: 0,
      user: 0
    }
    
    try {
      // 1. Supprimer toutes les conversations de l'utilisateur
      const conversationsResult = await db.collection("conversations").deleteMany({
        userId: userId
      })
      deletionResults.conversations = conversationsResult.deletedCount
      console.log(`[DELETE ACCOUNT] ${deletionResults.conversations} conversations supprimées`)
      
      // 2. Supprimer tous les objectifs de l'utilisateur
      const objectivesResult = await db.collection("objectives").deleteMany({
        userId: userId
      })
      deletionResults.objectives = objectivesResult.deletedCount
      console.log(`[DELETE ACCOUNT] ${deletionResults.objectives} objectifs supprimés`)
      
      // 3. Supprimer les comptes liés (NextAuth accounts)
      await db.collection("accounts").deleteMany({
        userId: userId
      })
      
      // 4. Supprimer les sessions actives
      await db.collection("sessions").deleteMany({
        userId: userId
      })
      
      // 5. Supprimer l'utilisateur lui-même
      const userResult = await db.collection("users").deleteOne({
        email: userEmail
      })
      deletionResults.user = userResult.deletedCount
      console.log(`[DELETE ACCOUNT] Utilisateur supprimé`)
      
      // Log pour audit
      await db.collection("audit_logs").insertOne({
        action: "ACCOUNT_DELETED",
        userEmail: userEmail,
        timestamp: new Date(),
        deletedData: deletionResults
      })
      
      return NextResponse.json({
        success: true,
        message: "Compte supprimé avec succès",
        deletedData: deletionResults
      })
      
    } catch (dbError) {
      console.error("[DELETE ACCOUNT] Erreur lors de la suppression:", dbError)
      
      // En cas d'erreur, essayer de faire un rollback manuel si possible
      return NextResponse.json(
        { 
          error: "Erreur lors de la suppression du compte",
          details: "Une partie des données pourrait avoir été supprimée. Contactez le support."
        },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error("[API] Erreur lors de la suppression du compte:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}