import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function assignReport() {
  try {
    const name = "Marketing Report";
    const filePath = "marketing-report.json";
    const type = "CUSTOM";

    const email = "admin@codi.com";
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true
      }
    });

    if (!user) {
        throw new Error(`User not found for email ${email}`);
    }

    // Create report model
    const report = await prisma.report.create({
      data: {
        name,
        filePath,
        type,
        userId: user.id
      }
    });

    console.log("Report assigned successfully:", report.name);
  } catch (error) {
    console.error("Error assigning report:", error);
  } finally {
    await prisma.$disconnect();
  }
}

assignReport();