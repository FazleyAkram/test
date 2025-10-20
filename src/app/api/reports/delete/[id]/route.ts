import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const token = request.cookies.get("token")?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const { id } = await params;
    console.log('Deleting report for user:', user.id, 'Report ID:', id);

    // Find the report
    const report = await prisma.report.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id // Ensure user can only delete their own reports
      }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Delete the database record
    await prisma.report.delete({
      where: { id: parseInt(id) }
    });

    console.log('Successfully deleted report:', id);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { error: 'Failed to delete report', details: error.message },
      { status: 500 }
    );
  }
}







