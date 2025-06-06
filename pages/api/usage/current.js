import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { query } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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
      SELECT comparisons_used, last_reset_date, tier, full_name, email
      FROM users 
      WHERE id = $1
    `, [userId])

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const userData = userResult.rows[0]
    
    // Check if we need to reset monthly counter
    let comparisons_used = userData.comparisons_used
    const lastReset = new Date(userData.last_reset_date)
    const now = new Date()
    
    // If it's a new month, reset the counter
    if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
      comparisons_used = 0
      
      await query(`
        UPDATE users 
        SET comparisons_used = 0, last_reset_date = CURRENT_DATE 
        WHERE id = $1
      `, [userId])
    }

    // Get usage limits based on tier
    const limits = {
      free: 5,
      pro: 999999, // Unlimited
      business: 999999 // Unlimited
    }

    const userLimit = limits[userData.tier] || limits.free

    res.status(200).json({
      user: {
        id: userId,
        email: userData.email,
        name: userData.full_name,
        tier: userData.tier
      },
      usage: {
        used: comparisons_used,
        limit: userLimit,
        remaining: userLimit - comparisons_used,
        tier: userData.tier
      }
    })

  } catch (error) {
    console.error('Current usage error:', error)
    res.status(500).json({ error: 'Failed to get usage data' })
  }
}
