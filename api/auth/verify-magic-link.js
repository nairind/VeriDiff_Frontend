import jwt from 'jsonwebtoken';
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  try {
    // Find magic link
    const magicLinkResult = await query(`
      SELECT ml.*, u.* FROM magic_links ml 
      JOIN users u ON ml.email = u.email 
      WHERE ml.token = $1 AND ml.used = false AND ml.expires_at > NOW()
    `, [token]);

    if (magicLinkResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired magic link' });
    }

    const user = magicLinkResult.rows[0];

    // Mark magic link as used
    await query('UPDATE magic_links SET used = true WHERE token = $1', [token]);

    // Update user last login and verify email
    await query('UPDATE users SET last_login = NOW(), email_verified = true WHERE id = $1', [user.id]);

    // Generate JWT token
    const jwtToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        tier: user.tier 
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({ 
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        tier: user.tier,
        company_name: user.company_name
      }
    });
  } catch (error) {
    console.error('Magic link verification error:', error);
    res.status(500).json({ error: 'Failed to verify magic link' });
  }
}
