'use client';

import React from 'react';

interface MarketingInsightsProps {
  metrics: {
    totalSessions: number;
    totalUsers: number;
    totalPageViews: number;
    avgSessionDuration: number;
    avgBounceRate: number;
    totalConversions: number;
    conversionRate: number;
    totalRevenue: number;
    revenuePerSession: number;
    revenuePerUser: number;
    totalEvents: number;
    avgEventsPerSession: number;
    topEvents: Array<{ name: string; count: number; sessions: number }>;
    conversionTypes: Array<{ name: string; count: number; revenue: number }>;
    avgRevenuePerConversion: number;
    benchmarkComparison: Array<{
      metric: string;
      actual: number;
      target: number;
      unit: string;
      performance: 'above' | 'below' | 'meeting';
      percentage: number;
    }>;
    dailyTrends: Array<{
      date: string;
      sessions: number;
      conversions: number;
      revenue: number;
      bounceRate: number;
    }>;
    campaignPerformance: Array<{
      campaign: string;
      source: string;
      sessions: number;
      conversions: number;
      revenue: number;
      conversionRate: number;
      revenuePerSession: number;
    }>;
  };
}

interface Insight {
  type: 'success' | 'warning' | 'opportunity' | 'critical';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action: string;
}

export default function MarketingInsights({ metrics }: MarketingInsightsProps) {
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];

    // Conversion Rate Analysis
    if (metrics.conversionRate < 1.0) {
      insights.push({
        type: 'critical',
        title: 'Low Conversion Rate',
        description: `Your conversion rate is ${metrics.conversionRate.toFixed(2)}%, which is below industry standards.`,
        impact: 'high',
        action: 'Optimize landing pages, improve call-to-action buttons, and A/B test different messaging.'
      });
    } else if (metrics.conversionRate > 3.0) {
      insights.push({
        type: 'success',
        title: 'Excellent Conversion Rate',
        description: `Your conversion rate of ${metrics.conversionRate.toFixed(2)}% is performing very well.`,
        impact: 'high',
        action: 'Scale successful campaigns and replicate strategies across other channels.'
      });
    }

    // Bounce Rate Analysis
    if (metrics.avgBounceRate > 70) {
      insights.push({
        type: 'warning',
        title: 'High Bounce Rate',
        description: `Your bounce rate is ${metrics.avgBounceRate.toFixed(1)}%, indicating users are leaving quickly.`,
        impact: 'high',
        action: 'Improve page load speed, enhance content relevance, and optimize user experience.'
      });
    } else if (metrics.avgBounceRate < 40) {
      insights.push({
        type: 'success',
        title: 'Low Bounce Rate',
        description: `Your bounce rate of ${metrics.avgBounceRate.toFixed(1)}% shows good user engagement.`,
        impact: 'medium',
        action: 'Continue current strategies and focus on converting engaged users.'
      });
    }

    // Revenue per Session Analysis
    if (metrics.revenuePerSession < 10) {
      insights.push({
        type: 'opportunity',
        title: 'Low Revenue per Session',
        description: `Revenue per session is $${metrics.revenuePerSession.toFixed(2)}, indicating potential for improvement.`,
        impact: 'high',
        action: 'Implement upselling strategies, improve product recommendations, and optimize pricing.'
      });
    }

    // Session Duration Analysis
    if (metrics.avgSessionDuration < 60) {
      insights.push({
        type: 'warning',
        title: 'Short Session Duration',
        description: `Average session duration is ${Math.round(metrics.avgSessionDuration)} seconds, suggesting low engagement.`,
        impact: 'medium',
        action: 'Create more engaging content, improve navigation, and add interactive elements.'
      });
    }

    // Campaign Performance Analysis
    const bestCampaign = metrics.campaignPerformance.reduce((best, campaign) => 
      campaign.conversionRate > best.conversionRate ? campaign : best, 
      metrics.campaignPerformance[0]
    );
    
    const worstCampaign = metrics.campaignPerformance.reduce((worst, campaign) => 
      campaign.conversionRate < worst.conversionRate ? campaign : worst, 
      metrics.campaignPerformance[0]
    );

    if (bestCampaign && worstCampaign && bestCampaign.conversionRate > worstCampaign.conversionRate * 2) {
      insights.push({
        type: 'opportunity',
        title: 'Campaign Performance Gap',
        description: `${bestCampaign.campaign} is performing ${(bestCampaign.conversionRate / worstCampaign.conversionRate).toFixed(1)}x better than ${worstCampaign.campaign}.`,
        impact: 'high',
        action: `Apply successful strategies from ${bestCampaign.campaign} to improve ${worstCampaign.campaign}.`
      });
    }

    // Event Engagement Analysis
    const topEvent = metrics.topEvents[0];
    if (topEvent && topEvent.count > metrics.totalSessions * 0.5) {
      insights.push({
        type: 'success',
        title: 'High Event Engagement',
        description: `${topEvent.name} is triggered in over 50% of sessions, showing strong user interest.`,
        impact: 'medium',
        action: 'Leverage this high-engagement event for conversion optimization and user segmentation.'
      });
    }

    // Benchmark Performance Analysis
    const underperformingBenchmarks = metrics.benchmarkComparison.filter(b => b.performance === 'below');
    if (underperformingBenchmarks.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Below Benchmark Performance',
        description: `${underperformingBenchmarks.length} metrics are performing below target benchmarks.`,
        impact: 'high',
        action: 'Focus on improving underperforming metrics through targeted optimization strategies.'
      });
    }

    // Revenue Trend Analysis
    const recentRevenue = metrics.dailyTrends.slice(-7).reduce((sum, day) => sum + day.revenue, 0);
    const previousRevenue = metrics.dailyTrends.slice(-14, -7).reduce((sum, day) => sum + day.revenue, 0);
    
    if (recentRevenue > previousRevenue * 1.2) {
      insights.push({
        type: 'success',
        title: 'Strong Revenue Growth',
        description: 'Revenue has increased by over 20% in the last week compared to the previous week.',
        impact: 'high',
        action: 'Scale successful strategies and maintain current momentum.'
      });
    } else if (recentRevenue < previousRevenue * 0.8) {
      insights.push({
        type: 'critical',
        title: 'Revenue Decline',
        description: 'Revenue has decreased by over 20% in the last week compared to the previous week.',
        impact: 'high',
        action: 'Investigate causes of decline and implement immediate corrective measures.'
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'opportunity': return '💡';
      case 'critical': return '🚨';
      default: return '📊';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-500 bg-green-900/20';
      case 'warning': return 'border-yellow-500 bg-yellow-900/20';
      case 'opportunity': return 'border-blue-500 bg-blue-900/20';
      case 'critical': return 'border-red-500 bg-red-900/20';
      default: return 'border-gray-500 bg-gray-900/20';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">AI-Powered Marketing Insights</h2>
        <div className="text-sm text-gray-400">
          {insights.length} insights generated
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <div className="text-gray-400">No specific insights available at this time.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`border-l-4 rounded-lg p-6 ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{getInsightIcon(insight.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-primary">{insight.title}</h3>
                    <span className={`text-xs font-medium ${getImpactColor(insight.impact)}`}>
                      {insight.impact.toUpperCase()} IMPACT
                    </span>
                  </div>
                  <p className="text-gray-300 mb-4">{insight.description}</p>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-300 mb-1">Recommended Action:</div>
                    <div className="text-sm text-gray-400">{insight.action}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Key Performance Indicators Summary */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Key Performance Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{metrics.conversionRate.toFixed(2)}%</div>
            <div className="text-sm text-gray-400">Conversion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{metrics.avgBounceRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Bounce Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">${metrics.revenuePerSession.toFixed(2)}</div>
            <div className="text-sm text-gray-400">Revenue per Session</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{Math.round(metrics.avgSessionDuration)}s</div>
            <div className="text-sm text-gray-400">Avg Session Duration</div>
          </div>
        </div>
      </div>
    </div>
  );
}












