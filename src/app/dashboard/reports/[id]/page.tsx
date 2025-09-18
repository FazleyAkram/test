'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ReportData {
  id: number;
  date: string;
  reportTypeId: number;
  reportText: {
    title: string;
    respondents: number;
    responseRate: number;
    sections: {
      title: string;
      type: 'table' | 'text';
      content: any;
    }[];
  };
  commPlaceId: number;
  tutorId: number;
}

export default function ViewReport() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/reports/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch report');
        }

        const data = await response.json();
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [params.id]);

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">Loading report...</div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-red-600 text-center">
            {error || 'Report not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{report.reportText.title}</h1>
              <p className="text-gray-600 mt-2">
                Created on {new Date(report.date).toLocaleDateString()}
              </p>
            </div>
            <div className="space-x-4">
              <button
                onClick={() => router.push(`/dashboard/reports/${report.id}/edit`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Report
              </button>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Export as PDF
              </button>
            </div>
          </div>

          {/* Report Summary */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Respondents</h3>
              <p className="text-2xl font-bold text-blue-600">{report.reportText.respondents}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Response Rate</h3>
              <p className="text-2xl font-bold text-green-600">{report.reportText.responseRate}%</p>
            </div>
          </div>

          {/* Report Sections */}
          <div className="space-y-8">
            {report.reportText.sections.map((section, index) => (
              <div key={index} className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
                
                {section.type === 'table' ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border">
                      <thead>
                        <tr>
                          {section.content.headers.map((header: string, i: number) => (
                            <th key={i} className="border p-2 bg-gray-100 whitespace-normal">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.content.rows.map((row: string[], rowIndex: number) => (
                          <tr key={rowIndex}>
                            {row.map((cell: string, colIndex: number) => (
                              <td key={colIndex} className="border p-2 whitespace-normal max-w-[300px]">
                                <div className="break-words">
                                  {cell}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    {section.content.split('\n').map((paragraph: string, i: number) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 