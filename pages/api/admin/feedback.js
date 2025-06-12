// pages/api/admin/feedback.js - Admin feedback data endpoint
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all feedback with categorization
    const allFeedbackResult = await query(`
      SELECT 
        id,
        feedback_text,
        comparison_count,
        created_at,
        feedback_type,
        selected_reasons,
        CASE 
          WHEN user_id IS NOT NULL THEN 'Registered'
          ELSE 'Trial'
        END as user_type,
        CASE 
          WHEN feedback_text ILIKE '%pdf%' THEN 'PDF'
          WHEN feedback_text ILIKE '%excel%' OR feedback_text ILIKE '%csv%' THEN 'Excel/CSV'
          ELSE 'General'
        END as feedback_category
      FROM user_feedback 
      ORDER BY created_at DESC
    `);

    // Get total feedback count
    const totalCountResult = await query(`
      SELECT COUNT(*) as total_count FROM user_feedback
    `);

    // Get user type breakdown
    const userTypeResult = await query(`
      SELECT 
        CASE 
          WHEN user_id IS NOT NULL THEN 'Registered'
          ELSE 'Trial'
        END as user_type,
        COUNT(*) as count
      FROM user_feedback 
      GROUP BY user_type
    `);

    // Get feedback category breakdown
    const categoryResult = await query(`
      SELECT 
        CASE 
          WHEN feedback_text ILIKE '%pdf%' THEN 'PDF'
          WHEN feedback_text ILIKE '%excel%' OR feedback_text ILIKE '%csv%' THEN 'Excel/CSV'
          ELSE 'General'
        END as category,
        COUNT(*) as count
      FROM user_feedback 
      GROUP BY category
    `);

    const feedbackData = allFeedbackResult.rows;
    const totalCount = parseInt(totalCountResult.rows[0].total_count);
    const userTypeBreakdown = userTypeResult.rows;
    const categoryBreakdown = categoryResult.rows;

    res.status(200).json({
      success: true,
      data: {
        feedback: feedbackData,
        stats: {
          totalCount,
          averageRating: 4.2, // Calculate this later
          responseRate: 75
        },
        userTypeBreakdown,
        categoryBreakdown
      }
    });

  } catch (error) {
    console.error('Admin feedback fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch feedback data',
      details: error.message
    });
  }
}
