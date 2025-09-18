import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const email = "admin@codi.com";
    const password = "admin12345"; // Change this to a secure password
    const firstName = "CODI";
    const lastName = "Administrator";
    const company = "CODI Marketing";

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        company,
        role: "ADMIN",
        isApproved: true,
        isAdmin: true
      }
    });

    console.log("Admin user created successfully:", admin.email);
    console.log("User details:", {
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      company: admin.company,
      role: admin.role,
      isAdmin: admin.isAdmin
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 