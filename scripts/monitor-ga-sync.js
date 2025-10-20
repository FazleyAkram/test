const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function monitorGASync() {
  try {
    console.log('🔍 Monitoring GA Data Sync...\n');
    
    // Check for recent GA imports
    const recentImports = await prisma.dataImport.findMany({
      where: {
        importType: 'GOOGLE_ANALYTICS',
        startTime: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      include: {
        dataSource: {
          include: {
            user: {
              select: { email: true }
            }
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    });
    
    console.log('=== Recent GA Imports (Last 24 Hours) ===');
    if (recentImports.length === 0) {
      console.log('❌ No recent GA imports found');
      console.log('   Go to /import page and sync your GA data');
    } else {
      recentImports.forEach((importItem, index) => {
        console.log(`\n${index + 1}. Import ID: ${importItem.id}`);
        console.log(`   User: ${importItem.dataSource.user.email}`);
        console.log(`   File: ${importItem.fileName}`);
        console.log(`   Status: ${importItem.status}`);
        console.log(`   Records: ${importItem.recordCount || 'Unknown'}`);
        console.log(`   Started: ${importItem.startTime}`);
        console.log(`   Ended: ${importItem.endTime || 'Still processing...'}`);
        console.log(`   Property: ${importItem.metadata?.propertyId || 'Unknown'}`);
        console.log(`   Date Range: ${importItem.metadata?.startDate} to ${importItem.metadata?.endDate}`);
      });
    }
    
    // Check for actual GA data in marketing tables
    console.log('\n=== GA Data in Marketing Tables ===');
    
    const sessionsCount = await prisma.marketingSession.count({
      where: {
        import: {
          importType: 'GOOGLE_ANALYTICS'
        }
      }
    });
    
    const eventsCount = await prisma.marketingEvent.count({
      where: {
        import: {
          importType: 'GOOGLE_ANALYTICS'
        }
      }
    });
    
    const conversionsCount = await prisma.marketingConversion.count({
      where: {
        import: {
          importType: 'GOOGLE_ANALYTICS'
        }
      }
    });
    
    console.log(`📊 Sessions: ${sessionsCount} records`);
    console.log(`📊 Events: ${eventsCount} records`);
    console.log(`📊 Conversions: ${conversionsCount} records`);
    
    if (sessionsCount > 0 || eventsCount > 0 || conversionsCount > 0) {
      console.log('\n✅ GA data is available in the database!');
      console.log('   You can now view analytics in the Marketing page');
    } else {
      console.log('\n❌ No GA data found in marketing tables');
      console.log('   Data sync may not have completed successfully');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

monitorGASync();













