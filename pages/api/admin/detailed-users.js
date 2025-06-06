// pages/api/admin/detailed-users.js - Enhanced user activity tracking
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  console.log('🔍 Detailed Users API called');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  
  // Check if user is admin
  const adminEmails = [
    'SALES@VERIDIFF.COM',
    'sales@veridiff.com',
    'contact@gubithcm.com'
  ];
  
  if (!session || !adminEmails.some(email => 
    email.toLowerCase() === session.user.email.toLowerCase()
  )) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    console.log('📊 Fetching detailed user data...');

    // Get all users with basic info
    const usersResult = await query(`
      SELECT 
        id, 
        full_name as name, 
        email, 
        tier, 
        created_at, 
        phone_number
      FROM users 
      ORDER BY created_at DESC
    `);

    const users = usersResult.rows;
    console.log(`✅ Found ${users.length} users`);

    // For each user, get their activity data
    const usersWithActivity = await Promise.all(
      users.map(async (user) => {
        try {
          // Get total comparisons for this user
          const totalComparisonsResult = await query(`
            SELECT COUNT(*) as count 
            FROM analytics 
            WHERE user_id = $1
          `, [user.id]);

          // Get Excel-Excel comparisons (free)
          const excelComparisonsResult = await query(`
            SELECT COUNT(*) as count 
            FROM analytics 
            WHERE user_id = $1 
            AND (comparison_type = 'excel-excel' OR comparison_type LIKE '%xlsx%')
          `, [user.id]);

          // Get premium comparisons
          const premiumComparisonsResult = await query(`
            SELECT COUNT(*) as count 
            FROM analytics 
            WHERE user_id = $1 
            AND comparison_type != 'excel-excel' 
            AND comparison_type NOT LIKE '%xlsx%'
          `, [user.id]);

          // Get last activity
          const lastActivityResult = await query(`
            SELECT timestamp 
            FROM analytics 
            WHERE user_id = $1 
            ORDER BY timestamp DESC 
            LIMIT 1
          `, [user.id]);

          // Get favorite comparison type
          const favoriteTypeResult = await query(`
            SELECT comparison_type, COUNT(*) as count 
            FROM analytics 
            WHERE user_id = $1 
            GROUP BY comparison_type 
            ORDER BY count DESC 
            LIMIT 1
          `, [user.id]);

          // Get recent activity (last 10)
          const recentActivityResult = await query(`
            SELECT 
              comparison_type,
              tier,
              timestamp,
              file1_name,
              file2_name
            FROM analytics 
            WHERE user_id = $1 
            ORDER BY timestamp DESC 
            LIMIT 10
          `, [user.id]);

          const totalComparisons = parseInt(totalComparisonsResult.rows[0]?.count || 0);
          const excelComparisons = parseInt(excelComparisonsResult.rows[0]?.count || 0);
          const premiumComparisons = parseInt(premiumComparisonsResult.rows[0]?.count || 0);
          const lastActivity = lastActivityResult.rows[0]?.timestamp || null;
          const favoriteComparison = favoriteTypeResult.rows[0]?.comparison_type || 'None';
          const recentActivity = recentActivityResult.rows || [];

          return {
            ...user,
            createdAt: user.created_at,
            phone: user.phone_number,
            totalComparisons,
            excelComparisons,
            premiumComparisons,
            lastActivity,
            favoriteComparison,
            recentActivity: recentActivity.map(activity => ({
              comparisonType: activity.comparison_type,
              tier: activity.tier,
              timestamp: activity.timestamp,
              files: `${activity.file1_name || 'File1'} vs ${activity.file2_name || 'File2'}`
            }))
          };

        } catch (activityError) {
          console.error(`⚠️ Error fetching activity for user ${user.id}:`, activityError);
          // Return user with zero activity if analytics fails
          return {
            ...user,
            createdAt: user.created_at,
            phone: user.phone_number,
            totalComparisons: 0,
            excelComparisons: 0,
            premiumComparisons: 0,
            lastActivity: null,
            favoriteComparison: 'None',
            recentActivity: []
          };
        }
      })
    );

    console.log('✅ Detailed user data compiled successfully');

    // Calculate summary stats
    const totalUsers = users.length;
    const activeUsers = usersWithActivity.filter(u => u.totalComparisons > 0).length;
    const upgradeOpportunities = usersWithActivity.filter(u => 
      u.tier !== 'premium' && u.premiumComparisons > 0
    ).length;

    res.status(200).json({
      success: true,
      users: usersWithActivity,
      summary: {
        totalUsers,
        activeUsers,
        upgradeOpportunities,
        totalComparisons: usersWithActivity.reduce((sum, u) => sum + u.totalComparisons, 0)
      },
      debug: {
        timestamp: new Date().toISOString(),
        usersProcessed: users.length
      }
    });

  } catch (error) {
    console.error('❌ Detailed users error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch detailed user data',
      message: error.message,
      debug: {
        timestamp: new Date().toISOString(),
        errorStack: error.stack
      }
    });
  }
}
