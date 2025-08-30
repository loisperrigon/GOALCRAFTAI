"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <header className="flex items-center justify-between px-8 py-6 relative z-20">
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => router.push("/")}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">G</span>
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          GoalCraftAI
        </span>
      </div>
      <nav className="hidden md:flex items-center gap-8">
        <a 
          href="#" 
          className={`relative transition-colors ${
            pathname === '/how-it-works' 
              ? 'text-foreground font-medium' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Comment ça marche
          {pathname === '/how-it-works' && (
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500" />
          )}
        </a>
        <a 
          href="#" 
          className={`relative transition-colors ${
            pathname === '/examples' 
              ? 'text-foreground font-medium' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Exemples
          {pathname === '/examples' && (
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500" />
          )}
        </a>
        <a 
          href="/pricing" 
          className={`relative transition-colors ${
            pathname === '/pricing' 
              ? 'text-foreground font-medium' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Tarifs
          {pathname === '/pricing' && (
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500" />
          )}
        </a>
        {pathname === '/create' ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">En ligne</span>
          </div>
        ) : pathname === '/auth' ? (
          <Button 
            variant="outline" 
            className="border-purple-500/50 bg-purple-500/10"
          >
            Connexion
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="border-purple-500/50 hover:bg-purple-500/10"
            onClick={() => router.push("/auth")}
          >
            Se connecter
          </Button>
        )}
      </nav>
    </header>
  )
}