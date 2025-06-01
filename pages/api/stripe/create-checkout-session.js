// File: pages/api/stripe/create-checkout-session.js
import Stripe from 'stripe';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  console.log('=== STRIPE CHECKOUT SESSION START ===');
  console.log('Method:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Environment check
    console.log('Environment check:');
    console.log('- STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
    console.log('- VERIDIFF_STRIPE_PRICE_ID:', process.env.VERIDIFF_STRIPE_PRICE_ID);

    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('❌ Missing STRIPE_SECRET_KEY');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    if (!process.env.VERIDIFF_STRIPE_PRICE_ID) {
      console.log('❌ Missing VERIDIFF_STRIPE_PRICE_ID');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
    console.log('✅ Stripe initialized');

    // Get user session
    console.log('Getting user session...');
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      console.log('❌ No authenticated user');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    console.log('✅ User authenticated:', session.user.email);

    // Generate URLs based on current request
    const origin = req.headers.origin || req.headers.referer?.split('/').slice(0, 3).join('/') || 'https://www.veridiff.com';
    const successUrl = `${origin}/compare?upgrade=success`;
    const cancelUrl = `${origin}/compare?upgrade=cancelled`;

    console.log('URLs generated:');
    console.log('- Origin:', origin);
    console.log('- Success URL:', successUrl);
    console.log('- Cancel URL:', cancelUrl);

    // Create checkout session
    console.log('Creating Stripe checkout session...');
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.VERIDIFF_STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: session.user.email,
      metadata: {
        userId: session.user.id || session.user.email,
        userEmail: session.user.email,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id || session.user.email,
          userEmail: session.user.email,
        },
      },
    });

    console.log('✅ Checkout session created:', checkoutSession.id);
    console.log('✅ Checkout URL:', checkoutSession.url);
    console.log('=== STRIPE CHECKOUT SESSION END ===');

    return res.status(200).json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });

  } catch (error) {
    console.log('❌ ERROR:', error.message);
    console.log('Error type:', error.type);
    console.log('Error code:', error.code);
    console.log('Full error:', error);
    console.log('=== STRIPE CHECKOUT SESSION END (ERROR) ===');

    return res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message,
      type: error.type,
    });
  }
}
