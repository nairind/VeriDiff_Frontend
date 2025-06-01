// pages/api/admin/database-setup.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  
  // Check if user is admin
  const adminEmails = ['SALES@VERIDIFF.COM', 'contact@gubithcm.com'];
  
  if (!session || !adminEmails.includes(session.user.email)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  console.log('🔧 Starting database setup for VeriDiff...');

  try {
    const steps = [];
    let success = true;
    let errorDetails = null;

    try {
      // Step 1: Create analytics table
      console.log('📊 Creating analytics table...');
      
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS analytics (
          id SERIAL PRIMARY KEY,
          
          -- User information (multiple field names for compatibility)
          user_id VARCHAR(255),
          userId VARCHAR(255),
          user_email VARCHAR(255),
          userEmail VARCHAR(255),
          user_name VARCHAR(255),
          userName VARCHAR(255),
          
          -- Comparison details
          comparison_type VARCHAR(50) NOT NULL,
          comparisonType VARCHAR(50),
          tier VARCHAR(20) NOT NULL,
          
          -- Timing
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          -- File information (optional)
          file1_name VARCHAR(255),
          file1Name VARCHAR(255),
          file2_name VARCHAR(255),
          file2Name VARCHAR(255),
          file1_size INTEGER,
          file1Size INTEGER,
          file2_size INTEGER,
          file2Size INTEGER,
          
          -- Metadata (optional)
          user_agent TEXT,
          userAgent TEXT,
          page_url VARCHAR(500),
          pageUrl VARCHAR(500),
          
          -- Status
          success BOOLEAN DEFAULT true
        )
      `;
      
      steps.push('Analytics table created successfully');
      console.log('✅ Analytics table ready');

    } catch (analyticsError) {
      if (analyticsError.message.includes('already exists')) {
        steps.push('Analytics table already exists (that\'s good!)');
        console.log('✅ Analytics table already exists');
      } else {
        console.error('❌ Analytics table error:', analyticsError);
        throw new Error(`Analytics table setup failed: ${analyticsError.message}`);
      }
    }

    try {
      // Step 2: Add phone field to users table
      console.log('📞 Adding phone field to users table...');
      
      await prisma.$executeRaw`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)
      `;
      
      steps.push('Phone field added to users table');
      console.log('✅ Phone field added');

    } catch (phoneError) {
      if (phoneError.message.includes('already exists') || phoneError.message.includes('duplicate')) {
        steps.push('Phone field already exists in users table');
        console.log('✅ Phone field already exists');
      } else {
        console.log('⚠️ Phone field could not be added:', phoneError.message);
        steps.push('Phone field setup skipped (table might have different structure)');
      }
    }

    try {
      // Step 3: Create indexes for better performance
      console.log('⚡ Creating database indexes...');
      
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_analytics_userId ON analytics(userId)',
        'CREATE INDEX IF NOT EXISTS idx_analytics_user_email ON analytics(user_email)',
        'CREATE INDEX IF NOT EXISTS idx_analytics_userEmail ON analytics(userEmail)',
        'CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp)',
        'CREATE INDEX IF NOT EXISTS idx_analytics_comparison_type ON analytics(comparison_type)'
      ];

      let indexCount = 0;
      for (const indexSQL of indexes) {
        try {
          await prisma.$executeRaw`${indexSQL}`;
          indexCount++;
        } catch (indexError) {
          // Indexes might already exist, that's okay
          console.log(`Index already exists: ${indexSQL.split(' ')[5]}`);
        }
      }

      steps.push(`${indexCount} database indexes created for better performance`);
      console.log('✅ Database indexes ready');

    } catch (indexError) {
      console.log('⚠️ Some indexes could not be created:', indexError.message);
      steps.push('Database indexes partially created');
    }

    try {
      // Step 4: Test the setup
      console.log('🧪 Testing database setup...');
      
      const testRecord = await prisma.analytics.create({
        data: {
          user_id: 'setup-test',
          user_email: 'setup-test@veridiff.com',
          comparison_type: 'excel-excel',
          tier: 'free',
          timestamp: new Date()
        }
      });

      // Clean up test record
      await prisma.analytics.delete({
        where: { id: testRecord.id }
      });

      steps.push('Database functionality test passed');
      console.log('✅ Database test successful');

    } catch (testError) {
      console.error('❌ Database test failed:', testError);
      steps.push('Database test failed - setup might be incomplete');
      errorDetails = `Test error: ${testError.message}`;
    }

    console.log('🎉 Database setup completed successfully!');
    
    res.status(200).json({
      success: true,
      message: 'Database setup completed successfully',
      steps: steps,
      note: 'Your admin dashboard should now show detailed user activity!'
    });

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    
    res.status(500).json({
      success: false,
      error: 'Database setup failed',
      details: error.message,
      note: 'Your main VeriDiff service will continue working normally. The admin dashboard will work with basic functionality.',
      troubleshooting: [
        'Check if you have database admin permissions',
        'Verify your database connection is working',
        'Contact your hosting provider if issues persist',
        'The dashboard will still work with limited functionality'
      ]
    });
  }
}
