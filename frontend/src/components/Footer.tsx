"use client"

import { useRouter } from "next/navigation"
import { Github, Twitter, Linkedin, Mail, Heart } from "lucide-react"

export default function Footer() {
  const router = useRouter()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative z-20 border-t border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
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
            <p className="text-sm text-muted-foreground">
              Transformez vos rêves en victoires épiques avec l'IA qui gamifie vos objectifs.
            </p>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-9 h-9 bg-purple-500/10 rounded-lg flex items-center justify-center hover:bg-purple-500/20 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4 text-purple-400" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 bg-purple-500/10 rounded-lg flex items-center justify-center hover:bg-purple-500/20 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4 text-purple-400" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 bg-purple-500/10 rounded-lg flex items-center justify-center hover:bg-purple-500/20 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4 text-purple-400" />
              </a>
            </div>
          </div>

          {/* Produit */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Produit</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-purple-400 transition-colors">
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a href="/pricing" className="text-muted-foreground hover:text-purple-400 transition-colors">
                  Tarifs
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-purple-400 transition-colors">
                  Exemples
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-purple-400 transition-colors">
                  Roadmap
                </a>
              </li>
            </ul>
          </div>

          {/* Ressources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Ressources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-purple-400 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-purple-400 transition-colors">
                  Guide d'utilisation
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-purple-400 transition-colors">
                  API
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-purple-400 transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Légal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-purple-400 transition-colors">
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-purple-400 transition-colors">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-purple-400 transition-colors">
                  Mentions légales
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-purple-400 transition-colors">
                  Cookies
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="max-w-md mx-auto text-center space-y-4">
            <h3 className="font-semibold text-foreground">Restez motivé !</h3>
            <p className="text-sm text-muted-foreground">
              Recevez des conseils et astuces pour atteindre vos objectifs plus rapidement.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="votre@email.com"
                  className="w-full pl-10 pr-3 py-2 bg-background/50 border border-purple-500/30 rounded-lg text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-sm font-semibold rounded-lg transition-all">
                S'inscrire
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} GoalCraftAI. Tous droits réservés.</p>
          <p className="flex items-center gap-1">
            Fait avec <Heart className="h-3 w-3 text-red-500 fill-current" /> pour vous aider à réussir
          </p>
        </div>
      </div>
    </footer>
  )
}