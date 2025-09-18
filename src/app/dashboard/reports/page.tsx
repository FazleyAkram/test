'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/header/Header.jsx';
import { PieChart, BarChart, LineChart, StackedBarChart, DonutChart } from '@/components/charts';

type ReportSection = {
  id: string;
  title: string;
  type: 'text' | 'table' | 'chart';
  content: any;
};

type ReportItem = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  sections: ReportSection[];
};

const mockReports: ReportItem[] = [
  {
    id: 'traffic-overview-001',
    name: 'Traffic Overview (Last 30 Days)',
    description: 'Sessions, Users, Page Views, and Engagement trends',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: 'summary',
        title: 'Executive Summary',
        type: 'text',
        content:
          'Overall traffic increased by 12% compared to the previous period. Desktop continues to drive higher conversion rate while mobile contributes the majority of sessions. Organic Search remains the top channel by volume, while Paid Search delivered the highest ROAS.',
      },
      {
        id: 'kpis',
        title: 'Key KPIs',
        type: 'table',
        content: {
          headers: ['Metric', 'Current', 'Previous', 'Change'],
          rows: [
            ['Sessions', '125,430', '112,030', '+12%'],
            ['Users', '98,240', '88,700', '+10.7%'],
            ['Page Views', '356,220', '320,110', '+11.3%'],
            ['Bounce Rate', '43.2%', '45.8%', '-2.6 pts'],
            ['Avg. Session Duration', '2m 34s', '2m 20s', '+14s'],
          ],
        },
      },
      {
        id: 'channels',
        title: 'Top Channels Breakdown',
        type: 'table',
        content: {
          headers: ['Channel', 'Sessions', 'Users', 'Conv. Rate', 'Revenue'],
          rows: [
            ['Organic Search', '52,112', '40,209', '2.3%', '$21,420'],
            ['Direct', '31,992', '25,180', '1.8%', '$10,320'],
            ['Paid Search', '18,405', '14,250', '3.1%', '$19,110'],
            ['Referral', '9,530', '7,482', '1.2%', '$2,340'],
            ['Email', '7,391', '6,210', '2.7%', '$5,780'],
          ],
        },
      },
      {
        id: 'channels-pie',
        title: 'Traffic Distribution by Channel',
        type: 'chart',
        content: {
          chartType: 'pie',
          data: [
            { name: 'Organic Search', value: 52112, color: '#0088FE' },
            { name: 'Direct', value: 31992, color: '#00C49F' },
            { name: 'Paid Search', value: 18405, color: '#FFBB28' },
            { name: 'Referral', value: 9530, color: '#FF8042' },
            { name: 'Email', value: 7391, color: '#8884D8' },
          ],
        },
      },
      {
        id: 'sessions-trend',
        title: 'Sessions Trend (Last 30 Days)',
        type: 'chart',
        content: {
          chartType: 'line',
          data: [
            { name: 'Day 1', value: 4200 },
            { name: 'Day 5', value: 3800 },
            { name: 'Day 10', value: 4500 },
            { name: 'Day 15', value: 4100 },
            { name: 'Day 20', value: 4800 },
            { name: 'Day 25', value: 5200 },
            { name: 'Day 30', value: 4900 },
          ],
        },
      },
    ],
  },
  {
    id: 'ecommerce-performance-001',
    name: 'E‑commerce Performance',
    description: 'Conversion, Revenue, AOV and Product performance',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: 'summary',
        title: 'Performance Summary',
        type: 'text',
        content:
          'Revenue increased by 15% driven by improvements in checkout completion and successful cross-sell bundles. High-value products contributed to a 9% lift in AOV. Mobile conversion improved following UX fixes.',
      },
      {
        id: 'kpis',
        title: 'Commerce KPIs',
        type: 'table',
        content: {
          headers: ['Metric', 'Value', 'Change'],
          rows: [
            ['Revenue', '$126,540', '+15%'],
            ['Transactions', '2,145', '+6%'],
            ['AOV', '$59.00', '+9%'],
            ['E‑commerce Conv. Rate', '1.72%', '+0.21 pts'],
            ['Cart Abandonment', '64%', '-3 pts'],
          ],
        },
      },
      {
        id: 'top-products',
        title: 'Top Products',
        type: 'table',
        content: {
          headers: ['Product', 'Units', 'Revenue', 'Refunds'],
          rows: [
            ['Wireless Headphones X', '534', '$32,040', '$0'],
            ['Smartwatch Pro S', '423', '$25,380', '$410'],
            ['USB‑C Dock 8‑in‑1', '702', '$21,060', '$120'],
          ],
        },
      },
      {
        id: 'products-bar',
        title: 'Product Performance Comparison',
        type: 'chart',
        content: {
          chartType: 'bar',
          data: [
            { name: 'Wireless Headphones X', value: 32040, units: 534 },
            { name: 'Smartwatch Pro S', value: 25380, units: 423 },
            { name: 'USB‑C Dock 8‑in‑1', value: 21060, units: 702 },
          ],
        },
      },
      {
        id: 'revenue-pie',
        title: 'Revenue Distribution by Product',
        type: 'chart',
        content: {
          chartType: 'pie',
          data: [
            { name: 'Wireless Headphones X', value: 32040, color: '#0088FE' },
            { name: 'Smartwatch Pro S', value: 25380, color: '#00C49F' },
            { name: 'USB‑C Dock 8‑in‑1', value: 21060, color: '#FFBB28' },
          ],
        },
      },
    ],
  },
  {
    id: 'user-engagement-001',
    name: 'User Engagement Analysis',
    description: 'User behavior, session patterns, and engagement metrics',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: 'summary',
        title: 'Engagement Overview',
        type: 'text',
        content:
          'User engagement has shown positive trends with improved session duration and reduced bounce rates. Mobile users are increasingly engaged, while desktop users maintain higher conversion rates.',
      },
      {
        id: 'device-breakdown',
        title: 'Traffic by Device Type',
        type: 'chart',
        content: {
          chartType: 'donut',
          data: [
            { name: 'Mobile', value: 65420, color: '#3AB0FF' },
            { name: 'Desktop', value: 45680, color: '#00C49F' },
            { name: 'Tablet', value: 14330, color: '#FFBB28' },
          ],
        },
      },
      {
        id: 'engagement-trends',
        title: 'Engagement Metrics Over Time',
        type: 'chart',
        content: {
          chartType: 'line',
          data: [
            { name: 'Week 1', value: 2.2, bounceRate: 45.8 },
            { name: 'Week 2', value: 2.4, bounceRate: 44.2 },
            { name: 'Week 3', value: 2.6, bounceRate: 43.1 },
            { name: 'Week 4', value: 2.8, bounceRate: 42.5 },
          ],
        },
      },
      {
        id: 'page-performance',
        title: 'Top Pages by Engagement',
        type: 'chart',
        content: {
          chartType: 'bar',
          data: [
            { name: 'Homepage', value: 8.5, sessions: 12500 },
            { name: 'Products', value: 6.2, sessions: 8900 },
            { name: 'About', value: 4.8, sessions: 3200 },
            { name: 'Contact', value: 3.9, sessions: 2100 },
          ],
        },
      },
      {
        id: 'traffic-sources-stacked',
        title: 'Traffic Sources by Device',
        type: 'chart',
        content: {
          chartType: 'stackedBar',
          data: [
            { name: 'Organic Search', mobile: 32000, desktop: 18000, tablet: 2100 },
            { name: 'Direct', mobile: 20000, desktop: 11000, tablet: 992 },
            { name: 'Paid Search', mobile: 12000, desktop: 6000, tablet: 405 },
            { name: 'Referral', mobile: 6000, desktop: 3000, tablet: 530 },
            { name: 'Email', mobile: 4000, desktop: 2000, tablet: 391 },
          ],
        },
      },
    ],
  },
];

