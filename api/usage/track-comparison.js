import jwt from 'jsonwebtoken';
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { file1_name, file2_name, file1_size, file2_size, comparison_type, is_trial = false } = req.body;
  const token = req.headers.authorization?.replace('Bearer ', '');

  try {
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (error) {
        // Invalid token, but allow trial usage
      }
    }

    // Track the comparison
    await query(`
      INSERT INTO file_comparisons (user_id, file1_name, file2_name, file1_size, file2_size, comparison_type, is_trial)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [userId, file1_name, file2_name, file1_size, file2_size, comparison_type, is_trial]);

    res.status(200).json({ message: 'Comparison tracked' });
  } catch (error) {
    console.error('Usage tracking error:', error);
    res.status(500).json({ error: 'Failed to track usage' });
  }
}
