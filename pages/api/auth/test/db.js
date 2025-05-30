// Create this file at: pages/api/test/db.js
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test basic connection
    const result = await query('SELECT NOW() as current_time');
    
    // Test users table
    const userCount = await query('SELECT COUNT(*) FROM users');
    
    // Test magic_links table  
    const linkCount = await query('SELECT COUNT(*) FROM magic_links');

    res.status(200).json({ 
      status: 'Database connected successfully!',
      current_time: result.rows[0].current_time,
      user_count: userCount.rows[0].count,
      magic_links_count: linkCount.rows[0].count,
      env_check: {
        postgres_url: !!process.env.POSTGRES_URL,
        resend_api_key: !!process.env.RESEND_API_KEY,
        nextauth_url: process.env.NEXTAUTH_URL
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      message: error.message,
      env_check: {
        postgres_url: !!process.env.POSTGRES_URL,
        resend_api_key: !!process.env.RESEND_API_KEY,
        nextauth_url: process.env.NEXTAUTH_URL
      }
    });
  }
}
