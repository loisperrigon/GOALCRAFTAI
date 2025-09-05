import { NextRequest, NextResponse } from 'next/server';

// Route pour forcer la synchronisation manuelle d'un abonnement
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email } = body;

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'User ID or email is required' },
        { status: 400 }
      );
    }

    // Pour l'instant, on simule une réponse sans Stripe configuré
    // TODO: Activer quand Stripe sera configuré avec de vraies clés
    
    // Vérifier si Stripe est configuré
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('XXXX')) {
      // Retourner un plan gratuit par défaut si Stripe n'est pas configuré
      return NextResponse.json({
        success: true,
        data: {
          plan: 'free',
          status: 'no_stripe',
          message: 'Stripe not configured - using free plan',
          syncedAt: new Date(),
        }
      });
    }

    // Import dynamique de stripe seulement si configuré
    const { stripe } = await import('@/lib/stripe');

    // Rechercher le customer Stripe
    let customer;
    
    if (email) {
      const customers = await stripe.customers.list({
        email: email,
        limit: 1,
      });
      customer = customers.data[0];
    }

    if (!customer) {
      return NextResponse.json({
        status: 'no_customer',
        plan: 'free',
        message: 'No Stripe customer found'
      });
    }

    // Récupérer les abonnements actifs
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    });

    const subscription = subscriptions.data[0];

    if (!subscription) {
      return NextResponse.json({
        status: 'no_subscription',
        plan: 'free',
        customerId: customer.id,
        message: 'Customer exists but no active subscription'
      });
    }

    // Extraire les informations
    const priceId = subscription.items.data[0]?.price.id;
    const { getPlanFromPriceId } = await import('@/lib/stripe');
    const planInfo = getPlanFromPriceId(priceId);

    const syncData = {
      customerId: customer.id,
      subscriptionId: subscription.id,
      status: subscription.status,
      plan: planInfo?.plan || 'free',
      period: planInfo?.period || 'monthly',
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      syncedAt: new Date(),
    };

    // TODO: Sauvegarder dans la base de données
    console.log('Sync data:', syncData);
    // await updateUserSubscriptionInDB(userId, syncData);

    return NextResponse.json({
      success: true,
      data: syncData,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync subscription' },
      { status: 500 }
    );
  }
}