import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: Array<{ name: string; value: number; [key: string]: any }>;
  title?: string;
  height?: number;
  dataKey?: string;
  xAxisDataKey?: string;
  secondaryDataKey?: string;
}

export default function BarChart({ 
  data, 
  title, 
  height = 300, 
  dataKey = 'value',
  xAxisDataKey = 'name',
  secondaryDataKey
}: BarChartProps) {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisDataKey} />
          <YAxis yAxisId="left" />
          {secondaryDataKey && <YAxis yAxisId="right" orientation="right" />}
          <Tooltip />
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






