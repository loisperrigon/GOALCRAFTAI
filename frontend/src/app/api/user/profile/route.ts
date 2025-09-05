import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { MongoClient } from "mongodb"

const client = new MongoClient(process.env.MONGODB_URI!)
let clientPromise = client.connect()

export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Se connecter à MongoDB
    const client = await clientPromise
    const db = client.db("goalcraft")
    const users = db.collection("users")
    
    // Récupérer l'utilisateur complet depuis MongoDB
    const user = await users.findOne(
      { email: session.user.email },
      { 
        projection: { 
          _id: 0,
          password: 0 // Ne jamais renvoyer le mot de passe
        } 
      }
    )
    
    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Récupérer les stats supplémentaires
    const objectives = db.collection("objectives")
    const conversations = db.collection("conversations")
    
    // Compter les objectifs
    const totalObjectives = await objectives.countDocuments({
      userId: session.user.id || session.user.email
    })
    
    const completedObjectives = await objectives.countDocuments({
      userId: session.user.id || session.user.email,
      status: "completed"
    })
    
    // Récupérer le streak depuis la collection appropriée si elle existe
    // Pour l'instant on utilise des valeurs par défaut
    const currentStreak = user.currentStreak || 0
    const longestStreak = user.longestStreak || 0
    
    // Formater la réponse avec toutes les données
    const profileData = {
      id: user.id || user._id || session.user.email,
      email: user.email,
      name: user.name || session.user.name,
      avatar: user.avatar || user.image || session.user.image,
      bio: user.bio || "Nouvel utilisateur de GoalCraft. Prêt à transformer mes rêves en réalité !",
      level: user.level || 1,
      xp: user.xp || 0,
      xpToNextLevel: user.xpToNextLevel || 100,
      badges: user.badges || [],
      achievements: user.achievements || [],
      createdAt: user.createdAt || new Date(),
      premiumType: user.premiumType || 'free',
      premiumExpiresAt: user.premiumExpiresAt,
      settings: user.settings || {
        notifications: true,
        darkMode: true,
        language: "fr",
        soundEnabled: true,
        musicEnabled: false,
        soundVolume: 0.7
      },
      // Stats calculées
      totalObjectives,
      completedObjectives,
      currentStreak,
      longestStreak
    }
    
    return NextResponse.json({
      success: true,
      user: profileData
    })
    
  } catch (error) {
    console.error("[API] Erreur lors de la récupération du profil:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// Route pour mettre à jour le profil
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }
    
    const updates = await req.json()
    
    // Filtrer les champs qu'on peut mettre à jour
    const allowedFields = [
      'name', 
      'bio', 
      'avatar', 
      'settings',
      'premiumType', // Seulement via Stripe normalement
      'premiumExpiresAt'
    ]
    
    const filteredUpdates: any = {}
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field]
      }
    }
    
    // Se connecter à MongoDB
    const client = await clientPromise
    const db = client.db("goalcraft")
    const users = db.collection("users")
    
    // Mettre à jour l'utilisateur
    const result = await users.updateOne(
      { email: session.user.email },
      { 
        $set: {
          ...filteredUpdates,
          updatedAt: new Date()
        }
      }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: "Profil mis à jour"
    })
    
  } catch (error) {
    console.error("[API] Erreur lors de la mise à jour du profil:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}