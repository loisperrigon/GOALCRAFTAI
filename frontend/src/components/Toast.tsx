"use client"

import { useEffect, useState } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

export type ToastType = "success" | "error" | "warning" | "info"

interface ToastProps {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
  onClose: (id: string) => void
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

const colors = {
  success: "border-green-500/50 bg-green-500/10 text-green-400",
  error: "border-red-500/50 bg-red-500/10 text-red-400",
  warning: "border-orange-500/50 bg-orange-500/10 text-orange-400",
  info: "border-blue-500/50 bg-blue-500/10 text-blue-400"
}

export function Toast({ id, type, title, description, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const Icon = icons[type]

  useEffect(() => {
    setIsVisible(true)
    
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose(id)
    }, 300)
  }

  return (
    <div
      className={`
        relative flex gap-3 w-full max-w-sm p-4 rounded-lg border backdrop-blur-sm
        ${colors[type]}
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={handleClose}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Array<{
    id: string
    type: ToastType
    title: string
    description?: string
    duration?: number
  }>
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  )
}