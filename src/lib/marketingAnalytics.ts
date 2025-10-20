import { MarketingSessionData, MarketingEventData, MarketingConversionData, MarketingBenchmarkData } from './marketingDataParser';

export interface MarketingMetrics {
  // Session Metrics
  totalSessions: number;
  totalUsers: number;
  totalPageViews: number;
  avgSessionDuration: number;
  avgBounceRate: number;
  totalConversions: number;
  conversionRate: number;
  
  // Revenue Metrics
  totalRevenue: number;
  revenuePerSession: number;
  revenuePerUser: number;
  
  // Event Metrics
  totalEvents: number;
  avgEventsPerSession: number;
  topEvents: Array<{ name: string; count: number; sessions: number }>;
  
  // Conversion Metrics
  conversionTypes: Array<{ name: string; count: number; revenue: number }>;
  avgRevenuePerConversion: number;
  
  // Performance vs Benchmarks
  benchmarkComparison: Array<{
    metric: string;
    actual: number;
    target: number;
    unit: string;
    performance: 'above' | 'below' | 'meeting';
    percentage: number;
  }>;
  
  // Trends (supports period-aware data)
  dailyTrends: Array<{
    date: string;
    periodStart?: string;
    periodEnd?: string;
    periodType?: string;
    sessions: number;
    conversions: number;
    revenue: number;
    bounceRate: number;
  }>;
  
  // Campaign Performance
  campaignPerformance: Array<{
    campaign: string;
    source: string;
    sessions: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
    revenuePerSession: number;
  }>;
}

export class MarketingAnalyticsCalculator {
  static calculateMetrics(
    sessions: MarketingSessionData[],
    events: MarketingEventData[],
    conversions: MarketingConversionData[],
    benchmarks: MarketingBenchmarkData[],
    campaigns: Array<{ utmCampaign: string; utmSource: string; startDate: string; endDate: string }>
  ): MarketingMetrics {
    // Calculate basic session metrics
    const totalSessions = sessions.reduce((sum, s) => sum + s.sessions, 0);
    const totalUsers = sessions.reduce((sum, s) => sum + s.users, 0);
    const totalPageViews = sessions.reduce((sum, s) => sum + s.pageViews, 0);
    const totalConversions = sessions.reduce((sum, s) => sum + s.conversions, 0);
    const totalRevenue = conversions.reduce((sum, c) => sum + c.revenue, 0);
    
    // Calculate averages
    const avgSessionDuration = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + s.avgSessionDuration, 0) / sessions.length 
      : 0;
    
