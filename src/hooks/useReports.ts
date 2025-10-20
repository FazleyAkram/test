import { useState, useEffect } from 'react';
import { FilterState } from '@/components/reports/FilterPanel';
import { useNotificationHelpers } from '@/context/NotificationContext';

interface ReportSection {
  id: string;
  title: string;
  type: 'text' | 'table' | 'chart';
  content: any;
}

export interface ReportItem {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  sections: ReportSection[];
}

export function useReports(userId: number | undefined) {
  // state for managing reports list, selected report, and edit mode
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [editing, setEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Filter state management
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { startDate: '', endDate: '', enabled: false },
    eventTypes: { selected: [], enabled: false },
    metrics: { minSessions: 0, maxSessions: 1000, minEvents: 0, maxEvents: 1000, enabled: false },
    searchTerm: ''
  });

  // Notification helpers
  const { showSuccess, showError, confirm } = useNotificationHelpers();

  // load reports from api when user changes
  useEffect(() => {
    const loadReports = async () => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/reports/load`);
        if (!res.ok) return;
        const data = await res.json();

        const items: ReportItem[] = (data.reports || []).map((r: any) => ({
          id: String(r.id),
          name: r.name,
          description: r.description ?? r.content?.description ?? '',
          createdAt: r.createdAt ?? r.content?.createdAt ?? new Date().toISOString(),
          updatedAt: r.updatedAt ?? r.content?.updatedAt ?? new Date().toISOString(),
          sections: r.sections ?? r.content?.sections ?? [],
        }));

        setReports(items);
        if (items.length > 0) setSelectedId(items[0].id);
      } catch (error) {
        console.error('Failed to load reports:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadReports();
  }, [userId]);

  // create new report
  const createReport = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    const newReport: ReportItem = {
      id: `report-${Date.now()}`,
      name: `New Report (${dateStr})`,
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
  };

  //save report and update local state
  const saveReport = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    const updatedReport = {
      ...report,
      updatedAt: new Date().toISOString(),
    };

    try {
      await fetch('/api/reports/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report: updatedReport }),
      });

      setReports((prev) =>
        prev.map((rep) => (rep.id === reportId ? updatedReport : rep))
      );
      setEditing(false);
      showSuccess('Report Saved', 'Report saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      showError('Save Failed', 'Failed to save report');
    }
  };

  // Delete single report with confirmation 
  const deleteReport = async (reportId: string) => {
    const confirmed = await confirm(
      'Delete Report',
      'Are you sure you want to delete this report? This action cannot be undone.',
      'danger'
    );
    
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/reports/delete/${reportId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete report');
      }

      setReports((prev) => prev.filter((rep) => rep.id !== reportId));

      if (selectedId === reportId) {
        const remainingReports = reports.filter((rep) => rep.id !== reportId);
        setSelectedId(remainingReports.length > 0 ? remainingReports[0].id : '');
      }

      showSuccess('Report Deleted', 'Report deleted successfully!');
    } catch (error: any) {
      console.error('Delete report error:', error);
      showError('Delete Failed', `Failed to delete report: ${error.message || 'Unknown error'}`);
    }
  };

  // delete all reports with confirmation
  const deleteAllReports = async () => {
    const confirmed = await confirm(
      'Delete All Reports',
      `Are you sure you want to delete ALL ${reports.length} reports? This action cannot be undone.`,
      'danger'
    );
    
    if (!confirmed) return;

    try {
      const deletePromises = reports.map(report =>
        fetch(`/api/reports/delete/${report.id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);

      setReports([]);
      setSelectedId('');

      showSuccess('All Reports Deleted', 'All reports deleted successfully!');
    } catch (error: any) {
      console.error('Delete all reports error:', error);
      showError('Delete Failed', `Failed to delete all reports: ${error.message || 'Unknown error'}`);
    }
  };

  // Update report field 
  const updateReportField = (path: string, value: any) => {
    setReports((prev) =>
      prev.map((rep) => {
        if (rep.id !== selectedId) return rep;

        const updated = structuredClone(rep);
        const parts = path.split('.');

        // navigates to the parent object
        let current: any = updated;
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];

          // handles array notatio ie sections.0 → sections[0]
          if (part === 'sections' && i + 1 < parts.length) {
            const index = Number(parts[i + 1]);
            current = current.sections[index];
            i++; // move further in iteration
          } else {
            current = current[part];
          }
        }

        // final value set 
        const lastKey = parts[parts.length - 1];
        current[lastKey] = value;

        updated.updatedAt = new Date().toISOString();
        return updated;
      })
    );
  };

  // add new text 
  const addSection = () => {
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
  };

  // add new chart section
  const addChartSection = (chartType: string) => {
    const newSection: ReportSection = {
      id: `section-${Date.now()}`,
      title: chartType === 'sessionsUsers' ? 'Sessions & Users Trend' : 
             chartType === 'bounceRate' ? 'Bounce Rate Trend' : 'New Chart',
      type: 'chart',
      content: {
        chartType,
        data: chartType === 'sessionsUsers' || chartType === 'bounceRate' ? [] : [
          { name: 'Sample Data', value: 100 }
        ],
        marketingData: null // Will be populated when data is available
      },
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

    // For marketing charts, try to fetch data
    if (chartType === 'sessionsUsers' || chartType === 'bounceRate') {
      fetchMarketingDataForChart(newSection.id, chartType);
    }
  };

  // Fetch marketing data for charts
  const fetchMarketingDataForChart = async (sectionId: string, chartType: string) => {
    try {
      // Get the first available marketing import
      const importsResponse = await fetch('/api/marketing/import');
      const importsData = await importsResponse.json();
      
      if (importsData.imports && importsData.imports.length > 0) {
        const firstImport = importsData.imports[0];
        const analyticsResponse = await fetch(`/api/marketing/analytics/${firstImport.id}`);
        const analyticsData = await analyticsResponse.json();
        
        if (analyticsData.metrics) {
          // Update the section with the marketing data
          setReports((prev) =>
            prev.map((rep) => {
              if (rep.id !== selectedId) return rep;
              return {
                ...rep,
                sections: rep.sections.map(section => {
                  if (section.id === sectionId) {
                    return {
                      ...section,
                      content: {
                        ...section.content,
                        marketingData: analyticsData.metrics
                      }
                    };
                  }
                  return section;
                }),
                updatedAt: new Date().toISOString(),
              };
            })
          );
        }
      }
    } catch (error) {
      console.error('Error fetching marketing data for chart:', error);
    }
  };

  // Filtering logic
  const filterTableData = (rows: string[][], headers: string[], sectionTitle: string) => {
    if (!rows || rows.length === 0) return rows;

    let filteredRows = rows;

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredRows = filteredRows.filter(row => 
        row.some(cell => cell.toLowerCase().includes(searchLower))
      );
    }

    // Date range filter (for sections with date columns)
    if (filters.dateRange.enabled && filters.dateRange.startDate && filters.dateRange.endDate) {
      const dateColumnIndex = headers.findIndex(header => 
        header.toLowerCase().includes('date') || header.toLowerCase().includes('time')
      );
      
      if (dateColumnIndex !== -1) {
        filteredRows = filteredRows.filter(row => {
          const cellDate = row[dateColumnIndex];
          if (!cellDate) return true;
          
          // Handle different date formats
          let dateValue: Date;
          if (cellDate.includes('-')) {
            dateValue = new Date(cellDate);
          } else if (cellDate.includes('/')) {
            const parts = cellDate.split('/');
            dateValue = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          } else {
            return true; // Skip if format is unknown
          }
          
          const startDate = new Date(filters.dateRange.startDate);
          const endDate = new Date(filters.dateRange.endDate);
          
          return dateValue >= startDate && dateValue <= endDate;
        });
      }
    }

    // Event type filter (for Events section)
    if (filters.eventTypes.enabled && filters.eventTypes.selected.length > 0 && sectionTitle.toLowerCase().includes('event')) {
      const eventColumnIndex = headers.findIndex(header => 
        header.toLowerCase().includes('event')
      );
      
      if (eventColumnIndex !== -1) {
        filteredRows = filteredRows.filter(row => {
          const eventName = row[eventColumnIndex];
          return filters.eventTypes.selected.includes(eventName);
        });
      }
    }

    // Metrics filter (for sessions/events metrics)
    if (filters.metrics.enabled) {
      const sessionsColumnIndex = headers.findIndex(header => 
        header.toLowerCase().includes('session')
      );
      const eventsColumnIndex = headers.findIndex(header => 
        header.toLowerCase().includes('event') && header.toLowerCase().includes('count')
      );

      filteredRows = filteredRows.filter(row => {
        let passesFilter = true;

        // Sessions filter
        if (sessionsColumnIndex !== -1) {
          const sessions = parseInt(row[sessionsColumnIndex]) || 0;
          if (sessions < filters.metrics.minSessions || sessions > filters.metrics.maxSessions) {
            passesFilter = false;
          }
        }

        // Events filter
        if (eventsColumnIndex !== -1) {
          const events = parseInt(row[eventsColumnIndex]) || 0;
          if (events < filters.metrics.minEvents || events > filters.metrics.maxEvents) {
            passesFilter = false;
          }
        }

        return passesFilter;
      });
    }

    return filteredRows;
  };

  const filterChartData = (data: any[], sectionTitle: string) => {
    if (!data || data.length === 0) return data;

    let filteredData = data;

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.name && item.name.toLowerCase().includes(searchLower)
      );
    }

    // Date range filter for chart data with date names
    if (filters.dateRange.enabled && filters.dateRange.startDate && filters.dateRange.endDate) {
      filteredData = filteredData.filter(item => {
        if (!item.name) return true;
        
        // Try to parse date from name field
        let dateValue: Date;
        if (item.name.includes('-')) {
          dateValue = new Date(item.name);
        } else if (item.name.includes('/')) {
          const parts = item.name.split('/');
          dateValue = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
          return true; // Skip if format is unknown
        }
        
        const startDate = new Date(filters.dateRange.startDate);
        const endDate = new Date(filters.dateRange.endDate);
        
        return dateValue >= startDate && dateValue <= endDate;
      });
    }

    // Event type filter for charts
    if (filters.eventTypes.enabled && filters.eventTypes.selected.length > 0 && sectionTitle.toLowerCase().includes('event')) {
      filteredData = filteredData.filter(item => {
        return item.name && filters.eventTypes.selected.includes(item.name);
      });
    }

    // Metrics filter for chart data
    if (filters.metrics.enabled) {
      filteredData = filteredData.filter(item => {
        const value = item.value || 0;
        return value >= filters.metrics.minSessions && value <= filters.metrics.maxSessions;
      });
    }

    return filteredData;
  };

  // Get available event types from current report data
  const getAvailableEventTypes = () => {
    const selectedReport = reports.find(r => r.id === selectedId);
    if (!selectedReport) return [];

    const eventTypes = new Set<string>();
    
    selectedReport.sections.forEach(section => {
      if (section.type === 'table' && section.content?.headers && section.content?.rows) {
        const eventColumnIndex = section.content.headers.findIndex((header: string) => 
          header.toLowerCase().includes('event')
        );
        
        if (eventColumnIndex !== -1) {
          section.content.rows.forEach((row: string[]) => {
            if (row[eventColumnIndex]) {
              eventTypes.add(row[eventColumnIndex]);
            }
          });
        }
      }
    });

    return Array.from(eventTypes).sort();
  };

  // Get data range from current report
  const getDataRange = () => {
    const selectedReport = reports.find(r => r.id === selectedId);
    if (!selectedReport) return { minDate: '', maxDate: '' };

    const dates: string[] = [];
    
    selectedReport.sections.forEach(section => {
      if (section.type === 'table' && section.content?.headers && section.content?.rows) {
        const dateColumnIndex = section.content.headers.findIndex((header: string) => 
          header.toLowerCase().includes('date')
        );
        
        if (dateColumnIndex !== -1) {
          section.content.rows.forEach((row: string[]) => {
            if (row[dateColumnIndex]) {
              dates.push(row[dateColumnIndex]);
            }
          });
        }
      }
    });

    if (dates.length === 0) return { minDate: '', maxDate: '' };

    const sortedDates = dates.sort();
    return {
      minDate: sortedDates[0],
      maxDate: sortedDates[sortedDates.length - 1]
    };
  };

  // Apply filters to current report
  const getFilteredReport = () => {
    const selectedReport = reports.find(r => r.id === selectedId);
    if (!selectedReport) return null;

    const filteredSections = selectedReport.sections.map(section => {
      if (section.type === 'table' && section.content?.headers && section.content?.rows) {
        const filteredRows = filterTableData(section.content.rows, section.content.headers, section.title);
        return {
          ...section,
          content: {
            ...section.content,
            rows: filteredRows
          }
        };
      } else if (section.type === 'chart' && section.content?.data) {
        const filteredData = filterChartData(section.content.data, section.title);
        return {
          ...section,
          content: {
            ...section.content,
            data: filteredData
          }
        };
      }
      return section;
    });

    return {
      ...selectedReport,
      sections: filteredSections
    };
  };

  return {
    reports,
    selectedId,
    selectedReport: getFilteredReport(),
    editing,
    filters,
    isLoading,
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
  };
}
