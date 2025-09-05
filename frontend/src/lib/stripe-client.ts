import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
      return null;
    }
    
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  
  return stripePromise;
};

// Helper pour rediriger vers Stripe Checkout
export async function redirectToCheckout(sessionId: string) {
  const stripe = await getStripe();
  
  if (!stripe) {
    console.error('Stripe not loaded');
    return { error: 'Stripe not loaded' };
  }
  
  const { error } = await stripe.redirectToCheckout({ sessionId });
  
  if (error) {
    console.error('Stripe redirect error:', error);
    return { error: error.message };
  }
  
  return { success: true };
}