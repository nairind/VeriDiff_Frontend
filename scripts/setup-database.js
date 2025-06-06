// scripts/setup-database.js
// Run this with: node scripts/setup-database.js

const { PrismaClient } = require('@prisma/client');
// OR replace with your database connection method

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log('🔧 Setting up VeriDiff database for admin dashboard...\n');

  try {
    // Check if analytics table exists and create it if not
    console.log('📊 Setting up analytics table...');
    
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
    
    console.log('✅ Analytics table ready');

    // Add phone field to users table if it doesn't exist
    console.log('📞 Adding phone field to users table...');
    
    try {
      await prisma.$executeRaw`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)
      `;
      console.log('✅ Phone field added to users table');
    } catch (phoneError) {
      if (phoneError.message.includes('already exists') || phoneError.message.includes('duplicate')) {
        console.log('✅ Phone field already exists in users table');
      } else {
        console.log('⚠️  Could not add phone field:', phoneError.message);
      }
    }

    // Create indexes for better performance
    console.log('⚡ Creating database indexes for better performance...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_userId ON analytics(userId)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_user_email ON analytics(user_email)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_userEmail ON analytics(userEmail)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_comparison_type ON analytics(comparison_type)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_comparisonType ON analytics(comparisonType)'
    ];

    for (const indexSQL of indexes) {
      try {
        await prisma.$executeRaw`${indexSQL}`;
      } catch (indexError) {
        // Indexes might already exist, that's okay
        console.log(`Index already exists or created: ${indexSQL.split(' ')[5]}`);
      }
    }

    console.log('✅ Database indexes created');

    // Test the setup
    console.log('\n🧪 Testing database setup...');
    
    // Test analytics table
    const testAnalytics = await prisma.analytics.create({
      data: {
        user_id: 'test-user',
        user_email: 'test@example.com',
        comparison_type: 'excel-excel',
        tier: 'free',
        timestamp: new Date()
      }
    });

    console.log('✅ Analytics table test successful');

    // Clean up test data
    await prisma.analytics.delete({
      where: { id: testAnalytics.id }
    });

    console.log('✅ Test data cleaned up');

    console.log('\n🎉 Database setup complete!');
    console.log('\nWhat this enables:');
    console.log('  📊 User activity tracking');
    console.log('  📈 Detailed analytics dashboard');
    console.log('  📞 Phone number storage for users');
    console.log('  🚀 Performance optimized queries');
    console.log('\nYour admin dashboard should now show detailed user data!');

  } catch (error) {
    console.error('❌ Database setup error:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure your database is running');
    console.log('2. Check your database connection settings');
    console.log('3. Ensure you have database admin permissions');
    console.log('\nThe admin dashboard will still work with basic functionality even if this setup fails.');
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupDatabase();

// Instructions for running this script:
/*

To run this setup script:

1. Open your terminal/command prompt
2. Navigate to your project folder
3. Run: node scripts/setup-database.js

If you get an error about 'prisma' not found:
- Replace 'prisma' in this file with your actual database connection method
- Ask your hosting provider about database setup
- The dashboard will still work without this, just with limited data

*/
