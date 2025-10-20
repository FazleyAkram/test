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
    
    // Validate that the import exists
    const dataImport = await prisma.dataImport.findUnique({
      where: { id: importId },
      select: { id: true }
    });
    
    if (!dataImport) {
      return NextResponse.json(
        { error: 'Import not found' },
        { status: 404 }
      );
    }
    
    // Fetch marketing data from the specific import only
    const [
      sessions,
      events,
      conversions,
      benchmarks,
      campaigns
    ] = await Promise.all([
      prisma.marketingSession.findMany({
        where: { 
          importId: importId
        },
        orderBy: { date: 'asc' }
      }),
      prisma.marketingEvent.findMany({
        where: { 
          importId: importId
        },
        orderBy: { date: 'asc' }
      }),
      prisma.marketingConversion.findMany({
        where: { 
          importId: importId
        },
        orderBy: { date: 'asc' }
      }),
      prisma.marketingBenchmark.findMany({
        where: { 
          importId: importId
        }
      }),
      prisma.marketingCampaign.findMany({
        where: { 
          importId: importId
        }
      })
    ]);
    
    // Check if we have any marketing data at all
    const hasAnyData = sessions.length > 0 || events.length > 0 || conversions.length > 0 || campaigns.length > 0 || benchmarks.length > 0;
    
    console.log('Analytics API - Import ID:', importId);
    console.log('Analytics API - Data counts:', {
      sessions: sessions.length,
      events: events.length,
      conversions: conversions.length,
      campaigns: campaigns.length,
      benchmarks: benchmarks.length
    });
    
    if (!hasAnyData) {
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
    
    // If no sessions data, create minimal data structure for analytics
    const hasSessionsData = sessionsData.length > 0;
    
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
    
    // If no sessions data, provide basic metrics from available data
    if (!hasSessionsData) {
      metrics.totalSessions = events.reduce((sum, e) => sum + e.sessionsWithEvent, 0);
      metrics.totalUsers = metrics.totalSessions; // Estimate users = sessions
      metrics.totalPageViews = events.reduce((sum, e) => sum + e.eventCount, 0);
      metrics.avgSessionDuration = 0; // No session data available
      
      // Calculate bounce rate from events data
      // Bounce rate = sessions with only 1 event / total sessions
      const singleEventSessions = events.filter(e => e.eventCount === 1).reduce((sum, e) => sum + e.sessionsWithEvent, 0);
      metrics.avgBounceRate = metrics.totalSessions > 0 ? (singleEventSessions / metrics.totalSessions) * 100 : 0;
      
      // Override conversions with actual conversions data
      metrics.totalConversions = conversions.reduce((sum, c) => sum + c.conversions, 0);
      
      metrics.conversionRate = metrics.totalSessions > 0 ? (metrics.totalConversions / metrics.totalSessions) * 100 : 0;
      metrics.revenuePerSession = metrics.totalSessions > 0 ? metrics.totalRevenue / metrics.totalSessions : 0;
      metrics.revenuePerUser = metrics.totalUsers > 0 ? metrics.totalRevenue / metrics.totalUsers : 0;
    }
    
    // Calculate trends
    const trends = MarketingAnalyticsCalculator.calculateTrends(metrics, 30);
    
    // Get date range
    const dateRange = {
      start: hasSessionsData ? sessionsData[0]?.date : eventsData[0]?.date || conversionsData[0]?.date,
      end: hasSessionsData ? sessionsData[sessionsData.length - 1]?.date : eventsData[eventsData.length - 1]?.date || conversionsData[conversionsData.length - 1]?.date
    };
    
    return NextResponse.json({
      importId,
      dateRange,
      metrics,
      trends,
      dataPoints: {
        sessions: sessionsData.length,
        events: eventsData.length,
        conversions: conversionsData.length,
        campaigns: campaignsData.length,
        benchmarks: benchmarksData.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching marketing analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marketing analytics' },
      { status: 500 }
    );
  }
}
