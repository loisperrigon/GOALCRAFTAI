"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import AuthModal from "@/components/AuthModal"
import { useUserStore } from "@/stores/user-store"
import { 
  Crown, 
  Check, 
  X, 
  Star,
  ChevronRight,
  Brain,
  Zap,
  Trophy,
  Unlock,
  Sparkles
} from "lucide-react"

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const router = useRouter()
  const { isAuthenticated } = useUserStore()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly')
  const [activeUsers, setActiveUsers] = useState(1427)
  
  const monthlyPrice = 9.99
  const yearlyPrice = 89.88 // 12 * 9.99 * 0.75 (25% off)
  const currentPrice = billingPeriod === 'monthly' ? monthlyPrice : yearlyPrice / 12

  // Simulation de mise à jour des utilisateurs actifs
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 3))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handlePremiumClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
    } else {
      // TODO: Intégrer Stripe checkout
      alert("Redirection vers Stripe...")
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <div className="p-4 md:p-6">
            {/* Header compact */}
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold mb-2">
                Choisissez votre plan
              </h2>
              <p className="text-sm text-muted-foreground">
                Débloquez tout le potentiel de GoalCraftAI
              </p>
            </div>


            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className={billingPeriod === 'monthly' ? 'text-white' : 'text-muted-foreground'}>
                Mensuel
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                className="relative w-16 h-8 bg-purple-500/20 rounded-full transition-colors hover:bg-purple-500/30"
              >
                <div className={`absolute top-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-transform ${
                  billingPeriod === 'yearly' ? 'translate-x-8' : 'translate-x-1'
                }`} />
              </button>
              <span className={billingPeriod === 'yearly' ? 'text-white' : 'text-muted-foreground'}>
                Annuel
              </span>
              {billingPeriod === 'yearly' && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  -25% 🎉
                </Badge>
              )}
            </div>

            {/* Pricing Cards */}
            <div className="grid lg:grid-cols-2 gap-6">
              
              {/* Free Plan */}
              <Card className="relative p-4 border border-border">
                <div className="mb-3">
                  <h3 className="text-lg font-bold mb-1">Gratuit</h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-3xl font-bold">0€</span>
                    <span className="text-sm text-muted-foreground">/mois</span>
                  </div>
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={onClose}
                  >
                    Plan actuel
                  </Button>
                </div>

                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">3 objectifs actifs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">10 étapes max</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">XP et badges</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">IA limitée</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Coaching IA</span>
                  </li>
                </ul>
              </Card>

              {/* Premium Plan */}
              <Card className="relative p-4 border-2 border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-blue-500/10">
                {/* Badge populaire */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-none">
                    <Star className="h-3 w-3 mr-1" />
                    POPULAIRE
                  </Badge>
                </div>

                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold">Premium</h3>
                    <Crown className="h-4 w-4 text-yellow-400" />
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-bold text-purple-400">
                      {billingPeriod === 'monthly' ? `${monthlyPrice}€` : `${currentPrice.toFixed(2)}€`}
                    </span>
                    <span className="text-sm text-muted-foreground">/mois</span>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <p className="text-xs text-green-400 mb-3">
                      Économisez {((monthlyPrice * 12) - yearlyPrice).toFixed(2)}€/an
                    </p>
                  )}
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                    onClick={handlePremiumClick}
                  >
                    <Unlock className="h-4 w-4 mr-2" />
                    Débloquer Premium
                  </Button>
                </div>

                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-semibold">Objectifs illimités</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-semibold">IA GPT-4 illimitée</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-semibold">Coaching personnalisé</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-semibold">Parcours experts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-semibold">Support prioritaire</span>
                  </li>
                </ul>

              </Card>
            </div>

            {/* Footer compact */}
            <div className="mt-4 pt-4 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                🔒 Paiement sécurisé • Annulation à tout moment • Garantie 30 jours
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auth Modal si besoin */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false)
          handlePremiumClick()
        }}
      />
    </>
  )
}