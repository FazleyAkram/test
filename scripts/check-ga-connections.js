const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkGAConnections() {
  try {
    console.log('🔍 Checking Google Analytics Connections...\n');
    
    const gaConnections = await prisma.dataSource.findMany({
      where: {
        provider: 'GOOGLE_ANALYTICS'
      },
      include: {
        user: {
          select: { id: true, email: true }
        }
      }
    });
    
    console.log('=== Google Analytics Connections ===');
    if (gaConnections.length === 0) {
      console.log('❌ No GA connections found');
      console.log('   Make sure you have completed the OAuth flow');
    } else {
      gaConnections.forEach((conn, index) => {
        console.log(`\n${index + 1}. User ID: ${conn.user.id} (${conn.user.email})`);
        console.log(`   Provider: ${conn.provider}`);
        console.log(`   Active: ${conn.isActive}`);
        console.log(`   Last Sync: ${conn.lastSync || 'Never'}`);
        console.log(`   Sync Status: ${conn.syncStatus}`);
        console.log(`   Properties: ${conn.config?.properties?.length || 0} found`);
        
        // Show properties if available
        if (conn.config?.properties?.length > 0) {
          console.log(`   Available Properties:`);
          conn.config.properties.forEach((prop, propIndex) => {
            console.log(`     ${propIndex + 1}. ${prop.displayName || prop.name} (ID: ${prop.name})`);
          });
        }
      });
    }
    
    // Check for GA data imports
    console.log('\n=== GA Data Imports ===');
    const gaImports = await prisma.dataImport.findMany({
      where: {
        importType: 'GOOGLE_ANALYTICS'
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
    
    if (gaImports.length === 0) {
      console.log('❌ No GA data imports found');
      console.log('   You need to sync data from GA properties');
    } else {
      console.log(`✅ Found ${gaImports.length} GA data imports:`);
      gaImports.forEach((importItem, index) => {
        console.log(`\n${index + 1}. Import ID: ${importItem.id}`);
        console.log(`   User: ${importItem.dataSource.user.email}`);
        console.log(`   File: ${importItem.fileName}`);
        console.log(`   Status: ${importItem.status}`);
        console.log(`   Records: ${importItem.recordCount}`);
        console.log(`   Started: ${importItem.startTime}`);
        console.log(`   Metadata:`, importItem.metadata);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkGAConnections();
