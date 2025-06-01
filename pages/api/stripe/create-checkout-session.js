// File: pages/api/stripe/create-checkout-session.js
// DEBUG REQUEST VERSION - Temporary
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
    // DEBUG: Log everything we receive
    console.log('🔍 DEBUG: Request received');
    console.log('🔍 Request body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 Environment variables check:');
    console.log('- STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
    console.log('- VERIDIFF_STRIPE_PRICE_ID:', process.env.VERIDIFF_STRIPE_PRICE_ID);
    
    // Get the current user session
    console.log('🔍 Getting session...');
    const session = await getServerSession(req, res, authOptions);
    console.log('🔍 Session:', {
      exists: !!session,
      email: session?.user?.email,
      id: session?.user?.id,
      name: session?.user?.name
    });
    
    if (!session?.user?.email) {
      console.log('❌ No session or email found');
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Extract and validate parameters
    const { 
      priceId = process.env.VERIDIFF_STRIPE_PRICE_ID || 'price_1RVEnnJbX57fsaKHqLt143Fg',
      successUrl,
      cancelUrl,
      mode = 'subscription',
      allowPromotionCodes = true
    } = req.body;

    console.log('🔍 Extracted parameters:');
    console.log('- priceId:', priceId);
    console.log('- successUrl:', successUrl);
    console.log('- cancelUrl:', cancelUrl);
    console.log('- mode:', mode);

    // Validate required parameters
    if (!priceId) {
      console.log('❌ Missing priceId');
      return res.status(400).json({ error: 'Missing priceId' });
    }
    if (!successUrl) {
      console.log('❌ Missing successUrl');
      return res.status(400).json({ error: 'Missing successUrl' });
    }
    if (!cancelUrl) {
      console.log('❌ Missing cancelUrl');
      return res.status(400).json({ error: 'Missing cancelUrl' });
    }

    console.log('✅ All parameters valid');

    // Try to create a simple checkout session
    console.log('🔍 Creating Stripe checkout session...');
    
    const checkoutSession = await stripe.checkout.sessions.create({
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
      customer_email: session.user.email,
    });

    console.log('✅ Checkout session created successfully:', checkoutSession.id);
    console.log('✅ Checkout URL:', checkoutSession.url);

    return res.status(200).json({ 
      url: checkoutSession.url,
      sessionId: checkoutSession.id 
    });

  } catch (error) {
    console.error('❌ Detailed error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack
    });
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      type: error.type
    });
  }
}
