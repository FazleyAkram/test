import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PieChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  title?: string;
  height?: number;
  darkTheme?: boolean;
}

const COLORS = ['#3AB0FF', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function PieChart({ data, title, height = 500, darkTheme = false }: PieChartProps) {
  return (
    <div className="w-full">
      {title && <h3 className={`text-lg font-semibold mb-4 text-center ${darkTheme ? 'text-white' : 'text-gray-800'}`}>{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [value, 'Value']}
            contentStyle={{
              backgroundColor: darkTheme ? '#1F2937' : '#FFFFFF',
              border: darkTheme ? '1px solid #374151' : '1px solid #E5E7EB',
              borderRadius: '8px',
              color: darkTheme ? '#F3F4F6' : '#374151'
            }}
          />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}












