/**
 * Cache temporaire pour stocker les associations messageId/conversationId
 * Car n8n ne renvoie pas toujours ces données
 */

interface WebhookContext {
  messageId: string
  conversationId: string
  userId: string
  timestamp: number
}

// Store en mémoire (pourrait être Redis en production)
const webhookCache = new Map<string, WebhookContext>()

// Nettoyer les entrées de plus de 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of webhookCache.entries()) {
    if (now - value.timestamp > 5 * 60 * 1000) {
      webhookCache.delete(key)
      console.log(`🗑️ [WebhookCache] Nettoyage de l'entrée expirée: ${key}`)
    }
  }
}, 60000) // Toutes les minutes

export function storeWebhookContext(messageId: string, conversationId: string, userId: string) {
  const context: WebhookContext = {
    messageId,
    conversationId,
    userId,
    timestamp: Date.now()
  }
  
  // Stocker avec plusieurs clés pour retrouver facilement
  webhookCache.set(messageId, context)
  webhookCache.set(`conv:${conversationId}`, context)
  webhookCache.set(`last`, context) // Toujours garder le dernier
  
  console.log(`💾 [WebhookCache] Context stocké pour messageId: ${messageId}`)
}

export function getWebhookContext(key?: string): WebhookContext | null {
  // Si pas de clé, retourner le dernier
  if (!key) {
    return webhookCache.get('last') || null
  }
  
  // Essayer différentes clés
  return webhookCache.get(key) || 
         webhookCache.get(`conv:${key}`) || 
         webhookCache.get('last') || 
         null
}

export function getLastWebhookContext(): WebhookContext | null {
  return webhookCache.get('last') || null
}

export function clearWebhookCache() {
  webhookCache.clear()
  console.log("🧹 [WebhookCache] Cache vidé")
}