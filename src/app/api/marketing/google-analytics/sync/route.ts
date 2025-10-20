import { NextRequest, NextResponse } from 'next/server';
import { GoogleAnalyticsService } from '@/lib/googleAnalytics';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MarketingAnalyticsCalculator } from '@/lib/marketingAnalytics';
import { formatDateDMY } from '@/lib/dateUtils';

function buildAutoReportSections(metrics: any, trends: any, sessionsData: any[], eventsData: any[], conversionsData: any[], campaignsData: any[]) {
  return [
    {
      id: 'overview',
      title: 'Overview Metrics',
      type: 'text',
      content: `Sessions: ${metrics.totalSessions}\nUsers: ${metrics.totalUsers}\nConversions: ${metrics.totalConversions}\nRevenue: ${metrics.totalRevenue}`
    },
    {
      id: 'sessionsUsersChart',
      title: 'Sessions & Users Trend',
      type: 'chart',
      content: {
        chartType: 'sessionsUsers',
        data: [],
        marketingData: {
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
          topEvents: metrics.topEvents,
          conversionTypes: metrics.conversionTypes,
          avgRevenuePerConversion: metrics.avgRevenuePerConversion,
          benchmarkComparison: metrics.benchmarkComparison,
          dailyTrends: sessionsData.map(s => ({
            date: s.date,
            periodStart: s.periodStart,
            periodEnd: s.periodEnd,
            periodType: s.periodType,
            sessions: s.sessions,
            conversions: s.conversions,
            revenue: 0, // Sessions data doesn't have revenue, use 0
            bounceRate: s.bounceRate
          })),
          campaignPerformance: metrics.campaignPerformance
        }
      }
    },
    {
      id: 'bounceRateChart',
      title: 'Bounce Rate Trend',
      type: 'chart',
      content: {
        chartType: 'bounceRate',
        data: [],
        marketingData: {
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
          topEvents: metrics.topEvents,
          conversionTypes: metrics.conversionTypes,
          avgRevenuePerConversion: metrics.avgRevenuePerConversion,
          benchmarkComparison: metrics.benchmarkComparison,
          dailyTrends: sessionsData.map(s => ({
            date: s.date,
            periodStart: s.periodStart,
            periodEnd: s.periodEnd,
            periodType: s.periodType,
            sessions: s.sessions,
            conversions: s.conversions,
            revenue: 0, // Sessions data doesn't have revenue, use 0
            bounceRate: s.bounceRate
          })),
          campaignPerformance: metrics.campaignPerformance
        }
      }
    },
    {
      id: 'sessionsTable',
      title: 'Sessions (Daily)',
      type: 'table',
      content: {
        headers: ['Date', 'Sessions', 'Users', 'Page Views', 'Avg Session Duration', 'Bounce Rate', 'Conversions'],
        rows: sessionsData.map(s => [
          s.date,
          String(s.sessions),
          String(s.users),
          String(s.pageViews),
          String(Math.round(s.avgSessionDuration)),
          String(Math.round(s.bounceRate)),
          String(s.conversions)
        ])
      }
    },
    {
      id: 'eventsTable',
      title: 'Events',
      type: 'table',
      content: {
        headers: ['Date', 'Event', 'Sessions with Event', 'Event Count'],
        rows: eventsData.map(e => [e.date, e.eventName, String(e.sessionsWithEvent), String(e.eventCount)])
      }
    },
    {
      id: 'conversionsTable',
      title: 'Conversions',
      type: 'table',
      content: {
        headers: ['Date', 'Conversion', 'Conversions', 'Revenue'],
        rows: conversionsData.map(c => [c.date, c.conversionName, String(c.conversions), String(c.revenue || 0)])
      }
    },
    {
      id: 'campaignsTable',
      title: 'Campaigns',
      type: 'table',
      content: {
        headers: ['Campaign', 'Source', 'Start', 'End'],
        rows: campaignsData.map(c => [c.utmCampaign, c.utmSource, c.startDate, c.endDate])
      }
    }
  ];
}

