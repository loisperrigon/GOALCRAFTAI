import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/db-init"
import { auth } from "@/lib/auth"
import { getUniqueIdentifier } from "@/lib/rate-limiter"
import { decrypt } from "@/lib/encryption"

// GET - Récupérer une conversation par ID ou toutes les conversations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("id")
    const all = searchParams.get("all") === "true"
    
    // Vérifier l'authentification - OBLIGATOIRE
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      )
    }
    const userId = session.user.id
    
    const db = await getDatabase()
    
    // Si on demande toutes les conversations
    if (all || (!conversationId)) {
      const conversations = await db.collection("conversations")
        .find({ userId: userId }) // Filtrer par userId
        .sort({ updatedAt: -1 })
        .limit(50) // Limiter à 50 conversations
        .toArray()
      
      console.log(`[Conversations API] ${conversations.length} conversations trouvées`)
      
      // Pour chaque conversation, récupérer les infos de base de l'objectif si il existe
      const conversationsWithInfo = await Promise.all(conversations.map(async (conv) => {
        // Récupérer le dernier message s'il existe et le déchiffrer
        let lastMessage = null
        if (conv.messages && conv.messages.length > 0) {
          const encryptedMsg = conv.messages[conv.messages.length - 1]
          try {
            // Déchiffrer le contenu du dernier message
            lastMessage = {
              ...encryptedMsg,
              content: decrypt(encryptedMsg.content)
            }
          } catch (error) {
            // Si le déchiffrement échoue, utiliser le message tel quel
            console.warn("[Conversations API] Message non chiffré ou erreur déchiffrement")
            lastMessage = encryptedMsg
          }
        }
        
        // Si on a un objectiveId, récupérer juste le titre et le nombre d'étapes
        let objectiveInfo = null
        if (conv.objectiveId) {
          try {
            const { ObjectId } = await import("mongodb")
            const objective = await db.collection("objectives").findOne(
              { _id: new ObjectId(conv.objectiveId) },
              { projection: { title: 1, skillTree: 1 } } // Ne récupérer que titre et skillTree
            )
            
            if (objective) {
              objectiveInfo = {
                title: objective.title || "Sans titre",
                stepsCount: objective.skillTree?.nodes?.length || 0
              }
            }
          } catch (error) {
            console.error(`[Conversations API] Erreur récupération objectif ${conv.objectiveId}:`, error)
          }
        }
        
        // Déchiffrer lastResponse si présent (pour les placeholders)
        let decryptedLastResponse = null
        if (conv.lastResponse) {
          try {
            decryptedLastResponse = decrypt(conv.lastResponse)
            // Tronquer pour l'affichage dans la sidebar
            decryptedLastResponse = decryptedLastResponse?.substring(0, 100) + 
              (decryptedLastResponse?.length > 100 ? '...' : '')
          } catch (error) {
            // Si pas chiffré, utiliser tel quel
            decryptedLastResponse = conv.lastResponse?.substring(0, 100) + 
              (conv.lastResponse?.length > 100 ? '...' : '')
          }
        }
        
        return {
          _id: conv._id,
          userId: conv.userId,
          objectiveId: conv.objectiveId, // Garder l'ID pour le chargement complet
          objectiveInfo: objectiveInfo, // Infos de base de l'objectif
          hasObjective: !!conv.objectiveId,
          status: conv.status || 'active',
          messagesCount: (conv.messages || []).length,
          lastMessage: lastMessage ? {
            role: lastMessage.role,
            content: lastMessage.content?.substring(0, 100) + (lastMessage.content?.length > 100 ? '...' : ''),
            timestamp: lastMessage.timestamp
          } : null,
          lastResponse: decryptedLastResponse, // Ajouter lastResponse déchiffré
          lastResponseAt: conv.lastResponseAt,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt || conv.createdAt
        }
      }))
      
      return NextResponse.json({
        success: true,
        conversations: conversationsWithInfo
      })
    }
    
    // Récupérer une conversation spécifique
    const conversation = await db.collection("conversations").findOne({
      _id: conversationId
    })
    
    if (!conversation) {
      return NextResponse.json({
        success: true,
        conversation: null,
        messages: []
      })
    }
    
    // Formater et déchiffrer les messages
    const formattedMessages = (conversation.messages || []).map((msg: any) => {
      try {
        // Déchiffrer le contenu du message
        return {
          role: msg.role,
          content: decrypt(msg.content),
          timestamp: msg.timestamp || new Date()
        }
      } catch (error) {
        // Si le déchiffrement échoue, retourner le message tel quel
        console.warn("[Conversations API] Message non chiffré ou erreur déchiffrement")
        return {
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp || new Date()
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation._id,
        userId: conversation.userId,
        hasObjective: conversation.hasObjective,
        objectiveId: conversation.objectiveId,
        status: conversation.status,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      },
      messages: formattedMessages
    })
    
  } catch (error) {
    console.error("[Conversations API] Erreur:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Erreur lors de la récupération de la conversation" 
      },
      { status: 500 }
    )
  }
}