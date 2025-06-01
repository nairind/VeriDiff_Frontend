// pages/api/analytics/track.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
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
      // Try to store in analytics table
      // IMPORTANT: Replace 'prisma' with your actual database connection method
      
      const analyticsData = {
        // User information
        userId: user_id || session.user.id,
        user_id: user_id || session.user.id,
        userEmail: user_email || session.user.email,
        user_email: user_email || session.user.email,
        userName: user_name || session.user.name,
        user_name: user_name || session.user.name,
        
        // Comparison details
        comparisonType: comparison_type,
        comparison_type: comparison_type,
        tier: tier,
        
        // Timing
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        
        // Optional file information
        file1Name: file1_name || null,
        file1_name: file1_name || null,
        file2Name: file2_name || null,
        file2_name: file2_name || null,
        file1Size: file1_size || null,
        file1_size: file1_size || null,
        file2Size: file2_size || null,
        file2_size: file2_size || null,
        
        // Optional metadata
        userAgent: user_agent || null,
        user_agent: user_agent || null,
        pageUrl: page_url || null,
        page_url: page_url || null,
        
        // Default success
        success: true
      };

      // Try multiple possible field name variations for compatibility
      const analyticsRecord = await prisma.analytics.create({
        data: analyticsData
      });

      console.log(`✅ Analytics tracked successfully: ID ${analyticsRecord.id}`);

      res.status(200).json({ 
        success: true, 
        message: 'Analytics tracked successfully',
        id: analyticsRecord.id,
        tracked: {
          user: user_email || session.user.email,
          comparison: comparison_type,
          tier: tier
        }
      });

    } catch (dbError) {
      console.error('Database error tracking analytics:', dbError);
      
      // If analytics table doesn't exist or has different structure, that's okay
      if (dbError.code === 'P2021' || 
          dbError.message.includes('table') || 
          dbError.message.includes('relation') ||
          dbError.message.includes('column') ||
          dbError.message.includes('field')) {
        
        console.log('📊 Analytics table not configured yet - that\'s okay, comparison can proceed');
        
        return res.status(200).json({ 
          success: false, 
          message: 'Analytics table not configured yet, but comparison proceeded successfully',
          error: 'Database table/column missing',
          note: 'This is normal if your database schema is not fully set up yet'
        });
      }
      
      // Log the error but don't fail the comparison
      console.error('Analytics tracking failed:', dbError.message);
      return res.status(200).json({ 
        success: false, 
        message: 'Analytics tracking failed, but comparison proceeded successfully',
        error: dbError.message 
      });
    }

  } catch (error) {
    console.error('Analytics API error:', error);
    
    // Never fail the comparison due to analytics issues
    res.status(200).json({ 
      success: false, 
      message: 'Analytics tracking failed, but comparison can proceed',
      error: error.message,
      note: 'Comparisons will work fine even without analytics tracking'
    });
  }
}
