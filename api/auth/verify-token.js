import jwt from 'jsonwebtoken';
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get fresh user data
    const userResult = await query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    res.status(200).json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      tier: user.tier,
      company_name: user.company_name
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
