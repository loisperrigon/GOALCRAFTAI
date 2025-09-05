import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, getPlanFromPriceId, PlanType } from '@/lib/stripe';
import Stripe from 'stripe';

// Cette route doit recevoir le body raw (pas de JSON parsing)
export const runtime = 'nodejs';

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('✅ Checkout completed:', session.id);
  
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const userId = session.metadata?.userId;

  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  // Récupérer la subscription pour avoir plus de détails
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;
  
  // Déterminer le plan depuis le prix
  const planInfo = getPlanFromPriceId(priceId);
  const plan = planInfo?.plan || 'starter';

  // TODO: Mettre à jour l'utilisateur dans la base de données
  console.log('Update user:', {
    userId,
    customerId,
    subscriptionId,
    plan,
    status: subscription.status,
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
  });

  // Ici vous devriez appeler votre API MongoDB pour mettre à jour l'utilisateur
  // await updateUserSubscription(userId, { ... });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('📝 Subscription updated:', subscription.id);
  
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;
  
  // Récupérer le customer pour avoir le userId
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  const userId = customer.metadata?.userId;

  if (!userId) {
    console.error('No userId in customer metadata');
    return;
  }

  // Déterminer le nouveau plan
  const planInfo = getPlanFromPriceId(priceId);
  const plan = planInfo?.plan || 'free';

  // TODO: Mettre à jour l'utilisateur dans la base de données
  console.log('Update subscription:', {
    userId,
    subscriptionId: subscription.id,
    plan,
    status: subscription.status,
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ Subscription deleted:', subscription.id);
  
  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  const userId = customer.metadata?.userId;

  if (!userId) {
    console.error('No userId in customer metadata');
    return;
  }

  // TODO: Rétrograder l'utilisateur au plan gratuit
  console.log('Downgrade to free:', {
    userId,
    plan: 'free',
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('⚠️ Payment failed for invoice:', invoice.id);
  
  const customerId = invoice.customer as string;
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  const userId = customer.metadata?.userId;

  if (!userId) {
    console.error('No userId in customer metadata');
    return;
  }

  // TODO: Envoyer un email d'alerte et marquer le compte
  console.log('Payment failed for user:', userId);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    if (!sig) {
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Gérer les différents types d'événements
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.payment_succeeded':
        // Renouvellement réussi
        console.log('💳 Payment succeeded for invoice:', (event.data.object as Stripe.Invoice).id);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}