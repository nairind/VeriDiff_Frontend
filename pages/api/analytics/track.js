import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { query } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const userId = session.user.id
    const { comparison_type, tier, timestamp } = req.body

    if (!comparison_type || !tier) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Simple analytics logging without complex table structure
    console.log('Excel Analytics:', {
      userId,
      comparison_type,
      tier,
      timestamp: timestamp || new Date().toISOString()
    })

    // Update user last activity
    await query(`
      UPDATE users 
      SET last_reset_date = CURRENT_DATE 
      WHERE id = $1
    `, [userId])

    res.status(200).json({
      success: true,
      message: 'Analytics tracked successfully'
    })

  } catch (error) {
    console.error('Analytics tracking error:', error)
    
    // Don't fail the comparison if analytics fails
    res.status(200).json({ 
      success: false,
      message: 'Analytics tracking failed but comparison can continue'
    })
  }
}
