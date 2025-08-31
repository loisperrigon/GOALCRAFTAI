import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import clientPromise from "@/lib/mongodb"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères")
})

const rateLimitMap = new Map<string, { count: number; lastRequest: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)
  
  if (!limit) {
    rateLimitMap.set(ip, { count: 1, lastRequest: now })
    return true
  }
  
  // Reset après 1 heure
  if (now - limit.lastRequest > 60 * 60 * 1000) {
    rateLimitMap.set(ip, { count: 1, lastRequest: now })
    return true
  }
  
  // Max 5 inscriptions par heure par IP
  if (limit.count >= 5) {
    return false
  }
  
  limit.count++
  limit.lastRequest = now
  return true
}

export async function POST(request: Request) {
  try {
    // Rate limiting par IP
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Trop de tentatives. Veuillez réessayer plus tard." },
        { status: 429 }
      )
    }

    const body = await request.json()
    
    // Validation
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      )
    }

    const { email, password, name } = validationResult.data

    // Connexion à MongoDB
    const client = await clientPromise
    const db = client.db()
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.collection("users").findOne({ 
      email: email.toLowerCase() 
    })
    
    if (existingUser) {
      // Délai artificiel pour éviter timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000))
      return NextResponse.json(
        { error: "Erreur lors de la création du compte" },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const result = await db.collection("users").insertOne({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      level: 1,
      xp: 0,
      isPremium: false,
      badges: [],
      achievements: [],
      provider: "credentials"
    })

    if (!result.insertedId) {
      return NextResponse.json(
        { error: "Erreur lors de la création du compte" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "Compte créé avec succès" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}