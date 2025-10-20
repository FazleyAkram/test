import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Used to get user reports
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get("token")?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    // Process request
    const { searchParams } = new URL(request.url);
    const requestedReport = searchParams.get("reportId"); // If absent, return ALL reports

    console.log('Loading requested report for user:', user.id, 'with report:', requestedReport);

    let reports;
    if (!requestedReport) {
      // Return ALL reports for the user by default
      reports = await prisma.report.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          content: true,
          filters: true,
          createdAt: true,
          updatedAt: true
        }
      });
    } else {
      // Return a specific report when reportId is provided
      const reportId = Number(requestedReport);
      reports = await prisma.report.findMany({
        where: { id: reportId, userId: user.id },
        take: 1,
        select: {
          id: true,
          name: true,
          description: true,
          content: true,
          filters: true,
          createdAt: true,
          updatedAt: true
        }
      });
    }

    console.log('Found requested reports in database:', reports.length);

    // Process reports to ensure they have the correct structure
    const processedReports = reports.map((report) => {
      const content = report.content as any || {};
      return {
        id: report.id,
        name: report.name,
        description: report.description,
        sections: content.sections || [],
        filters: report.filters || {},
        createdAt: report.createdAt,
        updatedAt: report.updatedAt
      };
    });

    console.log("Found valid reports:", processedReports.length);

    return NextResponse.json({
      success: true,
      reports: processedReports
    });

  } catch (error) {
    console.error("Error loading reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

