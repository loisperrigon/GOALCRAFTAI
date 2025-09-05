import { MongoClient } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// Log de connexion MongoDB
console.log("🔗 [MongoDB] Tentative de connexion à:", uri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@"))

if (process.env.NODE_ENV === "development") {
  // En développement, utiliser une variable globale pour préserver la connexion
  // entre les hot reloads
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
      .then((client) => {
        console.log("✅ [MongoDB] Connexion réussie à la base de données")
        // Lister les collections disponibles
        client.db().listCollections().toArray().then(collections => {
          console.log("📊 [MongoDB] Collections disponibles:", collections.map(c => c.name).join(", ") || "Aucune collection")
        })
        return client
      })
      .catch((error) => {
        console.error("❌ [MongoDB] Erreur de connexion:", error.message)
        throw error
      })
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // En production, créer une nouvelle connexion
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
    .then((client) => {
      console.log("✅ [MongoDB] Connexion réussie à la base de données (production)")
      return client
    })
    .catch((error) => {
      console.error("❌ [MongoDB] Erreur de connexion:", error.message)
      throw error
    })
}

export default clientPromise