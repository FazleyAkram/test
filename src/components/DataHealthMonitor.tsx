import React, { useEffect, useState } from 'react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DataHealthSummary {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warningChecks: number;
  errorChecks: number;
  healthScore: number;
  issues: any[];
  recommendations: string[];
}

interface DataQualityCheck {
  id: string;
  checkType: string;
  status: string;
  tableName: string;
  columnName?: string;
  checkDate: Date;
  recordCount: number;
  errorCount: number;
  warningCount: number;
  details: any;
}

export default function DataHealthMonitor() {
  const [healthSummary, setHealthSummary] = useState<DataHealthSummary | null>(null);
  const [recentChecks, setRecentChecks] = useState<DataQualityCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDataHealth();
  }, []);

  const loadDataHealth = async () => {
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate the data
      const mockSummary: DataHealthSummary = {
        totalChecks: 24,
        passedChecks: 18,
        failedChecks: 2,
        warningChecks: 4,
        errorChecks: 0,
        healthScore: 75.0,
        issues: [
          {
            type: 'Missing Data',
            message: '3 days of campaign data missing in January',
            severity: 'warning'
          },
          {
            type: 'Data Quality',
            message: 'Bounce rate values outside valid range (0-100)',
            severity: 'error'
          },
          {
            type: 'Anomaly',
            message: 'Unusual spike in sessions on 2024-12-15',
            severity: 'warning'
          }
        ],
        recommendations: [
          'Review and fix bounce rate data quality issues',
          'Investigate missing campaign data for January',
          'Verify session spike on 2024-12-15 is legitimate'
        ]
      };

      const mockChecks: DataQualityCheck[] = [
        {
          id: '1',
          checkType: 'REQUIRED_FIELDS',
          status: 'PASS',
          tableName: 'StagingSessionsDaily',
          checkDate: new Date(),
          recordCount: 365,
          errorCount: 0,
          warningCount: 0,
          details: { message: 'All required fields present' }
        },
        {
          id: '2',
          checkType: 'DATA_RANGES',
          status: 'WARNING',
          tableName: 'StagingSessionsDaily',
          columnName: 'bounceRatePercent',
          checkDate: new Date(),
          recordCount: 12,
          errorCount: 0,
          warningCount: 12,
          details: { message: 'Bounce rate values outside valid range (0-100)' }
        },
        {
          id: '3',
          checkType: 'UNIQUENESS',
          status: 'FAIL',
          tableName: 'StagingSessionsDaily',
          checkDate: new Date(),
          recordCount: 8,
          errorCount: 8,
          warningCount: 0,
          details: { message: 'Duplicate date+channel combinations found' }
        }
      ];

      setHealthSummary(mockSummary);
      setRecentChecks(mockChecks);
    } catch (error) {
      console.error('Error loading data health:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return 'text-green-400';
      case 'FAIL': return 'text-red-400';
      case 'WARNING': return 'text-yellow-400';
      case 'ERROR': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return '✅';
      case 'FAIL': return '❌';
      case 'WARNING': return '⚠️';
      case 'ERROR': return '🚨';
      default: return '⏳';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background-dark border border-primary/20 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-primary/20 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-primary/20 rounded w-1/2 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-primary/20 rounded"></div>
            <div className="h-4 bg-primary/20 rounded w-5/6"></div>
            <div className="h-4 bg-primary/20 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!healthSummary) {
    return (
      <div className="bg-background-dark border border-primary/20 rounded-xl p-6">
        <p className="text-center text-primary/70">No data health information available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Health Score Overview */}
      <div className="bg-background-dark border border-primary/20 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Data Health Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Score Card */}
          <div className="text-center">
            <div className={`text-6xl font-bold mb-2 ${getHealthScoreColor(healthSummary.healthScore)}`}>
              {healthSummary.healthScore.toFixed(0)}%
            </div>
            <p className="text-lg font-medium mb-1">{getHealthScoreLabel(healthSummary.healthScore)}</p>
            <p className="text-sm opacity-70">Overall Data Quality</p>
          </div>

          {/* Check Summary */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-70">Total Checks:</span>
              <span className="font-medium">{healthSummary.totalChecks}</span>
            </div>
            <div className="flex justify-between items-center text-green-400">
              <span className="text-sm opacity-70">Passed:</span>
              <span className="font-medium">{healthSummary.passedChecks}</span>
            </div>
            <div className="flex justify-between items-center text-yellow-400">
              <span className="text-sm opacity-70">Warnings:</span>
              <span className="font-medium">{healthSummary.warningChecks}</span>
            </div>
            <div className="flex justify-between items-center text-red-400">
              <span className="text-sm opacity-70">Failed:</span>
              <span className="font-medium">{healthSummary.failedChecks}</span>
            </div>
            {healthSummary.errorChecks > 0 && (
              <div className="flex justify-between items-center text-red-500">
                <span className="text-sm opacity-70">Errors:</span>
                <span className="font-medium">{healthSummary.errorChecks}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Issues and Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Issues */}
        <div className="bg-background-dark border border-primary/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Active Issues</h3>
          
          {healthSummary.issues.length === 0 ? (
            <p className="text-green-400 text-center py-4">🎉 No issues detected!</p>
          ) : (
            <div className="space-y-3">
              {healthSummary.issues.map((issue, index) => (
                <div key={index} className="p-3 border border-primary/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className={`text-lg ${
                      issue.severity === 'error' ? 'text-red-500' : 
                      issue.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                    }`}>
                      {issue.severity === 'error' ? '🚨' : 
                       issue.severity === 'warning' ? '⚠️' : 'ℹ️'}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{issue.type}</p>
                      <p className="text-sm opacity-70">{issue.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-background-dark border border-primary/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
          
          {healthSummary.recommendations.length === 0 ? (
            <p className="text-green-400 text-center py-4">✨ Data looks great!</p>
          ) : (
            <div className="space-y-3">
              {healthSummary.recommendations.map((rec, index) => (
                <div key={index} className="p-3 border border-primary/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-blue-400 text-lg">💡</span>
                    <p className="text-sm">{rec}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Quality Checks */}
      <div className="bg-background-dark border border-primary/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Quality Checks</h3>
        
        <div className="space-y-3">
          {recentChecks.map((check) => (
            <div key={check.id} className="p-4 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getStatusIcon(check.status)}</span>
                  <div>
                    <p className="font-medium">{check.checkType.replace(/_/g, ' ')}</p>
                    <p className="text-sm opacity-70">{check.tableName}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-medium ${getStatusColor(check.status)}`}>
                    {check.status}
                  </p>
                  <p className="text-sm opacity-70">
                    {new Date(check.checkDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="opacity-70">Records</p>
                  <p className="font-medium">{check.recordCount}</p>
                </div>
                <div>
                  <p className="opacity-70">Errors</p>
                  <p className="font-medium text-red-400">{check.errorCount}</p>
                </div>
                <div>
                  <p className="opacity-70">Warnings</p>
                  <p className="font-medium text-yellow-400">{check.warningCount}</p>
                </div>
              </div>

              {check.details?.message && (
                <div className="mt-3 p-2 bg-primary/10 rounded text-sm">
                  {check.details.message}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}




