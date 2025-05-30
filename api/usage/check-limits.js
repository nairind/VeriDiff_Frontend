import jwt from 'jsonwebtoken';
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(200).json({ 
      canCompare: true, 
      reason: 'trial',
      usage: { filesThisMonth: 0, limit: 1 }
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user tier
    const userResult = await query('SELECT tier FROM users WHERE id = $1', [decoded.userId]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Count this month's comparisons (excluding trials)
    const usageResult = await query(`
      SELECT COUNT(*) as count FROM file_comparisons 
      WHERE user_id = $1 AND is_trial = false 
      AND created_at >= date_trunc('month', CURRENT_DATE)
    `, [decoded.userId]);

    const filesThisMonth = parseInt(usageResult.rows[0].count);
    
    const limits = {
      free: 5,
      pro: -1,  // unlimited
      business: -1  // unlimited
    };

    const limit = limits[user.tier] || 5;
    const canCompare = limit === -1 || filesThisMonth < limit;

    res.status(200).json({
      canCompare,
      usage: {
        filesThisMonth,
        limit,
        tier: user.tier
      }
    });
  } catch (error) {
    console.error('Limit check error:', error);
    res.status(500).json({ error: 'Failed to check limits' });
  }
}
