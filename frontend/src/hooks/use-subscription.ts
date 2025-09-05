"use client"

import { useEffect } from 'react';
import { useUserStore } from '@/stores/user-store';
import { useObjectivesStore } from '@/stores/objectives-store';
import toast from 'react-hot-toast';

export function useSubscription() {
  const user = useUserStore(state => state.user);
  const syncSubscription = useUserStore(state => state.syncSubscription);
  const needsSubscriptionSync = useUserStore(state => state.needsSubscriptionSync);
  const getPremiumLimits = useUserStore(state => state.getPremiumLimits);
  const { objectives } = useObjectivesStore();
  
  // Sync automatique au montage et périodiquement
  useEffect(() => {
    if (user?.email && needsSubscriptionSync && needsSubscriptionSync()) {
      syncSubscription(user.email);
    }
    
    // Sync toutes les heures
    const interval = setInterval(() => {
      if (user?.email && needsSubscriptionSync && needsSubscriptionSync()) {
        syncSubscription(user.email);
      }
    }, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user?.email, needsSubscriptionSync, syncSubscription]);
  
  // Vérifier les limites
  const checkCanCreateObjective = (): boolean => {
    const limits = getPremiumLimits();
    
    if (limits.maxObjectives === -1) return true; // Illimité
    
    if (objectives.length >= limits.maxObjectives) {
      toast.error(
        `Limite atteinte : ${limits.maxObjectives} objectifs maximum avec le plan ${user?.premiumType || 'gratuit'}`
      );
      return false;
    }
    
    return true;
  };
  
  const checkCanAddStep = (objectiveId: string): boolean => {
    const limits = getPremiumLimits();
    
    if (limits.maxStepsPerObjective === -1) return true; // Illimité
    
    const objective = objectives.find(o => o.id === objectiveId);
    if (!objective) return false;
    
    const stepCount = objective.skillTree?.nodes?.length || 0;
    
    if (stepCount >= limits.maxStepsPerObjective) {
      toast.error(
        `Limite atteinte : ${limits.maxStepsPerObjective} étapes maximum par objectif avec le plan ${user?.premiumType || 'gratuit'}`
      );
      return false;
    }
    
    return true;
  };
  
  const isNearLimit = (): boolean => {
    const limits = getPremiumLimits();
    
    if (limits.maxObjectives === -1) return false;
    
    const usage = objectives.length / limits.maxObjectives;
    return usage >= 0.8; // 80% ou plus
  };
  
  return {
    user,
    limits: getPremiumLimits(),
    checkCanCreateObjective,
    checkCanAddStep,
    isNearLimit,
    objectivesCount: objectives.length,
    isPremium: user?.premiumType !== 'free',
    plan: user?.premiumType || 'free',
    subscriptionStatus: user?.subscriptionStatus || 'none',
    daysUntilRenewal: user?.currentPeriodEnd 
      ? Math.ceil((new Date(user.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null,
  };
}

// Hook pour créer une session de checkout
export function useStripeCheckout() {
  const user = useUserStore(state => state.user);
  
  const createCheckout = async (plan: 'starter' | 'pro', period: 'monthly' | 'yearly') => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          period,
          userId: user?.id,
          email: user?.email,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }
      
      const { sessionId, url } = await response.json();
      
      // Rediriger vers Stripe
      if (url) {
        window.location.href = url;
      } else if (sessionId) {
        // Utiliser Stripe.js si disponible
        const { redirectToCheckout } = await import('@/lib/stripe-client');
        await redirectToCheckout(sessionId);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Erreur lors de la création de la session de paiement');
      throw error;
    }
  };
  
  const openPortal = async () => {
    if (!user?.stripeCustomerId) {
      toast.error('Aucun abonnement trouvé');
      return;
    }
    
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user.stripeCustomerId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }
      
      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Erreur lors de l\'ouverture du portail client');
    }
  };
  
  return {
    createCheckout,
    openPortal,
  };
}