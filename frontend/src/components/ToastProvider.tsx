'use client'

import { useToastStore, ToastVariant } from '@/hooks/useToast'
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const variants = {
  default: {
    icon: Info,
    className: 'bg-background border-border',
    iconColor: 'text-foreground'
  },
  success: {
    icon: CheckCircle,
    className: 'bg-green-500/10 border-green-500/30',
    iconColor: 'text-green-500'
  },
  destructive: {
    icon: AlertCircle,
    className: 'bg-red-500/10 border-red-500/30',
    iconColor: 'text-red-500'
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-500/10 border-yellow-500/30',
    iconColor: 'text-yellow-500'
  },
  info: {
    icon: Info,
    className: 'bg-blue-500/10 border-blue-500/30',
    iconColor: 'text-blue-500'
  }
}

export default function ToastProvider() {
  const { toasts, removeToast } = useToastStore()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) return null
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-md w-full px-4 md:px-0">
      {toasts.map((toast) => {
        const variant = variants[toast.variant || 'default']
        const Icon = variant.icon
        
        return (
          <div
            key={toast.id}
            className={`
              pointer-events-auto
              animate-in slide-in-from-bottom-2 fade-in
              flex items-start gap-3 
              rounded-lg border p-4 shadow-lg 
              backdrop-blur-sm
              transition-all duration-300
              ${variant.className}
            `}
          >
            <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${variant.iconColor}`} />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{toast.title}</h3>
              {toast.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}