import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get("token")?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const { report } = await request.json();
    if (!report) return NextResponse.json({ error: 'Missing report' }, { status: 400 });

    console.log('Saving report for user:', user.id, 'Report:', report.name);

    // checks if this is an update through numeric id from database
    const reportId = report.id ? parseInt(report.id, 10) : null;
    const isUpdate = reportId && !isNaN(reportId);

    if (isUpdate) {
      // Update existing report
      const existingReport = await prisma.report.findUnique({
        where: { id: reportId },
        select: { userId: true }
      });

      if (!existingReport) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }

      if (existingReport.userId !== user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Update existing database record
      const updated = await prisma.report.update({
        where: { id: reportId },
        data: {
          name: report.name,
          description: report.description || null,
          content: {
            importId: report.importId,
            sections: report.sections || []
          },
          filters: report.filters || Prisma.JsonNull,
          updatedAt: new Date()
        },
        select: { id: true }
      });

      console.log('Report updated in database with ID:', updated.id);
      return NextResponse.json({ success: true, id: updated.id });
    } else {
      // Create new report
      const created = await prisma.report.create({
        data: {
          name: report.name,
          description: report.description || null,
          type: 'PERFORMANCE',
          userId: user.id,
          content: {
            importId: report.importId,
            sections: report.sections || []
          },
          filters: report.filters || Prisma.JsonNull,
          schedule: null,
          isScheduled: false,
          isPublic: false,
          filePath: `report-${Date.now()}.json` // Keep for compatibility but not used
        },
        select: { id: true }
      });

      console.log('Report created in database with ID:', created.id);
      return NextResponse.json({ success: true, id: created.id });
    }
  } catch (e: any) {
    console.error('Error saving report:', e);
    return NextResponse.json({ 
      error: e.message || 'Unknown error',
      details: e.stack 
    }, { status: 500 });
  }
}
