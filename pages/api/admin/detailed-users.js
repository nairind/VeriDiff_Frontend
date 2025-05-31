// pages/api/admin/detailed-users.js - Enhanced API with detailed user activity
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  
  // Check if user is admin
  const adminEmails = [
    'SALES@VERIDIFF.COM',  // Your email
    'contact@gubithcm.com' // Add more if needed
  ];
  
  if (!session || !adminEmails.includes(session.user.email)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    // IMPORTANT: Replace 'prisma' with your actual database connection method
    // If you're using a different database setup, adjust these queries accordingly
    
    let users = [];
    
    try {
      // Get all users with their basic info
      const basicUsers = await prisma.user.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,    // Add this field if it doesn't exist in your schema
          tier: true,
          createdAt: true,
          updatedAt: true
        }
      });

      // For each user, get their detailed activity
      for (const user of basicUsers) {
        try {
          // Get comparison activity from analytics table
          const userActivity = await prisma.analytics.findMany({
            where: {
              userId: user.id  // or user_id depending on your schema
            },
            orderBy: {
              timestamp: 'desc'
            },
            select: {
              comparisonType: true,  // or comparison_type
              tier: true,
              timestamp: true
            }
          });

          // Calculate stats
          const totalComparisons = userActivity.length;
          const excelComparisons = userActivity.filter(a => a.comparisonType === 'excel-excel').length;
          const premiumComparisons = userActivity.filter(a => a.comparisonType !== 'excel-excel').length;
          
          // Find most used comparison type
          const comparisonCounts = {};
          userActivity.forEach(activity => {
            comparisonCounts[activity.comparisonType] = (comparisonCounts[activity.comparisonType] || 0) + 1;
          });
          
          const favoriteComparison = Object.keys(comparisonCounts).reduce((a, b) => 
            comparisonCounts[a] > comparisonCounts[b] ? a : b, 'excel-excel'
          );

          // Get last activity date
          const lastActivity = userActivity.length > 0 ? userActivity[0].timestamp : null;

          // Get recent activity (last 10)
          const recentActivity = userActivity.slice(0, 10);

          users.push({
            ...user,
            totalComparisons,
            excelComparisons,
            premiumComparisons,
            favoriteComparison,
            lastActivity,
            recentActivity
          });

        } catch (activityError) {
          console.log(`No activity data for user ${user.id} - that's normal for new users`);
          
          // Add user with zero activity
          users.push({
            ...user,
            totalComparisons: 0,
            excelComparisons: 0,
            premiumComparisons: 0,
            favoriteComparison: 'excel-excel',
            lastActivity: null,
            recentActivity: []
          });
        }
      }

    } catch (userError) {
      console.error('Error fetching users:', userError);
      
      // If there's an error, return empty data with helpful message
      return res.status(200).json({
        users: [],
        error: 'Could not fetch user data. This is normal if your database tables are not set up yet.',
        message: 'Users will appear here once your database is properly configured and people start signing up.'
      });
    }

    // Sort users by most recent activity
    users.sort((a, b) => {
      if (!a.lastActivity && !b.lastActivity) return new Date(b.createdAt) - new Date(a.createdAt);
      if (!a.lastActivity) return 1;
      if (!b.lastActivity) return -1;
      return new Date(b.lastActivity) - new Date(a.lastActivity);
    });

    res.status(200).json({
      users,
      totalUsers: users.length,
      activeUsers: users.filter(u => u.totalComparisons > 0).length,
      premiumUsers: users.filter(u => u.tier === 'premium').length,
      upgradeOpportunities: users.filter(u => u.tier !== 'premium' && u.premiumComparisons > 0).length
    });

  } catch (error) {
    console.error('Detailed users API error:', error);
    
    // Return helpful error response
    res.status(200).json({
      users: [],
      totalUsers: 0,
      activeUsers: 0,
      premiumUsers: 0,
      upgradeOpportunities: 0,
      error: 'Database connection issue. This is normal if your database is not fully set up yet.',
      message: 'Contact your developer to ensure user and analytics tables are properly configured.'
    });
  }
}

// SAMPLE DATABASE SCHEMA UPDATES NEEDED:
/*

-- Add phone field to users table if not exists
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Analytics table for tracking comparisons (if not exists)
CREATE TABLE IF NOT EXISTS analytics (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id),
  user_email VARCHAR(255),
  comparison_type VARCHAR(50), -- 'excel-excel', 'excel-csv', etc.
  tier VARCHAR(20), -- 'free' or 'premium'
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file1_size INTEGER, -- optional
  file2_size INTEGER, -- optional
  success BOOLEAN DEFAULT true
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp);

*/
