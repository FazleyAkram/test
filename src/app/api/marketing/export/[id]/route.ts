import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MarketingAnalyticsCalculator } from '@/lib/marketingAnalytics';
import { formatDateDMY } from '@/lib/dateUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: importId } = await params;
    const format = request.nextUrl.searchParams.get('format') || 'json';
    
    // Fetch all marketing data for this import
    const [
      sessions,
      events,
      conversions,
      benchmarks,
      campaigns
    ] = await Promise.all([
      prisma.marketingSession.findMany({
        where: { importId },
        orderBy: { date: 'asc' }
      }),
      prisma.marketingEvent.findMany({
        where: { importId },
        orderBy: { date: 'asc' }
      }),
      prisma.marketingConversion.findMany({
        where: { importId },
        orderBy: { date: 'asc' }
      }),
      prisma.marketingBenchmark.findMany({
        where: { importId }
      }),
      prisma.marketingCampaign.findMany({
        where: { importId }
      })
    ]);
    
    if (sessions.length === 0) {
      return NextResponse.json(
        { error: 'No marketing data found for this import' },
        { status: 404 }
      );
    }
    
    // Convert to the format expected by the calculator
    const sessionsData = sessions.map(s => ({
      date: formatDateDMY(s.date),
      sessions: s.sessions,
      users: s.users,
      pageViews: s.pageViews,
      avgSessionDuration: s.avgSessionDuration,
      bounceRate: s.bounceRate,
      conversions: s.conversions
    }));
    
    const eventsData = events.map(e => ({
      date: formatDateDMY(e.date),
      eventName: e.eventName,
      sessionsWithEvent: e.sessionsWithEvent,
      eventCount: e.eventCount
    }));
    
    const conversionsData = conversions.map(c => ({
      date: formatDateDMY(c.date),
      conversionName: c.conversionName,
      conversions: c.conversions,
      revenue: Number(c.revenue)
    }));
    
    const benchmarksData = benchmarks.map(b => ({
      metric: b.metric,
      targetValue: Number(b.targetValue),
      unit: b.unit
    }));
    
    const campaignsData = campaigns.map(c => ({
      utmCampaign: c.utmCampaign,
      utmSource: c.utmSource,
      startDate: formatDateDMY(c.startDate),
      endDate: formatDateDMY(c.endDate)
    }));
    
    // Calculate comprehensive metrics
    const metrics = MarketingAnalyticsCalculator.calculateMetrics(
      sessionsData,
      eventsData,
      conversionsData,
      benchmarksData,
      campaignsData
    );
    
    // Calculate trends
    const trends = MarketingAnalyticsCalculator.calculateTrends(metrics, 30);
    
    // Prepare export data
    const exportData = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        importId,
        dataRange: {
          start: sessionsData[0]?.date,
          end: sessionsData[sessionsData.length - 1]?.date
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
      dailyTrends: metrics.dailyTrends,
      rawData: {
        sessions: sessionsData,
        events: eventsData,
        conversions: conversionsData,
        campaigns: campaignsData,
        benchmarks: benchmarksData
      }
    };
    
    if (format === 'csv') {
      // Generate CSV format
      const csvData = generateCSV(exportData);
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="marketing-report-${importId}.csv"`
        }
      });
    }
    
    // Return JSON format
    return NextResponse.json(exportData);
    
  } catch (error) {
    console.error('Error exporting marketing data:', error);
    return NextResponse.json(
      { error: 'Failed to export marketing data' },
      { status: 500 }
    );
  }
}

function generateCSV(data: any): string {
  const csvRows = [];
  
  // Add summary section
  csvRows.push('MARKETING ANALYTICS SUMMARY');
  csvRows.push('Metric,Value');
  csvRows.push(`Total Sessions,${data.summary.totalSessions}`);
  csvRows.push(`Total Users,${data.summary.totalUsers}`);
  csvRows.push(`Total Page Views,${data.summary.totalPageViews}`);
  csvRows.push(`Average Session Duration,${data.summary.avgSessionDuration}`);
  csvRows.push(`Average Bounce Rate,${data.summary.avgBounceRate}`);
  csvRows.push(`Total Conversions,${data.summary.totalConversions}`);
  csvRows.push(`Conversion Rate,${data.summary.conversionRate}`);
  csvRows.push(`Total Revenue,${data.summary.totalRevenue}`);
  csvRows.push(`Revenue per Session,${data.summary.revenuePerSession}`);
  csvRows.push(`Revenue per User,${data.summary.revenuePerUser}`);
  csvRows.push(`Total Events,${data.summary.totalEvents}`);
  csvRows.push(`Average Events per Session,${data.summary.avgEventsPerSession}`);
  csvRows.push(`Average Revenue per Conversion,${data.summary.avgRevenuePerConversion}`);
  csvRows.push('');
  
  // Add trends section
  csvRows.push('TRENDS (30-day)');
  csvRows.push('Metric,Trend Percentage');
  csvRows.push(`Sessions Trend,${data.trends.sessionsTrend}`);
  csvRows.push(`Conversions Trend,${data.trends.conversionsTrend}`);
  csvRows.push(`Revenue Trend,${data.trends.revenueTrend}`);
  csvRows.push(`Bounce Rate Trend,${data.trends.bounceRateTrend}`);
  csvRows.push('');
  
  // Add top events
  csvRows.push('TOP EVENTS');
  csvRows.push('Event Name,Count,Sessions');
  data.topEvents.forEach((event: any) => {
    csvRows.push(`${event.name},${event.count},${event.sessions}`);
  });
  csvRows.push('');
  
  // Add conversion types
  csvRows.push('CONVERSION TYPES');
  csvRows.push('Conversion Name,Count,Revenue');
  data.conversionTypes.forEach((conversion: any) => {
    csvRows.push(`${conversion.name},${conversion.count},${conversion.revenue}`);
  });
  csvRows.push('');
  
  // Add campaign performance
  csvRows.push('CAMPAIGN PERFORMANCE');
  csvRows.push('Campaign,Source,Sessions,Conversions,Revenue,Conversion Rate,Revenue per Session');
  data.campaignPerformance.forEach((campaign: any) => {
    csvRows.push(`${campaign.campaign},${campaign.source},${campaign.sessions},${campaign.conversions},${campaign.revenue},${campaign.conversionRate},${campaign.revenuePerSession}`);
  });
  csvRows.push('');
  
  // Add benchmark comparison
  csvRows.push('BENCHMARK COMPARISON');
  csvRows.push('Metric,Actual,Target,Unit,Performance,Percentage');
  data.benchmarkComparison.forEach((benchmark: any) => {
    csvRows.push(`${benchmark.metric},${benchmark.actual},${benchmark.target},${benchmark.unit},${benchmark.performance},${benchmark.percentage}`);
  });
  csvRows.push('');
  
  // Add daily trends
  csvRows.push('DAILY TRENDS');
  csvRows.push('Date,Sessions,Conversions,Revenue,Bounce Rate');
  data.dailyTrends.forEach((trend: any) => {
    csvRows.push(`${trend.date},${trend.sessions},${trend.conversions},${trend.revenue},${trend.bounceRate}`);
  });
  
  return csvRows.join('\n');
}
