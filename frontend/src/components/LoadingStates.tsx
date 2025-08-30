"use client"

import { Sparkles, Loader2 } from "lucide-react"

// Loading spinner simple
export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} />
}

// Loading complet pour page
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Sparkles className="h-10 w-10 text-purple-400 animate-pulse" />
        </div>
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    </div>
  )
}

// Skeleton pour cartes
export function CardSkeleton() {
  return (
    <div className="p-4 border border-border rounded-lg animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4 mb-3" />
      <div className="h-3 bg-muted rounded w-1/2 mb-4" />
      <div className="h-2 bg-muted rounded-full mb-2" />
      <div className="flex gap-3">
        <div className="h-3 bg-muted rounded w-16" />
        <div className="h-3 bg-muted rounded w-16" />
      </div>
    </div>
  )
}

// Skeleton pour messages chat
export function MessageSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="w-10 h-10 bg-muted rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-1/4" />
        <div className="h-3 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    </div>
  )
}

// Skeleton pour skill tree
export function SkillTreeSkeleton() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="relative">
          {/* Nodes simulés */}
          <div className="absolute -top-10 left-20 w-12 h-12 bg-muted rounded-full animate-pulse" />
          <div className="absolute top-0 -left-10 w-12 h-12 bg-muted rounded-full animate-pulse animation-delay-200" />
          <div className="absolute top-0 right-10 w-12 h-12 bg-muted rounded-full animate-pulse animation-delay-400" />
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full mx-auto animate-pulse" />
          <div className="absolute -bottom-10 left-20 w-12 h-12 bg-muted rounded-full animate-pulse animation-delay-600" />
        </div>
        <p className="text-sm text-muted-foreground mt-20">Construction de l'arbre...</p>
      </div>
    </div>
  )
}

// Loading button
export function LoadingButton({ 
  children, 
  isLoading, 
  ...props 
}: { 
  children: React.ReactNode
  isLoading: boolean
  [key: string]: any 
}) {
  return (
    <button {...props} disabled={isLoading || props.disabled}>
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Spinner className="h-4 w-4" />
          <span>Chargement...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}