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

  
  console.log('✅ Database seeded successfully!')
  console.log(`👤 Admin: ${admin.email}`)
  console.log(`👤 Marketer: ${marketer.email}`)

}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


