const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkGAConfig() {
  try {
    console.log('🔍 Checking GA Connection Config...\n');
    
    const gaConnection = await prisma.dataSource.findFirst({
      where: { provider: 'GOOGLE_ANALYTICS' },
      select: { 
        id: true,
        config: true,
        userId: true
      }
    });
    
    console.log('=== GA Connection Config ===');
    if (!gaConnection) {
      console.log('❌ No GA connection found');
    } else {
      console.log('Connection ID:', gaConnection.id);
      console.log('User ID:', gaConnection.userId);
      console.log('\nConfig Details:');
      console.log(JSON.stringify(gaConnection.config, null, 2));
      
      // Check if properties are stored
      if (gaConnection.config?.properties) {
        console.log('\n=== Stored Properties ===');
        gaConnection.config.properties.forEach((prop, index) => {
          console.log(`${index + 1}. Name: ${prop.name}`);
          console.log(`   Display Name: ${prop.displayName}`);
          console.log(`   Type: ${prop.type || 'Unknown'}`);
          console.log('');
        });
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkGAConfig();