    const avgBounceRate = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + s.bounceRate, 0) / sessions.length 
      : 0;
    
    const conversionRate = totalSessions > 0 ? (totalConversions / totalSessions) * 100 : 0;
    const revenuePerSession = totalSessions > 0 ? totalRevenue / totalSessions : 0;
    const revenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0;
    
    // Calculate event metrics
    const totalEvents = events.reduce((sum, e) => sum + e.eventCount, 0);
    const avgEventsPerSession = totalSessions > 0 ? totalEvents / totalSessions : 0;
    
    // Get top events
    const eventMap = new Map<string, { count: number; sessions: number }>();
    events.forEach(event => {
      const existing = eventMap.get(event.eventName) || { count: 0, sessions: 0 };
      eventMap.set(event.eventName, {
        count: existing.count + event.eventCount,
        sessions: existing.sessions + event.sessionsWithEvent
      });
    });
    
    const topEvents = Array.from(eventMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Calculate conversion types
    const conversionMap = new Map<string, { count: number; revenue: number }>();
    conversions.forEach(conversion => {
      const existing = conversionMap.get(conversion.conversionName) || { count: 0, revenue: 0 };
      conversionMap.set(conversion.conversionName, {
        count: existing.count + conversion.conversions,
        revenue: existing.revenue + conversion.revenue
      });
    });
    
    const conversionTypes = Array.from(conversionMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
    
    const avgRevenuePerConversion = totalConversions > 0 ? totalRevenue / totalConversions : 0;
    
    // Calculate benchmark comparison
    const benchmarkComparison = benchmarks.map(benchmark => {
      let actual = 0;
      switch (benchmark.metric) {
        case 'conversion_rate_percent':
          actual = conversionRate;
          break;
        case 'paid_search_ctr':
          // This would need to be calculated from campaign data
          actual = 0;
          break;
        case 'email_open_rate':
          // This would need to be calculated from email campaign data
          actual = 0;
          break;
        case 'roas':
          // Return on Ad Spend - would need cost data
          actual = 0;
          break;
        default:
          actual = 0;
      }
      
      const percentage = benchmark.targetValue > 0 ? (actual / benchmark.targetValue) * 100 : 0;
      const performance: 'above' | 'below' | 'meeting' = percentage >= 100 ? 'above' : percentage >= 90 ? 'meeting' : 'below';
      
      return {
        metric: benchmark.metric,
        actual,
        target: benchmark.targetValue,
        unit: benchmark.unit,
        performance,
        percentage
      };
    });
    
    // Calculate trends (period-aware): Prefer matching by periodStart/periodEnd if present
    const dailyTrends = sessions.map(session => {
      const periodStart = (session as any).periodStart ? String((session as any).periodStart) : undefined;
      const periodEnd = (session as any).periodEnd ? String((session as any).periodEnd) : undefined;
      const periodType = (session as any).periodType ? String((session as any).periodType) : undefined;
      const displayDate = periodStart || session.date;

      let periodRevenue = 0;
      if (periodStart && periodEnd) {
        periodRevenue = conversions
          .filter((c: any) => String((c as any).periodStart) === periodStart && String((c as any).periodEnd) === periodEnd)
          .reduce((sum, c) => sum + c.revenue, 0);
      } else {
        periodRevenue = conversions
          .filter(c => c.date === session.date)
          .reduce((sum, c) => sum + c.revenue, 0);
      }

      return {
        date: displayDate,
        periodStart,
        periodEnd,
        periodType,
        sessions: session.sessions,
        conversions: session.conversions,
        revenue: periodRevenue,
        bounceRate: session.bounceRate
      };
    }).sort((a, b) => {
      const aKey = a.periodStart ? new Date(a.periodStart).getTime() : new Date(a.date).getTime();
      const bKey = b.periodStart ? new Date(b.periodStart).getTime() : new Date(b.date).getTime();
      return aKey - bKey;
    });
    
    // Calculate campaign performance
    const campaignPerformance = campaigns.map(campaign => {
      const campaignSessions = sessions
        .filter(s => {
          const sessionDate = new Date((s as any).periodStart || s.date);
          const startDate = new Date(campaign.startDate);
          const endDate = new Date(campaign.endDate);
          return sessionDate >= startDate && sessionDate <= endDate;
        })
        .reduce((sum, s) => sum + s.sessions, 0);
      
      const campaignConversions = sessions
        .filter(s => {
          const sessionDate = new Date((s as any).periodStart || s.date);
          const startDate = new Date(campaign.startDate);
          const endDate = new Date(campaign.endDate);
          return sessionDate >= startDate && sessionDate <= endDate;
        })
        .reduce((sum, s) => sum + s.conversions, 0);
      
      const campaignRevenue = conversions
        .filter(c => {
          const dateLike = (c as any).periodStart || c.date;
          const conversionDate = new Date(dateLike);
          const startDate = new Date(campaign.startDate);
          const endDate = new Date(campaign.endDate);
          return conversionDate >= startDate && conversionDate <= endDate;
        })
        .reduce((sum, c) => sum + c.revenue, 0);
      
      const campaignConversionRate = campaignSessions > 0 ? (campaignConversions / campaignSessions) * 100 : 0;
      const campaignRevenuePerSession = campaignSessions > 0 ? campaignRevenue / campaignSessions : 0;
      
      return {
        campaign: campaign.utmCampaign,
        source: campaign.utmSource,
        sessions: campaignSessions,
        conversions: campaignConversions,
        revenue: campaignRevenue,
        conversionRate: campaignConversionRate,
        revenuePerSession: campaignRevenuePerSession
      };
    });
    
    return {
      totalSessions,
      totalUsers,
      totalPageViews,
      avgSessionDuration,
      avgBounceRate,
      totalConversions,
      conversionRate,
      totalRevenue,
      revenuePerSession,
      revenuePerUser,
      totalEvents,
      avgEventsPerSession,
      topEvents,
      conversionTypes,
      avgRevenuePerConversion,
      benchmarkComparison,
      dailyTrends,
      campaignPerformance
    };
  }
  
  static calculateTrends(metrics: MarketingMetrics, days: number = 30): {
    sessionsTrend: number;
    conversionsTrend: number;
    revenueTrend: number;
    bounceRateTrend: number;
  } {
    const recentData = metrics.dailyTrends.slice(-days);
    const olderData = metrics.dailyTrends.slice(-days * 2, -days);
    
    if (recentData.length === 0 || olderData.length === 0) {
      return {
        sessionsTrend: 0,
        conversionsTrend: 0,
        revenueTrend: 0,
        bounceRateTrend: 0
      };
    }
    
    const calculateTrend = (recent: number[], older: number[]): number => {
      const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
      const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
      return olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
    };
    
    return {
      sessionsTrend: calculateTrend(
        recentData.map(d => d.sessions),
        olderData.map(d => d.sessions)
      ),
      conversionsTrend: calculateTrend(
        recentData.map(d => d.conversions),
        olderData.map(d => d.conversions)
      ),
      revenueTrend: calculateTrend(
        recentData.map(d => d.revenue),
        olderData.map(d => d.revenue)
      ),
      bounceRateTrend: calculateTrend(
        recentData.map(d => d.bounceRate),
        olderData.map(d => d.bounceRate)
      )
    };
  }
}
