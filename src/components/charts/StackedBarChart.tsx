import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StackedBarChartProps {
  data: Array<{ name: string; [key: string]: any }>;
  title?: string;
  height?: number;
  dataKeys: string[];
  xAxisDataKey?: string;
  colors?: string[];
}

const DEFAULT_COLORS = ['#3AB0FF', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function StackedBarChart({ 
  data, 
  title, 
  height = 300, 
  dataKeys,
  xAxisDataKey = 'name',
  colors = DEFAULT_COLORS
}: StackedBarChartProps) {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisDataKey} />
          <YAxis />
          <Tooltip />
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






