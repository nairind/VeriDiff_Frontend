// File: pages/api/stripe/create-checkout-session.js
// DEBUG VERSION - Replace temporarily to find the issue

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Debug: API route called');
    console.log('🔍 Environment check:');
    console.log('- STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
    console.log('- STRIPE_SECRET_KEY starts with sk_test:', process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_'));
    console.log('- VERIDIFF_STRIPE_PRICE_ID exists:', !!process.env.VERIDIFF_STRIPE_PRICE_ID);
    
    // Check if Stripe package is available
    console.log('🔍 Trying to import Stripe...');
    const Stripe = require('stripe');
    console.log('✅ Stripe imported successfully');
    
    // Check if we can initialize Stripe
    console.log('🔍 Trying to initialize Stripe...');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
    console.log('✅ Stripe initialized successfully');
    
    // Check NextAuth
    console.log('🔍 Trying to import NextAuth...');
    const { getServerSession } = require('next-auth/next');
    const { authOptions } = require('../auth/[...nextauth]');
    console.log('✅ NextAuth imported successfully');
    
    // Check session
    console.log('🔍 Getting session...');
    const session = await getServerSession(req, res, authOptions);
    console.log('Session exists:', !!session);
    console.log('User email:', session?.user?.email);
    
    if (!session?.user?.email) {
      console.log('❌ No session or email');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    console.log('✅ All checks passed');
    return res.status(200).json({ 
      success: true, 
      message: 'Debug successful',
      hasStripe: true,
      hasSession: true,
      userEmail: session.user.email
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    return res.status(500).json({ 
      error: 'Debug failed',
      message: error.message,
      stack: error.stack
    });
  }
}
