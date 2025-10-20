'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface MarketingChartsProps {
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

interface ChartProps extends MarketingChartsProps {
  height?: number | string;
  showContainer?: boolean;
}

const COLORS = ['#3AB0FF', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

export function SessionsUsersChart({ metrics, height = 300, showContainer = true }: ChartProps) {
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat().format(value);
  };

  // Prepare data for sessions and users chart
  const sessionsTrendData = metrics.dailyTrends
    .filter(trend => {
      // Filter out invalid dates
      const date = trend.date;
      if (!date) return false;
      
      const dateObj = new Date(date);
      return !isNaN(dateObj.getTime());
    })
    .map(trend => {
      // Use the provided date field
      const date = trend.date;
      const dateObj = new Date(date);
      
      // Format based on period type if available
      let formattedDate;
      const periodType = (trend as any).periodType as string | undefined;
      if (periodType === 'WEEKLY') {
        formattedDate = `Week of ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      } else if (periodType === 'MONTHLY') {
        formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } else if (periodType === 'QUARTERLY') {
        const quarter = Math.floor(dateObj.getMonth() / 3) + 1;
        formattedDate = `Q${quarter} ${dateObj.getFullYear()}`;
      } else {
        // Daily or default
        formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      return {
        date: formattedDate,
        sessions: trend.sessions,
        users: Math.round(trend.sessions * 0.9), // Approximate users from sessions
      };
    });

  // Ensure height is properly handled for slideshow view
  const chartHeight = height === "100%" ? "100%" : height;

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <LineChart data={sessionsTrendData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fill: '#F3F4F6', fontSize: 16 }} />
        <YAxis stroke="#9CA3AF" tick={{ fill: '#F3F4F6', fontSize: 16 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F3F4F6'
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="sessions"
          stroke="#3AB0FF"
          strokeWidth={3}
          name="Sessions"
          dot={{ fill: '#3AB0FF', strokeWidth: 2, r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="users"
          stroke="#00C49F"
          strokeWidth={3}
          name="Users"
          dot={{ fill: '#00C49F', strokeWidth: 2, r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function BounceRateChart({ metrics, height = 300, showContainer = true }: ChartProps) {
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Prepare data for bounce rate chart
  const sessionsTrendData = metrics.dailyTrends
    .filter(trend => {
      // Filter out invalid dates
      const date = trend.date;
      if (!date) return false;
      
      const dateObj = new Date(date);
      return !isNaN(dateObj.getTime());
    })
    .map(trend => {
      // Use the provided date field
      const date = trend.date;
      const dateObj = new Date(date);
      
      // Format based on period type if available
      let formattedDate;
      const periodType = (trend as any).periodType as string | undefined;
      if (periodType === 'WEEKLY') {
        formattedDate = `Week of ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      } else if (periodType === 'MONTHLY') {
        formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } else if (periodType === 'QUARTERLY') {
        const quarter = Math.floor(dateObj.getMonth() / 3) + 1;
        formattedDate = `Q${quarter} ${dateObj.getFullYear()}`;
      } else {
        // Daily or default
        formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      return {
        date: formattedDate,
        bounceRate: trend.bounceRate
      };
    });

  // Ensure height is properly handled for slideshow view
  const chartHeight = height === "100%" ? "100%" : height;

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <LineChart data={sessionsTrendData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fill: '#F3F4F6', fontSize: 16 }} />
        <YAxis stroke="#9CA3AF" tick={{ fill: '#F3F4F6', fontSize: 16 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F3F4F6'
          }}
          formatter={(value) => [formatPercentage(value as number), 'Bounce Rate']}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="bounceRate"
          stroke="#FF8042"
          strokeWidth={3}
          name="Bounce Rate %"
          dot={{ fill: '#FF8042', strokeWidth: 2, r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function MarketingCharts({ metrics }: MarketingChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat().format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Prepare data for charts
  const sessionsTrendData = metrics.dailyTrends.map(trend => ({
    date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sessions: trend.sessions,
    users: Math.round(trend.sessions * 0.9), // Approximate users from sessions
    bounceRate: trend.bounceRate
  }));

  const revenueTrendData = metrics.dailyTrends.map(trend => ({
    date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: trend.revenue,
    conversions: trend.conversions
  }));

  const topEventsData = metrics.topEvents.slice(0, 8).map(event => ({
    name: event.name.replace(/_/g, ' ').toUpperCase(),
    count: event.count,
    sessions: event.sessions
  }));

  const conversionTypesData = metrics.conversionTypes.map(conversion => ({
    name: conversion.name.replace(/_/g, ' ').toUpperCase(),
    revenue: conversion.revenue,
    count: conversion.count
  }));

  const campaignPerformanceData = metrics.campaignPerformance.map(campaign => ({
    name: campaign.campaign.replace(/_/g, ' ').toUpperCase(),
    sessions: campaign.sessions,
    revenue: campaign.revenue,
    conversionRate: campaign.conversionRate
  }));

  const benchmarkData = metrics.benchmarkComparison.map(benchmark => ({
    metric: benchmark.metric.replace(/_/g, ' ').toUpperCase(),
    actual: benchmark.actual,
    target: benchmark.target,
    performance: benchmark.performance
  }));

  return (
    <div className="space-y-8">
      {/* Sessions and Users Trend */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Sessions & Users Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sessionsTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="sessions"
              stroke="#3AB0FF"
              strokeWidth={2}
              name="Sessions"
            />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#00C49F"
              strokeWidth={2}
              name="Users"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue and Conversions Trend */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Revenue & Conversions Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis yAxisId="left" stroke="#9CA3AF" />
            <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
              formatter={(value, name) => [
                name === 'revenue' ? formatCurrency(value as number) : value,
                name === 'revenue' ? 'Revenue' : 'Conversions'
              ]}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#3AB0FF"
              fill="#3AB0FF"
              fillOpacity={0.3}
              name="Revenue"
            />
            <Bar
              yAxisId="right"
              dataKey="conversions"
              fill="#00C49F"
              name="Conversions"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top Events */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Top Events</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topEventsData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#9CA3AF" />
            <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={120} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
              formatter={(value, name) => [formatNumber(value as number), name === 'count' ? 'Event Count' : 'Sessions']}
            />
            <Legend />
            <Bar dataKey="count" fill="#3AB0FF" name="Event Count" />
            <Bar dataKey="sessions" fill="#00C49F" name="Sessions" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Conversion Types Revenue */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Conversion Types Revenue</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={conversionTypesData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="revenue"
            >
              {conversionTypesData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
              formatter={(value) => [formatCurrency(value as number), 'Revenue']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Campaign Performance */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Campaign Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={campaignPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
            <YAxis yAxisId="left" stroke="#9CA3AF" />
            <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
              formatter={(value, name) => [
                name === 'revenue' ? formatCurrency(value as number) : 
                name === 'conversionRate' ? formatPercentage(value as number) : 
                formatNumber(value as number),
                name === 'revenue' ? 'Revenue' : 
                name === 'conversionRate' ? 'Conversion Rate' : 'Sessions'
              ]}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="sessions" fill="#3AB0FF" name="Sessions" />
            <Bar yAxisId="right" dataKey="conversionRate" fill="#00C49F" name="Conversion Rate %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Benchmark Performance */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Performance vs Benchmarks</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={benchmarkData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="metric" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
              formatter={(value, name) => [
                name === 'actual' ? value : value,
                name === 'actual' ? 'Actual' : 'Target'
              ]}
            />
            <Legend />
            <Bar dataKey="actual" fill="#3AB0FF" name="Actual" />
            <Bar dataKey="target" fill="#00C49F" name="Target" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bounce Rate Trend */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Bounce Rate Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sessionsTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
              formatter={(value) => [formatPercentage(value as number), 'Bounce Rate']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="bounceRate"
              stroke="#FF8042"
              strokeWidth={2}
              name="Bounce Rate %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}




