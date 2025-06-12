// pages/api/feedback/submit.js - Adapted for your existing table structure
import jwt from 'jsonwebtoken';
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { feedback_text, email } = req.body;
  const token = req.headers.authorization?.replace('Bearer ', '');

  try {
    let userId = null;
    let userEmail = email;
    let comparisonCount = 0;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
        
        // Get user's comparison count from your existing file_comparisons table
        const result = await query(`
          SELECT COUNT(*) as count 
          FROM file_comparisons 
          WHERE user_id = $1
        `, [userId]);
        
        comparisonCount = parseInt(result.rows[0].count);
      } catch (error) {
        // Invalid token, treat as trial user
        comparisonCount = req.body.comparisonCount || 3;
      }
    } else {
      // Trial user
      comparisonCount = req.body.comparisonCount || 3;
    }

    // Insert into your existing user_feedback table structure
    await query(`
      INSERT INTO user_feedback (
        user_id, 
        email, 
        feedback_text, 
        comparison_count, 
        feedback_type, 
        selected_reasons
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      userId, 
      userEmail, 
      feedback_text, 
      comparisonCount, 
      'improvement_suggestion',  // Using your feedback_type field
      []  // Empty array for selected_reasons since this is free text
    ]);

    res.status(200).json({ message: 'Thank you for your feedback!' });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
}

// pages/api/admin/feedback.js - Simple admin endpoint to view feedback
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Add your admin authentication check here if needed
  // const token = req.headers.authorization?.replace('Bearer ', '');
  // ... verify admin token ...

  try {
    // Get recent feedback
    const result = await query(`
      SELECT 
        feedback_text, 
        comparison_count, 
        created_at, 
        user_id,
        email,
        feedback_type
      FROM user_feedback 
      WHERE feedback_text IS NOT NULL AND feedback_text != ''
      ORDER BY created_at DESC 
      LIMIT 50
    `);

    // Get some basic stats
    const stats = await query(`
      SELECT 
        COUNT(*) as total_feedback,
        COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as authenticated_users,
        COUNT(CASE WHEN user_id IS NULL THEN 1 END) as trial_users,
        AVG(comparison_count) as avg_comparisons
      FROM user_feedback
    `);

    res.status(200).json({
      feedback: result.rows,
      stats: stats.rows[0]
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
}
