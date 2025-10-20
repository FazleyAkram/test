'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar.jsx';
import ChatBotWindow from '@/components/ChatBotWindow';
import { ActionButtons, ReportListSidebar, ReportEditor, SlideshowView, ReportsLoadingScreen } from '@/components/reports/ReportComponents';
import { useReports } from '@/hooks/useReports';

export default function ReportsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [showSlideshow, setShowSlideshow] = useState(false);

  const {
    reports,
    selectedId,
    selectedReport,
    editing,
    filters,
    isLoading: reportsLoading,
    setSelectedId,
    setEditing,
    setFilters,
    createReport,
    saveReport,
    deleteReport,
    deleteAllReports,
    updateReportField,
    addSection,
    addChartSection,
    getAvailableEventTypes,
    getDataRange,
  } = useReports(user?.id);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  // Show loading screen while reports are loading
  if (reportsLoading) return <ReportsLoadingScreen />;
  
  if (!user) return null;

  const handleSelectReport = (id: string) => {
    setSelectedId(id);
    setEditing(false);
  };

  const analyseSelectedReport = () => {
    router.push(`/dashboard/summary?reportId=${selectedId}`);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0F0EE' }}>
      <Sidebar />

      <div style={{ flex: 1, marginLeft: '280px', padding: '2rem', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#303D23', marginBottom: '0.5rem', fontFamily: 'Questrial, sans-serif' }}>
                Reports
              </h1>
              <p style={{ fontSize: '1.1rem', color: '#7F8C8D' }}>
                Create and manage your data reports with interactive charts
              </p>
            </div>

            <ActionButtons
              editing={editing}
              hasSelectedReport={!!selectedReport}
              reportCount={reports.length}
              onEdit={() => setEditing(true)}
              onAnalyse={() => analyseSelectedReport()}
              onNewReport={createReport}
              onSave={() => saveReport(selectedId)}
              onCancel={() => setEditing(false)}
              onSlideshow={() => setShowSlideshow(true)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <ReportListSidebar
              reports={reports}
              selectedId={selectedId}
              onSelectReport={handleSelectReport}
              onDeleteReport={deleteReport}
            />

            <ReportEditor
              report={selectedReport || undefined}
              editing={editing}
              onFieldChange={updateReportField}
              onAddSection={addSection}
              onAddChartSection={addChartSection}
              filters={filters}
              onFiltersChange={setFilters}
              availableEventTypes={getAvailableEventTypes()}
              dataRange={getDataRange()}
            />
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsChatOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '4rem',
          height: '4rem',
          background: 'linear-gradient(135deg, #E59853, #FF6F61)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          boxShadow: '0 4px 20px rgba(229, 152, 83, 0.3)',
          cursor: 'pointer',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Chat with CODi"
      >
        <svg style={{ width: '2rem', height: '2rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      <ChatBotWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      
      {showSlideshow && selectedReport && (() => {
        const range = getDataRange();
        return (
          <SlideshowView
            report={selectedReport}
            filters={filters}
            onFiltersChange={setFilters}
            availableEventTypes={getAvailableEventTypes()}
            dataRange={{ min: range.minDate, max: range.maxDate }}
            onClose={() => setShowSlideshow(false)}
          />
        );
      })()}
    </div>
  );
}