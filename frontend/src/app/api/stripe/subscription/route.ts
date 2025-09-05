import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const customerId = searchParams.get('customerId');
    const subscriptionId = searchParams.get('subscriptionId');

    if (!customerId && !subscriptionId) {
      return NextResponse.json(
        { error: 'Customer ID or Subscription ID is required' },
        { status: 400 }
      );
    }

    let subscription;

    if (subscriptionId) {
      // Récupérer directement par ID
      subscription = await stripe.subscriptions.retrieve(subscriptionId);
    } else if (customerId) {
      // Récupérer les abonnements du customer
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });

      subscription = subscriptions.data[0];
    }

    if (!subscription) {
      return NextResponse.json(
        { status: 'no_subscription', plan: 'free' },
        { status: 200 }
      );
    }

    // Extraire les informations importantes
    const priceId = subscription.items.data[0]?.price.id;
    const { getPlanFromPriceId } = await import('@/lib/stripe');
    const planInfo = getPlanFromPriceId(priceId);

    return NextResponse.json({
      status: subscription.status,
      plan: planInfo?.plan || 'free',
      period: planInfo?.period || 'monthly',
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}