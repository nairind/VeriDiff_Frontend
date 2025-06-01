// File: pages/api/stripe/create-checkout-session.js
import Stripe from 'stripe';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the current user session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { 
      priceId = process.env.VERIDIFF_STRIPE_PRICE_ID || 'price_1RVEnnJbX57fsaKHqLt143Fg',
      successUrl,
      cancelUrl,
      mode = 'subscription',
      allowPromotionCodes = true
    } = req.body;

    // Validate required parameters
    if (!priceId || !successUrl || !cancelUrl) {
      return res.status(400).json({ 
        error: 'Missing required parameters: priceId, successUrl, cancelUrl' 
      });
    }

    console.log('🔄 Creating Stripe checkout session for:', session.user.email);

    // Create or retrieve Stripe customer
    let customer;
    try {
      // Try to find existing customer by email
      const existingCustomers = await stripe.customers.list({
        email: session.user.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
        console.log('✅ Found existing Stripe customer:', customer.id);
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: session.user.email,
          name: session.user.name || session.user.full_name,
          metadata: {
            veridiff_user_id: session.user.id,
            signup_source: 'veridiff_premium_upgrade',
            created_at: new Date().toISOString(),
          },
        });
        console.log('✅ Created new Stripe customer:', customer.id);
      }
    } catch (customerError) {
      console.error('❌ Failed to create/retrieve customer:', customerError);
      return res.status(500).json({ 
        error: 'Failed to process customer information' 
      });
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: allowPromotionCodes,
      billing_address_collection: 'auto',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      metadata: {
        veridiff_user_id: session.user.id,
        veridiff_user_email: session.user.email,
        product_name: 'VeriDiff Premium',
        upgrade_source: 'compare_page',
      },
      subscription_data: mode === 'subscription' ? {
        metadata: {
          veridiff_user_id: session.user.id,
          veridiff_user_email: session.user.email,
          tier: 'premium',
        },
      } : undefined,
    });

    console.log('✅ Checkout session created:', checkoutSession.id);

    return res.status(200).json({ 
      url: checkoutSession.url,
      sessionId: checkoutSession.id 
    });

  } catch (error) {
    console.error('❌ Stripe checkout error:', error);
    
    // Enhanced error handling
    let errorMessage = 'Failed to create checkout session';
    let statusCode = 500;

    if (error.type === 'StripeCardError') {
      errorMessage = 'Payment method error';
      statusCode = 400;
    } else if (error.type === 'StripeRateLimitError') {
      errorMessage = 'Too many requests, please try again later';
      statusCode = 429;
    } else if (error.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid request parameters';
      statusCode = 400;
    } else if (error.type === 'StripeAPIError') {
      errorMessage = 'Stripe API error, please try again';
      statusCode = 502;
    } else if (error.type === 'StripeConnectionError') {
      errorMessage = 'Network error, please try again';
      statusCode = 503;
    }

    return res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
