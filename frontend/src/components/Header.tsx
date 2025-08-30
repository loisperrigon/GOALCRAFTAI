"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 relative z-20">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => router.push("/")}
        >
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg md:text-xl">G</span>
          </div>
          <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            GoalCraftAI
          </span>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 hover:bg-purple-500/10 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
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
        {pathname === '/objectives' ? (
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

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu */}
      <div className={`
        fixed top-0 right-0 h-full w-[280px] bg-background border-l border-border z-40 
        transform transition-transform duration-300 md:hidden
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-semibold">Menu</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-2">
          <a 
            href="#"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`px-4 py-3 rounded-lg transition-colors ${
              pathname === '/how-it-works'
                ? 'bg-purple-500/10 text-foreground font-medium'
                : 'hover:bg-purple-500/10 text-muted-foreground'
            }`}
          >
            Comment ça marche
          </a>
          <a 
            href="#"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`px-4 py-3 rounded-lg transition-colors ${
              pathname === '/examples'
                ? 'bg-purple-500/10 text-foreground font-medium'
                : 'hover:bg-purple-500/10 text-muted-foreground'
            }`}
          >
            Exemples
          </a>
          <a 
            href="/pricing"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`px-4 py-3 rounded-lg transition-colors ${
              pathname === '/pricing'
                ? 'bg-purple-500/10 text-foreground font-medium'
                : 'hover:bg-purple-500/10 text-muted-foreground'
            }`}
          >
            Tarifs
          </a>
          
          <div className="pt-4 mt-4 border-t border-border">
            {pathname === '/objectives' ? (
              <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">En ligne</span>
              </div>
            ) : (
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                onClick={() => {
                  router.push("/auth")
                  setIsMobileMenuOpen(false)
                }}
              >
                {pathname === '/auth' ? 'Connexion' : 'Se connecter'}
              </Button>
            )}
          </div>
        </nav>
      </div>
    </>
  )
}