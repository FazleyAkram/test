import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const dataImport = await prisma.dataImport.findUnique({
      where: { id },
      select: {
        id: true,
        fileName: true,
        recordCount: true,
        importType: true,
        status: true,
      }
    });

    if (!dataImport) {
      return NextResponse.json({ error: 'Import not found' }, { status: 404 });
    }

    // Count related rows based on file type
    const counts: Record<string, number | string> = {};

    if (dataImport.fileName?.includes('sessions_daily')) {
      counts.dbCount = await prisma.marketingSession.count({ where: { importId: id } });
      counts.expected = dataImport.recordCount ?? 0;
      counts.type = 'sessions';
    } else if (dataImport.fileName?.includes('events_daily')) {
      counts.dbCount = await prisma.marketingEvent.count({ where: { importId: id } });
      counts.expected = dataImport.recordCount ?? 0;
      counts.type = 'events';
    } else if (dataImport.fileName?.includes('conversions_daily')) {
      counts.dbCount = await prisma.marketingConversion.count({ where: { importId: id } });
      counts.expected = dataImport.recordCount ?? 0;
      counts.type = 'conversions';
    } else if (dataImport.fileName?.includes('campaign_catalog')) {
      counts.dbCount = await prisma.marketingCampaign.count({ where: { importId: id } });
      counts.expected = dataImport.recordCount ?? 0;
      counts.type = 'campaigns';
    } else if (dataImport.fileName?.includes('benchmarks')) {
      counts.dbCount = await prisma.marketingBenchmark.count({ where: { importId: id } });
      counts.expected = dataImport.recordCount ?? 0;
      counts.type = 'benchmarks';
    } else {
      // Fallback: sum all related counts
      const [sessions, events, conversions, campaigns, benchmarks] = await Promise.all([
        prisma.marketingSession.count({ where: { importId: id } }),
        prisma.marketingEvent.count({ where: { importId: id } }),
        prisma.marketingConversion.count({ where: { importId: id } }),
        prisma.marketingCampaign.count({ where: { importId: id } }),
        prisma.marketingBenchmark.count({ where: { importId: id } }),
      ]);
      counts.dbCount = sessions + events + conversions + campaigns + benchmarks;
      counts.expected = dataImport.recordCount ?? counts.dbCount;
      counts.type = 'mixed';
    }

    const isMatch = counts.expected === counts.dbCount;

    return NextResponse.json({
      import: dataImport,
      verification: {
        type: counts.type,
        expected: counts.expected,
        dbCount: counts.dbCount,
        isMatch
      }
    });
  } catch (error: any) {
    console.error('Verify import failed:', error);
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}







