import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: Array<{ name: string; value: number; [key: string]: any }>;
  title?: string;
  height?: number;
  dataKey?: string;
  xAxisDataKey?: string;
  secondaryDataKey?: string;
  darkTheme?: boolean;
}

export default function BarChart({ 
  data, 
  title, 
  height = 500, 
  dataKey = 'value',
  xAxisDataKey = 'name',
  secondaryDataKey,
  darkTheme = false
}: BarChartProps) {
  return (
    <div className="w-full">
      {title && <h3 className={`text-lg font-semibold mb-4 text-center ${darkTheme ? 'text-white' : 'text-gray-800'}`}>{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={darkTheme ? '#374151' : '#E5E7EB'} />
          <XAxis 
            dataKey={xAxisDataKey} 
            stroke={darkTheme ? '#9CA3AF' : '#6B7280'} 
            tick={{ fill: darkTheme ? '#F3F4F6' : '#374151' }}
          />
          <YAxis 
            yAxisId="left" 
            stroke={darkTheme ? '#9CA3AF' : '#6B7280'} 
            tick={{ fill: darkTheme ? '#F3F4F6' : '#374151' }}
          />
          {secondaryDataKey && (
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke={darkTheme ? '#9CA3AF' : '#6B7280'} 
              tick={{ fill: darkTheme ? '#F3F4F6' : '#374151' }}
            />
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: darkTheme ? '#1F2937' : '#FFFFFF',
              border: darkTheme ? '1px solid #374151' : '1px solid #E5E7EB',
              borderRadius: '8px',
              color: darkTheme ? '#F3F4F6' : '#374151'
            }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey={dataKey} fill="#3AB0FF" />
          {secondaryDataKey && (
            <Bar yAxisId="right" dataKey={secondaryDataKey} fill="#00C49F" />
          )}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}









