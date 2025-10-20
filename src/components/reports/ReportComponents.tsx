import React, { useState, useEffect } from 'react';
import { PieChart, BarChart, LineChart, StackedBarChart, DonutChart } from '@/components/charts';
import { FilterPanel, FilterState } from './FilterPanel';
import { SessionsUsersChart, BounceRateChart } from '@/components/marketing/MarketingCharts';

//button styles

const buttonStyles = {
  orange: {
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    background: '#E59853',
    color: 'white',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease'
  },
  analysis: {
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #A3BCBA, #365B5E)',
    color: 'white',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    justifyContent: 'center'
  },
  green: {
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #365B5E, #A3BCBA)',
    color: 'white',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease'
  },
  red: {
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    background: '#e74c3c',
    color: 'white',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease'
  },
  blue: {
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #3AB0FF, #00C49F)',
    color: 'white',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease'
  },
  gray: {
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    background: '#95a5a6',
    color: 'white',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease'
  }
};

//types

interface ReportSection {
  id: string;
  title: string;
  type: 'text' | 'table' | 'chart';
  content: any;
}

interface ReportItem {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  sections: ReportSection[];
}

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface ChartContent {
  chartType: string;
  data: ChartData[];
  marketingData?: any; // For marketing-specific charts
}

//table component

interface TableSectionProps {
  headers: string[];
  rows: string[][];
  editing: boolean;
  onCellChange: (rowIndex: number, colIndex: number, value: string) => void;
}