async function createAutoReport(importId: string, userId: number, startDate?: string, endDate?: string) {
  // Fetch data for the specific import (same as analytics API)
  const [sessions, events, conversions, benchmarks, campaigns] = await Promise.all([
    prisma.marketingSession.findMany({ where: { importId }, orderBy: { date: 'asc' } }),
    prisma.marketingEvent.findMany({ where: { importId }, orderBy: { date: 'asc' } }),
    prisma.marketingConversion.findMany({ where: { importId }, orderBy: { date: 'asc' } }),
    prisma.marketingBenchmark.findMany({ where: { importId } }),
    prisma.marketingCampaign.findMany({ where: { importId } })
  ]);

  const sessionsData = sessions.map(s => ({
    date: formatDateDMY(s.date),
    periodStart: s.periodStart ? formatDateDMY(s.periodStart) : undefined,
    periodEnd: s.periodEnd ? formatDateDMY(s.periodEnd) : undefined,
    periodType: s.periodType,
    sessions: s.sessions,
    users: s.users,
    pageViews: s.pageViews,
    avgSessionDuration: s.avgSessionDuration,
    bounceRate: s.bounceRate,
    conversions: s.conversions,
  }));
  const eventsData = events.map(e => ({
    date: formatDateDMY(e.date),
    eventName: e.eventName,
    sessionsWithEvent: e.sessionsWithEvent,
    eventCount: e.eventCount,
  }));
  const conversionsData = conversions.map(c => ({
    date: formatDateDMY(c.date),
    conversionName: c.conversionName,
    conversions: c.conversions,
    revenue: Number(c.revenue || 0),
  }));
  const benchmarksData = benchmarks.map(b => ({ metric: b.metric, targetValue: Number(b.targetValue), unit: b.unit }));
  const campaignsData = campaigns.map(c => ({
    utmCampaign: c.utmCampaign,
    utmSource: c.utmSource,
    startDate: formatDateDMY(c.startDate),
    endDate: formatDateDMY(c.endDate),
  }));

  const metrics = MarketingAnalyticsCalculator.calculateMetrics(
    sessionsData, eventsData, conversionsData, benchmarksData, campaignsData
  );
  const trends = MarketingAnalyticsCalculator.calculateTrends(metrics, 30);

  // Generate report name with date range
  const formatDateForReport = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const startDateFormatted = startDate ? formatDateForReport(startDate) : '';
  const endDateFormatted = endDate ? formatDateForReport(endDate) : '';
  const dateRangeStr = startDateFormatted && endDateFormatted ? ` (${startDateFormatted} - ${endDateFormatted})` : '';

  const reportPayload = {
    name: `Marketing Analytics${dateRangeStr}`,
    description: 'Auto-generated after data import',
    importId,
    sections: buildAutoReportSections(metrics, trends, sessionsData, eventsData, conversionsData, campaignsData)
  };

  // Avoid duplicate auto-reports for the same import
  const existing = await prisma.report.findFirst({
    where: { content: { path: ['importId'], equals: importId } },
    select: { id: true, content: true }
  });
  
  if (existing) {
    // validate existing sections; if missing table shapes, rewrite
    const ok = Array.isArray((existing.content as any)?.sections) && (existing.content as any).sections.every((s: any) => {
      if (s.type === 'table') return Array.isArray(s.content?.headers) && Array.isArray(s.content?.rows);
      if (s.type === 'chart') return Array.isArray(s.content?.data);
      return true;
    });
    if (ok) return;
    
    // Update existing report content
    await prisma.report.update({ 
      where: { id: existing.id }, 
      data: { 
        content: { importId, sections: reportPayload.sections },
        name: reportPayload.name,
        description: reportPayload.description,
        updatedAt: new Date()
      } 
    });
    return;
  }

  // Create new report in database only
  await prisma.report.create({
    data: {
      name: reportPayload.name,
      description: reportPayload.description,
      type: 'PERFORMANCE',
      userId,
      content: { importId, sections: reportPayload.sections },
      filters: {},
      schedule: null,
      isScheduled: false,
      isPublic: false,
      filePath: `report-${Date.now()}.json` // Keep for compatibility but not used
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get("token")?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { propertyId, startDate, endDate } = await request.json();

    if (!propertyId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: propertyId, startDate, endDate' },
        { status: 400 }
      );
    }

    // Sync data from Google Analytics
    const importId = await GoogleAnalyticsService.syncDataToDatabase(
      user.id,
      propertyId,
      startDate,
      endDate
    );

    // Auto-generate a report for this import
    try { await createAutoReport(importId, user.id, startDate, endDate); } catch (e) { console.warn('Auto-report generation failed:', e); }

    return NextResponse.json({
      success: true,
      importId,
      message: 'Google Analytics data synced successfully'
    });

  } catch (error: any) {
    console.error('Google Analytics sync error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sync Google Analytics data', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get("token")?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Google Analytics connection status
    const dataSource = await GoogleAnalyticsService.getDataSource(user.id);

    if (!dataSource) {
      return NextResponse.json({
        connected: false,
        message: 'Google Analytics not connected'
      });
    }

    return NextResponse.json({
      connected: true,
      dataSource: {
        id: dataSource.id,
        name: dataSource.name,
        properties: dataSource.config.properties,
        lastSync: (dataSource as any).lastSync ?? null
      }
    });

  } catch (error: any) {
    console.error('Google Analytics status error:', error);
    return NextResponse.json(
      { error: 'Failed to get Google Analytics status' },
      { status: 500 }
    );
  }
}



