import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/server/mongodb-client"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: "Email et mot de passe requis"
      })
    }
    
    const client = await clientPromise
    const db = client.db()
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.collection("users").findOne({
      email: email.toLowerCase()
    })
    
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: "Un utilisateur avec cet email existe déjà",
        user: {
          id: existingUser._id,
          email: existingUser.email,
          name: existingUser.name
        }
      })
    }
    
    // Créer le nouvel utilisateur
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = {
      email: email.toLowerCase(),
      name: email.split("@")[0],
      password: hashedPassword,
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      level: 1,
      xp: 0,
      badges: [],
      achievements: [],
      isPremium: false
    }
    
    const result = await db.collection("users").insertOne(newUser)
    
    return NextResponse.json({
      success: true,
      message: "Utilisateur créé avec succès",
      user: {
        id: result.insertedId.toString(),
        email: newUser.email,
        name: newUser.name
      }
    })
    
  } catch (error) {
    console.error("[Create Test] Erreur:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue"
    })
  }
}