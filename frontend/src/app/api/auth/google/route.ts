import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { getDatabase } from '@/lib/db-init'

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()
    
    if (!credential) {
      return NextResponse.json(
        { success: false, error: 'Credential manquant' },
        { status: 400 }
      )
    }

    // Vérifier le token avec Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    })
    
    const payload = ticket.getPayload()
    
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 401 }
      )
    }

    // Extraire les informations utilisateur
    const { sub: googleId, email, name, picture } = payload
    
    // Connexion à la base de données
    const db = await getDatabase()
    
    // Chercher ou créer l'utilisateur
    let user = await db.collection('users').findOne({ googleId })
    
    if (!user) {
      // Créer un nouvel utilisateur
      const newUser = {
        googleId,
        email,
        name,
        avatar: picture,
        provider: 'google',
        level: 1,
        xp: 0,
        badges: [],
        achievements: [],
        objectives: [],
        settings: {
          theme: 'dark',
          notifications: true,
          sound: true,
          language: 'fr'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      const result = await db.collection('users').insertOne(newUser)
      user = { ...newUser, _id: result.insertedId }
    } else {
      // Mettre à jour les infos de l'utilisateur existant
      await db.collection('users').updateOne(
        { googleId },
        {
          $set: {
            email,
            name,
            avatar: picture,
            updatedAt: new Date(),
          }
        }
      )
    }

    // Créer une session (dans une vraie app, utiliser JWT ou sessions)
    // Pour l'instant, on retourne juste les données utilisateur
    
    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        level: user.level,
        xp: user.xp,
        badges: user.badges,
        achievements: user.achievements,
        objectives: user.objectives,
        settings: user.settings,
      }
    })
    
  } catch (error) {
    console.error('[Google Auth] Erreur:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}