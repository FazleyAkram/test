'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotificationHelpers } from '@/context/NotificationContext';
import { useAI } from '@/components/AI';
import Sidebar from '@/components/Sidebar.jsx';
import ReactMarkdown from 'react-markdown';

// Used for times/dates at the bottom of messages
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  return isToday
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
};

function SummaryContent() {
  const { user, isLoading } = useAuth();
  const { showError } = useNotificationHelpers();
  const [generatedSummaryJSON, setGeneratedSummaryJSON] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsToUse, setReportsToUse] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { messages, inputMessage, setInputMessage, botLoading, messagesLoading, sendMessage, loadChatHistory, clearChatHistory, scrollToBottom, messagesEndRef } =
    useAI("INLINE");
  const router = useRouter();

  // Get parsed report id
  const searchParams = useSearchParams();
  const reportId = searchParams.get('reportId');

  // Automatically redirect to login page if user isn't logged in
  useEffect(() => {
      if (!isLoading && !user) {
        router.replace("/login");
      }
    }, [user, isLoading, router]);

  // Extract marketing data from report structure
  const extractMarketingData = (report) => {
    if (!report || !report.sections) {
      console.log('No report or sections found');
      return null;
    }

    console.log('Extracting marketing data from report sections:', report.sections.length);
    
    // Find chart sections with marketing data
    const marketingData = {};
    report.sections.forEach(section => {
      if (section.type === 'chart' && section.content?.marketingData) {
        console.log(`Found marketing data in section: ${section.title}`);
        Object.assign(marketingData, section.content.marketingData);
      }
    });

    if (Object.keys(marketingData).length === 0) {
      console.log('No marketing data found in report sections');
      return null;
    }

    console.log('Extracted marketing data:', Object.keys(marketingData));
    return marketingData;
  };

  // Get the summary from the reports with a POST request
  async function getSummary() {
    try {
      setSummaryLoading(true);
      
      console.log('Attempting primary summary generation with full report data...');
      
      // Primary approach: Send entire report JSON to AI
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          reports: reportsToUse, // Send entire report structure
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Primary AI response received');

        // Check if AI indicates data was too large or failed to process
        const responseText = data.response.toLowerCase();
        const isDataTooLarge = responseText.includes('too large') || 
                              responseText.includes('too big') || 
                              responseText.includes('exceeded') ||
                              responseText.includes('cannot process') ||
                              responseText.includes('insufficient data') ||
                              responseText.includes('no data') ||
                              responseText.includes('n/a');

        if (isDataTooLarge) {
          console.log('AI indicated data was too large, falling back to marketing data extraction...');
          await generateSummaryWithExtractedData();
          return;
        }

        // Try to parse the JSON response
        const jsonMatch = data.response.match(/```JSON_START([\s\S]*?)```JSON_END/);
        const jsonData = jsonMatch ? JSON.parse(jsonMatch[1].trim()) : null;
        
        if (jsonData && !isAllNA(jsonData)) {
          console.log('Primary summary generation successful');
          setGeneratedSummaryJSON(jsonData);
          return;
        } else {
          console.log('Primary summary generation failed or returned N/A, trying fallback...');
          await generateSummaryWithExtractedData();
          return;
        }
        
      } else {
        throw new Error(`Failed to get AI response: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Primary summary generation error:', error);
      console.log('Falling back to marketing data extraction...');
      await generateSummaryWithExtractedData();
    } finally {
      setSummaryLoading(false);
    }
  }

  // Fallback method: Extract marketing data and send to AI
  async function generateSummaryWithExtractedData() {
    try {
      console.log('Using fallback: extracting marketing data from report structure...');
      
      // Extract marketing data from report structure
      const marketingData = extractMarketingData(reportsToUse);
      
      if (!marketingData) {
        console.log('No marketing data available for summary generation');
        showError('No Data Available', 'No marketing data found in the selected report.');
        return;
      }

      console.log('Sending extracted marketing data to AI for summary generation');
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          reports: marketingData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fallback summary generation successful');

        // Get Key Insights & Observations strings from JSON
        const jsonMatch = data.response.match(/```JSON_START([\s\S]*?)```JSON_END/);
        const jsonData = jsonMatch ? JSON.parse(jsonMatch[1].trim()) : null;
        setGeneratedSummaryJSON(jsonData);
        
      } else {
        throw new Error(`Fallback failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Fallback summary generation error:', error);
      showError('Summary Generation Failed', 'Unable to generate summary with both primary and fallback methods. Please try again.');
    }
  }

  // Helper function to check if AI response contains only N/A values
  const isAllNA = (jsonData) => {
    if (!jsonData) return true;
    
    // Check categories
    if (jsonData.categories) {
      const hasNonNA = jsonData.categories.some(cat => 
        cat.metric && cat.metric !== 'N/A' && cat.metric !== 'n/a'
      );
      if (hasNonNA) return false;
    }
    
    // Check insights
    if (jsonData.insights) {
      const hasNonNA = jsonData.insights.some(insight => 
        Object.values(insight).some(value => 
          typeof value === 'string' && value !== 'N/A' && value !== 'n/a' && value.trim() !== ''
        )
      );
      if (hasNonNA) return false;
    }
    
    return true;
  };

  const getReports = async (reportId) => {
    if (!user?.id) return;

    try {
      setReportsLoading(true);
      console.log('Fetching relevant reports...');

      let response;
      if (reportId) { // Don't use latest report, use requested report
        response = await fetch(`/api/reports/load?reportId=${reportId}`);
      }
      else { // Use latest report if no report id is specified
        response = await fetch('/api/reports/load');
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Reports API response:", data);
      
      if (data.reports && data.reports.length > 0) {
        console.log(`Found ${data.reports.length} reports, using first report:`, data.reports[0]);
        setReportsToUse(data.reports[0]); // Only using one report to generate summary for now
      } else {
        console.log('No reports found in response');
        setReportsToUse(null);
      }

    } catch (error) {
      console.error('Error fetching reports:', error);
      showError('Failed to Load Reports', 'Unable to fetch reports. Please try again.');
      setReportsToUse(null);
    } finally {
      setReportsLoading(false);
    }
  };

  // Source reports on component mount
  useEffect(() => {
    if (user?.id) {
      getReports(reportId);
    }
  }, [user]);

  // Only get the summary and chat history after the reports have been sourced
  useEffect(() => {
    if (reportsToUse) {
      console.log('Loading chat history for report:', reportsToUse.id);
      loadChatHistory(reportsToUse.id);
      getSummary();
    }
  }, [reportsToUse]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const currentSummary = generatedSummaryJSON;
    sendMessage(inputMessage, reportsToUse, currentSummary); // Send reports and summary
    setInputMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  // Let the user press enter (but not shift-enter) to send
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Clear current and previous messages
  const handleClearChat = (e) => {
    setInputMessage("");
    setMenuOpen(false);
    if (reportsToUse?.id) {
      clearChatHistory(reportsToUse.id);
    } else {
      console.log('No report ID available for clearing chat history');
    }
  }

  // Used to retrieve data from generatedSummaryJSON
  const getCategoryData = (data, section, title, key) => {
    if (!data || !data[section]) return null;

    const category = data[section].find(cat => cat.title === title);
    return category ? category[key] : null;
  }

  const generateInsightsMessage = (category, data) => {
    setInputMessage("Explain how you got to your " + category + " \"" + data + "\"");
    scrollToBottom();
  }

  const generateMetricsMessage = (category, data) => {
    setInputMessage("Explore the " + category + " of " + data + " in more detail.");
    scrollToBottom();
  }
  
  // Export to PDF
  const handleExportPDF = async () => {
  
    setExporting(true);
    try {
      // Calls api to generate PDF
      const response = await fetch('/api/summary/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          summaryData: generatedSummaryJSON || {},
          reportData: reportsToUse || null
        }),
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      // Downloads generated PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `retrospective-analysis-${new Date()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      
    } catch (error) {
      console.error('Export error:', error);
      showError('Export Failed', 'Failed to export PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (!user?.id) return null;

return (
    <div className="min-h-screen" style={{ display: 'flex', background: '#F0F0EE' }}>
      <Sidebar />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8" style={{ marginLeft: '280px', flex: 1 }}>
        {/* Data Summary Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <div className="mb-6">
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#303D23', marginBottom: '0.5rem', fontFamily: 'Questrial, sans-serif' }}>
              CODi Retrospective Analysis
            </h1>

            {/* Report Name */}
            <p style={{ fontSize: '1.4rem', color: '#424747ff' }}>
                {(reportsLoading || summaryLoading)? '' :
                reportsToUse ? `${reportsToUse.name}` : ''}
              </p>

            <p style={{ fontSize: '1.1rem', color: '#7F8C8D' }}>
              {(reportsLoading || summaryLoading)? '' :
              reportsToUse ? `Analysis complete - Click an observation, insight or item to learn more.` :
              'No marketing data found - Connect Google Analytics data'}
            </p>
          </div>

          {/* Loading message */}
          {(reportsLoading || summaryLoading) && (
            <div className="flex items-center gap-3 p-4 bg-white/90 border border-gray-200 rounded-xl mb-4">
              <div className="flex flex-col">
                <span className="text-gray-700 font-medium">CODi is reviewing your analytics</span>
                <div className="flex space-x-1 mt-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Main metrics */}
          {!reportsLoading && !summaryLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div onClick={() => {if (!reportsToUse) return; generateMetricsMessage("total sessions", getCategoryData(generatedSummaryJSON, "categories", "Total Sessions", "metric"))}} className="cursor-pointer transform transition hover:scale-105" style={{ background: 'linear-gradient(135deg, #365B5E, #A3BCBA)', borderRadius: '12px', padding: '1.5rem', border: '1px solid #E5E5E5' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <span className="text-white font-medium">Total Sessions</span>
                </div>
                <div className="text-2xl font-bold text-white">{getCategoryData(generatedSummaryJSON, "categories", "Total Sessions", "metric")}</div>
              </div>

              <div onClick={() => {if (!reportsToUse) return; generateMetricsMessage("total revenue", getCategoryData(generatedSummaryJSON, "categories", "Total Revenue", "metric"))}} className="cursor-pointer transform transition hover:scale-105" style={{ background: 'linear-gradient(135deg, #E59853, #FF6F61)', borderRadius: '12px', padding: '1.5rem', border: '1px solid #E5E5E5' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                    </svg>
                  </div>
                  <span className="text-white font-medium">Total Revenue</span>
                </div>
                <div className="text-2xl font-bold text-white">{getCategoryData(generatedSummaryJSON, "categories", "Total Revenue", "metric")}</div>
              </div>

              <div onClick={() => {if (!reportsToUse) return; generateMetricsMessage("conversion rate", getCategoryData(generatedSummaryJSON, "categories", "Conversion Rate", "metric"))}} className="cursor-pointer transform transition hover:scale-105" style={{ background: 'linear-gradient(135deg, #365B5E, #A3BCBA)', borderRadius: '12px', padding: '1.5rem', border: '1px solid #E5E5E5' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                  <span className="text-white font-medium">Conversion Rate</span>
                </div>
                <div className="text-2xl font-bold text-white">{getCategoryData(generatedSummaryJSON, "categories", "Conversion Rate", "metric")}</div>
              </div>

              <div onClick={() => {if (!reportsToUse) return; generateMetricsMessage("bounce rate", getCategoryData(generatedSummaryJSON, "categories", "Bounce Rate", "metric"))}} className="cursor-pointer transform transition hover:scale-105" style={{ background: 'linear-gradient(135deg, #E59853, #FF6F61)', borderRadius: '12px', padding: '1.5rem', border: '1px solid #E5E5E5' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                    </svg>
                  </div>
                  <span className="text-white font-medium">Bounce Rate</span>
                </div>
                <div className="text-2xl font-bold text-white">{getCategoryData(generatedSummaryJSON, "categories", "Bounce Rate", "metric")}</div>
              </div>
            </div>
          )}

          {/* Key Insights & Observations*/}
          {!reportsLoading && !summaryLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> 
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Observations</h3>
              <div className="space-y-3">
                <button onClick={() => generateInsightsMessage("observation", getCategoryData(generatedSummaryJSON, "insights", "Observations", "insight1"))} disabled={!reportsToUse} className="w-full text-left p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-200">
                    <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-gray-700">{getCategoryData(generatedSummaryJSON, "insights", "Observations", "insight1")}</p>
                    </div>
                  </div>
                </button>
                <button onClick={() => generateInsightsMessage("observation", getCategoryData(generatedSummaryJSON, "insights", "Observations", "insight2"))} disabled={!reportsToUse} className="w-full text-left p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-gray-700">{getCategoryData(generatedSummaryJSON, "insights", "Observations", "insight2")}</p>
                    </div>
                  </div>
                </button>
                <button onClick={() => generateInsightsMessage("observation", getCategoryData(generatedSummaryJSON, "insights", "Observations", "insight3"))} disabled={!reportsToUse} className="w-full text-left p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-200">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-gray-700">{getCategoryData(generatedSummaryJSON, "insights", "Observations", "insight3")}</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Key Insights</h3>
              <div className="space-y-3">
                <button onClick={() => generateInsightsMessage("key insight", getCategoryData(generatedSummaryJSON, "insights", "Key Insights", "insight1"))} disabled={!reportsToUse} className="w-full text-left p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-200">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-gray-700">{getCategoryData(generatedSummaryJSON, "insights", "Key Insights", "insight1")}</p>
                    </div>
                  </div>
                </button>
                <button onClick={() => generateInsightsMessage("key insight", getCategoryData(generatedSummaryJSON, "insights", "Key Insights", "insight2"))} disabled={!reportsToUse} className="w-full text-left p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-gray-700">{getCategoryData(generatedSummaryJSON, "insights", "Key Insights", "insight2")}</p>
                    </div>
                  </div>
                </button>
                <button onClick={() => generateInsightsMessage("key insight", getCategoryData(generatedSummaryJSON, "insights", "Key Insights", "insight3"))} disabled={!reportsToUse} className="w-full text-left p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-200">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-gray-700">{getCategoryData(generatedSummaryJSON, "insights", "Key Insights", "insight3")}</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
          )}

          {/* Actionable Items */}
          {!reportsLoading && !summaryLoading && (
          <div className="gap-8 w-full pt-6"> 
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Actionable Items</h3>
              <div className="space-y-3">
                <button onClick={() => generateInsightsMessage("actionable item", getCategoryData(generatedSummaryJSON, "insights", "Actionable Items", "insight1"))} disabled={!reportsToUse} className="w-full text-left p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-200">
                    <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-gray-700">{getCategoryData(generatedSummaryJSON, "insights", "Actionable Items", "insight1")}</p>
                    </div>
                  </div>
                </button>
                <button onClick={() => generateInsightsMessage("actionable item", getCategoryData(generatedSummaryJSON, "insights", "Actionable Items", "insight2"))} disabled={!reportsToUse} className="w-full text-left p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-gray-700">{getCategoryData(generatedSummaryJSON, "insights", "Actionable Items", "insight2")}</p>
                    </div>
                  </div>
                </button>
                <button onClick={() => generateInsightsMessage("actionable item", getCategoryData(generatedSummaryJSON, "insights", "Actionable Items", "insight3"))} disabled={!reportsToUse} className="w-full text-left p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-200">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-gray-700">{getCategoryData(generatedSummaryJSON, "insights", "Actionable Items", "insight3")}</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
          )}

          {/* Action Buttons */}
          {!reportsLoading && !summaryLoading && (
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={handleExportPDF}
                disabled={exporting || !reportsToUse}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #365B5E, #A3BCBA)',
                  color: 'white',
                  fontWeight: 600,
                  borderRadius: '0.75rem',
                  border: 'none',
                  cursor: exporting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(54, 91, 94, 0.3)',
                  transition: 'all 0.2s',
                  opacity: exporting ? 0.6 : 1
                }}
              >
                {exporting ? 'Exporting...' : 'Export Analysis'}
              </button>
           </div>
          )}
        </div>

        {/* CODI AI Chat Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4" style={{ background: 'linear-gradient(135deg, #365B5E, #A3BCBA)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
              <div>
                <h2 className="text-xl font-bold text-white">AskCODi</h2>
                <p className="text-white/80 text-sm">
                  Ask me about your marketing strategy
                </p>
              </div>
            </div>

              {/* Right side (menu button) */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  disabled={!reportsToUse}
                  className="p-2 rounded-full hover:bg-white/20 text-white"
                >
                  <span className="text-2xl">⋯</span>
                </button>

                {/* Dropdown menu */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black/5">
                    <ul className="py-1">
                      <li>
                        <button 
                          onClick={() => handleClearChat()}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-500">
                          <span className="flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-trash"
                              viewBox="0 0 16 16"
                            >
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                            </svg>
                            Clear chat
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {!reportsLoading && !summaryLoading && !messagesLoading && reportsToUse &&
              <div className="text-center text-gray-500 py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-gray-700 text-sm">To get started, click on an item from the analysis above or type me a question below!</h3>
              </div>
            }

            {messages.map((msg) => (
              <div key={msg.id} className="space-y-3">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="flex items-start gap-3 max-w-3xl flex-row-reverse">
                    {/* User Avatar */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #365B5E, #A3BCBA)' }}>
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>

                    {/* User Bubble */}
                    <div className="rounded-2xl px-4 py-3 max-w-lg text-white" style={{ background: 'linear-gradient(135deg, #365B5E, #A3BCBA)' }}>
                      <p className="leading-relaxed text-sm">{msg.message}</p>
                      <p className="text-xs mt-2 text-white/80">
                        {formatTimestamp(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Response */}
                {msg.response && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3 max-w-3xl">
                      {/* AI Avatar */}
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E59853, #FF6F61)' }}>
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                      </div>

                      {/* AI Bubble with Markdown */}
                      <div className="rounded-2xl px-4 py-3 max-w-lg bg-white border border-gray-200 text-gray-800">
                        <ReactMarkdown
                          components={{
                            p: ({ node, ...props }) => <p className="mb-2 text-sm leading-relaxed" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc ml-5 mb-2 text-sm" {...props} />,
                            li: ({ node, ...props }) => <li className="ml-4 list-disc text-sm" {...props} />,
                          }}
                        >
                          {msg.response}
                        </ReactMarkdown>
                        <p className="text-xs mt-2 text-gray-500">
                          {formatTimestamp(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {botLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3 max-w-3xl">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E59853, #FF6F61)' }}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />

            {/* Chat Messages Loading Message */}
            <div className="relative bottom-0 left-0 w-full flex justify-start px-4 py-3 bg-gray-50 bg-opacity-80">
              {(reportsLoading || messagesLoading) && (
                <div className="flex space-x-1 mt-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
            </div>

          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
            <div className="flex gap-3">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Send AskCODi a question"
                className="flex-1 p-3 border border-gray-300 rounded-xl resize-none transition-all text-gray-700"
                style={{ outline: 'none' }}
                rows="2"
                disabled={botLoading || reportsLoading || summaryLoading || messagesLoading || !reportsToUse}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || botLoading || reportsLoading || summaryLoading || messagesLoading || !reportsToUse}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #E59853, #FF6F61)',
                  color: 'white',
                  borderRadius: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  opacity: (!inputMessage.trim() || botLoading || reportsLoading || summaryLoading || messagesLoading) ? 0.5 : 1
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SummaryPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem' }} />}> 
      <SummaryContent />
    </Suspense>
  );
}