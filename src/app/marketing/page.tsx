'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import MarketingCharts from '@/components/marketing/MarketingCharts';
import MarketingInsights from '@/components/marketing/MarketingInsights';

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
  const { user, isLoading } = useAuth();
  const router = useRouter();
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

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    fetchImports();
  }, []);

  useEffect(() => {
    console.log('imports changed:', imports);
    // If we have imports but no selectedImport, set the first one
    if (imports.length > 0 && !selectedImport) {
      console.log('Auto-selecting first import:', imports[0].id);
      setSelectedImport(imports[0].id);
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
        console.log('fetchImports - Setting selectedImport to:', data.imports[0].id);
        setSelectedImport(data.imports[0].id);
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
      const response = await fetch(`/api/marketing/analytics/${importId}`);
      const data = await response.json();
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
        alert(`Import failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv' = 'json') => {
    if (!selectedImport) return;

    setExporting(true);
    try {
      const response = await fetch(`/api/marketing/export/${selectedImport}?format=${format}`);
      
      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `marketing-report-${selectedImport}.csv`;
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
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteImport = async (importId: string) => {
    console.log('handleDeleteImport called with importId:', importId);
    
    if (!confirm('Are you sure you want to delete this import? This action cannot be undone.')) {
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
        alert('Import deleted successfully');
      } else {
        const errorData = await response.json();
        console.error('Delete failed with error:', errorData);
        alert(`Delete failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed. Please try again.');
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

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return '↗️';
    if (trend < 0) return '↘️';
    return '→';
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-500';
    if (trend < 0) return 'text-red-500';
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
            <p className="text-gray-400 mt-2">EV Bike Store Marketing Performance</p>
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
                {imports.map((importItem) => (
                  <option key={importItem.id} value={importItem.id}>
                    {importItem.fileName} - {new Date(importItem.startTime).toLocaleDateString()}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  console.log('Delete button clicked, selectedImport:', selectedImport);
                  if (selectedImport) {
                    handleDeleteImport(selectedImport);
                  } else {
                    alert('Please select an import to delete');
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
                  <span className={`text-sm ${getTrendColor(trends.sessionsTrend)}`}>
                    {getTrendIcon(trends.sessionsTrend)} {formatPercentage(trends.sessionsTrend)}
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
                  <span className={`text-sm ${getTrendColor(trends.revenueTrend)}`}>
                    {getTrendIcon(trends.revenueTrend)} {formatPercentage(trends.revenueTrend)}
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
                  <span className={`text-sm ${getTrendColor(trends.conversionsTrend)}`}>
                    {getTrendIcon(trends.conversionsTrend)} {formatPercentage(trends.conversionsTrend)}
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
                  <span className={`text-sm ${getTrendColor(-trends.bounceRateTrend)}`}>
                    {getTrendIcon(-trends.bounceRateTrend)} {formatPercentage(trends.bounceRateTrend)}
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

        {/* AI Insights Section */}
        {metrics && (
          <div className="mb-8">
            <MarketingInsights metrics={metrics} />
          </div>
        )}

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
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-primary mb-4">Import Marketing Data</h3>
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
                {importing ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
