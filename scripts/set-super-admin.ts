import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setSuperAdmin() {
  try {
    // Find the first admin user (by creation date)
    const firstAdmin = await prisma.user.findFirst({
      where: { isAdmin: true },
      orderBy: { createdAt: 'asc' }
    });

    if (!firstAdmin) {
      console.log('No admin users found. Please create an admin user first.');
      return;
    }

    // Set this user as super admin
    await prisma.user.update({
      where: { id: firstAdmin.id },
      data: { isSuperAdmin: true }
    });

    console.log(`✅ User ${firstAdmin.email} (ID: ${firstAdmin.id}) has been set as Super Admin`);
    console.log('This user cannot be demoted from admin status by other admins.');

  } catch (error) {
    console.error('Error setting super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setSuperAdmin();












