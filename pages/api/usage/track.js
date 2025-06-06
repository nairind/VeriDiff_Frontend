import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { query } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get user session
    const session = await getServerSession(req, res, authOptions)
    
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const userId = session.user.id

    // Get current user data
    const userResult = await query(`
      SELECT comparisons_used, last_reset_date, tier 
      FROM users 
      WHERE id = $1
    `, [userId])

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const userData = userResult.rows[0]
    
    // ✅ NEW BUSINESS MODEL: Premium subscription required for non-Excel formats
    // Excel-Excel comparisons should never call this endpoint (handled separately)
    
    if (userData.tier === 'free') {
      return res.status(403).json({ 
        error: 'Premium subscription required',
        message: 'This format requires a premium subscription. Excel-Excel comparisons remain free forever!',
        tier: userData.tier,
        upgrade_url: '/pricing' // Optional: direct link to pricing page
      })
    }

    // For premium users (pro/business), allow unlimited usage
    if (userData.tier === 'pro' || userData.tier === 'business') {
      // Update last activity date for premium users (for analytics)
      await query(`
        UPDATE users 
        SET last_reset_date = CURRENT_DATE 
        WHERE id = $1
      `, [userId])

      return res.status(200).json({
        success: true,
        message: 'Premium comparison tracked',
        usage: {
          used: 'unlimited',
          limit: 'unlimited', 
          tier: userData.tier,
          remaining: 'unlimited'
        }
      })
    }

    // Fallback for unknown tiers
    return res.status(403).json({
      error: 'Invalid subscription tier',
      message: 'Please contact support for assistance.',
      tier: userData.tier
    })

  } catch (error) {
    console.error('Usage tracking error:', error)
    res.status(500).json({ error: 'Failed to track usage' })
  }
}
