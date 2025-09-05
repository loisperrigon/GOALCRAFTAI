import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia' as any,
  typescript: true,
});

// Prix IDs depuis les variables d'environnement
export const PRICES = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_STARTER_YEARLY!,
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY!,
  },
} as const;

// Types pour les plans
export type PlanType = 'free' | 'starter' | 'pro';
export type BillingPeriod = 'monthly' | 'yearly';

// Helper pour obtenir le prix ID
export function getPriceId(plan: Exclude<PlanType, 'free'>, period: BillingPeriod): string {
  return PRICES[plan][period];
}

// Helper pour déterminer le plan depuis le prix ID
export function getPlanFromPriceId(priceId: string): { plan: PlanType; period: BillingPeriod } | null {
  for (const [plan, prices] of Object.entries(PRICES)) {
    for (const [period, id] of Object.entries(prices)) {
      if (id === priceId) {
        return { plan: plan as Exclude<PlanType, 'free'>, period: period as BillingPeriod };
      }
    }
  }
  return null;
}