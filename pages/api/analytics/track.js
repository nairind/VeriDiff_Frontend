// pages/api/analytics/track.js - Enhanced with feedback support
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { query } from '../../../lib/db'; // Using YOUR database connection

export default async function handler(req, res) {
  console.log('📊 Analytics Track API called');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    console.log('❌ No session for analytics tracking');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const {
      user_id,
      user_email,
      user_name,
      comparison_type,
      tier,
      timestamp,
      file1_name,
      file2_name,
      file1_size,
      file2_size,
      user_agent,
      page_url,
      // NEW: Feedback-specific fields
      feedback_rating,
      feedback_comment,
      feedback_timestamp,
      feedback_session_id,
      comparison_results
    } = req.body;

    // Validate required fields
    if (!comparison_type || !tier) {
      return res.status(400).json({ error: 'Missing required fields: comparison_type and tier' });
    }

    // Check if this is a feedback submission
    const isFeedbackSubmission = feedback_rating && feedback_rating >= 1 && feedback_rating <= 5;
    
    if (isFeedbackSubmission) {
      console.log(`💬 Tracking feedback: ${feedback_rating}⭐ from ${user_email || session.user.email}`);
    } else {
      console.log(`📊 Tracking analytics: ${comparison_type} (${tier}) for ${user_email || session.user.email}`);
    }

    try {
      // Enhanced INSERT with feedback fields
      const result = await query(`
        INSERT INTO analytics (
          user_id,
          user_email,
          user_name,
          comparison_type,
          tier,
          timestamp,
          file1_name,
          file2_name,
          file1_size,
          file2_size,
          user_agent,
          page_url,
          success,
          feedback_rating,
          feedback_comment,
          feedback_timestamp,
          feedback_session_id,
          comparison_results
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING id
      `, [
        user_id || session.user.id,
        user_email || session.user.email,
        user_name || session.user.name,
        comparison_type,
        tier,
        timestamp || new Date().toISOString(),
        file1_name || null,
        file2_name || null,
        file1_size || null,
        file2_size || null,
        user_agent || null,
        page_url || null,
        true,  // success = true
        feedback_rating || null,
        feedback_comment || null,
        feedback_timestamp || null,
        feedback_session_id || null,
        comparison_results ? JSON.stringify(comparison_results) : null
      ]);

      const analyticsId = result.rows[0].id;

      if (isFeedbackSubmission) {
        console.log(`✅ Feedback recorded successfully: ID ${analyticsId} | Rating: ${feedback_rating}⭐`);
        if (feedback_comment) {
          console.log(`💬 Comment: "${feedback_comment.substring(0, 100)}${feedback_comment.length > 100 ? '...' : ''}"`);
        }
      } else {
        console.log(`✅ Analytics recorded successfully: ID ${analyticsId}`);
      }

      res.status(200).json({
        success: true,
        message: isFeedbackSubmission ? 'Feedback submitted successfully' : 'Analytics tracked successfully',
        id: analyticsId,
        type: isFeedbackSubmission ? 'feedback' : 'analytics',
        tracked: {
          user: user_email || session.user.email,
          comparison: comparison_type,
          tier: tier,
          timestamp: new Date().toISOString(),
          ...(isFeedbackSubmission && { 
            rating: feedback_rating,
            has_comment: !!feedback_comment 
          })
        }
      });

    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      
      // Check if it's a missing table/column error
      if (dbError.message.includes('relation') || 
          dbError.message.includes('column') || 
          dbError.message.includes('table') ||
          dbError.message.includes('does not exist')) {
        
        console.log('📊 Analytics table not configured yet - functionality can proceed');
        
        return res.status(200).json({
          success: false,
          message: 'Analytics/feedback table not configured yet, but operation proceeded successfully',
          error: 'Database table/column missing',
          note: 'Run the analytics table migration SQL to enable tracking',
          troubleshooting: {
            issue: 'Analytics table structure mismatch',
            solution: 'Run analytics table migration script',
            impact: 'Core functionality works fine, just no activity tracking yet'
          }
        });
      }
      
      // Log other database errors but don't fail the operation
      console.error('Analytics/feedback tracking failed:', dbError.message);
      return res.status(200).json({
        success: false,
        message: `${isFeedbackSubmission ? 'Feedback' : 'Analytics'} tracking failed, but operation proceeded successfully`,
        error: dbError.message,
        note: 'Core functionality is not affected'
      });
    }

  } catch (error) {
    console.error('❌ Analytics API error:', error);
    
    // Never fail the core functionality due to tracking issues
    res.status(200).json({
      success: false,
      message: 'Tracking failed, but core functionality can proceed',
      error: error.message,
      note: 'Operations will work fine even without analytics/feedback tracking'
    });
  }
}
