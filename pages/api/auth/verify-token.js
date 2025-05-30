import jwt from 'jsonwebtoken';
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Find the magic link
    const magicLinkResult = await query(
      'SELECT * FROM magic_links WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (magicLinkResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired magic link' });
    }

    const magicLink = magicLinkResult.rows[0];

    // Get the user
    const userResult = await query(
      'SELECT * FROM users WHERE email = $1',
      [magicLink.email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Generate JWT token for authentication
    const authToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        full_name: user.full_name 
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '30d' }
    );

    // Delete the used magic link
    await query('DELETE FROM magic_links WHERE token = $1', [token]);

    // Update user's last login
    await query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    res.status(200).json({
      message: 'Login successful',
      authToken,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        company_name: user.company_name,
        job_title: user.job_title
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
}
