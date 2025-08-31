import { LRUCache } from "lru-cache"

// Types de limiteurs
type RateLimiterType = "global" | "auth" | "anon"

interface RateLimiterOptions {
  uniqueTokenPerInterval?: number
  interval?: number
  maxRequests?: number
}

// Configurations par type d'utilisateur
const LIMITS = {
  // Utilisateurs anonymes : très limités pour éviter les abus
  anon: {
    maxRequests: 3,        // 3 requêtes max
    interval: 60 * 1000,   // par minute
    dailyLimit: 5          // max 5 messages par jour (1 objectif de test)
  },
  // Utilisateurs connectés gratuits
  free: {
    maxRequests: 5,        // 5 requêtes
    interval: 60 * 1000,   // par minute
    dailyLimit: 20         // max 20 messages par jour (3-4 objectifs)
  },
  // Utilisateurs premium
  premium: {
    maxRequests: 10,       // 10 requêtes
    interval: 60 * 1000,   // par minute
    dailyLimit: 50         // max 50 messages par jour (8-10 objectifs)
  }
}

// Cache LRU pour stocker les tentatives
const rateLimiters = new Map<string, LRUCache<string, number[]>>()

function getRateLimiter(type: RateLimiterType, options: RateLimiterOptions) {
  const key = `${type}-${options.interval}`
  
  if (!rateLimiters.has(key)) {
    const cache = new LRUCache<string, number[]>({
      max: options.uniqueTokenPerInterval || 500,
      ttl: options.interval || 60000,
    })
    rateLimiters.set(key, cache)
  }
  
  return rateLimiters.get(key)!
}

export async function rateLimit(
  identifier: string,
  userType: "anon" | "free" | "premium" = "anon"
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  const limits = LIMITS[userType]
  const now = Date.now()
  
  // Limiter par minute
  const minuteLimiter = getRateLimiter("global", {
    uniqueTokenPerInterval: 500,
    interval: limits.interval,
    maxRequests: limits.maxRequests
  })
  
  const tokenRequests = minuteLimiter.get(identifier) || []
  const requestsInWindow = tokenRequests.filter(
    (timestamp) => now - timestamp < limits.interval
  )
  
  if (requestsInWindow.length >= limits.maxRequests) {
    return {
      success: false,
      limit: limits.maxRequests,
      remaining: 0,
      reset: Math.ceil((requestsInWindow[0] + limits.interval - now) / 1000)
    }
  }
  
  // Limiter quotidien
  const dailyKey = `${identifier}-daily-${new Date().toDateString()}`
  const dailyLimiter = getRateLimiter("global", {
    uniqueTokenPerInterval: 1000,
    interval: 24 * 60 * 60 * 1000, // 24h
    maxRequests: limits.dailyLimit
  })
  
  const dailyRequests = dailyLimiter.get(dailyKey) || []
  if (dailyRequests.length >= limits.dailyLimit) {
    return {
      success: false,
      limit: limits.dailyLimit,
      remaining: 0,
      reset: Math.ceil((24 * 60 * 60 * 1000) / 1000) // Reset dans 24h
    }
  }
  
  // Ajouter la nouvelle requête
  requestsInWindow.push(now)
  dailyRequests.push(now)
  minuteLimiter.set(identifier, requestsInWindow)
  dailyLimiter.set(dailyKey, dailyRequests)
  
  return {
    success: true,
    limit: limits.maxRequests,
    remaining: limits.maxRequests - requestsInWindow.length,
    reset: Math.ceil(limits.interval / 1000)
  }
}

// Fonction pour obtenir un identifiant unique plus robuste
export function getUniqueIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : "unknown"
  
  // Combiner plusieurs facteurs pour un fingerprint plus robuste
  const userAgent = request.headers.get("user-agent") || "unknown"
  const acceptLanguage = request.headers.get("accept-language") || "unknown"
  const acceptEncoding = request.headers.get("accept-encoding") || "unknown"
  
  // Créer un hash simple mais efficace
  const fingerprint = `${ip}-${userAgent.substring(0, 50)}-${acceptLanguage}-${acceptEncoding}`
  
  // Encoder en base64 pour éviter les caractères spéciaux
  return Buffer.from(fingerprint).toString("base64").substring(0, 32)
}

// Middleware pour vérifier les limites
export async function checkRateLimit(
  request: Request,
  userType: "anon" | "free" | "premium" = "anon"
) {
  const identifier = getUniqueIdentifier(request)
  const result = await rateLimit(identifier, userType)
  
  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: "Trop de requêtes. Veuillez patienter.",
        retryAfter: result.reset
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": result.limit?.toString() || "0",
          "X-RateLimit-Remaining": result.remaining?.toString() || "0",
          "X-RateLimit-Reset": result.reset?.toString() || "0",
          "Retry-After": result.reset?.toString() || "60"
        }
      }
    )
  }
  
  return null // Continuer si OK
}