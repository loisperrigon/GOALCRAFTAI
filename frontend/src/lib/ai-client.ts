interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp?: Date
}

interface ChatResponse {
  conversationId: string
  response: string
  objective?: any  // Optionnel - peut être null pendant la discussion
  action?: "chat" | "create_objective"  // Type d'action de l'IA
  metadata?: any
  isFallback?: boolean
}

interface ChatRequest {
  message: string
  conversationId?: string
  objectiveType?: string
  action?: "chat" | "generate_objective"
}

class AIClient {
  private baseUrl = "/api/ai"

  async sendMessage(
    message: string,
    options?: {
      conversationId?: string
      objectiveType?: string
      action?: "chat" | "generate_objective"
    }
  ): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        ...options
      })
    })

    if (!response.ok) {
      throw new Error("Erreur lors de l'envoi du message")
    }

    return response.json()
  }

  async streamMessage(
    message: string,
    options?: {
      objectiveType?: string
      context?: any
    },
    onChunk?: (chunk: string) => void
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        ...options
      })
    })

    if (!response.ok) {
      throw new Error("Erreur de streaming")
    }

    const reader = response.body?.getReader()
    if (!reader) return

    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break
      
      const chunk = decoder.decode(value)
      const lines = chunk.split("\n")
      
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6)
          
          if (data === "[DONE]") {
            return
          }
          
          try {
            const parsed = JSON.parse(data)
            if (parsed.content && onChunk) {
              onChunk(parsed.content)
            }
          } catch (e) {
            // Ignorer les erreurs de parsing
          }
        }
      }
    }
  }

  async getConversation(conversationId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/chat?conversationId=${conversationId}`
    )

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération de la conversation")
    }

    return response.json()
  }

  async getConversations(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/chat`)

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des conversations")
    }

    return response.json()
  }
}

export const aiClient = new AIClient()
export type { ChatMessage, ChatResponse, ChatRequest }