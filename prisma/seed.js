import { PrismaClient } from '@prisma/client'
import bcrypt from "bcryptjs";

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding CODI Marketing Assistant database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin12345', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@codi.com' },
    update: {},
    create: {
      email: 'admin@codi.com',
      passwordHash: adminPassword,
      firstName: 'CODI',
      lastName: 'Administrator',
      company: 'CODI Marketing',
      role: 'ADMIN',
      isApproved: true,
      isAdmin: true
    }
  })

  // Create sample marketer user
  const marketerPassword = await bcrypt.hash('marketer123', 10)
  const marketer = await prisma.user.upsert({
    where: { email: 'marketer@codi.com' },
    update: {},
    create: {
      email: 'marketer@codi.com',
      passwordHash: marketerPassword,
      firstName: 'John',
      lastName: 'Marketer',
      company: 'CODI Marketing',
      role: 'MARKETER',
      isApproved: true,
      isAdmin: false
    }
  })

  // Create sample data sources
  const googleAnalytics = await prisma.dataSource.upsert({
    where: { id: 'ga-source-1' },
    update: {},
    create: {
      id: 'ga-source-1',
      name: 'Main Website Analytics',
      provider: 'GOOGLE_ANALYTICS',
      isActive: true,
      config: { propertyId: 'GA4-123456789' },
      userId: admin.id,
      syncStatus: 'SUCCESS',
      lastSync: new Date()
    }
  })

  // Removed Meta Pixels data source per request

  // Create sample campaign
  const summerCampaign = await prisma.campaign.upsert({
    where: { id: 'summer-2024' },
    update: {},
    create: {
      id: 'summer-2024',
      name: 'Summer Sale 2024',
      description: 'Annual summer promotion campaign',
      type: 'DISPLAY',
      status: 'ACTIVE',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
      budget: 50000.00,
      currency: 'USD',
      tags: ['summer', 'sale', 'display'],
      userId: admin.id
    }
  })

  // Create sample metrics
  await prisma.metric.createMany({
    data: [
      {
        name: 'Website Sessions',
        value: 125000,
        unit: 'sessions',
        metricType: 'SESSIONS',
        sourceId: googleAnalytics.id,
        campaignId: summerCampaign.id,
        date: new Date('2024-06-15'),
        dimensions: { device: 'desktop', country: 'US' }
      },
      // Removed Meta Pixels-derived metrics per request
      {
        name: 'Conversions',
        value: 1250,
        unit: 'conversions',
        metricType: 'CONVERSIONS',
        sourceId: googleAnalytics.id,
        campaignId: summerCampaign.id,
        date: new Date('2024-06-15'),
        dimensions: { device: 'desktop' }
      }
    ],
    skipDuplicates: true
  })

  // Create sample insight
  // Removed Meta Pixels-specific insight per request

  console.log('✅ Database seeded successfully!')
  console.log(`👤 Admin: ${admin.email}`)
  console.log(`👤 Marketer: ${marketer.email}`)
  console.log(`📊 Data sources: ${googleAnalytics.name}`)
  console.log(`🎯 Campaign: ${summerCampaign.name}`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


