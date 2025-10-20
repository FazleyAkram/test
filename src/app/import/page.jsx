'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useNotificationHelpers } from '@/context/NotificationContext';
import { formatDateForInput } from '@/lib/dateUtils';
import Sidebar from '@/components/Sidebar.jsx';
import ChatBotWindow from '@/components/ChatBotWindow';

function ImportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useNotificationHelpers();
  const [file, setFile] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Google Analytics state
  const [gaConnected, setGaConnected] = useState(false);
  const [gaProperties, setGaProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [syncDateRange, setSyncDateRange] = useState({
    startDate: formatDateForInput(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
    endDate: formatDateForInput(new Date())
  });
  const [syncing, setSyncing] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState('google-analytics');
  const [gaError, setGaError] = useState(null);
  const [showErrorState, setShowErrorState] = useState(false);
  
  useEffect(() => {
    checkGoogleAnalyticsConnection();

    const gaErrorParam = searchParams.get('ga_error');
    if (gaErrorParam) {
      if (gaErrorParam === 'verification_required') {
        setGaError('Google verification required. Please add your email to test users in Google Cloud Console.');
      } else {
        setGaError(decodeURIComponent(gaErrorParam));
      }
      setTimeout(() => setShowErrorState(true), 300);
    }
  }, [searchParams]);

  useEffect(() => {
    setTimeout(() => setIsPageLoaded(true), 100);
  }, []);

  const checkGoogleAnalyticsConnection = async () => {
    try {
      const response = await fetch('/api/marketing/google-analytics/sync');
      if (response.ok) {
        const data = await response.json();
        setGaConnected(data.connected);
        if (data.connected && data.dataSource) {
          setGaProperties(data.dataSource.properties || []);
          // If no properties are returned, default to auto-detect so user can sync
          if (!data.dataSource.properties || data.dataSource.properties.length === 0) {
            setSelectedProperty('auto-detect');
          }
        }
      }
    } catch (error) {
      console.error('Error checking GA connection:', error);
    }
  };

  const connectGoogleAnalytics = async () => {
    try {
      const response = await fetch('/api/auth/google');
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Error connecting to Google Analytics:', error);
    }
  };

  const disconnectGoogleAnalytics = async () => {
    try {
      const resp = await fetch('/api/marketing/google-analytics/disconnect', { method: 'POST' });
      if (resp.ok) {
        await checkGoogleAnalyticsConnection();
        setSelectedProperty('');
      } else {
        console.error('Failed to disconnect GA');
      }
    } catch (e) {
      console.error('Error disconnecting Google Analytics:', e);
    }
  };

  const syncGoogleAnalyticsData = async () => {
    // Allow auto-detect if no explicit property selected
    const propertyToUse = selectedProperty || 'auto-detect';
    setSyncing(true);
    try {
      const response = await fetch('/api/marketing/google-analytics/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: propertyToUse,
          startDate: syncDateRange.startDate,
          endDate: syncDateRange.endDate
        })
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess('Sync Successful', 'Google Analytics data synced successfully!');
        router.push('/dashboard/summary');
      } else {
        const error = await response.json();
        showError('Sync Failed', `Sync failed: ${error.details || error.error}`);
      }
    } catch (error) {
      console.error('Error syncing GA data:', error);
      showError('Sync Failed', 'Failed to sync Google Analytics data');
    } finally {
      setSyncing(false);
    }
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcessData = () => {
    router.push('/dashboard/summary');
  };

  const dismissError = () => {
    setShowErrorState(false);
    setTimeout(() => setGaError(null), 300);
  };

  return (
    <div className="import-page">
      <Sidebar activeTab="import" />

      {/* Main Content */}
      <main className="main-content">
        <div className="content-container">
          <div className={`header-section ${isPageLoaded ? 'loaded' : ''}`}>
            <h1 className="page-title">Import Marketing Data</h1>
            <p className="page-description">
              Upload your Google Analytics data to generate comprehensive marketing insights and reports.
            </p>
          </div>
          
          <div className="cards-container">
            {/* Data Source Selection */}
            <div className={`card ${isPageLoaded ? 'loaded' : ''}`} style={{ animationDelay: '0.1s' }}>
              <h3 className="card-title">Select Data Source</h3>
              <div className="data-source-grid">
                <div
                  onClick={() => setSelectedDataSource('google-analytics')}
                  className={`data-source-btn ${selectedDataSource === 'google-analytics' ? 'active' : ''}`}
                >
                  <div className="data-source-content">
                    <svg className="ga-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <div className="data-source-text">
                      <div className="data-source-name">Google Analytics</div>
                      <div className="data-source-desc">Traffic, conversions, and user behavior data</div>
                      {gaConnected && (
                        <div className="connected-badge">
                          <svg className="check-icon" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Connected
                        </div>
                      )}
                    </div>
                    {!gaConnected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          connectGoogleAnalytics();
                        }}
                        className="connect-btn"
                      >
                        <span className="btn-text">Connect</span>
                        <span className="btn-ripple"></span>
                      </button>
                    )}
                    {gaConnected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          disconnectGoogleAnalytics();
                        }}
                        className="connect-btn"
                        style={{ backgroundColor: '#ef4444' }}
                      >
                        <span className="btn-text">Disconnect</span>
                        <span className="btn-ripple"></span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* GA Error Display */}
              {gaError && (
                <div className={`error-box ${showErrorState ? 'show' : ''}`}>
                  <div className="error-content">
                    <div className="error-icon">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="error-text">
                      <h4 className="error-title">Google Analytics Connection Error</h4>
                      <p className="error-message">{gaError}</p>
                      <div className="error-instructions">
                        <p>To fix this:</p>
                        <ol>
                          <li>
                            Go to{' '}
                            <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">
                              Google Cloud Console
                            </a>
                          </li>
                          <li>Select your project → APIs & Services → OAuth consent screen</li>
                          <li>Scroll to "Test users" section</li>
                          <li>
                            Add your email address: <code>micevaluationpa2501@gmail.com</code>
                          </li>
                          <li>Click "Save" and try connecting again</li>
                        </ol>
                      </div>
                      <button onClick={dismissError} className="dismiss-btn">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Google Analytics Configuration */}
            {selectedDataSource === 'google-analytics' && gaConnected && (
              <div className={`card ${isPageLoaded ? 'loaded' : ''}`} style={{ animationDelay: '0.2s' }}>
                <h3 className="card-title">Configure Google Analytics</h3>

                {gaProperties.length > 0 && (
                  <div className="form-group">
                    <label className="form-label">Select Property</label>
                    <select
                      value={selectedProperty}
                      onChange={(e) => setSelectedProperty(e.target.value)}
                      className="form-select"
                    >
                      <option value="">Select a property...</option>
                      {gaProperties.map((property, index) => (
                        <option key={index} value={property.name}>
                          {property.displayName || property.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="date-grid">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                  <input
                    type="date"
                      value={syncDateRange.startDate}
                      onChange={(e) => setSyncDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                      className="form-input"
                  />
                </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                  <input
                    type="date"
                      value={syncDateRange.endDate}
                      onChange={(e) => setSyncDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                      className="form-input"
                  />
                </div>
              </div>
            </div>
            )}

            {/* Date Range Selection (for other data sources) */}
            {selectedDataSource !== 'google-analytics' && (
              <div className={`card ${isPageLoaded ? 'loaded' : ''}`} style={{ animationDelay: '0.2s' }}>
                <h3 className="card-title">Select Date Range</h3>
                <div className="date-grid">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input type="date" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input type="date" className="form-input" />
                  </div>
                </div>
              </div>
            )}

            {/* File Upload Section (kept, but no processing button shown) */}
            {selectedDataSource !== 'google-analytics' && (
              <div className={`card ${isPageLoaded ? 'loaded' : ''}`} style={{ animationDelay: '0.3s' }}>
                <h3 className="card-title">Upload Data Files</h3>
                <div className="form-group">
                  <label className="form-label">Marketing Data (CSV/JSON)</label>
                  <div className="file-upload-wrapper">
                <input
                  type="file"
                  accept=".csv,.json,.xlsx"
                  onChange={handleFileChange}
                      className="file-input"
                      id="file-input"
                    />
                    <label htmlFor="file-input" className="file-label">
                      <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <span>{file ? file.name : 'Click to upload or drag and drop'}</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons (ONLY GA sync now) */}
            <div className={`card ${isPageLoaded ? 'loaded' : ''}`} style={{ animationDelay: '0.4s' }}>
              <h3 className="card-title">Process Marketing Data</h3>

              {selectedDataSource === 'google-analytics' ? (
                <div className="action-section">
              <button
                    onClick={syncGoogleAnalyticsData}
                    disabled={!gaConnected || !selectedProperty || syncing}
                    className={`action-btn primary ${!gaConnected || !selectedProperty || syncing ? 'disabled' : ''}`}
                  >
                    {syncing ? (
                      <>
                        <span className="spinner"></span>
                        <span>Syncing Data...</span>
                      </>
                    ) : (
                      'Sync Google Analytics Data'
                    )}
                    <span className="btn-glow"></span>
              </button>

                  <p className="action-hint">
                    {!gaConnected
                      ? 'Connect Google Analytics first to sync data.'
                      : 'This will sync your Google Analytics data and redirect you to the marketing dashboard.'}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .import-page {
          min-height: 100vh;
          background: #F0F0EE;
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex;
        }
        .main-content { flex: 1; margin-left: 280px; padding: 2rem; overflow-y: auto; }
        .content-container { max-width: 1200px; margin: 0 auto; }
        .header-section { margin-bottom: 2rem; opacity: 0; transform: translateY(-20px); transition: all 0.6s ease-out; }
        .header-section.loaded { opacity: 1; transform: translateY(0); }
        .page-title { font-family: 'Questrial', sans-serif; font-size: 2.5rem; font-weight: 700; color: #303D23; margin-bottom: 0.5rem; }
        .page-description { font-size: 1.1rem; color: #7F8C8D; }
        .cards-container { display: flex; flex-direction: column; gap: 1.5rem; }
        .card { background: white; border: 1px solid #E5E5E5; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); opacity: 0; transform: translateY(30px); transition: all 0.6s cubic-bezier(0.68,-0.55,0.265,1.55); }
        .card.loaded { opacity: 1; transform: translateY(0); }
        .card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.1); transform: translateY(-2px); }
        .card-title { font-size: 1.25rem; font-weight: 600; color: #303D23; margin-bottom: 1.25rem; }
        .data-source-grid { display: grid; gap: 1rem; }
        .data-source-btn { padding: 1.25rem; border-radius: 12px; border: 2px solid #E5E5E5; background: white; cursor: pointer; transition: all 0.3s cubic-bezier(0.68,-0.55,0.265,1.55); position: relative; overflow: hidden; }
        .data-source-btn::before { content: ''; position: absolute; top: 50%; left: 50%; width: 0; height: 0; border-radius: 50%; background: radial-gradient(circle, rgba(54,91,94,0.1), transparent); transform: translate(-50%,-50%); transition: width 0.6s ease, height 0.6s ease; }
        .data-source-btn:hover::before { width: 500px; height: 500px; }
        .data-source-btn:hover { border-color: #365B5E; background: rgba(54,91,94,0.02); transform: scale(1.02); box-shadow: 0 4px 16px rgba(54,91,94,0.15); }
        .data-source-btn.active { border-color: #365B5E; background: rgba(54,91,94,0.05); animation: pulseActive 2s ease-in-out infinite; }
        @keyframes pulseActive { 0%,100% { box-shadow: 0 0 0 0 rgba(54,91,94,0.4);} 50% { box-shadow: 0 0 0 10px rgba(54,91,94,0);} }
        .data-source-content { display: flex; align-items: center; gap: 1rem; position: relative; z-index: 1; }
        .ga-icon { width: 2.5rem; height: 2.5rem; color: #365B5E; flex-shrink: 0; transition: transform 0.4s cubic-bezier(0.68,-0.55,0.265,1.55); }
        .data-source-btn:hover .ga-icon { transform: rotate(360deg) scale(1.1); }
        .data-source-text { flex: 1; text-align: left; }
        .data-source-name { font-weight: 600; color: #303D23; margin-bottom: 0.25rem; }
        .data-source-desc { font-size: 0.9rem; color: #7F8C8D; }
        .connected-badge { display: flex; align-items: center; gap: 0.25rem; color: #A3BCBA; font-size: 0.75rem; margin-top: 0.5rem; animation: slideInLeft 0.5s ease-out; }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-20px);} to { opacity: 1; transform: translateX(0);} }
        .check-icon { width: 1rem; height: 1rem; animation: checkPop 0.5s cubic-bezier(0.68,-0.55,0.265,1.55); }
        @keyframes checkPop { 0% { transform: scale(0) rotate(-45deg);} 100% { transform: scale(1) rotate(0deg);} }
        .connect-btn { padding: 0.5rem 1.25rem; background: #365B5E; color: white; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden; animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(54,91,94,0.7);} 50% { box-shadow: 0 0 0 10px rgba(54,91,94,0);} }
        .connect-btn:hover { background: #2d4a4d; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(54,91,94,0.3); animation: none; }
        .connect-btn .btn-text { position: relative; z-index: 1; }
        .btn-ripple { position: absolute; top: 50%; left: 50%; width: 0; height: 0; border-radius: 50%; background: rgba(255,255,255,0.3); transform: translate(-50%,-50%); transition: width 0.6s, height 0.6s; }
        .connect-btn:active .btn-ripple { width: 200px; height: 200px; }
        .error-box { background: #fee; border: 1px solid #fcc; border-radius: 12px; padding: 1.25rem; margin-top: 1.25rem; opacity: 0; transform: translateY(-20px); transition: all 0.3s ease; max-height: 0; overflow: hidden; }
        .error-box.show { opacity: 1; transform: translateY(0); max-height: 1000px; animation: shake 0.5s ease-in-out; }
        @keyframes shake { 0%,100% { transform: translateX(0);} 25% { transform: translateX(-10px);} 75% { transform: translateX(10px);} }
        .error-content { display: flex; gap: 1rem; }
        .error-icon { width: 1.5rem; height: 1.5rem; color: #c33; flex-shrink: 0; animation: errorIconBounce 0.6s ease-out; }
        @keyframes errorIconBounce { 0%,100% { transform: scale(1);} 50% { transform: scale(1.2) rotate(10deg);} }
        .error-icon svg { width: 100%; height: 100%; }
        .error-text { flex: 1; }
        .error-title { font-weight: 600; color: #c33; margin-bottom: 0.5rem; }
        .error-message { color: #c33; font-size: 0.9rem; margin-bottom: 1rem; }
        .error-instructions { font-size: 0.8rem; color: #c33; margin-bottom: 1rem; }
        .error-instructions ol { margin-left: 1.5rem; margin-top: 0.5rem; }
        .error-instructions li { margin-bottom: 0.25rem; }
        .error-instructions code { background: rgba(204,51,51,0.1); padding: 0.125rem 0.375rem; border-radius: 4px; font-size: 0.75rem; }
        .dismiss-btn { padding: 0.5rem 1rem; background: #c33; color: white; border: none; border-radius: 8px; font-size: 0.8rem; cursor: pointer; transition: all 0.3s ease; }
        .dismiss-btn:hover { background: #a22; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(204,51,51,0.3); }
        .form-group { margin-bottom: 1.25rem; }
        .form-label { display: block; font-weight: 500; color: #303D23; margin-bottom: 0.5rem; font-size: 0.95rem; transition: color 0.2s ease; }
        .form-select, .form-input { width: 100%; padding: 0.75rem; border: 1px solid #E5E5E5; border-radius: 8px; background: white; color: #303D23; font-size: 0.95rem; transition: all 0.3s cubic-bezier(0.68,-0.55,0.265,1.55); }
        .form-select:focus, .form-input:focus { outline: none; border-color: #365B5E; box-shadow: 0 0 0 4px rgba(54,91,94,0.1); transform: scale(1.02); }
        .date-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
        .file-upload-wrapper { position: relative; }
        .file-input { position: absolute; opacity: 0; width: 0; height: 0; }
        .file-label { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; padding: 2rem; border: 2px dashed #E5E5E5; border-radius: 12px; background: #F0F0EE; cursor: pointer; transition: all 0.3s cubic-bezier(0.68,-0.55,0.265,1.55); }
        .file-label:hover { border-color: #365B5E; background: rgba(54,91,94,0.05); transform: scale(1.02); box-shadow: 0 4px 16px rgba(54,91,94,0.1); }
        .upload-icon { width: 3rem; height: 3rem; color: #365B5E; transition: transform 0.3s ease; }
        .file-label span { color: #7F8C8D; font-size: 0.9rem; text-align: center; }
        .action-section { display: flex; flex-direction: column; gap: 1rem; }
        .action-btn { padding: 1rem 2rem; border: none; border-radius: 12px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transitiontransition: all 0.4s cubic-bezier(0.68,-0.55,0.265,1.55); box-shadow: 0 4px 12px rgba(0,0,0,0.1); position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .action-btn::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); transition: left 0.6s; }
        .action-btn:hover::before { left: 100%; }
        .action-btn.primary { background: linear-gradient(135deg, #365B5E, #A3BCBA); color: white; animation: buttonGlow 3s ease-in-out infinite; }
        @keyframes buttonGlow { 0%,100% { box-shadow: 0 4px 12px rgba(54,91,94,0.2);} 50% { box-shadow: 0 4px 20px rgba(54,91,94,0.4);} }
        .action-btn.primary:hover:not(.disabled) { transform: translateY(-4px) scale(1.02); box-shadow: 0 8px 24px rgba(54,91,94,0.3); animation: none; }
        .action-btn.disabled { opacity: 0.5; cursor: not-allowed; transform: none; animation: none; }
        .action-btn:active:not(.disabled) { transform: translateY(-1px) scale(0.98); }
        .btn-glow { position: absolute; top: 50%; left: 50%; width: 0; height: 0; background: radial-gradient(circle, rgba(255,255,255,0.4), transparent); border-radius: 50%; transform: translate(-50%,-50%); transition: width 0.6s, height 0.6s; }
        .action-btn:hover .btn-glow { width: 300px; height: 300px; }
        .spinner { width: 1.2rem; height: 1.2rem; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .action-hint { font-size: 0.9rem; color: #7F8C8D; animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .divider { display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0; }
        .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, transparent, #E5E5E5, transparent); }
        .chat-button { position: fixed; bottom: 2rem; right: 2rem; width: 4rem; height: 4rem; background: linear-gradient(135deg, #E59853, #FF6F61); color: white; border: none; border-radius: 50%; box-shadow: 0 4px 20px rgba(229,152,83,0.3); cursor: pointer; transition: all 0.3s cubic-bezier(0.68,-0.55,0.265,1.55); z-index: 50; display: flex; align-items: center; justify-content: center; animation: chatFloat 3s ease-in-out infinite; }
        @keyframes chatFloat { 0%,100% { transform: translateY(0) rotate(0deg);} 25% { transform: translateY(-10px) rotate(-5deg);} 75% { transform: translateY(-5px) rotate(5deg);} }
        .chat-icon { width: 2rem; height: 2rem; position: relative; z-index: 1; animation: iconBounce 2s ease-in-out infinite; }
        @keyframes iconBounce { 0%,100% { transform: scale(1);} 50% { transform: scale(1.1);} }
        @media (max-width: 1024px) { .main-content { margin-left: 0; } }
        @media (max-width: 768px) {
          .main-content { padding: 1rem; }
          .page-title { font-size: 2rem; }
          .date-grid { grid-template-columns: 1fr; }
          .action-btn { font-size: 1rem; padding: 0.875rem 1.5rem; }
          .chat-button { bottom: 1rem; right: 1rem; width: 3.5rem; height: 3.5rem; }
          .data-source-content { flex-direction: column; text-align: center; }
          .data-source-text { text-align: center; }
        }
        .main-content::-webkit-scrollbar { width: 8px; }
        .main-content::-webkit-scrollbar-track { background: #f1f1f1; }
        .main-content::-webkit-scrollbar-thumb { background: #A3BCBA; border-radius: 4px; transition: background 0.3s; }
        .main-content::-webkit-scrollbar-thumb:hover { background: #365B5E; }
        .action-btn:focus-visible, .connect-btn:focus-visible, .dismiss-btn:focus-visible { outline: 3px solid #4A90E2; outline-offset: 2px; }
        @keyframes cardShimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
        .card.loading { background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size: 1000px 100%; animation: cardShimmer 2s infinite; }
      `}</style>

      {/* Chat Button */}
      <button onClick={() => setIsChatOpen(true)} className="chat-button" title="Chat with CODi">
        <svg className="chat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      <ChatBotWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}

export default function ImportPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem' }} />}> 
      <ImportContent />
    </Suspense>
  );
}
