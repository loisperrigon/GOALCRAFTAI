"use client"

import { create } from "zustand"
import { ToastType } from "@/components/Toast"

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Date.now().toString()
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }]
    }))
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

export function useToast() {
  const { addToast, removeToast, clearToasts } = useToastStore()

  const toast = {
    success: (title: string, description?: string) => {
      addToast({ type: "success", title, description })
    },
    error: (title: string, description?: string) => {
      addToast({ type: "error", title, description })
    },
    warning: (title: string, description?: string) => {
      addToast({ type: "warning", title, description })
    },
    info: (title: string, description?: string) => {
      addToast({ type: "info", title, description })
    }
  }

  return { toast, removeToast, clearToasts }
}