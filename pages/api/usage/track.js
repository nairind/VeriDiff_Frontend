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
    const today = new Date().toISOString().split('T')[0]
    
    // Check if we need to reset monthly counter
    let comparisons_used = userData.comparisons_used
    if (userData.last_reset_date !== today) {
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
    }

    // Check usage limits based on tier
    const limits = {
      free: 5,
      pro: 999999, // Unlimited
      business: 999999 // Unlimited
    }

    const userLimit = limits[userData.tier] || limits.free

    if (comparisons_used >= userLimit) {
      return res.status(403).json({ 
        error: 'Usage limit exceeded',
        limit: userLimit,
        used: comparisons_used,
        tier: userData.tier
      })
    }

    // Increment usage
    const newUsageCount = comparisons_used + 1
    
    await query(`
      UPDATE users 
      SET comparisons_used = $1, last_reset_date = CURRENT_DATE 
      WHERE id = $2
    `, [newUsageCount, userId])

    res.status(200).json({
      success: true,
      usage: {
        used: newUsageCount,
        limit: userLimit,
        tier: userData.tier,
        remaining: userLimit - newUsageCount
      }
    })

  } catch (error) {
    console.error('Usage tracking error:', error)
    res.status(500).json({ error: 'Failed to track usage' })
  }
}
