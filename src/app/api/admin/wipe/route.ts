import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Proceed with database wipe (only existing models)
    // Marketing data (child tables first)
    await prisma.marketingAnalytics.deleteMany({});
    await prisma.marketingBenchmark.deleteMany({});
    await prisma.marketingConversion.deleteMany({});
    await prisma.marketingEvent.deleteMany({});
    await prisma.marketingCampaign.deleteMany({});
    await prisma.marketingSession.deleteMany({});

    // Reports
    await prisma.report.deleteMany({});

    // Chat
    await prisma.chatMessage.deleteMany({});

    // Imports and data sources
    await prisma.dataImport.deleteMany({});
    await prisma.dataSource.deleteMany({});

    // Users (last)
    await prisma.user.deleteMany({});

    return NextResponse.json({ success: true, message: "Database wiped." });
  } catch (error) {
    console.error("Error wiping database:");
    console.error(error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}