// pages/api/feedback/submit.js - Updated with selected_reasons support
import jwt from 'jsonwebtoken';
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { feedback_text, email, comparisonCount, selected_reasons } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    let userId = null;
    let userEmail = email || null;
    let finalComparisonCount = comparisonCount || 3;
    let feedbackReasons = selected_reasons || [];
    
    // Try to decode token if provided
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
        
        // Get user's actual comparison count from database
        const result = await query(`
          SELECT COUNT(*) as count 
          FROM file_comparisons 
          WHERE user_id = $1
        `, [userId]);
        
        finalComparisonCount = parseInt(result.rows[0].count);
      } catch (jwtError) {
        console.log('JWT decode failed, treating as trial user:', jwtError.message);
        // Continue as trial user
      }
    }

    // Insert feedback into database with selected_reasons
    const insertResult = await query(`
      INSERT INTO user_feedback (
        user_id, 
        email, 
        feedback_text, 
        comparison_count, 
        feedback_type,
        selected_reasons
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [
      userId, 
      userEmail, 
      feedback_text || '', 
      finalComparisonCount, 
      'improvement_suggestion',
      feedbackReasons
    ]);

    console.log('Feedback inserted successfully:', insertResult.rows[0]);

    res.status(200).json({ 
      message: 'Thank you for your feedback!',
      success: true 
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    
    // Return more specific error info for debugging
    res.status(500).json({ 
      error: 'Failed to submit feedback',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
