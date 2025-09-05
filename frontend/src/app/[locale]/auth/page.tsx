"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Chrome, Mail, Lock, User, Sparkles, Trophy, Target, Zap } from "lucide-react"
import Header from "@/components/Header"
import { Spinner } from "@/components/ui/loader"
import Footer from "@/components/Footer"

export default function AuthPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  console.log("[Auth Page] Session status:", status)
  console.log("[Auth Page] Session data:", session)
  
  // Rediriger vers /objectives si déjà connecté
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/objectives')
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    console.log("[Auth Page] Tentative de connexion avec:", email)
    console.log("[Auth Page] Mode:", isLogin ? "Connexion" : "Inscription")
    
    try {
      // Pour l'inscription ET la connexion, on utilise credentials
      // Le backend gère automatiquement la création si l'utilisateur n'existe pas
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      
      console.log("[Auth Page] Résultat signIn:", result)
      
      if (result?.error) {
        // Afficher un message d'erreur approprié
        if (result.error === "CredentialsSignin") {
          setError(isLogin ? "Email ou mot de passe incorrect" : "Erreur lors de l'inscription")
        } else {
          setError("Une erreur est survenue. Veuillez réessayer.")
        }
        console.error("[Auth Page] Erreur auth:", result.error)
      } else if (result?.ok) {
        // Connexion réussie
        console.log("[Auth Page] Connexion réussie, redirection vers /objectives")
        router.push("/objectives")
      } else {
        console.log("[Auth Page] Résultat inattendu:", result)
      }
    } catch (error) {
      console.error("[Auth Page] Erreur exception:", error)
      setError("Une erreur inattendue est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialAuth = async (provider: string) => {
    setIsLoading(true)
    setError(null)
    
    console.log("[Auth Page] Tentative de connexion avec:", provider)
    
    try {
      const result = await signIn(provider, { callbackUrl: "/objectives" })
      console.log("[Auth Page] Résultat social auth:", result)
    } catch (error) {
      console.error("[Auth Page] Erreur auth social:", error)
      setError("Erreur lors de la connexion avec " + provider)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden relative flex flex-col">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-blue-900/20" />
      
      {/* Animated particles effect */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full filter blur-[128px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/30 rounded-full filter blur-[128px] animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/20 rounded-full filter blur-[128px] animate-pulse animation-delay-4000" />
      </div>

      <Header />

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-md">
          <Card className="bg-card/50 backdrop-blur border-purple-500/20 p-6 md:p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                isLogin 
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Se connecter
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                !isLogin 
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              S'inscrire
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Social Auth Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full border-purple-500/30 hover:bg-purple-500/10"
              onClick={() => handleSocialAuth("google")}
              disabled={isLoading}
            >
              <Chrome className="mr-2 h-4 w-4" />
              Continuer avec Google
            </Button>
          </div>

          {/* Separator */}
          <div className="relative mb-6">
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
                <Label htmlFor="name">Nom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
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
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
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
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
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
                  <span className="text-muted-foreground">Se souvenir de moi</span>
                </label>
                <a href="#" className="text-purple-400 hover:text-purple-300">
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
                isLogin ? "Se connecter" : "Créer mon compte"
              )}
            </Button>
          </form>

          {!isLogin && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              En créant un compte, vous acceptez nos{" "}
              <a href="#" className="text-purple-400 hover:text-purple-300">
                conditions d'utilisation
              </a>{" "}
              et notre{" "}
              <a href="#" className="text-purple-400 hover:text-purple-300">
                politique de confidentialité
              </a>
            </p>
          )}
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}