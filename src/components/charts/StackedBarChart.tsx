import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StackedBarChartProps {
  data: Array<{ name: string; [key: string]: any }>;
  title?: string;
  height?: number;
  dataKeys: string[];
  xAxisDataKey?: string;
  colors?: string[];
  darkTheme?: boolean;
}

const DEFAULT_COLORS = ['#3AB0FF', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function StackedBarChart({ 
  data, 
  title, 
  height = 500, 
  dataKeys,
  xAxisDataKey = 'name',
  colors = DEFAULT_COLORS,
  darkTheme = false
}: StackedBarChartProps) {
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
            stroke={darkTheme ? '#9CA3AF' : '#6B7280'} 
            tick={{ fill: darkTheme ? '#F3F4F6' : '#374151' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: darkTheme ? '#1F2937' : '#FFFFFF',
              border: darkTheme ? '1px solid #374151' : '1px solid #E5E7EB',
              borderRadius: '8px',
              color: darkTheme ? '#F3F4F6' : '#374151'
            }}
          />
          <Legend />
          {dataKeys.map((key, index) => (
            <Bar 
              key={key}
              dataKey={key} 
              stackId="a"
              fill={colors[index % colors.length]} 
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}









