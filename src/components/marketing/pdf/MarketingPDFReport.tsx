import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1F2937',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#374151',
  },
  section: {
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    width: '23%',
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#E5E7EB',
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#E5E7EB',
  },
  tableCell: {
    margin: 'auto',
    marginTop: 5,
    fontSize: 10,
    padding: 8,
  },
  tableHeader: {
    backgroundColor: '#F9FAFB',
    fontWeight: 'bold',
  },
  insightText: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#374151',
    marginBottom: 8,
  },
  trendsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  trendCard: {
    width: '30%',
    padding: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  trendTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 4,
  },
  trendValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#6B7280',
  },
});

interface MarketingPDFReportProps {
  exportData: {
    exportInfo: {
      exportDate: string;
      importId: string;
      dataRange: {
        start: string;
        end: string;
      };
      recordCounts: {
        sessions: number;
        events: number;
        conversions: number;
        campaigns: number;
        benchmarks: number;
      };
    };
    summary: {
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
      avgRevenuePerConversion: number;
    };
    trends: {
      sessionsTrend: number;
      conversionsTrend: number;
      revenueTrend: number;
      bounceRateTrend: number;
    };
    topEvents: Array<{
      name: string;
      count: number;
      sessions: number;
    }>;
    conversionTypes: Array<{
      name: string;
      count: number;
      revenue: number;
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
    benchmarkComparison: Array<{
      metric: string;
      actual: number;
      target: number;
      unit: string;
      performance: string;
      percentage: number;
    }>;
  };
}

const MarketingPDFReport: React.FC<MarketingPDFReportProps> = ({ exportData }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(2)}%`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* heading */}
        <Text style={styles.header}>Marketing Analytics Report</Text>

        {/* Exec summmary */}
        <Text style={styles.subHeader}>Executive Summary</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Sessions</Text>
            <Text style={styles.metricValue}>{formatNumber(exportData.summary.totalSessions)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Users</Text>
            <Text style={styles.metricValue}>{formatNumber(exportData.summary.totalUsers)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Revenue</Text>
            <Text style={styles.metricValue}>{formatCurrency(exportData.summary.totalRevenue)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Conversion Rate</Text>
            <Text style={styles.metricValue}>{formatPercentage(exportData.summary.conversionRate)}</Text>
          </View>
        </View>

        {/* 3o day trends */}
        <Text style={styles.subHeader}>30-Day Trends</Text>
        <View style={styles.trendsContainer}>
          <View style={styles.trendCard}>
            <Text style={styles.trendTitle}>Sessions</Text>
            <Text style={styles.trendValue}>{formatPercentage(exportData.trends.sessionsTrend)}</Text>
          </View>
          <View style={styles.trendCard}>
            <Text style={styles.trendTitle}>Conversions</Text>
            <Text style={styles.trendValue}>{formatPercentage(exportData.trends.conversionsTrend)}</Text>
          </View>
          <View style={styles.trendCard}>
            <Text style={styles.trendTitle}>Revenue</Text>
            <Text style={styles.trendValue}>{formatPercentage(exportData.trends.revenueTrend)}</Text>
          </View>
        </View>

        {/* Top Events */}
        <Text style={styles.subHeader}>Top Events</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, styles.tableHeader]}>
              <Text style={styles.tableCell}>Event Name</Text>
            </View>
            <View style={[styles.tableCol, styles.tableHeader]}>
              <Text style={styles.tableCell}>Count</Text>
            </View>
            <View style={[styles.tableCol, styles.tableHeader]}>
              <Text style={styles.tableCell}>Sessions</Text>
            </View>
            <View style={[styles.tableCol, styles.tableHeader]}>
              <Text style={styles.tableCell}>Rate</Text>
            </View>
          </View>
          {exportData.topEvents.slice(0, 5).map((event, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{event.name}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{formatNumber(event.count)}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{formatNumber(event.sessions)}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {formatPercentage((event.sessions / exportData.summary.totalSessions) * 100)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* footer */}
        <Text style={styles.footer}>
          Generated by CODI AI
        </Text>
      </Page>

      {/* second page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Detailed Analytics</Text>

        {/* Campaign data */}
        <Text style={styles.subHeader}>Campaign Performance</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, styles.tableHeader]}>
              <Text style={styles.tableCell}>Campaign</Text>
            </View>
            <View style={[styles.tableCol, styles.tableHeader]}>
              <Text style={styles.tableCell}>Sessions</Text>
            </View>
            <View style={[styles.tableCol, styles.tableHeader]}>
              <Text style={styles.tableCell}>Conversions</Text>
            </View>
            <View style={[styles.tableCol, styles.tableHeader]}>
              <Text style={styles.tableCell}>Revenue</Text>
            </View>
          </View>
          {exportData.campaignPerformance.slice(0, 8).map((campaign, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{campaign.campaign}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{formatNumber(campaign.sessions)}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{formatNumber(campaign.conversions)}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{formatCurrency(campaign.revenue)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Comparison of benchmarks */}
        <Text style={styles.subHeader}>Benchmark Comparison</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, styles.tableHeader]}>
              <Text style={styles.tableCell}>Metric</Text>
            </View>
            <View style={[styles.tableCol, styles.tableHeader]}>
              <Text style={styles.tableCell}>Actual</Text>
            </View>
            <View style={[styles.tableCol, styles.tableHeader]}>
              <Text style={styles.tableCell}>Target</Text>
            </View>
            <View style={[styles.tableCol, styles.tableHeader]}>
              <Text style={styles.tableCell}>Performance</Text>
            </View>
          </View>
          {exportData.benchmarkComparison.map((benchmark, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{benchmark.metric}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {benchmark.actual.toFixed(2)} {benchmark.unit}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {benchmark.target} {benchmark.unit}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{benchmark.performance}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Additional data */}
        <Text style={styles.subHeader}>Additional Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Avg Session Duration</Text>
            <Text style={styles.metricValue}>{exportData.summary.avgSessionDuration.toFixed(2)}s</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Bounce Rate</Text>
            <Text style={styles.metricValue}>{formatPercentage(exportData.summary.avgBounceRate)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Revenue per Session</Text>
            <Text style={styles.metricValue}>{formatCurrency(exportData.summary.revenuePerSession)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Revenue per User</Text>
            <Text style={styles.metricValue}>{formatCurrency(exportData.summary.revenuePerUser)}</Text>
          </View>
        </View>

        {/* Footer note */}
        <Text style={styles.footer}>
          Generated by CODI AI 
        </Text>
      </Page>
    </Document>
  );
};

export default MarketingPDFReport;