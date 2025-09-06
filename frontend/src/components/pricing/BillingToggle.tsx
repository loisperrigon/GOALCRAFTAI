"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"

interface BillingToggleProps {
  onPeriodChange?: (period: 'monthly' | 'yearly') => void
}

function BillingToggle({ onPeriodChange }: BillingToggleProps) {
  const [billingPeriod, setBillingPeriod] = React.useState<'monthly' | 'yearly'>('yearly')

  const handleToggle = () => {
    const newPeriod = billingPeriod === 'monthly' ? 'yearly' : 'monthly'
    setBillingPeriod(newPeriod)
    onPeriodChange?.(newPeriod)
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <span className={billingPeriod === 'monthly' ? 'text-white' : 'text-muted-foreground'}>
        Mensuel
      </span>
      <button
        onClick={handleToggle}
        className="relative w-16 h-8 bg-purple-500/20 rounded-full transition-colors hover:bg-purple-500/30"
        aria-label="Toggle billing period"
      >
        <div className={`absolute top-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-transform ${
          billingPeriod === 'yearly' ? 'translate-x-8' : 'translate-x-1'
        }`} />
      </button>
      <span className={billingPeriod === 'yearly' ? 'text-white' : 'text-muted-foreground'}>
        Annuel
      </span>
      {billingPeriod === 'yearly' && (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 animate-pulse">
          -25% 🎉
        </Badge>
      )}
    </div>
  )
}

export default BillingToggle