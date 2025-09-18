import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LineChartProps {
  data: Array<{ name: string; value: number; [key: string]: any }>;
  title?: string;
  height?: number;
  dataKey?: string;
  xAxisDataKey?: string;
  strokeColor?: string;
  secondaryDataKey?: string;
  secondaryStrokeColor?: string;
}

export default function LineChart({ 
  data, 
  title, 
  height = 300, 
  dataKey = 'value',
  xAxisDataKey = 'name',
  strokeColor = '#3AB0FF',
  secondaryDataKey,
  secondaryStrokeColor = '#00C49F'
}: LineChartProps) {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisDataKey} />
          <YAxis yAxisId="left" />
          {secondaryDataKey && <YAxis yAxisId="right" orientation="right" />}
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey={dataKey} stroke={strokeColor} strokeWidth={2} />
          {secondaryDataKey && (
            <Line yAxisId="right" type="monotone" dataKey={secondaryDataKey} stroke={secondaryStrokeColor} strokeWidth={2} />
          )}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}






