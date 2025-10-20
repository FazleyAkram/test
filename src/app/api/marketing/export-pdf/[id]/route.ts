import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MarketingAnalyticsCalculator } from '@/lib/marketingAnalytics';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import MarketingPDFReport from '@/components/marketing/pdf/MarketingPDFReport';
import { format } from 'date-fns';

//async operation to handle GET request to generate and return PDF report
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: importId } = await params;

    // source id gets data from all imports with the same source (like analytics API)
    const dataImport = await prisma.dataImport.findUnique({
      where: { id: importId },
      select: { sourceId: true }
    });

    if (!dataImport) {
      return NextResponse.json({ error: 'Import not found' }, { status: 404 });
    }

    // gets all marketing data concurrently from all imports with the same source (like analytics API)
    const [sessions, events, conversions, benchmarks, campaigns] = await Promise.all([
      prisma.marketingSession.findMany({
        where: {
          import: { sourceId: dataImport.sourceId }
        },
        orderBy: { date: 'asc' }
      }),
      prisma.marketingEvent.findMany({
        where: {
          import: { sourceId: dataImport.sourceId }
        },
        orderBy: { date: 'asc' }
      }),
      prisma.marketingConversion.findMany({
        where: {
          import: { sourceId: dataImport.sourceId }
        },
        orderBy: { date: 'asc' }
      }),
      prisma.marketingBenchmark.findMany({
        where: {
          import: { sourceId: dataImport.sourceId }
        }
      }),
      prisma.marketingCampaign.findMany({
        where: {
          import: { sourceId: dataImport.sourceId }
        }
      })
    ]);

    if (!sessions.length && !events.length && !conversions.length) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }

    // Convert to the format expected by the calculator
    const sessionsData = sessions.map((s: any) => ({
      date: format(s.date, 'yyyy-MM-dd'),
      sessions: s.sessions,
      users: s.users,
      pageViews: s.pageViews,
      avgSessionDuration: s.avgSessionDuration,
      bounceRate: s.bounceRate,
      conversions: s.conversions
    }));

    const eventsData = events.map((e: any) => ({
      date: format(e.date, 'yyyy-MM-dd'),
      eventName: e.eventName,
      sessionsWithEvent: e.sessionsWithEvent,
      eventCount: e.eventCount
    }));

    const conversionsData = conversions.map((c: any) => ({
      date: format(c.date, 'yyyy-MM-dd'),
      conversionName: c.conversionName,
      conversions: c.conversions,
      revenue: Number(c.revenue)
    }));

    const benchmarksData = benchmarks.map((b: any) => ({
      metric: b.metric,
      targetValue: Number(b.targetValue),
      unit: b.unit
    }));

    const campaignsData = campaigns.map((c: any) => ({
      utmCampaign: c.utmCampaign,
      utmSource: c.utmSource,
      startDate: format(c.startDate, 'yyyy-MM-dd'),
      endDate: format(c.endDate, 'yyyy-MM-dd')
    }));

    // calculates metrics using marketing analytics function in marketing analytics tsx
    const metrics = MarketingAnalyticsCalculator.calculateMetrics(
      sessionsData,
      eventsData,
      conversionsData,
      benchmarksData,
      campaignsData
    );

    // calculates trends
    const trends = MarketingAnalyticsCalculator.calculateTrends(metrics, 30);

    // prepares export data before PDF generation
    const rangeStart = (sessionsData.length > 0 && sessionsData[0].date)
      || (conversionsData.length > 0 && conversionsData[0].date)
      || (eventsData.length > 0 && eventsData[0].date)
      || '';
    const rangeEnd = (sessionsData.length > 0 && sessionsData[sessionsData.length - 1].date)
      || (conversionsData.length > 0 && conversionsData[conversionsData.length - 1].date)
      || (eventsData.length > 0 && eventsData[eventsData.length - 1].date)
      || '';

    const exportData = {
      exportInfo: {
        exportDate: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        importId,

        //marketing data can be input in different combinations
        dataRange: {
          start: rangeStart,
          end: rangeEnd
        },
        recordCounts: {
          sessions: sessionsData.length,
          events: eventsData.length,
          conversions: conversionsData.length,
          campaigns: campaignsData.length,
          benchmarks: benchmarksData.length
        }
      },
      summary: {
        totalSessions: metrics.totalSessions,
        totalUsers: metrics.totalUsers,
        totalPageViews: metrics.totalPageViews,
        avgSessionDuration: metrics.avgSessionDuration,
        avgBounceRate: metrics.avgBounceRate,
        totalConversions: metrics.totalConversions,
        conversionRate: metrics.conversionRate,
        totalRevenue: metrics.totalRevenue,
        revenuePerSession: metrics.revenuePerSession,
        revenuePerUser: metrics.revenuePerUser,
        totalEvents: metrics.totalEvents,
        avgEventsPerSession: metrics.avgEventsPerSession,
        avgRevenuePerConversion: metrics.avgRevenuePerConversion
      },
      trends,
      topEvents: metrics.topEvents,
      conversionTypes: metrics.conversionTypes,
      campaignPerformance: metrics.campaignPerformance,
      benchmarkComparison: metrics.benchmarkComparison,
      dailyTrends: metrics.dailyTrends
    };

    // generates pdf report
    const pdfBuffer = await renderToBuffer(
      React.createElement(MarketingPDFReport, { exportData }) as any
    );

  
    // returns PDF 
    return new Response(pdfBuffer as BodyInit);

    //error handling
  } catch (error) {
    console.error('Error generating PDF report:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF report' },
      { status: 500 }
    );
  }
}