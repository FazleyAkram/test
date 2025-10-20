import React, { useState, useEffect } from 'react';

export interface FilterState {
  dateRange: {
    startDate: string;
    endDate: string;
    enabled: boolean;
  };
  eventTypes: {
    selected: string[];
    enabled: boolean;
  };
  metrics: {
    minSessions: number;
    maxSessions: number;
    minEvents: number;
    maxEvents: number;
    enabled: boolean;
  };
  searchTerm: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableEventTypes: string[];
  dataRange: { minDate: string; maxDate: string };
}

export function FilterPanel({ filters, onFiltersChange, availableEventTypes, dataRange }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      dateRange: { startDate: dataRange.minDate, endDate: dataRange.maxDate, enabled: false },
      eventTypes: { selected: [], enabled: false },
      metrics: { minSessions: 0, maxSessions: 1000, minEvents: 0, maxEvents: 1000, enabled: false },
      searchTerm: ''
    });
  };

  const toggleEventType = (eventType: string) => {
    const selected = filters.eventTypes.selected.includes(eventType)
      ? filters.eventTypes.selected.filter(e => e !== eventType)
      : [...filters.eventTypes.selected, eventType];
    
    updateFilters({
      eventTypes: { ...filters.eventTypes, selected }
    });
  };

  const hasActiveFilters = () => {
    return filters.dateRange.enabled || 
           filters.eventTypes.enabled || 
           filters.metrics.enabled || 
           filters.searchTerm.length > 0;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
            {hasActiveFilters() && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearAllFilters}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-6">
            {/* Search Term */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search in data..."
                value={filters.searchTerm}
                onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Date Range Filter */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.dateRange.enabled}
                    onChange={(e) => updateFilters({
                      dateRange: { ...filters.dateRange, enabled: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Date Range</span>
                </label>
              </div>
              {filters.dateRange.enabled && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">From</label>
                    <input
                      type="date"
                      value={filters.dateRange.startDate}
                      min={dataRange.minDate}
                      max={dataRange.maxDate}
                      onChange={(e) => updateFilters({
                        dateRange: { ...filters.dateRange, startDate: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">To</label>
                    <input
                      type="date"
                      value={filters.dateRange.endDate}
                      min={dataRange.minDate}
                      max={dataRange.maxDate}
                      onChange={(e) => updateFilters({
                        dateRange: { ...filters.dateRange, endDate: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Event Types Filter */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.eventTypes.enabled}
                    onChange={(e) => updateFilters({
                      eventTypes: { ...filters.eventTypes, enabled: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Event Types</span>
                </label>
              </div>
              {filters.eventTypes.enabled && (
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  <div className="space-y-2">
                    {availableEventTypes.map((eventType) => (
                      <label key={eventType} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.eventTypes.selected.includes(eventType)}
                          onChange={() => toggleEventType(eventType)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{eventType}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Metrics Filter */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.metrics.enabled}
                    onChange={(e) => updateFilters({
                      metrics: { ...filters.metrics, enabled: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Metrics Range</span>
                </label>
              </div>
              {filters.metrics.enabled && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Sessions</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.metrics.minSessions || ''}
                        onChange={(e) => updateFilters({
                          metrics: { ...filters.metrics, minSessions: Number(e.target.value) || 0 }
                        })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.metrics.maxSessions || ''}
                        onChange={(e) => updateFilters({
                          metrics: { ...filters.metrics, maxSessions: Number(e.target.value) || 1000 }
                        })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Events</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.metrics.minEvents || ''}
                        onChange={(e) => updateFilters({
                          metrics: { ...filters.metrics, minEvents: Number(e.target.value) || 0 }
                        })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.metrics.maxEvents || ''}
                        onChange={(e) => updateFilters({
                          metrics: { ...filters.metrics, maxEvents: Number(e.target.value) || 1000 }
                        })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}