export function TableSection({ headers, rows, editing, onCellChange }: TableSectionProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
      <table className="min-w-full">
        <thead>
          <tr className="bg-purple-50">
            {headers.map((header, i) => (
              <th key={i} className="border border-gray-200 p-3 text-left font-semibold text-gray-800">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {row.map((cell, colIndex) => (
                <td key={colIndex} className="border border-gray-200 p-3">
                  <input
                    className="w-full bg-transparent outline-none text-gray-800"
                    value={cell}
                    onChange={(e) => editing && onCellChange(rowIndex, colIndex, e.target.value)}
                    disabled={!editing}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

//chart component

interface ChartSectionProps {
  content: ChartContent;
  title: string;
  editing: boolean;
  onContentChange: (newContent: ChartContent) => void;
}

export function ChartSection({ content, title, editing, onContentChange }: ChartSectionProps) {
  const updateChartType = (chartType: string) => {
    onContentChange({ ...content, chartType });
  };

  const updateDataPoint = (index: number, field: 'name' | 'value', value: string | number) => {
    const newData = [...content.data];
    newData[index] = { ...newData[index], [field]: value };
    onContentChange({ ...content, data: newData });
  };

  const removeDataPoint = (index: number) => {
    const newData = content.data.filter((_, i) => i !== index);
    onContentChange({ ...content, data: newData });
  };

  const addDataPoint = () => {
    const newData = [...content.data, { name: 'New Item', value: 0 }];
    onContentChange({ ...content, data: newData });
  };

  const renderChart = () => {
    const chartType = content.chartType || 'pie';
    const data = content.data || [];

    const chartProps = {
      data,
      title,
      height: 300,
      darkTheme: true
    };

    // Handle marketing-specific charts
    if (chartType === 'sessionsUsers' || chartType === 'bounceRate') {
      if (!content.marketingData) {
        return (
          <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
            <p>No marketing data available for this chart.</p>
            <p className="text-sm mt-2">Please sync Google Analytics data first.</p>
          </div>
        );
      }
      
      // Render specific marketing charts
      if (chartType === 'sessionsUsers') {
        return (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Sessions & Users Trend</h3>
            <SessionsUsersChart metrics={content.marketingData} height={300} showContainer={true} />
          </div>
        );
      }
      
      if (chartType === 'bounceRate') {
        return (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Bounce Rate Trend</h3>
            <BounceRateChart metrics={content.marketingData} height={300} showContainer={true} />
          </div>
        );
      }
    }

    switch (chartType) {
      case 'pie':
        return <PieChart {...chartProps} />;
      case 'donut':
        return <DonutChart {...chartProps} />;
      case 'bar':
        return (
          <BarChart
            {...chartProps}
            dataKey="value"
            xAxisDataKey="name"
            secondaryDataKey={data[0]?.sessions ? 'sessions' : undefined}
          />
        );
      case 'line':
        return (
          <LineChart
            {...chartProps}
            dataKey="value"
            xAxisDataKey="name"
            secondaryDataKey={data[0]?.bounceRate ? 'bounceRate' : undefined}
          />
        );
      case 'stackedBar':
        return (
          <StackedBarChart
            {...chartProps}
            dataKeys={Object.keys(data[0] || {}).filter(key => key !== 'name')}
            xAxisDataKey="name"
          />
        );
      default:
        return <PieChart {...chartProps} />;
    }
  };

  return (
    <div className="space-y-6">
      {editing && (
        <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
          <div className="flex gap-4 items-center">
            <label className="text-gray-700 font-medium">Chart Type:</label>
            <select
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              value={content.chartType || 'pie'}
              onChange={(e) => updateChartType(e.target.value)}
            >
              <option value="pie">Pie Chart</option>
              <option value="donut">Donut Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="stackedBar">Stacked Bar Chart</option>
              <option value="sessionsUsers">Sessions & Users Trend</option>
              <option value="bounceRate">Bounce Rate Trend</option>
            </select>
          </div>

          {/* Only show chart data editing for non-marketing charts */}
          {content.chartType !== 'sessionsUsers' && content.chartType !== 'bounceRate' && (
            <>
              <div className="text-gray-700 font-medium">Chart Data:</div>
              <div className="space-y-3">
                {(content.data || []).map((item, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <input
                      className="flex-1 p-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-purple-500"
                      placeholder="Name"
                      value={item.name || ''}
                      onChange={(e) => updateDataPoint(index, 'name', e.target.value)}
                    />
                    <input
                      className="w-24 p-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-purple-500"
                      placeholder="Value"
                      type="number"
                      value={item.value || ''}
                      onChange={(e) => updateDataPoint(index, 'value', Number(e.target.value))}
                    />
                    <button
                      onClick={() => removeDataPoint(index)}
                      className="w-10 h-10 rounded-lg bg-red-500 text-white hover:bg-red-600 flex items-center justify-center transition-colors"
                      title="Remove data point"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={addDataPoint}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  + Add Data Point
                </button>
              </div>
            </>
          )}

          {/* Show info for marketing charts */}
          {(content.chartType === 'sessionsUsers' || content.chartType === 'bounceRate') && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-800 font-medium">Marketing Data Chart</span>
              </div>
              <p className="text-blue-700 text-sm">
                This chart uses real-time data from your Google Analytics integration. 
                Data will be automatically updated when you sync your analytics.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-600 shadow-sm">
        {renderChart()}
      </div>
    </div>
  );
}

//section editor

interface SectionEditorProps {
  section: ReportSection;
  editing: boolean;
  canDelete: boolean;
  onTitleChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onContentChange: (value: any) => void;
  onDelete: () => void;
}

export function SectionEditor({
  section,
  editing,
  canDelete,
  onTitleChange,
  onTypeChange,
  onContentChange,
  onDelete
}: SectionEditorProps) {

  const handleTableCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const currentRows: string[][] = Array.isArray(section.content?.rows) ? section.content.rows : [];
    const newRows = currentRows.map((row: string[], rIdx: number) =>
      rIdx === rowIndex
        ? row.map((cell: string, cIdx: number) => (cIdx === colIndex ? value : cell))
        : row
    );
    onContentChange({ ...(section.content || {}), rows: newRows });
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-gray-700 font-medium">Section Title</label>
        <div className="flex gap-3">
          {editing && (
            <select
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              value={section.type}
              onChange={(e) => onTypeChange(e.target.value)}
            >
              <option value="text">Text</option>
              <option value="table">Table</option>
              <option value="chart">Chart</option>
            </select>
          )}
          {editing && canDelete && (
            <button
              onClick={onDelete}
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
        value={section.title}
        onChange={(e) => editing && onTitleChange(e.target.value)}
        disabled={!editing}
      />

      {section.type === 'text' && (
        <textarea
          rows={6}
          className="w-full p-4 rounded-xl border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 leading-relaxed"
          value={section.content}
          onChange={(e) => editing && onContentChange(e.target.value)}
          disabled={!editing}
        />
      )}

      {section.type === 'table' && (
        Array.isArray(section.content?.headers) && Array.isArray(section.content?.rows) ? (
          <TableSection
            headers={section.content.headers}
            rows={section.content.rows}
            editing={editing}
            onCellChange={handleTableCellChange}
          />
        ) : (
          <div className="bg-white rounded-xl p-6 border border-gray-200 text-gray-600">
            No table data available for this section.
          </div>
        )
      )}

      {section.type === 'chart' && (
        <ChartSection
          content={section.content}
          title={section.title}
          editing={editing}
          onContentChange={onContentChange}
        />
      )}
    </div>
  );
}

// Loading component for reports
export function ReportsLoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated logo/icon */}
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          {/* Rotating ring */}
          <div className="absolute inset-0 w-20 h-20 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-2xl animate-spin"></div>
        </div>

        {/* Loading text */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-800 animate-pulse">Loading Reports</h2>
          <p className="text-gray-600 text-lg">Fetching your data reports...</p>
          
          {/* Animated dots */}
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-8 w-64 mx-auto">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Processing report data...</p>
        </div>

        {/* Loading tips */}
        <div className="mt-12 max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 Loading Tips</h3>
            <ul className="text-sm text-gray-600 space-y-2 text-left">
              <li>• Large reports may take a moment to load</li>
              <li>• Charts and analytics data are being processed</li>
              <li>• Your data is secure and private</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

//action buttons

interface ActionButtonsProps {
  editing: boolean;
  hasSelectedReport: boolean;
  reportCount: number;
  onEdit: () => void;
  onAnalyse: () => void;
  onNewReport: () => void;
  onSave: () => void;
  onCancel: () => void;
  onSlideshow?: () => void;
}

export function ActionButtons({
  editing,
  hasSelectedReport,
  reportCount,
  onEdit,
  onAnalyse,
  onNewReport,
  onSave,
  onCancel,
  onSlideshow
}: ActionButtonsProps) {
  return (
    <div className="flex gap-3">
      {!editing ? (
        <>
          <button
            onClick={onEdit}
            style={buttonStyles.orange}
            disabled={!hasSelectedReport}
          >
            Edit
          </button>
          <button
            onClick={onAnalyse}
            style={buttonStyles.analysis}
            disabled={!hasSelectedReport}
          >
            <img 
              src="/logos/side.png" 
              alt="CODi Logo"
              className="logo-image"
              style={{ width: '50px', transform: 'scale(3)', transformOrigin: 'center' }}
            /> 
            Analysis
          </button>
          {hasSelectedReport && onSlideshow && (
            <button
              onClick={onSlideshow}
              style={buttonStyles.blue}
            >
              Slideshow View
            </button>
          )}
          <button
            onClick={onNewReport}
            style={buttonStyles.green}
          >
            + New Report
          </button>
        </>
      ) : (
        <>
          <button onClick={onSave} style={buttonStyles.orange}>
            Save
          </button>
          <button onClick={onCancel} style={buttonStyles.orange}>
            Cancel
          </button>
        </>
      )}
    </div>
  );
}

//report list sidebar

interface ReportListSidebarProps {
  reports: ReportItem[];
  selectedId: string;
  onSelectReport: (id: string) => void;
  onDeleteReport: (id: string) => void;
}

export function ReportListSidebar({
  reports,
  selectedId,
  onSelectReport,
  onDeleteReport
}: ReportListSidebarProps) {
  return (
    <div className="lg:col-span-1 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl h-max">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Reports</h3>
      <ul className="space-y-3">
        {reports.length === 0 && (
          <li className="text-gray-500">No reports yet. Link your GA data.</li>
        )}
        {reports.map((report) => (
          <li key={report.id}>
            <div className="relative group">
              <button
                onClick={() => onSelectReport(report.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedId === report.id
                    ? 'border-purple-400 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <div className="font-semibold text-gray-800 pr-8">{report.name}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {report.updatedAt ? `Updated ${new Date(report.updatedAt).toLocaleDateString()}` : ''}
                </div>
              </button>

              <button
                onClick={() => onDeleteReport(report.id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white hover:bg-red-600 text-sm flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                title="Delete report"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

//report editor

interface ReportEditorProps {
  report: ReportItem | undefined;
  editing: boolean;
  onFieldChange: (path: string, value: any) => void;
  onAddSection: () => void;
  onAddChartSection: (chartType: string) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableEventTypes: string[];
  dataRange: { minDate: string; maxDate: string };
}

export function ReportEditor({
  report,
  editing,
  onFieldChange,
  onAddSection,
  onAddChartSection,
  filters,
  onFiltersChange,
  availableEventTypes,
  dataRange
}: ReportEditorProps) {
  const [showChartDropdown, setShowChartDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.chart-dropdown-container')) {
        setShowChartDropdown(false);
      }
    };

    if (showChartDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showChartDropdown]);

  if (!report) {
    return <div className="text-gray-600">No report selected.</div>;
  }

  const handleSectionFieldChange = (sectionIndex: number, field: string, value: any) => {
    onFieldChange(`sections.${sectionIndex}.${field}`, value);
  };

  const handleDeleteSection = (sectionIndex: number) => {
    const newSections = report.sections.filter((_, i) => i !== sectionIndex);
    onFieldChange('sections', newSections);
  };

  const SectionSpecificFilter = ({ sectionTitle, sectionContent }: { sectionTitle: string; sectionContent: any }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFiltered, setIsFiltered] = useState(false);
    
    // Store original data and filtered data
    const [originalData, setOriginalData] = useState(sectionContent);
    const [filteredData, setFilteredData] = useState(sectionContent);

    // Update original data when sectionContent changes
    useEffect(() => {
      if (sectionContent && !originalData) {
        setOriginalData(sectionContent);
        setFilteredData(sectionContent);
      }
    }, [sectionContent, originalData]);
    
    // Determine section type and available options
    const isSessionsSection = sectionTitle.toLowerCase().includes('session');
    const isEventsSection = sectionTitle.toLowerCase().includes('event');
    const isConversionsSection = sectionTitle.toLowerCase().includes('conversion');
    const isCampaignsSection = sectionTitle.toLowerCase().includes('campaign');
    
    // Extract available data for filters
    const getAvailableOptions = () => {
      // Always use original data for extracting options, not filtered data
      const dataToUse = originalData || sectionContent;
      if (dataToUse?.headers && dataToUse?.rows) {
        const options: { [key: string]: string[] } = {};
        
        dataToUse.headers.forEach((header: string, index: number) => {
          if (isEventsSection) {
            // Look for the Event column specifically
            if (header.toLowerCase() === 'event') {
              // Extract all unique values from the Event column
              const eventNames = dataToUse.rows
                .map((row: string[]) => row[index])
                .filter(Boolean)
                .filter((name: string) => {
                  const str = String(name).trim();
                  // Keep only non-numeric values (event names)
                  return isNaN(Number(str)) && str !== '';
                });
              options.events = Array.from(new Set<string>(eventNames as string[]));
            }
          }
          if (header.toLowerCase().includes('campaign') && isCampaignsSection) {
            const values = dataToUse.rows.map((row: string[]) => row[index]).filter(Boolean) as string[];
            options.campaigns = Array.from(new Set<string>(values));
          }
          if (header.toLowerCase().includes('source') && isCampaignsSection) {
            const values = dataToUse.rows.map((row: string[]) => row[index]).filter(Boolean) as string[];
            options.sources = Array.from(new Set<string>(values));
          }
        });
        
        return options;
      }
      return {};
    };

    const availableOptions = getAvailableOptions();
    const hasDateColumn = sectionContent?.headers?.some((h: string) => h.toLowerCase().includes('date'));
    
    // Debug logging
    console.log('Events section debug:', {
      sectionTitle,
      isEventsSection,
      headers: sectionContent?.headers,
      availableOptions,
      sampleRows: sectionContent?.rows?.slice(0, 3)
    });
    
    // Section-specific filter state
    const [sectionFilters, setSectionFilters] = useState({
      dateRange: { enabled: false, startDate: '', endDate: '' },
      searchTerm: '',
      selectedEvents: [] as string[],
      selectedCampaigns: [] as string[],
      selectedSources: [] as string[],
      minSessions: 0,
      maxSessions: 1000,
      minEvents: 0,
      maxEvents: 1000,
    });

    // Apply filters to the data
    const applyFilters = () => {
      if (!originalData?.headers || !originalData?.rows) return;

      let filteredRows = [...originalData.rows];

      // Search filter
      if (sectionFilters.searchTerm) {
        const searchLower = sectionFilters.searchTerm.toLowerCase();
        filteredRows = filteredRows.filter((row: string[]) => 
          row.some((cell: string) => cell.toLowerCase().includes(searchLower))
        );
      }

      // Date range filter
      if (sectionFilters.dateRange.enabled && sectionFilters.dateRange.startDate && sectionFilters.dateRange.endDate) {
        const dateColumnIndex = originalData.headers.findIndex((header: string) => 
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
            
            const startDate = new Date(sectionFilters.dateRange.startDate);
            const endDate = new Date(sectionFilters.dateRange.endDate);
            
            return dateValue >= startDate && dateValue <= endDate;
          });
        }
      }

      // Event type filter
      if (sectionFilters.selectedEvents.length > 0 && isEventsSection) {
        const eventColumnIndex = originalData.headers.findIndex((header: string) => 
          header.toLowerCase() === 'event'
        );
        
        if (eventColumnIndex !== -1) {
          filteredRows = filteredRows.filter(row => {
            const eventName = row[eventColumnIndex];
            return sectionFilters.selectedEvents.includes(eventName);
          });
        }
      }

      // Campaign filter
      if (sectionFilters.selectedCampaigns.length > 0 && isCampaignsSection) {
        const campaignColumnIndex = originalData.headers.findIndex((header: string) => 
          header.toLowerCase().includes('campaign')
        );
        
        if (campaignColumnIndex !== -1) {
          filteredRows = filteredRows.filter(row => {
            const campaignName = row[campaignColumnIndex];
            return sectionFilters.selectedCampaigns.includes(campaignName);
          });
        }
      }

      // Source filter
      if (sectionFilters.selectedSources.length > 0 && isCampaignsSection) {
        const sourceColumnIndex = originalData.headers.findIndex((header: string) => 
          header.toLowerCase().includes('source')
        );
        
        if (sourceColumnIndex !== -1) {
          filteredRows = filteredRows.filter(row => {
            const sourceName = row[sourceColumnIndex];
            return sectionFilters.selectedSources.includes(sourceName);
          });
        }
      }

      // Metrics filter
      const sessionsColumnIndex = originalData.headers.findIndex((header: string) => 
        header.toLowerCase().includes('session')
      );
      const eventsColumnIndex = originalData.headers.findIndex((header: string) => 
        header.toLowerCase().includes('event') && header.toLowerCase().includes('count')
      );

      filteredRows = filteredRows.filter(row => {
        let passesFilter = true;

        // Sessions filter
        if (sessionsColumnIndex !== -1) {
          const sessions = parseInt(row[sessionsColumnIndex]) || 0;
          if (sessions < sectionFilters.minSessions || sessions > sectionFilters.maxSessions) {
            passesFilter = false;
          }
        }

        // Events filter
        if (eventsColumnIndex !== -1) {
          const events = parseInt(row[eventsColumnIndex]) || 0;
          if (events < sectionFilters.minEvents || events > sectionFilters.maxEvents) {
            passesFilter = false;
          }
        }

        return passesFilter;
      });

      // Update the section content with filtered data
      const newFilteredData = {
        ...originalData,
        rows: filteredRows
      };
      
      setFilteredData(newFilteredData);
      setIsFiltered(true);
      
      // Update the parent component's section content
      const sectionIndex = report?.sections.findIndex(s => s.title === sectionTitle);
      if (sectionIndex !== undefined && sectionIndex !== -1) {
        onFieldChange(`sections.${sectionIndex}.content`, newFilteredData);
      }
    };

    const clearAllFilters = () => {
      setSectionFilters({
        dateRange: { enabled: false, startDate: '', endDate: '' },
        searchTerm: '',
        selectedEvents: [],
        selectedCampaigns: [],
        selectedSources: [],
        minSessions: 0,
        maxSessions: 1000,
        minEvents: 0,
        maxEvents: 1000,
      });
      
      // Reset to original data
      setFilteredData(originalData);
      setIsFiltered(false);
      
      // Update the parent component's section content with original data
      const sectionIndex = report?.sections.findIndex(s => s.title === sectionTitle);
      if (sectionIndex !== undefined && sectionIndex !== -1) {
        onFieldChange(`sections.${sectionIndex}.content`, originalData);
      }
    };

    const toggleEvent = (eventName: string) => {
      setSectionFilters(prev => ({
        ...prev,
        selectedEvents: prev.selectedEvents.includes(eventName)
          ? prev.selectedEvents.filter(e => e !== eventName)
          : [...prev.selectedEvents, eventName]
      }));
    };

    const toggleCampaign = (campaignName: string) => {
      setSectionFilters(prev => ({
        ...prev,
        selectedCampaigns: prev.selectedCampaigns.includes(campaignName)
          ? prev.selectedCampaigns.filter(c => c !== campaignName)
          : [...prev.selectedCampaigns, campaignName]
      }));
    };

    const toggleSource = (sourceName: string) => {
      setSectionFilters(prev => ({
        ...prev,
        selectedSources: prev.selectedSources.includes(sourceName)
          ? prev.selectedSources.filter(s => s !== sourceName)
          : [...prev.selectedSources, sourceName]
      }));
    };

    const hasActiveFilters = () => {
      return sectionFilters.dateRange.enabled ||
             sectionFilters.searchTerm.length > 0 ||
             sectionFilters.selectedEvents.length > 0 ||
             sectionFilters.selectedCampaigns.length > 0 ||
             sectionFilters.selectedSources.length > 0 ||
             sectionFilters.minSessions > 0 ||
             sectionFilters.maxSessions < 1000 ||
             sectionFilters.minEvents > 0 ||
             sectionFilters.maxEvents < 1000;
    };

    const hasFilterChanges = () => {
      return hasActiveFilters() && !isFiltered;
    };

    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-semibold" style={{ color: '#4F46E5' }}>
              {sectionTitle} Filters
            </h4>
            {hasActiveFilters() && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Active
              </span>
            )}
            {isFiltered && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Applied
              </span>
            )}
            {hasFilterChanges() && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                Pending
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasFilterChanges() && (
              <button
                onClick={applyFilters}
                className="px-3 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors font-medium"
              >
                Apply Filters
              </button>
            )}
            <button
              onClick={clearAllFilters}
              className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2 py-1 text-xs bg-white hover:bg-gray-50 rounded border transition-colors"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 space-y-4">
            {/* Search */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search in this section..."
                value={sectionFilters.searchTerm}
                onChange={(e) => setSectionFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Date Range */}
            {hasDateColumn && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={sectionFilters.dateRange.enabled}
                    onChange={(e) => setSectionFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, enabled: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="text-xs font-medium text-gray-700">Date Range</label>
                </div>
                {sectionFilters.dateRange.enabled && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={sectionFilters.dateRange.startDate}
                      onChange={(e) => setSectionFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, startDate: e.target.value }
                      }))}
                      className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      value={sectionFilters.dateRange.endDate}
                      onChange={(e) => setSectionFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, endDate: e.target.value }
                      }))}
                      className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Events Filter */}
            {isEventsSection && availableOptions.events && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Event Types</label>
                <div className="max-h-24 overflow-y-auto border border-gray-200 rounded p-2 space-y-1">
                  {availableOptions.events.map((event: string) => (
                    <label key={event} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={sectionFilters.selectedEvents.includes(event)}
                        onChange={() => toggleEvent(event)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-700">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Campaigns Filter */}
            {isCampaignsSection && availableOptions.campaigns && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Campaigns</label>
                <div className="max-h-24 overflow-y-auto border border-gray-200 rounded p-2 space-y-1">
                  {availableOptions.campaigns.map((campaign: string) => (
                    <label key={campaign} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={sectionFilters.selectedCampaigns.includes(campaign)}
                        onChange={() => toggleCampaign(campaign)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-700">{campaign}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Sources Filter */}
            {isCampaignsSection && availableOptions.sources && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Sources</label>
                <div className="max-h-24 overflow-y-auto border border-gray-200 rounded p-2 space-y-1">
                  {availableOptions.sources.map((source: string) => (
                    <label key={source} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={sectionFilters.selectedSources.includes(source)}
                        onChange={() => toggleSource(source)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-700">{source}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics Range */}
            {(isSessionsSection || isEventsSection) && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Metrics Range</label>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Sessions</label>
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="number"
                        placeholder="Min"
                        value={sectionFilters.minSessions || ''}
                        onChange={(e) => setSectionFilters(prev => ({
                          ...prev,
                          minSessions: Number(e.target.value) || 0
                        }))}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={sectionFilters.maxSessions || ''}
                        onChange={(e) => setSectionFilters(prev => ({
                          ...prev,
                          maxSessions: Number(e.target.value) || 1000
                        }))}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Events</label>
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="number"
                        placeholder="Min"
                        value={sectionFilters.minEvents || ''}
                        onChange={(e) => setSectionFilters(prev => ({
                          ...prev,
                          minEvents: Number(e.target.value) || 0
                        }))}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={sectionFilters.maxEvents || ''}
                        onChange={(e) => setSectionFilters(prev => ({
                          ...prev,
                          maxEvents: Number(e.target.value) || 1000
                        }))}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Submit Button */}
            {hasFilterChanges() && (
              <div className="pt-3 border-t border-blue-200">
                <button
                  onClick={applyFilters}
                  className="w-full px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium"
                >
                  Apply Filters to {sectionTitle}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="lg:col-span-3 bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl space-y-8">
      <div>
        <label className="block text-gray-700 font-medium mb-2">Report Name</label>
        <input
          className="w-full p-4 rounded-xl border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-semibold text-lg"
          value={report.name || ''}
          onChange={(e) => editing && onFieldChange('name', e.target.value)}
          disabled={!editing}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Description</label>
        <input
          className="w-full p-4 rounded-xl border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
          value={report.description || ''}
          onChange={(e) => editing && onFieldChange('description', e.target.value)}
          disabled={!editing}
          placeholder="Add a description for your report..."
        />
      </div>


      {report.sections && report.sections.length > 0 ? (
        report.sections.map((section, idx) => (
          <div key={section.id}>
            <SectionSpecificFilter sectionTitle={section.title} sectionContent={section.content} />
            <SectionEditor
              section={section}
              editing={editing}
              canDelete={report.sections.length > 1}
              onTitleChange={(value) => handleSectionFieldChange(idx, 'title', value)}
              onTypeChange={(value) => handleSectionFieldChange(idx, 'type', value)}
              onContentChange={(value) => handleSectionFieldChange(idx, 'content', value)}
              onDelete={() => handleDeleteSection(idx)}
            />
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No sections found in this report.</p>
          <p className="text-sm mt-2">The report may be empty or corrupted.</p>
        </div>
      )}

      {editing && (
        <div className="pt-6 border-t border-gray-200">
          <div className="flex gap-3">
            <button onClick={onAddSection} style={buttonStyles.orange}>
              + Add Text Section
            </button>
            <div className="relative chart-dropdown-container">
              <button 
                onClick={() => setShowChartDropdown(!showChartDropdown)} 
                style={buttonStyles.green}
                className="mr-2"
              >
                + Add Chart
              </button>
              {showChartDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                  <button
                    onClick={() => {
                      onAddChartSection('sessionsUsers');
                      setShowChartDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100"
                  >
                    📊 Sessions & Users Trend
                  </button>
                  <button
                    onClick={() => {
                      onAddChartSection('bounceRate');
                      setShowChartDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100"
                  >
                    📈 Bounce Rate Trend
                  </button>
                  <button
                    onClick={() => {
                      onAddChartSection('pie');
                      setShowChartDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100"
                  >
                    🥧 Pie Chart
                  </button>
                  <button
                    onClick={() => {
                      onAddChartSection('bar');
                      setShowChartDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100"
                  >
                    📊 Bar Chart
                  </button>
                  <button
                    onClick={() => {
                      onAddChartSection('line');
                      setShowChartDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    📈 Line Chart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Slideshow View Component
interface SlideshowViewProps {
  report: ReportItem;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableEventTypes: string[];
  dataRange: { min: string; max: string };
  onClose: () => void;
}

export function SlideshowView({
  report,
  filters,
  onFiltersChange,
  availableEventTypes,
  dataRange,
  onClose
}: SlideshowViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [filteredSections, setFilteredSections] = useState(report.sections || []);

  // Apply filters to sections
  useEffect(() => {
    let filtered = report.sections || [];
    
    // Apply search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(section => 
        section.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (section.content && JSON.stringify(section.content).toLowerCase().includes(filters.searchTerm.toLowerCase()))
      );
    }

    // Apply date range filter
    if (filters.dateRange?.startDate || filters.dateRange?.endDate) {
      filtered = filtered.filter(section => {
        if (section.type === 'table' && section.content?.rows) {
          return section.content.rows.some((row: string[]) => {
            const dateStr = row[0]; // Assuming first column is date
            if (!dateStr) return true;
            
            const rowDate = new Date(dateStr);
            const startDate = filters.dateRange?.startDate ? new Date(filters.dateRange.startDate) : null;
            const endDate = filters.dateRange?.endDate ? new Date(filters.dateRange.endDate) : null;
            
            if (startDate && rowDate < startDate) return false;
            if (endDate && rowDate > endDate) return false;
            return true;
          });
        }
        return true;
      });
    }

    // Apply event type filter
    if (filters.eventTypes?.selected?.length > 0) {
      filtered = filtered.filter(section => {
        if (section.type === 'table' && section.content?.rows) {
          return section.content.rows.some((row: string[]) => {
            return row.some(cell => 
              filters.eventTypes.selected.some(eventType => 
                cell.toLowerCase().includes(eventType.toLowerCase())
              )
            );
          });
        }
        return true;
      });
    }

    setFilteredSections(filtered);
    setCurrentSlide(0); // Reset to first slide when filters change
  }, [filters, report.sections]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % filteredSections.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + filteredSections.length) % filteredSections.length);
  };

  const renderSlide = (section: any) => {
    switch (section.type) {
      case 'text':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-8">
            <h2 className="text-4xl font-bold text-white mb-8 text-center">{section.title}</h2>
            <div className="text-white text-xl whitespace-pre-line text-center max-w-4xl">
              {section.content}
            </div>
          </div>
        );

      case 'table':
        const headers = section.content?.headers || [];
        const rows = section.content?.rows || [];
        
        return (
          <div className="w-full h-full flex flex-col p-6">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">{section.title}</h2>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-white text-lg">
                <thead>
                  <tr className="border-b border-gray-600">
                    {headers.map((header: string, index: number) => (
                      <th key={index} className="px-6 py-4 text-left font-semibold text-xl">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row: string[], rowIndex: number) => (
                    <tr key={rowIndex} className="border-b border-gray-700 hover:bg-gray-800">
                      {row.map((cell: string, cellIndex: number) => (
                        <td key={cellIndex} className="px-6 py-4 text-lg">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'chart':
        const chartType = section.content?.chartType || 'pie';
        const data = section.content?.data || [];
        
        // Handle marketing-specific charts
        if (chartType === 'sessionsUsers' || chartType === 'bounceRate') {
          console.log('Rendering marketing chart:', {
            chartType,
            hasMarketingData: !!section.content?.marketingData,
            sectionTitle: section.title,
            marketingDataKeys: section.content?.marketingData ? Object.keys(section.content.marketingData) : []
          });

          if (!section.content?.marketingData) {
            return (
              <div className="w-full h-full flex flex-col items-center justify-center p-8">
                <h2 className="text-4xl font-bold text-white mb-8">{section.title}</h2>
                <div className="text-gray-400 text-xl text-center">
                  <p>No marketing data available for this chart.</p>
                  <p className="text-lg mt-4">Please sync Google Analytics data first.</p>
                </div>
              </div>
            );
          }
          
          if (chartType === 'sessionsUsers') {
            return (
              <div className="w-full h-full flex flex-col">
                <h2 className="text-3xl font-bold text-white mb-4 text-center p-4">{section.title}</h2>
                <div className="flex-1 p-4">
                  <SessionsUsersChart metrics={section.content.marketingData} height="100%" showContainer={false} />
                </div>
              </div>
            );
          }
          
          if (chartType === 'bounceRate') {
            return (
              <div className="w-full h-full flex flex-col">
                <h2 className="text-3xl font-bold text-white mb-4 text-center p-4">{section.title}</h2>
                <div className="flex-1 p-4">
                  <BounceRateChart metrics={section.content.marketingData} height="100%" showContainer={false} />
                </div>
              </div>
            );
          }
        }

        // Regular charts
        const chartProps = {
          data,
          height: 600,
          darkTheme: true
        };

        switch (chartType) {
          case 'pie':
            return (
              <div className="w-full h-full flex flex-col p-6">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">{section.title}</h2>
                <div className="flex-1">
                  <PieChart {...chartProps} />
                </div>
              </div>
            );
          case 'donut':
            return (
              <div className="w-full h-full flex flex-col p-6">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">{section.title}</h2>
                <div className="flex-1">
                  <DonutChart {...chartProps} />
                </div>
              </div>
            );
          case 'bar':
            return (
              <div className="w-full h-full flex flex-col p-6">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">{section.title}</h2>
                <div className="flex-1">
                  <BarChart {...chartProps} dataKey="value" xAxisDataKey="name" />
                </div>
              </div>
            );
          case 'line':
            return (
              <div className="w-full h-full flex flex-col p-6">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">{section.title}</h2>
                <div className="flex-1">
                  <LineChart {...chartProps} dataKey="value" xAxisDataKey="name" />
                </div>
              </div>
            );
          case 'stackedBar':
            return (
              <div className="w-full h-full flex flex-col p-6">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">{section.title}</h2>
                <div className="flex-1">
                  <StackedBarChart 
                    {...chartProps} 
                    dataKeys={Object.keys(data[0] || {}).filter(key => key !== 'name')}
                    xAxisDataKey="name"
                  />
                </div>
              </div>
            );
          default:
            return (
              <div className="w-full h-full flex flex-col items-center justify-center p-8">
                <h2 className="text-4xl font-bold text-white mb-8">{section.title}</h2>
                <div className="text-gray-400 text-xl">Unsupported chart type: {chartType}</div>
              </div>
            );
        }

      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-8">
            <h2 className="text-4xl font-bold text-white mb-8">{section.title}</h2>
            <div className="text-gray-400 text-xl">Unsupported section type: {section.type}</div>
          </div>
        );
    }
  };

  if (filteredSections.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">No Slides Available</h2>
          <p className="text-gray-400 mb-6">No sections match the current filters.</p>
          <button
            onClick={onClose}
            style={buttonStyles.orange}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ paddingLeft: '15vw', paddingRight: '5vw' }}>
      <div className="bg-gray-900 rounded-lg p-4 w-full h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{report.name}</h1>
            <p className="text-gray-400">Slideshow View</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterPanel
            filters={filters}
            onFiltersChange={onFiltersChange}
            availableEventTypes={availableEventTypes}
            dataRange={{ minDate: dataRange.min, maxDate: dataRange.max }}
          />
        </div>

        {/* Slide Content */}
        <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
          <div className="w-full h-full flex items-center justify-center">
            {renderSlide(filteredSections[currentSlide])}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={prevSlide}
            disabled={filteredSections.length <= 1}
            style={{
              ...buttonStyles.orange,
              opacity: filteredSections.length <= 1 ? 0.5 : 1,
              cursor: filteredSections.length <= 1 ? 'not-allowed' : 'pointer'
            }}
          >
            ← Previous
          </button>

          <div className="text-white text-center">
            <div className="text-lg font-semibold">
              {currentSlide + 1} of {filteredSections.length}
            </div>
            <div className="text-sm text-gray-400">
              {filteredSections[currentSlide]?.title}
            </div>
          </div>

          <button
            onClick={nextSlide}
            disabled={filteredSections.length <= 1}
            style={{
              ...buttonStyles.orange,
              opacity: filteredSections.length <= 1 ? 0.5 : 1,
              cursor: filteredSections.length <= 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Next →
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSlide + 1) / filteredSections.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

