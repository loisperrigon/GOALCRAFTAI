/**
 * Système de tracking anonyme persistant
 * Utilise plusieurs méthodes pour identifier un utilisateur même s'il change d'IP
 */

import crypto from "crypto"

interface AnonymousUser {
  id: string
  fingerprint: string
  firstSeen: Date
  lastSeen: Date
  messageCount: number
  ipHistory: string[]
  deviceInfo: {
    userAgent?: string
    language?: string
    platform?: string
  }
}

/**
 * Génère un fingerprint basé sur plusieurs facteurs
 * Plus robuste qu'une simple IP
 */
export function generateFingerprint(request: Request): string {
  const headers = request.headers
  
  // Facteurs pour le fingerprint
  const factors = {
    userAgent: headers.get("user-agent") || "",
    acceptLanguage: headers.get("accept-language") || "",
    acceptEncoding: headers.get("accept-encoding") || "",
    dnt: headers.get("dnt") || "",
    // Canvas fingerprint et WebGL peuvent être ajoutés côté client
  }
  
  // Créer un hash stable
  const fingerprintString = JSON.stringify(factors)
  return crypto
    .createHash("sha256")
    .update(fingerprintString)
    .digest("hex")
    .substring(0, 16)
}

/**
 * Associe un utilisateur anonyme à un compte lors de l'inscription
 */
export async function linkAnonymousToUser(
  anonymousId: string,
  userId: string,
  db: any
) {
  try {
    // Transférer toutes les conversations anonymes vers le compte utilisateur
    await db.collection("conversations").updateMany(
      { userId: anonymousId },
      { $set: { userId: userId, migratedFrom: anonymousId } }
    )
    
    // Transférer les objectifs
    await db.collection("objectives").updateMany(
      { userId: anonymousId },
      { $set: { userId: userId, migratedFrom: anonymousId } }
    )
    
    // Enregistrer la migration
    await db.collection("user_migrations").insertOne({
      anonymousId,
      userId,
      migratedAt: new Date()
    })
    
    return true
  } catch (error) {
    console.error("Erreur lors de la migration anonyme->user:", error)
    return false
  }
}

/**
 * Vérifie si un utilisateur anonyme existe déjà
 * Utilise le fingerprint pour retrouver même si l'IP change
 */
export async function findOrCreateAnonymousUser(
  request: Request,
  db: any
): Promise<AnonymousUser> {
  const fingerprint = generateFingerprint(request)
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"
  
  // Chercher par fingerprint
  let anonUser = await db.collection("anonymous_users").findOne({
    fingerprint: fingerprint
  })
  
  if (anonUser) {
    // Mettre à jour les infos
    await db.collection("anonymous_users").updateOne(
      { fingerprint },
      {
        $set: { lastSeen: new Date() },
        $inc: { messageCount: 1 },
        $addToSet: { ipHistory: ip } // Ajouter l'IP si nouvelle
      }
    )
  } else {
    // Créer un nouvel utilisateur anonyme
    const newUser: AnonymousUser = {
      id: `anon-${fingerprint}`,
      fingerprint,
      firstSeen: new Date(),
      lastSeen: new Date(),
      messageCount: 1,
      ipHistory: [ip],
      deviceInfo: {
        userAgent: request.headers.get("user-agent") || undefined,
        language: request.headers.get("accept-language") || undefined
      }
    }
    
    await db.collection("anonymous_users").insertOne(newUser)
    anonUser = newUser
  }
  
  return anonUser
}

/**
 * Nettoie les anciennes données anonymes (RGPD)
 */
export async function cleanupOldAnonymousData(db: any) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  // Supprimer les utilisateurs anonymes inactifs depuis 30 jours
  await db.collection("anonymous_users").deleteMany({
    lastSeen: { $lt: thirtyDaysAgo },
    messageCount: { $lt: 10 } // Garder ceux qui ont beaucoup interagi
  })
  
  // Supprimer les conversations orphelines
  await db.collection("conversations").deleteMany({
    userId: { $regex: /^anon-/ },
    updatedAt: { $lt: thirtyDaysAgo }
  })
}