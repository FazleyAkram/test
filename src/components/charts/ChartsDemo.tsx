import React from 'react';
import { PieChart, BarChart, LineChart, StackedBarChart } from './index';

export default function ChartsDemo() {
  const pieData = [
    { name: 'Desktop', value: 45680, color: '#0088FE' },
    { name: 'Mobile', value: 65420, color: '#00C49F' },
    { name: 'Tablet', value: 14330, color: '#FFBB28' },
  ];

  const barData = [
    { name: 'Q1', value: 4000, target: 3500 },
    { name: 'Q2', value: 3000, target: 4000 },
    { name: 'Q3', value: 2000, target: 3000 },
    { name: 'Q4', value: 2780, target: 2500 },
  ];

  const lineData = [
    { name: 'Jan', value: 400, sales: 240 },
    { name: 'Feb', value: 300, sales: 139 },
    { name: 'Mar', value: 200, sales: 980 },
    { name: 'Apr', value: 278, sales: 390 },
    { name: 'May', value: 189, sales: 480 },
  ];

  const stackedData = [
    { name: 'Product A', revenue: 4000, cost: 2400, profit: 1600 },
    { name: 'Product B', revenue: 3000, cost: 1398, profit: 1602 },
    { name: 'Product C', revenue: 2000, cost: 9800, profit: -7800 },
    { name: 'Product D', revenue: 2780, cost: 3908, profit: -1128 },
  ];

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Charts Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg p-4 shadow-lg">
          <PieChart data={pieData} title="Device Distribution" height={300} />
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-lg">
          <BarChart 
            data={barData} 
            title="Quarterly Performance" 
            height={300}
            secondaryDataKey="target"
          />
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-lg">
          <LineChart 
            data={lineData} 
            title="Monthly Trends" 
            height={300}
            secondaryDataKey="sales"
          />
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-lg">
          <StackedBarChart 
            data={stackedData} 
            title="Product Analysis" 
            height={300}
            dataKeys={['revenue', 'cost', 'profit']}
          />
        </div>
      </div>
    </div>
  );
}













