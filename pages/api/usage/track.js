import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { query } from '../../../lib/db'

export default async function handler(req, res) {
  console.log('🔥 TRACK API CALLED - Timestamp:', new Date().toISOString())
  console.log('🔥 Request method:', req.method)
  console.log('🔥 Request headers:', req.headers)
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get user session
    const session = await getServerSession(req, res, authOptions)
    
    if (!session) {
      console.log('❌ No session found')
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const userId = session.user.id
    console.log('👤 User ID:', userId)

    // Get current user data
    console.log('📊 Fetching current user data...')
    const userResult = await query(`
      SELECT comparisons_used, last_reset_date, tier 
      FROM users 
      WHERE id = $1
    `, [userId])

    if (userResult.rows.length === 0) {
      console.log('❌ User not found in database')
      return res.status(404).json({ error: 'User not found' })
    }

    const userData = userResult.rows[0]
    console.log('📊 Current user data:', userData)
    
    const today = new Date().toISOString().split('T')[0]
    console.log('📅 Today:', today)
    console.log('📅 Last reset date:', userData.last_reset_date)
    
    // Check if we need to reset monthly counter
    let comparisons_used = userData.comparisons_used
    console.log('📊 Initial comparisons_used:', comparisons_used)
    
    if (userData.last_reset_date !== today) {
      const lastReset = new Date(userData.last_reset_date)
      const now = new Date()
      console.log('📅 Checking if reset needed - Last reset month:', lastReset.getMonth(), 'Current month:', now.getMonth())
      
      // If it's a new month, reset the counter
      if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
        console.log('🔄 RESETTING monthly counter to 0')
        comparisons_used = 0
        
        await query(`
          UPDATE users 
          SET comparisons_used = 0, last_reset_date = CURRENT_DATE 
          WHERE id = $1
        `, [userId])
        console.log('✅ Reset query executed')
      }
    }

    // Check usage limits based on tier
    const limits = {
      free: 5,
      pro: 999999, // Unlimited
      business: 999999 // Unlimited
    }

    const userLimit = limits[userData.tier] || limits.free
    console.log('🚫 User tier:', userData.tier, 'Limit:', userLimit)
    console.log('📊 Current usage:', comparisons_used, 'vs limit:', userLimit)

    if (comparisons_used >= userLimit) {
      console.log('🚫 USAGE LIMIT EXCEEDED!')
      return res.status(403).json({ 
        error: 'Usage limit exceeded',
        limit: userLimit,
        used: comparisons_used,
        tier: userData.tier
      })
    }

    // Increment usage
    const newUsageCount = comparisons_used + 1
    console.log('➕ Incrementing usage from', comparisons_used, 'to', newUsageCount)
    
    console.log('💾 Executing UPDATE query...')
    const updateResult = await query(`
      UPDATE users 
      SET comparisons_used = $1, last_reset_date = CURRENT_DATE 
      WHERE id = $2
    `, [newUsageCount, userId])
    console.log('✅ UPDATE query result:', updateResult)

    // Double-check what was actually saved
    console.log('🔍 Verifying database update...')
    const verifyResult = await query(`
      SELECT comparisons_used FROM users WHERE id = $1
    `, [userId])
    console.log('🔍 Database now shows comparisons_used:', verifyResult.rows[0]?.comparisons_used)

    const responseData = {
      success: true,
      usage: {
        used: newUsageCount,
        limit: userLimit,
        tier: userData.tier,
        remaining: userLimit - newUsageCount
      }
    }
    
    console.log('📤 Sending response:', responseData)
    res.status(200).json(responseData)

  } catch (error) {
    console.error('❌ Usage tracking error:', error)
    res.status(500).json({ error: 'Failed to track usage' })
  }
}
