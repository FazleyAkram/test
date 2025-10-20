'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useNotificationHelpers } from '@/context/NotificationContext';
import { formatDateForInput } from '@/lib/dateUtils';
import MarketingCharts from '@/components/marketing/MarketingCharts';
// Removed AI insights per request

interface MarketingImport {
  id: string;
  fileName: string;
  status: string;
  startTime: string;
  recordCount: number;
  marketingSessions: any[];
  marketingCampaigns: any[];
  marketingEvents: any[];
  marketingConversions: any[];
  marketingBenchmarks: any[];
}

interface MarketingMetrics {
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
}

interface Trends {
  sessionsTrend: number;
  conversionsTrend: number;
  revenueTrend: number;
  bounceRateTrend: number;
}

export default function MarketingDashboard() {
  const formatDMY = (dateInput: string | Date) => {
    const dt = new Date(dateInput);
    if (isNaN(dt.getTime())) return '';
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { showSuccess, showError, showWarning, confirm } = useNotificationHelpers();
  const [imports, setImports] = useState<MarketingImport[]>([]);
  const [selectedImport, setSelectedImport] = useState<string>('');
  const [metrics, setMetrics] = useState<MarketingMetrics | null>(null);
  const [trends, setTrends] = useState<Trends | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFiles, setImportFiles] = useState<FileList | null>(null);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Google Analytics state
  const [gaConnected, setGaConnected] = useState(false);
  const [gaProperties, setGaProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [syncDateRange, setSyncDateRange] = useState({
    startDate: formatDateForInput(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // 30 days ago
    endDate: formatDateForInput(new Date()) // today
  });
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    fetchImports();
    checkGoogleAnalyticsConnection();
  }, []);

  const checkGoogleAnalyticsConnection = async () => {
    try {
      const response = await fetch('/api/marketing/google-analytics/sync');
      if (response.ok) {
        const data = await response.json();
        setGaConnected(data.connected);
        if (data.connected && data.dataSource) {
          setGaProperties(data.dataSource.properties || []);
        }
      }
    } catch (error) {
      console.error('Error checking GA connection:', error);
    }
  };

  const connectGoogleAnalytics = async () => {
    try {
      const response = await fetch('/api/auth/google');
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Error connecting to Google Analytics:', error);
    }
  };

  const syncGoogleAnalyticsData = async () => {
    if (!selectedProperty) {
      showWarning('Property Required', 'Please select a Google Analytics property');
      return;
    }

    setSyncing(true);
    try {
      const response = await fetch('/api/marketing/google-analytics/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: selectedProperty,
          startDate: syncDateRange.startDate,
          endDate: syncDateRange.endDate
        })
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess('Sync Successful', 'Google Analytics data synced successfully!');
        fetchImports(); // Refresh the imports list
      } else {
        const error = await response.json();
        showError('Sync Failed', `Sync failed: ${error.details || error.error}`);
      }
    } catch (error) {
      console.error('Error syncing GA data:', error);
      showError('Sync Failed', 'Failed to sync Google Analytics data');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    console.log('imports changed:', imports);
    // If we have imports but no selectedImport, set the most recent one
    if (imports.length > 0 && !selectedImport) {
      const sortedImports = imports.sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
      const mostRecentImport = sortedImports[0];
      console.log('Auto-selecting most recent import:', mostRecentImport.id, 'from', mostRecentImport.fileName);
      setSelectedImport(mostRecentImport.id);
    }
  }, [imports, selectedImport]);

  useEffect(() => {
    console.log('selectedImport changed to:', selectedImport);
    if (selectedImport) {
      fetchAnalytics(selectedImport);
    }
  }, [selectedImport]);

  const fetchImports = async () => {
    try {
      const response = await fetch('/api/marketing/import');
      const data = await response.json();
      console.log('fetchImports - API response:', data);
      setImports(data.imports || []);
      if (data.imports && data.imports.length > 0) {
        // Sort imports by startTime (most recent first) and select the latest one
        const sortedImports = data.imports.sort((a: { startTime: string | number | Date; }, b: { startTime: string | number | Date; }) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        const mostRecentImport = sortedImports[0];
        console.log('fetchImports - Setting selectedImport to most recent:', mostRecentImport.id, 'from', mostRecentImport.fileName);
        setSelectedImport(mostRecentImport.id);
      } else {
        console.log('fetchImports - No imports found, clearing selectedImport');
        setSelectedImport('');
      }
    } catch (error) {
      console.error('Error fetching imports:', error);
    }
  };

  const fetchAnalytics = async (importId: string) => {
    setLoadingData(true);
    try {
      console.log('fetchAnalytics - Fetching data for importId:', importId);
      const response = await fetch(`/api/marketing/analytics/${importId}`);
      const data = await response.json();
      console.log('fetchAnalytics - Received data:', {
        importId,
        totalSessions: data.metrics?.totalSessions,
        totalUsers: data.metrics?.totalUsers,
        totalRevenue: data.metrics?.totalRevenue,
        conversionRate: data.metrics?.conversionRate
      });
      setMetrics(data.metrics);
      setTrends(data.trends);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportFiles(event.target.files);
  };

  const handleImport = async () => {
    if (!importFiles || importFiles.length === 0) return;

    setImporting(true);
    try {
      const formData = new FormData();
      Array.from(importFiles).forEach(file => {
        formData.append(file.name, file);
      });

      const response = await fetch('/api/marketing/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setShowImportModal(false);
        setImportFiles(null);
        fetchImports();
        // Select the newly imported data
        setSelectedImport(data.importId);
      } else {
        showError('Import Failed', `Import failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      showError('Import Failed', 'Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv' | 'pdf' = 'json') => {
    if (!selectedImport) return;

    setExporting(true);
    try {
      let response;
      if (format === 'pdf') {
        response = await fetch(`/api/marketing/export-pdf/${selectedImport}`);
      } else {
        response = await fetch(`/api/marketing/export/${selectedImport}?format=${format}`);
      }

      if (format === 'csv' || format === 'pdf') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `marketing-report-${selectedImport}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `marketing-report-${selectedImport}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export error:', error);
      showError('Export Failed', 'Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteImport = async (importId: string) => {
    console.log('handleDeleteImport called with importId:', importId);
    
    const confirmed = await confirm(
      'Delete Import',
      'Are you sure you want to delete this import? This action cannot be undone.',
      'danger'
    );
    
    if (!confirmed) {
      console.log('User cancelled deletion');
      return;
    }

    console.log('User confirmed deletion, proceeding...');
    setDeleting(true);
    
    try {
      console.log('Making DELETE request to:', `/api/marketing/import/${importId}`);
      const response = await fetch(`/api/marketing/import/${importId}`, {
        method: 'DELETE',
      });

      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        console.log('Delete successful, refreshing imports...');
        // Refresh imports list
        await fetchImports();
        // Clear selected import if it was the deleted one
        if (selectedImport === importId) {
          setSelectedImport('');
          setMetrics(null);
          setTrends(null);
        }
        showSuccess('Import Deleted', 'Import deleted successfully');
      } else {
        const errorData = await response.json();
        console.error('Delete failed with error:', errorData);
        showError('Delete Failed', `Delete failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      showError('Delete Failed', 'Delete failed. Please try again.');
    } finally {
      setDeleting(false);
    }
  };
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  const formatPercentage = (num: number | undefined) => {
    return `${(num || 0).toFixed(1)}%`;
  };

  const getTrendIcon = (trend: number | undefined) => {
    const value = trend || 0;
    if (value > 0) return '↗️';
    if (value < 0) return '↘️';
    return '→';
  };

  const getTrendColor = (trend: number | undefined) => {
    const value = trend || 0;
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-dark text-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Marketing Analytics Dashboard</h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Import Data
            </button>
            {selectedImport && (
              <div className="flex space-x-2">
                <button
                  onClick={async () => {
                    if (!metrics) return;
                    try {
                      const payload = {
                        name: `Performance Overview - ${new Date().toLocaleDateString()}`,
                        description: 'Comprehensive marketing analytics snapshot with charts, trends, and insights',
                        importId: selectedImport,
                        sections: [
                          // Summary KPIs Table
                          { id: 'summary', title: 'Summary KPIs', type: 'table', content: {
                            headers: ['Metric', 'Value'],
                            rows: [
                              ['Total Sessions', String(metrics.totalSessions)],
                              ['Total Users', String(metrics.totalUsers)],
                              ['Total Page Views', String(metrics.totalPageViews)],
                              ['Conversion Rate', `${metrics.conversionRate.toFixed(1)}%`],
                              ['Total Conversions', String(metrics.totalConversions)],
                              ['Total Revenue', String(metrics.totalRevenue)],
                            ]
                          }},
                          
                          // Campaign Performance Table
                          { id: 'campaigns', title: 'Campaign Performance', type: 'table', content: {
                            headers: ['Campaign', 'Source', 'Sessions', 'Conversions', 'Revenue', 'Conv. Rate'],
                            rows: (metrics.campaignPerformance || []).map(c => [
                              c.campaign,
                              c.source,
                              String(c.sessions),
                              String(c.conversions),
                              String(c.revenue),
                              `${c.conversionRate.toFixed(1)}%`
                            ])
                          }},
                          
                          // Channel Performance Chart (using campaignPerformance as proxy)
                          { id: 'channels', title: 'Channel Performance', type: 'chart', content: {
                            chartType: 'bar',
                            data: (metrics.campaignPerformance || []).map(campaign => ({
                              name: campaign.source || campaign.campaign,
                              value: campaign.sessions,
                              sessions: campaign.sessions,
                              conversions: campaign.conversions || 0,
                              conversionRate: campaign.conversionRate || 0
                            }))
                          }},
                          
                          // Campaign Performance Chart
                          { id: 'campaign-chart', title: 'Campaign Performance Chart', type: 'chart', content: {
                            chartType: 'pie',
                            data: (metrics.campaignPerformance || []).slice(0, 5).map(campaign => ({
                              name: campaign.campaign,
                              value: campaign.sessions,
                              sessions: campaign.sessions,
                              conversions: campaign.conversions,
                              revenue: campaign.revenue
                            }))
                          }},
                          
                          // Trends Analysis
                          { id: 'trends', title: 'Performance Trends', type: 'table', content: {
                            headers: ['Metric', 'Current Period', 'Previous Period', 'Change', 'Trend'],
                            rows: [
                              ['Sessions', String(metrics.totalSessions), String(Math.round(metrics.totalSessions / (1 + (trends?.sessionsTrend || 0)/100))), `${(trends?.sessionsTrend || 0) >= 0 ? '+' : ''}${(trends?.sessionsTrend || 0).toFixed(1)}%`, (trends?.sessionsTrend || 0) >= 0 ? '📈' : '📉'],
                              ['Users', String(metrics.totalUsers), String(Math.round(metrics.totalUsers / (1 + (trends?.sessionsTrend || 0)/100))), `${(trends?.sessionsTrend || 0) >= 0 ? '+' : ''}${(trends?.sessionsTrend || 0).toFixed(1)}%`, (trends?.sessionsTrend || 0) >= 0 ? '📈' : '📉'],
                              ['Revenue', `$${metrics.totalRevenue.toLocaleString()}`, `$${Math.round(metrics.totalRevenue / (1 + (trends?.revenueTrend || 0)/100)).toLocaleString()}`, `${(trends?.revenueTrend || 0) >= 0 ? '+' : ''}${(trends?.revenueTrend || 0).toFixed(1)}%`, (trends?.revenueTrend || 0) >= 0 ? '📈' : '📉'],
                              ['Conversion Rate', `${metrics.conversionRate.toFixed(1)}%`, `${(metrics.conversionRate / (1 + (trends?.conversionsTrend || 0)/100)).toFixed(1)}%`, `${(trends?.conversionsTrend || 0) >= 0 ? '+' : ''}${(trends?.conversionsTrend || 0).toFixed(1)}%`, (trends?.conversionsTrend || 0) >= 0 ? '📈' : '📉']
                            ]
                          }},
                          
                          // Key Insights
                          { id: 'insights', title: 'Key Insights', type: 'text', content: `
🎯 **Performance Highlights:**
• Total sessions: ${metrics.totalSessions.toLocaleString()} (${(trends?.sessionsTrend || 0) >= 0 ? '+' : ''}${(trends?.sessionsTrend || 0).toFixed(1)}% vs previous)
• Conversion rate: ${metrics.conversionRate.toFixed(1)}% (${(trends?.conversionsTrend || 0) >= 0 ? '+' : ''}${(trends?.conversionsTrend || 0).toFixed(1)}% vs previous)
• Top channel: ${metrics.campaignPerformance?.[0]?.source || 'N/A'} with ${metrics.campaignPerformance?.[0]?.sessions?.toLocaleString() || 0} sessions

📊 **Channel Analysis:**
${(metrics.campaignPerformance || []).slice(0, 3).map((campaign, i) => 
  `${i + 1}. ${campaign.source || campaign.campaign}: ${campaign.sessions.toLocaleString()} sessions (${campaign.conversionRate?.toFixed(1) || 0}% conversion rate)`
).join('\n')}

🚀 **Campaign Performance:**
${(metrics.campaignPerformance || []).slice(0, 3).map((campaign, i) => 
  `${i + 1}. ${campaign.campaign}: ${campaign.sessions.toLocaleString()} sessions, ${campaign.conversions} conversions`
).join('\n')}

💡 **Recommendations:**
• Focus on top-performing channels for budget allocation
• Optimize underperforming campaigns
• Monitor conversion rate trends for optimization opportunities
                          `},
                          
                          // Benchmark Comparison
                          { id: 'benchmarks', title: 'Benchmark Analysis', type: 'table', content: {
                            headers: ['Metric', 'Your Performance', 'Industry Benchmark', 'Status'],
                            rows: [
                              ['Conversion Rate', `${metrics.conversionRate.toFixed(1)}%`, '2.5%', metrics.conversionRate >= 2.5 ? '✅ Above Benchmark' : '⚠️ Below Benchmark'],
                              ['Bounce Rate', `${metrics.avgBounceRate?.toFixed(1) || 'N/A'}%`, '45%', (metrics.avgBounceRate || 0) <= 45 ? '✅ Above Benchmark' : '⚠️ Below Benchmark'],
                              ['Session Duration', `${metrics.avgSessionDuration?.toFixed(0) || 'N/A'}s`, '120s', (metrics.avgSessionDuration || 0) >= 120 ? '✅ Above Benchmark' : '⚠️ Below Benchmark']
                            ]
                          }}
                        ]
                      };
                      const res = await fetch('/api/reports/save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ report: payload })
                      });
                      
                      if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(errorData.error || 'Failed to save report');
                      }
                      
                      const result = await res.json();
                      showSuccess('Report Saved', `Report "${payload.name}" saved successfully!`);
                    } catch (e: any) {
                      console.error('Save report error:', e);
                      showError('Save Failed', `Failed to save report: ${e.message || 'Unknown error'}`);
                    }
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  Save as Report
                </button>
                <button
                  onClick={() => handleExport('json')}
                  disabled={exporting}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {exporting ? 'Exporting...' : 'Export JSON'}
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  disabled={exporting}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {exporting ? 'Exporting...' : 'Export CSV'}
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={exporting}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {exporting ? 'Exporting...' : 'Export PDF'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Import Selection */}
        {imports.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Data Import
            </label>
            <div className="flex items-center gap-3">
              <select
                value={selectedImport}
                onChange={(e) => setSelectedImport(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-primary flex-1"
              >
                {imports.map((importItem) => {
                  const provider = ((importItem as any)?.dataSource?.provider) || ((importItem as any)?.metadata?.provider) || '';
                  const fileName = (importItem.fileName || '').toLowerCase();

                  const meta = (importItem as any).metadata || {};
                  const start = meta.startDate || meta.start || '';
                  const end = meta.endDate || meta.end || '';

                  const startLabel = start ? formatDMY(start) : formatDMY(importItem.startTime);
                  const endLabel = end ? formatDMY(end) : '';

                  let label: string;
                  if (provider === 'GOOGLE_ANALYTICS') {
                    label = `Google Analytics${startLabel ? ` (${startLabel}${endLabel ? ` - ${endLabel}` : ''})` : ''}`;
                  } else if (fileName.includes('csv')) {
                    label = `CSV Upload${startLabel ? ` (${startLabel})` : ''}`;
                  } else {
                    label = `Custom Dataset${startLabel ? ` (${startLabel})` : ''}`;
                  }

                  return (
                    <option key={importItem.id} value={importItem.id}>
                      {label}
                    </option>
                  );
                })}
              </select>
              <button
                onClick={() => {
                  console.log('Delete button clicked, selectedImport:', selectedImport);
                  if (selectedImport) {
                    handleDeleteImport(selectedImport);
                  } else {
                    showWarning('Selection Required', 'Please select an import to delete');
                  }
                }}
                disabled={deleting || !selectedImport}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  deleting || !selectedImport 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
                title={selectedImport ? "Delete selected import" : "Select an import to delete"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>

              <button
                onClick={async () => {
                  const confirmed = await confirm(
                    'Delete All Imports',
                    'This will permanently delete ALL uploaded CSV imports and their analytics. Continue?',
                    'danger'
                  );
                  
                  if (!confirmed) return;
                  setDeleting(true);
                  try {
                    const res = await fetch('/api/marketing/import', { method: 'DELETE' });
                    if (!res.ok) {
                      const e = await res.json();
                      throw new Error(e.error || 'Delete failed');
                    }
                    await fetchImports();
                    setSelectedImport('');
                    setMetrics(null);
                    setTrends(null);
                    showSuccess('All Deleted', 'All uploaded CSVs and related analytics were deleted.');
                  } catch (e) {
                    console.error(e);
                    showError('Delete Failed', 'Failed to delete all uploads.');
                  } finally {
                    setDeleting(false);
                  }
                }}
                disabled={deleting || imports.length === 0}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  deleting || imports.length === 0
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-amber-600 text-white hover:bg-amber-700'
                }`}
                title="Delete all uploaded CSV imports"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-9 4h12M10 3h4a1 1 0 011 1v2H9V4a1 1 0 011-1zm-5 5h14l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 8z"/>
                </svg>
                {deleting ? 'Deleting...' : 'Delete All'}
              </button>
            </div>
            {/* Debug info */}
            <div className="text-xs text-gray-500 mt-2">
              Debug: selectedImport = "{selectedImport}", deleting = {deleting.toString()}, button disabled = {(deleting || !selectedImport).toString()}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loadingData && (
          <div className="text-center py-8">
            <div className="text-primary">Loading analytics...</div>
          </div>
        )}

        {/* Metrics Overview */}
        {metrics && trends && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Sessions */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Sessions</p>
                  <p className="text-2xl font-bold text-primary">{formatNumber(metrics.totalSessions)}</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm ${getTrendColor(trends?.sessionsTrend)}`}>
                    {getTrendIcon(trends?.sessionsTrend)} {formatPercentage(trends?.sessionsTrend)}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(metrics.totalRevenue)}</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm ${getTrendColor(trends?.revenueTrend)}`}>
                    {getTrendIcon(trends?.revenueTrend)} {formatPercentage(trends?.revenueTrend)}
                  </span>
                </div>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Conversion Rate</p>
                  <p className="text-2xl font-bold text-primary">{formatPercentage(metrics.conversionRate)}</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm ${getTrendColor(trends?.conversionsTrend)}`}>
                    {getTrendIcon(trends?.conversionsTrend)} {formatPercentage(trends?.conversionsTrend)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bounce Rate */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Bounce Rate</p>
                  <p className="text-2xl font-bold text-primary">{formatPercentage(metrics.avgBounceRate)}</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm ${getTrendColor(-(trends?.bounceRateTrend || 0))}`}>
                    {getTrendIcon(-(trends?.bounceRateTrend || 0))} {formatPercentage(trends?.bounceRateTrend)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">User Engagement</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Users</span>
                  <span className="text-primary">{formatNumber(metrics.totalUsers)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Page Views</span>
                  <span className="text-primary">{formatNumber(metrics.totalPageViews)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Session Duration</span>
                  <span className="text-primary">{Math.round(metrics.avgSessionDuration)}s</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Revenue Metrics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Revenue per Session</span>
                  <span className="text-primary">{formatCurrency(metrics.revenuePerSession)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Revenue per User</span>
                  <span className="text-primary">{formatCurrency(metrics.revenuePerUser)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Revenue per Conversion</span>
                  <span className="text-primary">{formatCurrency(metrics.avgRevenuePerConversion)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Event Activity</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Events</span>
                  <span className="text-primary">{formatNumber(metrics.totalEvents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Events per Session</span>
                  <span className="text-primary">{metrics.avgEventsPerSession.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Events */}
        {metrics && metrics.topEvents.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-primary mb-4">Top Events</h3>
            <div className="space-y-2">
              {metrics.topEvents.slice(0, 5).map((event, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-300">{event.name}</span>
                  <div className="text-right">
                    <span className="text-primary font-semibold">{formatNumber(event.count)}</span>
                    <span className="text-gray-400 text-sm ml-2">({formatNumber(event.sessions)} sessions)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campaign Performance */}
        {metrics && metrics.campaignPerformance.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-primary mb-4">Campaign Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 text-gray-400">Campaign</th>
                    <th className="text-left py-2 text-gray-400">Source</th>
                    <th className="text-right py-2 text-gray-400">Sessions</th>
                    <th className="text-right py-2 text-gray-400">Conversions</th>
                    <th className="text-right py-2 text-gray-400">Revenue</th>
                    <th className="text-right py-2 text-gray-400">Conv. Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.campaignPerformance.map((campaign, index) => (
                    <tr key={index} className="border-b border-gray-700">
                      <td className="py-2 text-primary">{campaign.campaign}</td>
                      <td className="py-2 text-gray-300">{campaign.source}</td>
                      <td className="py-2 text-right text-primary">{formatNumber(campaign.sessions)}</td>
                      <td className="py-2 text-right text-primary">{formatNumber(campaign.conversions)}</td>
                      <td className="py-2 text-right text-primary">{formatCurrency(campaign.revenue)}</td>
                      <td className="py-2 text-right text-primary">{formatPercentage(campaign.conversionRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI Insights removed */}

        {/* Charts Section */}
        {metrics && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-6">Analytics Charts</h2>
            <MarketingCharts metrics={metrics} />
          </div>
        )}

        {/* Benchmark Comparison */}
        {metrics && metrics.benchmarkComparison.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Performance vs Benchmarks</h3>
            <div className="space-y-4">
              {metrics.benchmarkComparison.map((benchmark, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-300">{benchmark.metric.replace(/_/g, ' ').toUpperCase()}</span>
                    <div className="text-sm text-gray-400">
                      Target: {benchmark.target} {benchmark.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-primary font-semibold">
                      {benchmark.actual.toFixed(2)} {benchmark.unit}
                    </div>
                    <div className={`text-sm ${
                      benchmark.performance === 'above' ? 'text-green-500' :
                      benchmark.performance === 'meeting' ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {benchmark.percentage.toFixed(1)}% of target
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-primary mb-4">Import Marketing Data</h3>
            
            {/* Google Analytics Section */}
            <div className="mb-6 p-4 bg-gray-700 rounded-lg">
              <h4 className="text-md font-semibold text-primary mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google Analytics Integration
              </h4>
              
              {!gaConnected ? (
                <div className="text-center">
                  <p className="text-gray-300 mb-4">Connect your Google Analytics account to automatically sync data</p>
                  <button
                    onClick={connectGoogleAnalytics}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Connect Google Analytics
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-green-400 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Connected to Google Analytics
                  </p>
                  
                  {gaProperties.length > 0 && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Select Property</label>
                        <select
                          value={selectedProperty}
                          onChange={(e) => setSelectedProperty(e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-primary"
                        >
                          <option value="">Select a property...</option>
                          {gaProperties.map((property, index) => (
                            <option key={index} value={property.name}>
                              {property.displayName || property.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                          <input
                            type="date"
                            value={syncDateRange.startDate}
                            onChange={(e) => setSyncDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                          <input
                            type="date"
                            value={syncDateRange.endDate}
                            onChange={(e) => setSyncDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-primary"
                          />
                        </div>
                      </div>
                      
                      <button
                        onClick={syncGoogleAnalyticsData}
                        disabled={!selectedProperty || syncing}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {syncing ? 'Syncing...' : 'Sync Data from Google Analytics'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center mb-6">
              <div className="flex-1 border-t border-gray-600"></div>
              <span className="px-3 text-gray-400 text-sm">OR</span>
              <div className="flex-1 border-t border-gray-600"></div>
            </div>

            {/* CSV Upload Section */}
            <div>
              <h4 className="text-md font-semibold text-primary mb-3">Upload CSV Files</h4>
              <p className="text-gray-400 text-sm mb-4">
                Upload CSV files: sessions_daily.csv, campaign_catalog.csv, events_daily.csv, conversions_daily.csv, benchmarks.csv
              </p>
              <input
                type="file"
                multiple
                accept=".csv"
                onChange={handleFileUpload}
                className="w-full mb-4 p-2 border border-gray-600 rounded-lg bg-gray-700 text-primary"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importFiles || importing}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors"
              >
                {importing ? 'Importing...' : 'Import CSV Files'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
