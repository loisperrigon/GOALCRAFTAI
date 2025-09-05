import { useToastStore } from '@/hooks/useToast'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseUrl: string = ''
  
  constructor() {
    // L'URL de base est relative pour utiliser le même domaine
    this.baseUrl = ''
  }
  
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type')
    const isJson = contentType?.includes('application/json')
    
    let data: any
    
    if (isJson) {
      data = await response.json()
    } else {
      data = await response.text()
    }
    
    if (!response.ok) {
      // Afficher automatiquement un toast d'erreur
      const errorMessage = data?.error || data?.message || `Erreur ${response.status}: ${response.statusText}`
      
      // Accès direct au store pour afficher le toast
      useToastStore.getState().addToast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive'
      })
      
      throw new Error(errorMessage)
    }
    
    return data
  }
  
  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })
      
      return await this.handleResponse<T>(response)
    } catch (error) {
      // Si c'est une erreur réseau
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        useToastStore.getState().addToast({
          title: 'Erreur de connexion',
          description: 'Impossible de contacter le serveur. Vérifiez votre connexion internet.',
          variant: 'destructive'
        })
      }
      
      throw error
    }
  }
  
  // Méthodes HTTP
  async get<T>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' })
  }
  
  async post<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }
  
  async put<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }
  
  async patch<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
  }
  
  async delete<T>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' })
  }
}

// Export d'une instance unique
export const apiClient = new ApiClient()

// Hook pour utiliser dans les composants avec gestion d'état loading
export function useApiClient() {
  const showSuccess = (message: string) => {
    useToastStore.getState().addToast({
      title: 'Succès',
      description: message,
      variant: 'success'
    })
  }
  
  return {
    api: apiClient,
    showSuccess
  }
}