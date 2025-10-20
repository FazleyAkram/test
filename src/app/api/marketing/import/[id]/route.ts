import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Ensure exists
    const existing = await prisma.dataImport.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return NextResponse.json({ error: 'Import not found' }, { status: 404 });
    }

    // Delete related marketing data first to satisfy FKs
    await prisma.$transaction([
      prisma.marketingSession.deleteMany({ where: { importId: id } }),
      prisma.marketingEvent.deleteMany({ where: { importId: id } }),
      prisma.marketingConversion.deleteMany({ where: { importId: id } }),
      prisma.marketingCampaign.deleteMany({ where: { importId: id } }),
      prisma.marketingBenchmark.deleteMany({ where: { importId: id } }),
    ]);

    await prisma.dataImport.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete import failed:', error);
    return NextResponse.json({ error: error.message || 'Delete failed' }, { status: 500 });
  }
}










