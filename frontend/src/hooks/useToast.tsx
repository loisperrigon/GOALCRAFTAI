"use client"

import { create } from "zustand"

export type ToastVariant = "default" | "success" | "destructive" | "warning" | "info"

interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

// Store global pour les toasts
export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Date.now().toString() + Math.random().toString(36)
    const duration = toast.duration ?? (toast.variant === 'destructive' ? 5000 : 3000)
    
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id, duration }]
    }))
    
    // Auto-remove après la durée spécifiée
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id)
        }))
      }, duration)
    }
    
    return id
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
  },
  clearToasts: () => {
    set({ toasts: [] })
  }
}))

// Hook principal pour utiliser les toasts
export function useToast() {
  const { addToast, removeToast, clearToasts } = useToastStore()

  // Méthode principale avec objet de configuration
  const toast = (config: {
    title: string
    description?: string
    variant?: ToastVariant
    duration?: number
  }) => {
    return addToast(config)
  }
  
  // Méthodes de raccourci pour chaque type
  toast.success = (title: string, description?: string) => {
    return addToast({ title, description, variant: "success" })
  }
  
  toast.error = (title: string, description?: string) => {
    return addToast({ title, description, variant: "destructive" })
  }
  
  toast.warning = (title: string, description?: string) => {
    return addToast({ title, description, variant: "warning" })
  }
  
  toast.info = (title: string, description?: string) => {
    return addToast({ title, description, variant: "info" })
  }
  
  toast.dismiss = (id: string) => removeToast(id)
  toast.dismissAll = () => clearToasts()

  return { toast, removeToast, clearToasts }
}