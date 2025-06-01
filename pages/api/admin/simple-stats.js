// pages/api/admin/simple-stats.js - Using YOUR correct database connection
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  console.log('🔍 Simple Stats API called');
  
  if (req.method !== 'GET') {
    console.log('❌ Wrong method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  console.log('🔐 Session:', session ? `User: ${session.user.email}` : 'No session');
  
  // Check if user is admin
  const adminEmails = [
    'SALES@VERIDIFF.COM',  // Your email
    'sales@veridiff.com',  // Lowercase version
    'contact@gubithcm.com' // Add more if needed
  ];
  
  if (!session || !adminEmails.some(email => 
    email.toLowerCase() === session.user.email.toLowerCase()
  )) {
    console.log('❌ Unauthorized access attempt:', session?.user?.email || 'no email');
    return res.status(403).json({ error: 'Unauthorized' });
  }

  console.log('✅ Admin access granted to:', session.user.email);

  try {
    // Initialize with defaults
    let totalUsers = 0;
    let weeklyUsers = 0;
    let premiumUsers = 0;
    let totalComparisons = 0;
    let recentUsers = [];
    let databaseStatus = 'unknown';

    try {
      console.log('📊 Fetching user data...');
      
      // Get total users count - USING YOUR DATABASE CONNECTION
      const totalResult = await query('SELECT COUNT(*) as count FROM users');
      totalUsers = parseInt(totalResult.rows[0].count);
      console.log(`✅ Total users: ${totalUsers}`);
      databaseStatus = 'connected';

      // Get users from this week
      const weeklyResult = await query(`
        SELECT COUNT(*) as count FROM users 
        WHERE created_at >= NOW() - INTERVAL '7 days'
      `);
      weeklyUsers = parseInt(weeklyResult.rows[0].count);
      console.log(`✅ Weekly users: ${weeklyUsers}`);

      // Get premium users count
      const premiumResult = await query(`
        SELECT COUNT(*) as count FROM users 
        WHERE tier = 'premium'
      `);
      premiumUsers = parseInt(premiumResult.rows[0].count);
      console.log(`✅ Premium users: ${premiumUsers}`);

      // Get recent users (last 10) - with all fields you need
      const recentResult = await query(`
        SELECT id, full_name as name, email, tier, created_at, phone_number
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 10
      `);
      recentUsers = recentResult.rows.map(user => ({
        ...user,
        created_at: user.created_at ? new Date(user.created_at).toISOString() : null
      }));
      console.log(`✅ Recent users fetched: ${recentUsers.length} users`);
      console.log('📋 Recent users sample:', recentUsers.slice(0, 2));

    } catch (userError) {
      console.error('⚠️ User table error:', userError.message);
      console.error('Full error:', userError);
      databaseStatus = 'user_table_error';
    }

    try {
      // Try to get total comparisons - USING YOUR DATABASE CONNECTION
      const analyticsResult = await query('SELECT COUNT(*) as count FROM analytics');
      totalComparisons = parseInt(analyticsResult.rows[0].count);
      console.log(`✅ Analytics data fetched: ${totalComparisons} total comparisons`);
      
    } catch (analyticsError) {
      console.log('⚠️ Analytics table not found or empty - that\'s okay');
      totalComparisons = 0;
      
      if (databaseStatus === 'connected') {
        databaseStatus = 'missing_analytics_table';
      }
    }

    const responseData = {
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
          : null,
      debug: {
        timestamp: new Date().toISOString(),
        userEmail: session.user.email,
        queriesExecuted: true
      }
    };

    console.log('📤 Sending response:', {
      totalUsers,
      weeklyUsers,
      premiumUsers,
      recentUsersCount: recentUsers.length,
      databaseStatus
    });

    // Send the data back
    res.status(200).json(responseData);

  } catch (error) {
    console.error('❌ Simple stats error:', error);
    console.error('Error stack:', error.stack);
    
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
      message: 'Database connection issue. Check your database connection.',
      troubleshooting: [
        'Verify database is running',
        'Check API configuration',
        'Contact your hosting provider if issues persist'
      ],
      debug: {
        timestamp: new Date().toISOString(),
        errorMessage: error.message,
        errorStack: error.stack
      }
    });
  }
}
