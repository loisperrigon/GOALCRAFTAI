import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Debug: Afficher si la clé est chargée
    console.log('[Stripe] Secret key exists:', !!process.env.STRIPE_SECRET_KEY);
    console.log('[Stripe] Secret key starts with:', process.env.STRIPE_SECRET_KEY?.substring(0, 7));
    
    // Vérifier si Stripe est configuré
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('XXXX')) {
      console.error('[Stripe] Configuration error: Missing or invalid secret key');
      return NextResponse.json(
        { error: 'Stripe is not configured. Please add your Stripe keys to .env' },
        { status: 503 }
      );
    }
    
    const { stripe, getPriceId } = await import('@/lib/stripe');
    const body = await req.json();
    const { plan, period, userId, email } = body;

    // Validation
    if (!plan || !period) {
      return NextResponse.json(
        { error: 'Plan and period are required' },
        { status: 400 }
      );
    }

    if (plan === 'free') {
      return NextResponse.json(
        { error: 'Cannot checkout free plan' },
        { status: 400 }
      );
    }

    const priceId = getPriceId(plan, period);
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan or period' },
        { status: 400 }
      );
    }

    // Créer ou récupérer le customer Stripe
    let customerId: string | undefined;
    
    if (email) {
      // Chercher si le customer existe déjà
      const existingCustomers = await stripe.customers.list({
        email: email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        // Créer un nouveau customer
        const customer = await stripe.customers.create({
          email: email,
          metadata: {
            userId: userId || '',
          },
        });
        customerId = customer.id;
      }
    }

    // Créer la session de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      customer: customerId,
      customer_email: !customerId ? email : undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      subscription_data: {
        // Pas de période d'essai
        metadata: {
          userId: userId || '',
          plan,
          period,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: userId || '',
        plan,
        period,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}