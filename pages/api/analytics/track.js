// pages/api/analytics/track.js - Enhanced analytics tracking
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
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Store analytics data
      // IMPORTANT: Replace 'prisma' with your actual database connection method
      
      const analyticsRecord = await prisma.analytics.create({
        data: {
          // User information
          user_id: user_id || session.user.id,
          user_email: user_email || session.user.email,
          user_name: user_name || session.user.name,
          
          // Comparison details
          comparison_type,
          tier,
          
          // Timing
          timestamp: timestamp ? new Date(timestamp) : new Date(),
          
          // Optional file information
          file1_name: file1_name || null,
          file2_name: file2_name || null,
          file1_size: file1_size || null,
          file2_size: file2_size || null,
          
          // Optional metadata
          user_agent: user_agent || null,
          page_url: page_url || null,
          
          // Default success
          success: true
        }
      });

      console.log(`✅ Analytics tracked for ${user_email}: ${comparison_type} (${tier})`);

      res.status(200).json({ 
        success: true, 
        message: 'Analytics tracked successfully',
        id: analyticsRecord.id
      });

    } catch (dbError) {
      console.error('Database error tracking analytics:', dbError);
      
      // If analytics table doesn't exist, log it but don't fail the comparison
      if (dbError.code === 'P2021' || dbError.message.includes('table') || dbError.message.includes('relation')) {
        console.log('📊 Analytics table not set up yet - that\'s okay for now');
        return res.status(200).json({ 
          success: false, 
          message: 'Analytics table not configured yet, but comparison can proceed',
          error: 'Database table missing'
        });
      }
      
      throw dbError;
    }

  } catch (error) {
    console.error('Analytics tracking error:', error);
    
    // Don't fail the comparison even if analytics fails
    res.status(200).json({ 
      success: false, 
      message: 'Analytics tracking failed, but comparison can proceed',
      error: error.message 
    });
  }
}

// ENHANCED DATABASE SCHEMA FOR ANALYTICS:
/*

-- Enhanced analytics table with all the detailed tracking
CREATE TABLE IF NOT EXISTS analytics (
  id SERIAL PRIMARY KEY,
  
  -- User information
  user_id VARCHAR(255) REFERENCES users(id),
  user_email VARCHAR(255),
  user_name VARCHAR(255),
  
  -- Comparison details
  comparison_type VARCHAR(50) NOT NULL, -- 'excel-excel', 'excel-csv', etc.
  tier VARCHAR(20) NOT NULL, -- 'free' or 'premium'
  
  -- Timing
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- File information (optional)
  file1_name VARCHAR(255),
  file2_name VARCHAR(255),
  file1_size INTEGER,
  file2_size INTEGER,
  
  -- Metadata (optional)
  user_agent TEXT,
  page_url VARCHAR(500),
  
  -- Status
  success BOOLEAN DEFAULT true,
  
  -- Indexes for better performance
  INDEX idx_user_id (user_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_comparison_type (comparison_type),
  INDEX idx_user_email (user_email)
);

-- Add phone field to users table if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

*/
