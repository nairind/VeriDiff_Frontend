// pages/api/admin/simple-stats.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  
  // Check if user is admin (same emails as in the admin page)
  const adminEmails = [
    'sales@veridiff.com',  // ← CHANGE THIS TO YOUR EMAIL
    'contact@qubithcm.com'   // ← ADD MORE ADMIN EMAILS HERE
  ];
  
  if (!session || !adminEmails.includes(session.user.email)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    // IMPORTANT: Replace 'prisma' with whatever database connection you're using
    // If you're using a different database setup, ask your developer how to query users
    
    // Get total users count
    const totalUsers = await prisma.user.count();

    // Get users from this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: oneWeekAgo
        }
      }
    });

    // Get premium users count
    const premiumUsers = await prisma.user.count({
      where: {
        tier: 'premium'
      }
    });

    // Get recent users (last 10)
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        name: true,
        email: true,
        tier: true,
        createdAt: true
      }
    });

    // Try to get total comparisons (this might not work if analytics table doesn't exist yet)
    let totalComparisons = 0;
    try {
      totalComparisons = await prisma.analytics.count();
    } catch (error) {
      console.log('Analytics table not found - that\'s okay, it will show 0');
    }

    // Send the data back
    res.status(200).json({
      totalUsers,
      weeklyUsers,
      premiumUsers,
      totalComparisons,
      recentUsers
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    
    // Send back zeros if there's an error
    res.status(200).json({
      totalUsers: 0,
      weeklyUsers: 0,
      premiumUsers: 0,
      totalComparisons: 0,
      recentUsers: [],
      error: 'Could not fetch data - this is normal if your database isn\'t set up yet'
    });
  }
}
