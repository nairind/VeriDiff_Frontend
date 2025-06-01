// pages/api/admin/detailed-users.js
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
    // Start with empty arrays in case database isn't set up yet
    let users = [];
    let totalUsers = 0;
    let activeUsers = 0;
    let premiumUsers = 0;
    let upgradeOpportunities = 0;

    try {
      // Try to get users from database
      // IMPORTANT: You'll need to replace 'prisma' with your actual database connection
      
      // Get all users with basic info
      const basicUsers = await prisma.user.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,    // This field might not exist yet - that's okay
          tier: true,
          createdAt: true,
          updatedAt: true
        }
      });

      totalUsers = basicUsers.length;

      // For each user, try to get their activity
      for (const user of basicUsers) {
        let userActivity = [];
        let totalComparisons = 0;
        let excelComparisons = 0;
        let premiumComparisons = 0;
        let favoriteComparison = 'excel-excel';
        let lastActivity = null;

        try {
          // Try to get analytics data
          userActivity = await prisma.analytics.findMany({
            where: {
              OR: [
                { userId: user.id },
                { user_id: user.id },
                { userEmail: user.email },
                { user_email: user.email }
              ]
            },
            orderBy: {
              timestamp: 'desc'
            },
            take: 50, // Limit to recent activity
            select: {
              comparisonType: true,
              comparison_type: true,
              tier: true,
              timestamp: true
            }
          });

          // Calculate stats from activity
          totalComparisons = userActivity.length;
          
          userActivity.forEach(activity => {
            const compType = activity.comparisonType || activity.comparison_type || 'excel-excel';
            if (compType === 'excel-excel') {
              excelComparisons++;
            } else {
              premiumComparisons++;
            }
          });

          lastActivity = userActivity.length > 0 ? userActivity[0].timestamp : null;

          // Find most used comparison type
          const comparisonCounts = {};
          userActivity.forEach(activity => {
            const compType = activity.comparisonType || activity.comparison_type || 'excel-excel';
            comparisonCounts[compType] = (comparisonCounts[compType] || 0) + 1;
          });
          
          if (Object.keys(comparisonCounts).length > 0) {
            favoriteComparison = Object.keys(comparisonCounts).reduce((a, b) => 
              comparisonCounts[a] > comparisonCounts[b] ? a : b
            );
          }

        } catch (analyticsError) {
          console.log(`No analytics data for user ${user.id} - that's normal for new setups`);
        }

        users.push({
          ...user,
          totalComparisons,
          excelComparisons,
          premiumComparisons,
          favoriteComparison,
          lastActivity,
          recentActivity: userActivity.slice(0, 10).map(a => ({
            comparisonType: a.comparisonType || a.comparison_type,
            tier: a.tier,
            timestamp: a.timestamp
          }))
        });

        // Count active and premium users
        if (totalComparisons > 0) activeUsers++;
        if (user.tier === 'premium') premiumUsers++;
        if (user.tier !== 'premium' && premiumComparisons > 0) upgradeOpportunities++;
      }

    } catch (dbError) {
      console.error('Database error (this is normal if not set up yet):', dbError.message);
      
      // Return empty but valid response
      return res.status(200).json({
        users: [],
        totalUsers: 0,
        activeUsers: 0,
        premiumUsers: 0,
        upgradeOpportunities: 0,
        message: 'Database not fully configured yet. Users will appear here once database is set up and people start signing up.',
        setupNeeded: true
      });
    }

    // Sort users by most recent activity
    users.sort((a, b) => {
      if (!a.lastActivity && !b.lastActivity) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (!a.lastActivity) return 1;
      if (!b.lastActivity) return -1;
      return new Date(b.lastActivity) - new Date(a.lastActivity);
    });

    res.status(200).json({
      users,
      totalUsers,
      activeUsers,
      premiumUsers,
      upgradeOpportunities,
      message: users.length === 0 ? 'No users found yet. Users will appear here as people sign up.' : null
    });

  } catch (error) {
    console.error('Detailed users API error:', error);
    
    // Always return a valid response, even if there's an error
    res.status(200).json({
      users: [],
      totalUsers: 0,
      activeUsers: 0,
      premiumUsers: 0,
      upgradeOpportunities: 0,
      error: 'Unable to fetch user data',
      message: 'This is normal if your database is not fully configured yet.',
      setupNeeded: true
    });
  }
}
