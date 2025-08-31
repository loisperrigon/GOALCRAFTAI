// Vérifier qu'on est côté serveur
if (typeof window !== "undefined") {
  throw new Error("db-init.ts ne doit être utilisé que côté serveur")
}

import { MongoClient, Db } from "mongodb"

// Variable globale pour stocker la connexion
let mongoClient: MongoClient | null = null
let database: Db | null = null

/**
 * Initialise la connexion MongoDB une seule fois au démarrage
 */
export async function initDatabase(): Promise<void> {
  if (mongoClient && database) {
    console.log("⚡ [MongoDB] Connexion déjà établie")
    return
  }

  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/goalcraft"
  
  try {
    console.log("🔗 [MongoDB] Connexion au serveur...")
    console.log("📍 [MongoDB] URI:", uri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@"))
    
    // Options pour maintenir la connexion active
    mongoClient = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    
    await mongoClient.connect()
    
    database = mongoClient.db()
    
    // Vérifier la connexion
    await database.admin().ping()
    console.log("✅ [MongoDB] Connexion établie avec succès!")
    
    // Lister les collections
    const collections = await database.listCollections().toArray()
    console.log("📊 [MongoDB] Collections:", collections.map(c => c.name).join(", ") || "Aucune collection")
    
    // Créer les index si nécessaire
    await createIndexes()
    
    // Heartbeat pour maintenir la connexion active
    setInterval(async () => {
      try {
        await database?.admin().ping()
        console.log("💓 [MongoDB] Heartbeat - connexion active")
      } catch (error) {
        console.error("⚠️ [MongoDB] Heartbeat failed, tentative de reconnexion...")
        await reconnect()
      }
    }, 30000) // Toutes les 30 secondes
    
    // Gérer les événements de connexion
    mongoClient.on("serverClosed", () => {
      console.warn("⚠️ [MongoDB] Connexion fermée par le serveur")
      reconnect()
    })
    
    mongoClient.on("error", (error) => {
      console.error("❌ [MongoDB] Erreur de connexion:", error)
      reconnect()
    })
    
    // Gérer la fermeture propre
    process.on("SIGINT", async () => {
      console.log("🔌 [MongoDB] Fermeture de la connexion...")
      await mongoClient?.close()
      process.exit(0)
    })
    
  } catch (error) {
    console.error("❌ [MongoDB] Erreur de connexion:", error)
    throw error
  }
}

/**
 * Reconnexion automatique à MongoDB
 */
async function reconnect() {
  try {
    if (mongoClient) {
      console.log("🔄 [MongoDB] Tentative de reconnexion...")
      await mongoClient.close()
      mongoClient = null
      database = null
      await initDatabase()
      console.log("✅ [MongoDB] Reconnexion réussie!")
    }
  } catch (error) {
    console.error("❌ [MongoDB] Échec de reconnexion:", error)
    // Réessayer dans 5 secondes
    setTimeout(reconnect, 5000)
  }
}

/**
 * Créer les index pour optimiser les performances
 */
async function createIndexes() {
  if (!database) return
  
  try {
    // Index pour les conversations
    await database.collection("conversations").createIndex({ userId: 1, updatedAt: -1 })
    await database.collection("conversations").createIndex({ lastMessageId: 1 })
    
    // Index pour les objectives
    await database.collection("objectives").createIndex({ userId: 1, createdAt: -1 })
    
    // Index pour les users
    await database.collection("users").createIndex({ email: 1 }, { unique: true, sparse: true })
    
    console.log("📋 [MongoDB] Index créés/vérifiés")
  } catch (error) {
    console.error("⚠️ [MongoDB] Erreur lors de la création des index:", error)
  }
}

/**
 * Récupère la base de données avec vérification de connexion
 * @throws Error si la base n'est pas initialisée
 */
export async function getDatabase(): Promise<Db> {
  if (!database || !mongoClient) {
    console.warn("⚠️ [MongoDB] Base non initialisée, tentative d'initialisation...")
    await initDatabase()
  }
  
  // Vérifier que la connexion est toujours active
  try {
    await database?.admin().ping()
  } catch (error) {
    console.warn("⚠️ [MongoDB] Connexion perdue, reconnexion...")
    await reconnect()
  }
  
  if (!database) {
    throw new Error("Impossible de se connecter à MongoDB")
  }
  
  return database
}

/**
 * Récupère le client MongoDB
 * @throws Error si le client n'est pas initialisé
 */
export function getMongoClient(): MongoClient {
  if (!mongoClient) {
    throw new Error("MongoDB client not initialized. Call initDatabase() first.")
  }
  return mongoClient
}

/**
 * Vérifie si la base de données est connectée
 */
export function isDatabaseConnected(): boolean {
  return mongoClient !== null && database !== null
}