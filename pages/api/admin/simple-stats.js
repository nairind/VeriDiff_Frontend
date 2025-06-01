// pages/api/admin/simple-stats.js - Updated with better error handling
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
    // Initialize with defaults
    let totalUsers = 0;
    let weeklyUsers = 0;
    let premiumUsers = 0;
    let totalComparisons = 0;
    let recentUsers = [];
    let databaseStatus = 'unknown';

    try {
      // Try to get total users count
      totalUsers = await prisma.user.count();
      databaseStatus = 'connected';

      // Get users from this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      weeklyUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: oneWeekAgo
          }
        }
      });

      // Get premium users count
      premiumUsers = await prisma.user.count({
        where: {
          tier: 'premium'
        }
      });

      // Get recent users (last 10)
      recentUsers = await prisma.user.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          name: true,
          email: true,
          tier: true,
          createdAt: true
        }
      });

      console.log(`✅ User data fetched: ${totalUsers} total users`);

    } catch (userError) {
      console.error('⚠️ User table error:', userError.message);
      databaseStatus = 'user_table_error';
    }

    try {
      // Try to get total comparisons (this might not work if analytics table doesn't exist yet)
      totalComparisons = await prisma.analytics.count();
      console.log(`✅ Analytics data fetched: ${totalComparisons} total comparisons`);
      
    } catch (analyticsError) {
      console.log('⚠️ Analytics table not found - that\'s okay, it will be created during setup');
      totalComparisons = 0;
      
      if (databaseStatus === 'connected') {
        databaseStatus = 'missing_analytics_table';
      }
    }

    // Send the data back
    res.status(200).json({
      totalUsers,
      weeklyUsers,
      premiumUsers,
      totalComparisons,
      recentUsers,
      databaseStatus,
      setupNeeded: databaseStatus === 'missing_analytics_table',
      message: databaseStatus === 'missing_analytics_table' 
        ? 'Database connected but analytics table missing. Run database setup for full functionality.'
        : totalUsers === 0 
          ? 'No users found yet. Users will appear here as people sign up.'
          : null
    });

  } catch (error) {
    console.error('❌ Simple stats error:', error);
    
    // Send back zeros if there's an error, but still let dashboard work
    res.status(200).json({
      totalUsers: 0,
      weeklyUsers: 0,
      premiumUsers: 0,
      totalComparisons: 0,
      recentUsers: [],
      databaseStatus: 'error',
      setupNeeded: true,
      error: 'Could not fetch data',
      message: 'Database connection issue. This is normal if your database is not fully configured yet. Run database setup to fix this.',
      troubleshooting: [
        'Go to /admin/setup to run database setup',
        'Check your database connection',
        'Contact your hosting provider if issues persist'
      ]
    });
  }
}
