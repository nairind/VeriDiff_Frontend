// pages/api/analytics/track.js - Fixed to use YOUR database connection
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
      page_url
    } = req.body;

    // Validate required fields
    if (!comparison_type || !tier) {
      return res.status(400).json({ error: 'Missing required fields: comparison_type and tier' });
    }

    console.log(`📊 Tracking analytics: ${comparison_type} (${tier}) for ${user_email || session.user.email}`);

    try {
      // Insert analytics record using YOUR database connection method
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
          success
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
        true  // success = true
      ]);

      const analyticsId = result.rows[0].id;

      console.log(`✅ Analytics recorded successfully: ID ${analyticsId}`);
      console.log(`📊 User: ${user_email || session.user.email} | Type: ${comparison_type} | Tier: ${tier}`);

      res.status(200).json({
        success: true,
        message: 'Analytics tracked successfully',
        id: analyticsId,
        tracked: {
          user: user_email || session.user.email,
          comparison: comparison_type,
          tier: tier,
          timestamp: new Date().toISOString()
        }
      });

    } catch (dbError) {
      console.error('❌ Database error tracking analytics:', dbError);
      
      // Check if it's a missing table/column error
      if (dbError.message.includes('relation') || 
          dbError.message.includes('column') || 
          dbError.message.includes('table') ||
          dbError.message.includes('does not exist')) {
        
        console.log('📊 Analytics table not configured yet - comparison can proceed');
        
        return res.status(200).json({
          success: false,
          message: 'Analytics table not configured yet, but comparison proceeded successfully',
          error: 'Database table/column missing',
          note: 'Run the analytics table setup SQL to enable tracking',
          troubleshooting: {
            issue: 'Analytics table structure mismatch',
            solution: 'Run analytics table setup script',
            impact: 'Comparisons work fine, just no activity tracking yet'
          }
        });
      }
      
      // Log other database errors but don't fail the comparison
      console.error('Analytics tracking failed:', dbError.message);
      return res.status(200).json({
        success: false,
        message: 'Analytics tracking failed, but comparison proceeded successfully',
        error: dbError.message,
        note: 'Comparison functionality is not affected'
      });
    }

  } catch (error) {
    console.error('❌ Analytics API error:', error);
    
    // Never fail the comparison due to analytics issues
    res.status(200).json({
      success: false,
      message: 'Analytics tracking failed, but comparison can proceed',
      error: error.message,
      note: 'Comparisons will work fine even without analytics tracking'
    });
  }
}
