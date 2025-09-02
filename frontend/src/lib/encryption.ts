import crypto from 'crypto'

// Fonction pour obtenir et valider la clé de chiffrement
function getEncryptionKey(): Buffer {
  let key = process.env.ENCRYPTION_KEY
  
  if (!key) {
    console.warn('[Encryption] ⚠️ ENCRYPTION_KEY non définie dans .env.local')
    console.warn('[Encryption] Génération d\'une clé temporaire (NON RECOMMANDÉ pour la production)')
    // Générer une clé de 32 caractères hexadécimaux
    const tempKey = crypto.randomBytes(16).toString('hex') // 16 bytes = 32 caractères hex
    console.warn('[Encryption] ============================================')
    console.warn('[Encryption] IMPORTANTE: Ajoutez cette ligne dans votre .env.local:')
    console.warn(`[Encryption] ENCRYPTION_KEY=${tempKey}`)
    console.warn('[Encryption] ============================================')
    key = tempKey
  }
  
  // Si la clé fait 32 caractères hex, la convertir en Buffer de 16 bytes
  if (key.length === 32 && /^[a-f0-9]{32}$/i.test(key)) {
    console.log('[Encryption] ✅ Clé hexadécimale valide détectée (32 caractères hex = 16 bytes)')
    return Buffer.from(key, 'hex')
  }
  
  // Si la clé fait 64 caractères hex, la convertir en Buffer de 32 bytes
  if (key.length === 64 && /^[a-f0-9]{64}$/i.test(key)) {
    console.log('[Encryption] ✅ Clé hexadécimale valide détectée (64 caractères hex = 32 bytes)')
    return Buffer.from(key, 'hex')
  }
  
  // Si la clé fait exactement 32 bytes en ASCII, l'utiliser directement
  if (key.length === 32) {
    console.log('[Encryption] ✅ Clé ASCII de 32 bytes détectée')
    return Buffer.from(key, 'utf8')
  }
  
  // Sinon, hasher la clé pour obtenir 32 bytes
  console.warn('[Encryption] ⚠️ Clé invalide, création d\'un hash SHA-256 pour obtenir 32 bytes')
  console.warn('[Encryption] Pour une meilleure sécurité, utilisez une clé de 64 caractères hex')
  console.warn('[Encryption] Générez-en une avec: openssl rand -hex 32')
  return crypto.createHash('sha256').update(key).digest()
}

// Obtenir et valider la clé au démarrage
const ENCRYPTION_KEY = getEncryptionKey()
const IV_LENGTH = 16 // Pour AES, c'est toujours 16

/**
 * Chiffre un texte avec AES-256-GCM (le plus sécurisé)
 */
export function encrypt(text: string): string {
  try {
    // Générer un vecteur d'initialisation aléatoire
    const iv = crypto.randomBytes(IV_LENGTH)
    
    // Créer le cipher avec la clé et l'IV
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      ENCRYPTION_KEY, // Déjà un Buffer maintenant
      iv
    )
    
    // Chiffrer le texte
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    // Récupérer le tag d'authentification (protection contre la modification)
    const authTag = cipher.getAuthTag()
    
    // Retourner IV + authTag + texte chiffré (tout en hex)
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
  } catch (error) {
    console.error('[Encryption] Erreur lors du chiffrement:', error)
    throw new Error('Impossible de chiffrer les données')
  }
}

/**
 * Déchiffre un texte chiffré avec AES-256-GCM
 */
export function decrypt(encryptedText: string): string {
  try {
    // Séparer l'IV, le tag et le texte chiffré
    const parts = encryptedText.split(':')
    if (parts.length !== 3) {
      throw new Error('Format de données chiffrées invalide')
    }
    
    const iv = Buffer.from(parts[0], 'hex')
    const authTag = Buffer.from(parts[1], 'hex')
    const encrypted = parts[2]
    
    // Créer le decipher
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      ENCRYPTION_KEY, // Déjà un Buffer maintenant
      iv
    )
    
    // Définir le tag d'authentification
    decipher.setAuthTag(authTag)
    
    // Déchiffrer
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('[Encryption] Erreur lors du déchiffrement:', error)
    throw new Error('Impossible de déchiffrer les données')
  }
}

/**
 * Chiffre un objet complet (le convertit en JSON puis chiffre)
 */
export function encryptObject(obj: any): string {
  const jsonString = JSON.stringify(obj)
  return encrypt(jsonString)
}

/**
 * Déchiffre et parse un objet JSON chiffré
 */
export function decryptObject(encryptedText: string): any {
  const jsonString = decrypt(encryptedText)
  return JSON.parse(jsonString)
}

/**
 * Chiffre uniquement les champs sensibles d'une conversation
 */
export function encryptConversation(conversation: any) {
  // Copier l'objet pour ne pas le modifier
  const encrypted = { ...conversation }
  
  // Chiffrer les messages
  if (encrypted.messages && Array.isArray(encrypted.messages)) {
    encrypted.messages = encrypted.messages.map((msg: any) => ({
      ...msg,
      content: encrypt(msg.content), // Chiffrer le contenu du message
      role: msg.role, // Garder le rôle en clair pour les requêtes
      timestamp: msg.timestamp
    }))
  }
  
  // Chiffrer le titre de l'objectif si présent
  if (encrypted.objectiveTitle) {
    encrypted.objectiveTitle = encrypt(encrypted.objectiveTitle)
  }
  
  // Chiffrer la description de l'objectif si présente
  if (encrypted.objectiveDescription) {
    encrypted.objectiveDescription = encrypt(encrypted.objectiveDescription)
  }
  
  return encrypted
}

/**
 * Déchiffre une conversation
 */
export function decryptConversation(conversation: any) {
  // Copier l'objet
  const decrypted = { ...conversation }
  
  // Déchiffrer les messages
  if (decrypted.messages && Array.isArray(decrypted.messages)) {
    decrypted.messages = decrypted.messages.map((msg: any) => {
      try {
        return {
          ...msg,
          content: decrypt(msg.content) // Déchiffrer le contenu
        }
      } catch (error) {
        // Si le déchiffrement échoue, retourner le message tel quel
        // (peut-être qu'il n'était pas chiffré)
        console.warn('[Encryption] Message non chiffré ou erreur:', error)
        return msg
      }
    })
  }
  
  // Déchiffrer le titre si présent et chiffré
  if (decrypted.objectiveTitle) {
    try {
      decrypted.objectiveTitle = decrypt(decrypted.objectiveTitle)
    } catch (error) {
      // Garder tel quel si pas chiffré
    }
  }
  
  // Déchiffrer la description si présente et chiffrée
  if (decrypted.objectiveDescription) {
    try {
      decrypted.objectiveDescription = decrypt(decrypted.objectiveDescription)
    } catch (error) {
      // Garder tel quel si pas chiffré
    }
  }
  
  return decrypted
}


/**
 * Hash un mot de passe avec bcrypt (pour l'authentification credentials)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return salt + ':' + hash
}

/**
 * Vérifie un mot de passe hashé
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [salt, hash] = hashedPassword.split(':')
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return hash === verifyHash
}