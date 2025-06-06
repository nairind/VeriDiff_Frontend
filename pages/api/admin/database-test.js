// pages/api/admin/database-test.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  
  // Check if user is admin
  const adminEmails = ['SALES@VERIDIFF.COM', 'contact@gubithcm.com'];
  
  if (!session || !adminEmails.includes(session.user.email)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  console.log('🧪 Testing database connection...');

  try {
    let userCount = 0;
    let analyticsCount = 0;
    let tablesExist = {
      users: false,
      analytics: false
    };

    // Test users table
    try {
      userCount = await prisma.user.count();
      tablesExist.users = true;
      console.log(`✅ Users table: ${userCount} users found`);
    } catch (userError) {
      console.log('❌ Users table issue:', userError.message);
    }

    // Test analytics table
    try {
      analyticsCount = await prisma.analytics.count();
      tablesExist.analytics = true;
      console.log(`✅ Analytics table: ${analyticsCount} records found`);
    } catch (analyticsError) {
      console.log('❌ Analytics table issue:', analyticsError.message);
    }

    // Test database write capability
    let canWrite = false;
    try {
      const testWrite = await prisma.analytics.create({
        data: {
          user_id: 'connection-test',
          user_email: 'test@veridiff.com',
          comparison_type: 'test',
          tier: 'test'
        }
      });

      await prisma.analytics.delete({
        where: { id: testWrite.id }
      });
      
      canWrite = true;
      console.log('✅ Database write test successful');
    } catch (writeError) {
      console.log('❌ Database write test failed:', writeError.message);
    }

    // Overall health check
    const isHealthy = tablesExist.users && tablesExist.analytics && canWrite;

    res.status(200).json({
      success: true,
      healthy: isHealthy,
      userCount,
      analyticsCount,
      tables: tablesExist,
      canWrite,
      message: isHealthy 
        ? 'Database is fully functional!' 
        : 'Database has some issues but basic functionality works',
      details: {
        usersTable: tablesExist.users ? 'Working' : 'Missing or inaccessible',
        analyticsTable: tablesExist.analytics ? 'Working' : 'Missing - run database setup',
        writePermissions: canWrite ? 'Working' : 'Limited - check permissions'
      }
    });

  } catch (error) {
    console.error('❌ Database test failed:', error);
    
    res.status(500).json({
      success: false,
      healthy: false,
      error: 'Database connection failed',
      details: error.message,
      userCount: 0,
      analyticsCount: 0,
      tables: { users: false, analytics: false },
      canWrite: false,
      troubleshooting: [
        'Check database connection settings',
        'Verify database is running',
        'Run database setup if analytics table is missing',
        'Contact hosting provider if issues persist'
      ]
    });
  }
}
