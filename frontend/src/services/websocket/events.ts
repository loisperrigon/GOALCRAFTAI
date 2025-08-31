/**
 * Système de gestion des événements pour WebSocket
 */

type EventCallback = (...args: any[]) => void

export class EventEmitter {
  private events: Map<string, Set<EventCallback>> = new Map()
  private onceEvents: Map<string, Set<EventCallback>> = new Map()

  /**
   * Écoute d'un événement
   */
  on(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    
    this.events.get(event)!.add(callback)
    
    // Retourne une fonction de désabonnement
    return () => this.off(event, callback)
  }

  /**
   * Écoute unique d'un événement
   */
  once(event: string, callback: EventCallback): () => void {
    if (!this.onceEvents.has(event)) {
      this.onceEvents.set(event, new Set())
    }
    
    this.onceEvents.get(event)!.add(callback)
    
    // Retourne une fonction de désabonnement
    return () => {
      this.onceEvents.get(event)?.delete(callback)
    }
  }

  /**
   * Retrait d'un écouteur
   */
  off(event: string, callback: EventCallback): void {
    this.events.get(event)?.delete(callback)
    this.onceEvents.get(event)?.delete(callback)
  }

  /**
   * Émission d'un événement
   */
  emit(event: string, ...args: any[]): void {
    // Appeler les écouteurs permanents
    this.events.get(event)?.forEach(callback => {
      try {
        callback(...args)
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error)
      }
    })

    // Appeler les écouteurs uniques et les supprimer
    const onceCallbacks = this.onceEvents.get(event)
    if (onceCallbacks) {
      onceCallbacks.forEach(callback => {
        try {
          callback(...args)
        } catch (error) {
          console.error(`Error in once event listener for "${event}":`, error)
        }
      })
      this.onceEvents.delete(event)
    }
  }

  /**
   * Suppression de tous les écouteurs d'un événement
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event)
      this.onceEvents.delete(event)
    } else {
      this.events.clear()
      this.onceEvents.clear()
    }
  }

  /**
   * Nombre d'écouteurs pour un événement
   */
  listenerCount(event: string): number {
    const regularCount = this.events.get(event)?.size || 0
    const onceCount = this.onceEvents.get(event)?.size || 0
    return regularCount + onceCount
  }

  /**
   * Liste des événements écoutés
   */
  eventNames(): string[] {
    const events = new Set<string>()
    this.events.forEach((_, key) => events.add(key))
    this.onceEvents.forEach((_, key) => events.add(key))
    return Array.from(events)
  }
}