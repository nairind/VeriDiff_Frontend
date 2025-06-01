// File: pages/api/stripe/webhook.js
import Stripe from 'stripe';
import { buffer } from 'micro';
import { query } from '../../../lib/db'; // Your existing database connection

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Disable the default body parser to handle raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('❌ Missing STRIPE_WEBHOOK_SECRET environment variable');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event;

  try {
    // Get the raw body
    const buf = await buffer(req);
    
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    console.log('✅ Webhook signature verified:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// Handle new subscription creation
async function handleSubscriptionCreated(subscription) {
  console.log('🎉 Subscription created:', subscription.id);
  
  try {
    // Get customer details
    const customer = await stripe.customers.retrieve(subscription.customer);
    const userEmail = customer.email;
    const userId = subscription.metadata?.veridiff_user_id || customer.metadata?.veridiff_user_id;

    if (!userEmail) {
      console.error('❌ No email found for customer:', subscription.customer);
      return;
    }

    // Update user tier to premium
    await updateUserTier(userEmail, userId, 'premium', {
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
    });

    console.log('✅ User upgraded to premium:', userEmail);
  } catch (error) {
    console.error('❌ Failed to handle subscription creation:', error);
  }
}

// Handle subscription updates (status changes, plan changes, etc.)
async function handleSubscriptionUpdated(subscription) {
  console.log('🔄 Subscription updated:', subscription.id, 'Status:', subscription.status);
  
  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    const userEmail = customer.email;
    const userId = subscription.metadata?.veridiff_user_id || customer.metadata?.veridiff_user_id;

    if (!userEmail) {
      console.error('❌ No email found for customer:', subscription.customer);
      return;
    }

    // Determine tier based on subscription status
    let tier = 'free';
    if (subscription.status === 'active' || subscription.status === 'trialing') {
      tier = 'premium';
    } else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
      // Keep premium for grace period
      tier = 'premium';
    } else if (subscription.status === 'canceled' || subscription.status === 'incomplete_expired') {
      tier = 'free';
    }

    await updateUserTier(userEmail, userId, tier, {
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
    });

    console.log(`✅ User tier updated to ${tier}:`, userEmail);
  } catch (error) {
    console.error('❌ Failed to handle subscription update:', error);
  }
}

// Handle subscription deletion/cancellation
async function handleSubscriptionDeleted(subscription) {
  console.log('❌ Subscription deleted:', subscription.id);
  
  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    const userEmail = customer.email;
    const userId = subscription.metadata?.veridiff_user_id || customer.metadata?.veridiff_user_id;

    if (!userEmail) {
      console.error('❌ No email found for customer:', subscription.customer);
      return;
    }

    // Downgrade user to free tier
    await updateUserTier(userEmail, userId, 'free', {
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: null, // Clear subscription ID
      subscription_status: 'canceled',
      current_period_start: null,
      current_period_end: null,
    });

    console.log('✅ User downgraded to free:', userEmail);
  } catch (error) {
    console.error('❌ Failed to handle subscription deletion:', error);
  }
}

// Handle successful payments
async function handlePaymentSucceeded(invoice) {
  console.log('💰 Payment succeeded:', invoice.id);
  
  try {
    if (invoice.subscription) {
      // This is a subscription payment
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      const customer = await stripe.customers.retrieve(invoice.customer);
      
      const userEmail = customer.email;
      const userId = subscription.metadata?.veridiff_user_id || customer.metadata?.veridiff_user_id;

      if (userEmail) {
        // Ensure user is premium (in case they were downgraded due to failed payment)
        await updateUserTier(userEmail, userId, 'premium', {
          stripe_customer_id: invoice.customer,
          stripe_subscription_id: invoice.subscription,
          subscription_status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          last_payment_date: new Date(invoice.created * 1000),
        });

        console.log('✅ Payment processed for premium user:', userEmail);
      }
    }
  } catch (error) {
    console.error('❌ Failed to handle payment success:', error);
  }
}

// Handle failed payments
async function handlePaymentFailed(invoice) {
  console.log('❌ Payment failed:', invoice.id);
  
  try {
    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      const customer = await stripe.customers.retrieve(invoice.customer);
      
      const userEmail = customer.email;

      if (userEmail) {
        // Note: Don't immediately downgrade on first payment failure
        // Stripe will retry and update subscription status accordingly
        console.log(`⚠️ Payment failed for user: ${userEmail}, subscription: ${subscription.id}`);
        
        // The subscription status will be updated via subscription.updated webhook
        // if multiple payment attempts fail
      }
    }
  } catch (error) {
    console.error('❌ Failed to handle payment failure:', error);
  }
}

// Helper function to update user tier in database
async function updateUserTier(email, userId, tier, subscriptionData = {}) {
  try {
    // Update user tier
    await query(
      'UPDATE users SET tier = $1 WHERE email = $2',
      [tier, email]
    );

    // Optional: Store additional subscription data if you want to track it
    // You could create a separate subscriptions table or add columns to users table
    if (subscriptionData.stripe_customer_id) {
      try {
        // Try to update additional subscription fields if they exist in your users table
        await query(`
          UPDATE users 
          SET 
            tier = $1,
            stripe_customer_id = $2,
            stripe_subscription_id = $3,
            subscription_status = $4,
            updated_at = NOW()
          WHERE email = $5
        `, [
          tier,
          subscriptionData.stripe_customer_id,
          subscriptionData.stripe_subscription_id,
          subscriptionData.subscription_status,
          email
        ]);
      } catch (updateError) {
        // If additional columns don't exist, just update the tier (which we already did above)
        console.log('ℹ️ Additional subscription columns not found, tier updated only');
      }
    }

    console.log(`✅ Database updated - User: ${email}, Tier: ${tier}`);
  } catch (error) {
    console.error('❌ Failed to update user tier in database:', error);
    throw error;
  }
}
