"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Chrome, Mail, Lock, User, X } from "lucide-react"
import { Spinner } from "@/components/ui/loader"
import { signIn } from "next-auth/react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  redirectTo?: string
}

export default function AuthModal({ isOpen, onClose, onSuccess, redirectTo = "/objectives" }: AuthModalProps) {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Pour l'instant, on utilise la connexion avec credentials (à implémenter dans NextAuth)
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      
      if (result?.error) {
        // Gérer l'erreur
        console.error("Erreur de connexion:", result.error)
        setIsLoading(false)
      } else {
        // Succès
        if (onSuccess) {
          onSuccess()
        } else {
          router.push(redirectTo)
        }
        onClose()
      }
    } catch (error) {
      console.error("Erreur:", error)
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            {isLogin ? "Connexion requise" : "Créer un compte"}
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Connectez-vous pour continuer vers votre abonnement Premium
          </p>
        </DialogHeader>

        <div className="mt-4">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all text-sm ${
                isLogin 
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white" 
                  : "text-muted-foreground hover:text-foreground bg-muted/50"
              }`}
            >
              Se connecter
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all text-sm ${
                !isLogin 
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white" 
                  : "text-muted-foreground hover:text-foreground bg-muted/50"
              }`}
            >
              S'inscrire
            </button>
          </div>

          {/* Social Auth Buttons */}
          <div className="space-y-3 mb-4">
            <Button
              type="button"
              variant="outline"
              className="w-full border-purple-500/30 hover:bg-purple-500/10"
              onClick={() => {
                setIsLoading(true)
                signIn("google", { callbackUrl: redirectTo })
              }}
              disabled={isLoading}
            >
              <Chrome className="mr-2 h-4 w-4" />
              Continuer avec Google
            </Button>
            
          </div>

          {/* Separator */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="modal-name" className="text-sm">Nom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="modal-name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-background/50"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="modal-email" className="text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="modal-email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-background/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-password" className="text-sm">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="modal-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-background/50"
                  required
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-purple-500/50" />
                  <span className="text-muted-foreground text-xs">Se souvenir</span>
                </label>
                <a href="#" className="text-purple-400 hover:text-purple-300 text-xs">
                  Mot de passe oublié ?
                </a>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Chargement...
                </div>
              ) : (
                <>
                  {isLogin ? "Se connecter" : "Créer mon compte"}
                  {" et continuer"}
                </>
              )}
            </Button>
          </form>

          {!isLogin && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              En créant un compte, vous acceptez nos{" "}
              <a href="#" className="text-purple-400 hover:text-purple-300">
                conditions
              </a>{" "}
              et notre{" "}
              <a href="#" className="text-purple-400 hover:text-purple-300">
                politique de confidentialité
              </a>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}