export default function ReportsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [reports, setReports] = useState<ReportItem[]>(mockReports);
  const [selectedId, setSelectedId] = useState<string>(mockReports[0].id);
  const [editing, setEditing] = useState<boolean>(false);
  const selectedReport = useMemo(
    () => reports.find((r) => r.id === selectedId)!,
    [reports, selectedId]
  );

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [isLoading, user, router]);

  if (isLoading || !user) return null;

  const handleFieldChange = (path: string, value: any) => {
    setReports((prev) =>
      prev.map((rep) => {
        if (rep.id !== selectedId) return rep;
        const cloned = structuredClone(rep);
        const parts = path.split('.');
        let target: any = cloned as any;
        for (let i = 0; i < parts.length - 1; i++) {
          const key = parts[i] === 'sections' ? 'sections' : parts[i];
          target = key === 'sections' ? target.sections[Number(parts[++i])] : target[key];
        }
        target[parts.at(-1)!] = value;
        cloned.updatedAt = new Date().toISOString();
        return cloned;
      })
    );
  };

  const handleSaveAs = async () => {
    const base = selectedReport;
    const copy: ReportItem = {
      ...base,
      id: `${base.id}-copy-${Date.now()}`,
      name: `${base.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setReports((prev) => [copy, ...prev]);

    try {
      await fetch('/api/reports/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report: copy }),
      });
    } catch (_) {}
    setEditing(false);
    setSelectedId(copy.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Reports</h1>
            <p className="text-white/80 text-lg">Create and manage your data reports with interactive charts</p>
          </div>
          <div className="flex gap-3">
            {!editing ? (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-400 to-yellow-500 text-white font-medium hover:from-orange-500 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    const newReport: ReportItem = {
                      id: `report-${Date.now()}`,
                      name: 'New Report',
                      description: 'Add your description here',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      sections: [
                        {
                          id: `section-${Date.now()}`,
                          title: 'Summary',
                          type: 'text',
                          content: 'Enter your summary here...',
                        },
                      ],
                    };
                    setReports((prev) => [newReport, ...prev]);
                    setSelectedId(newReport.id);
                    setEditing(true);
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  + New Report
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSaveAs}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Save as New
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar: Report list */}
          <div className="lg:col-span-1 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl h-max">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Reports</h3>
            <ul className="space-y-3">
              {reports.map((r) => (
                <li key={r.id}>
                  <div className="relative">
                    <button
                      onClick={() => {
                        setSelectedId(r.id);
                        setEditing(false);
                      }}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedId === r.id
                          ? 'border-purple-400 bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <div className="font-semibold text-gray-800">{r.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Updated {new Date(r.updatedAt).toLocaleDateString()}
                      </div>
                    </button>
                    {editing && reports.length > 1 && (
                      <button
                        onClick={() => {
                          setReports((prev) => prev.filter((rep) => rep.id !== r.id));
                          if (selectedId === r.id) {
                            setSelectedId(reports.find((rep) => rep.id !== r.id)?.id || '');
                          }
                        }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white hover:bg-red-600 text-sm flex items-center justify-center transition-colors"
                        title="Delete report"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Main: Report editor/viewer */}
          <div className="lg:col-span-3 bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl space-y-8">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Report Name</label>
              <input
                className="w-full p-4 rounded-xl border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-semibold text-lg"
                value={selectedReport.name}
                onChange={(e) => editing && handleFieldChange('name', e.target.value)}
                disabled={!editing}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Description</label>
              <input
                className="w-full p-4 rounded-xl border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                value={selectedReport.description || ''}
                onChange={(e) => editing && handleFieldChange('description', e.target.value)}
                disabled={!editing}
                placeholder="Add a description for your report..."
              />
            </div>

            {selectedReport.sections.map((sec, idx) => (
              <div key={sec.id} className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-gray-700 font-medium">Section Title</label>
                  <div className="flex gap-3">
                    {editing && (
                      <select
                        className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        value={sec.type}
                        onChange={(e) => handleFieldChange(`sections.${idx}.type`, e.target.value)}
                      >
                        <option value="text">Text</option>
                        <option value="table">Table</option>
                        <option value="chart">Chart</option>
                      </select>
                    )}
                    {editing && selectedReport.sections.length > 1 && (
                      <button
                        onClick={() => {
                          setReports((prev) =>
                            prev.map((rep) => {
                              if (rep.id !== selectedId) return rep;
                              return {
                                ...rep,
                                sections: rep.sections.filter((_, i) => i !== idx),
                                updatedAt: new Date().toISOString(),
                              };
                            })
                          );
                        }}
                        className="px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                        title="Delete section"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
                
                <input
                  className="w-full p-3 rounded-xl border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold"
                  value={sec.title}
                  onChange={(e) => editing && handleFieldChange(`sections.${idx}.title`, e.target.value)}
                  disabled={!editing}
                />

                {sec.type === 'text' && (
                  <textarea
                    rows={6}
                    className="w-full p-4 rounded-xl border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 leading-relaxed"
                    value={sec.content}
                    onChange={(e) => editing && handleFieldChange(`sections.${idx}.content`, e.target.value)}
                    disabled={!editing}
                  />
                )}

                {sec.type === 'table' && (
                  <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-purple-50">
                          {sec.content.headers.map((h: string, i: number) => (
                            <th key={i} className="border border-gray-200 p-3 text-left font-semibold text-gray-800">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sec.content.rows.map((row: string[], ri: number) => (
                          <tr key={ri} className="hover:bg-gray-50">
                            {row.map((cell: string, ci: number) => (
                              <td key={ci} className="border border-gray-200 p-3">
                                <input
                                  className="w-full bg-transparent outline-none text-gray-800"
                                  value={cell}
                                  onChange={(e) =>
                                    editing && handleFieldChange(
                                      `sections.${idx}.content.rows`,
                                      sec.content.rows.map((r: string[], rj: number) =>
                                        rj === ri ? r.map((c, cj) => (cj === ci ? e.target.value : c)) : r
                                      )
                                    )
                                  }
                                  disabled={!editing}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {sec.type === 'chart' && (
                  <div className="space-y-6">
                    {editing && (
                      <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
                        <div className="flex gap-4 items-center">
                          <label className="text-gray-700 font-medium">Chart Type:</label>
                          <select
                            className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            value={sec.content.chartType || 'pie'}
                            onChange={(e) => {
                              const newContent = { ...sec.content, chartType: e.target.value };
                              handleFieldChange(`sections.${idx}.content`, newContent);
                            }}
                          >
                            <option value="pie">Pie Chart</option>
                            <option value="donut">Donut Chart</option>
                            <option value="bar">Bar Chart</option>
                            <option value="line">Line Chart</option>
                            <option value="stackedBar">Stacked Bar Chart</option>
                          </select>
                        </div>
                        
                        <div className="text-gray-700 font-medium">Chart Data:</div>
                        <div className="space-y-3">
                          {(sec.content.data || []).map((item: any, dataIdx: number) => (
                            <div key={dataIdx} className="flex gap-3 items-center">
                              <input
                                className="flex-1 p-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-purple-500"
                                placeholder="Name"
                                value={item.name || ''}
                                onChange={(e) => {
                                  const newData = [...(sec.content.data || [])];
                                  newData[dataIdx] = { ...newData[dataIdx], name: e.target.value };
                                  const newContent = { ...sec.content, data: newData };
                                  handleFieldChange(`sections.${idx}.content`, newContent);
                                }}
                              />
                              <input
                                className="w-24 p-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-purple-500"
                                placeholder="Value"
                                type="number"
                                value={item.value || ''}
                                onChange={(e) => {
                                  const newData = [...(sec.content.data || [])];
                                  newData[dataIdx] = { ...newData[dataIdx], value: Number(e.target.value) };
                                  const newContent = { ...sec.content, data: newData };
                                  handleFieldChange(`sections.${idx}.content`, newContent);
                                }}
                              />
                              <button
                                onClick={() => {
                                  const newData = (sec.content.data || []).filter((_: any, i: number) => i !== dataIdx);
                                  const newContent = { ...sec.content, data: newData };
                                  handleFieldChange(`sections.${idx}.content`, newContent);
                                }}
                                className="w-10 h-10 rounded-lg bg-red-500 text-white hover:bg-red-600 flex items-center justify-center transition-colors"
                                title="Remove data point"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newData = [...(sec.content.data || []), { name: 'New Item', value: 0 }];
                              const newContent = { ...sec.content, data: newData };
                              handleFieldChange(`sections.${idx}.content`, newContent);
                            }}
                            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                          >
                            + Add Data Point
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      {sec.content.chartType === 'pie' && (
                        <PieChart 
                          data={sec.content.data || []} 
                          title={sec.title}
                          height={300}
                        />
                      )}
                      {sec.content.chartType === 'donut' && (
                        <DonutChart 
                          data={sec.content.data || []} 
                          title={sec.title}
                          height={300}
                        />
                      )}
                      {sec.content.chartType === 'bar' && (
                        <BarChart 
                          data={sec.content.data || []} 
                          title={sec.title}
                          height={300}
                          dataKey="value"
                          xAxisDataKey="name"
                          secondaryDataKey={sec.content.data[0]?.sessions ? 'sessions' : undefined}
                        />
                      )}
                      {sec.content.chartType === 'line' && (
                        <LineChart 
                          data={sec.content.data || []} 
                          title={sec.title}
                          height={300}
                          dataKey="value"
                          xAxisDataKey="name"
                          secondaryDataKey={sec.content.data[0]?.bounceRate ? 'bounceRate' : undefined}
                        />
                      )}
                      {sec.content.chartType === 'stackedBar' && (
                        <StackedBarChart 
                          data={sec.content.data || []} 
                          title={sec.title}
                          height={300}
                          dataKeys={Object.keys(sec.content.data[0] || {}).filter(key => key !== 'name')}
                          xAxisDataKey="name"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {editing && (
              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    const newSection: ReportSection = {
                      id: `section-${Date.now()}`,
                      title: 'New Section',
                      type: 'text',
                      content: 'Enter your content here...',
                    };
                    setReports((prev) =>
                      prev.map((rep) => {
                        if (rep.id !== selectedId) return rep;
                        return {
                          ...rep,
                          sections: [...rep.sections, newSection],
                          updatedAt: new Date().toISOString(),
                        };
                      })
                    );
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  + Add Section
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}