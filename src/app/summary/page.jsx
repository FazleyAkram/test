'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/header/Header.jsx';

export default function SummaryPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Hello! I'm CODI AI, your marketing intelligence assistant. I've analyzed your uploaded data and generated the summary above. Feel free to ask me any questions about your marketing performance, trends, or strategies!",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Marketing data state
  const [marketingData, setMarketingData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchMarketingData();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMarketingData = async () => {
    try {
      setLoadingData(true);
      console.log('Fetching marketing data...');
      
      // First, get all marketing imports
      const importsResponse = await fetch('/api/marketing/import');
      const importsData = await importsResponse.json();
      console.log('Imports response:', importsData);
      
      if (importsData.imports && importsData.imports.length > 0) {
        console.log('Found imports:', importsData.imports.length);
        // Sort imports by startTime (most recent first) and get the latest one
        const sortedImports = importsData.imports.sort((a, b) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        const mostRecentImport = sortedImports[0];
        console.log('Getting analytics for most recent import:', mostRecentImport.id, 'from', mostRecentImport.fileName);
        
        const analyticsResponse = await fetch(`/api/marketing/analytics/${mostRecentImport.id}`);
        const analyticsData = await analyticsResponse.json();
        console.log('Analytics response:', analyticsData);
        
        if (analyticsData.metrics) {
          console.log('Setting marketing data:', analyticsData);
          setMarketingData(analyticsData);
          setHasData(true);
        } else {
          console.log('No metrics found in analytics data');
          setHasData(false);
        }
      } else {
        console.log('No imports found');
        setHasData(false);
      }
    } catch (error) {
      console.error('Error fetching marketing data:', error);
      setHasData(false);
    } finally {
      setLoadingData(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 flex items-center justify-center">
        <div className="text-white text-xl font-medium">Loading...</div>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: generateAIResponse(inputMessage),
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput) => {
    const responses = [
      "Based on your data, I can see that organic search is your strongest channel, driving 52% of total traffic. This suggests your SEO strategy is working well.",
      "Your conversion rate has improved by 12% over the previous period. The mobile traffic increase is particularly noteworthy - it's up 18% from last month.",
      "I notice your bounce rate decreased from 45.8% to 43.2%. This improvement indicates better user engagement and content relevance.",
      "Your email marketing channel shows strong performance with a 2.7% conversion rate. Consider increasing investment in this channel.",
      "The data shows peak traffic on weekdays between 2-4 PM. You might want to schedule your social media posts during these high-engagement windows.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Data Summary Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Marketing Data Summary</h1>
            <p className="text-gray-600">
              {loadingData ? 'Loading your data...' : 
               hasData ? 'Analysis complete - Here\'s what your data reveals' : 
               'No marketing data found - Import some data to see insights'}
            </p>
          </div>

          {loadingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-600 text-lg">Loading your marketing data...</div>
            </div>
          ) : hasData && marketingData ? (
            /* Real Data Metrics Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">Sessions</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">{marketingData.metrics.totalSessions.toLocaleString()}</div>
                <div className={`text-sm font-medium ${marketingData.trends.sessionTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {marketingData.trends.sessionTrend >= 0 ? '+' : ''}{marketingData.trends.sessionTrend.toFixed(1)}% vs previous
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">Users</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">{marketingData.metrics.totalUsers.toLocaleString()}</div>
                <div className={`text-sm font-medium ${marketingData.trends.userTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {marketingData.trends.userTrend >= 0 ? '+' : ''}{marketingData.trends.userTrend.toFixed(1)}% vs previous
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">Revenue</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">${marketingData.metrics.totalRevenue.toLocaleString()}</div>
                <div className={`text-sm font-medium ${marketingData.trends.revenueTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {marketingData.trends.revenueTrend >= 0 ? '+' : ''}{marketingData.trends.revenueTrend.toFixed(1)}% vs previous
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">Conv. Rate</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">{marketingData.metrics.conversionRate.toFixed(1)}%</div>
                <div className={`text-sm font-medium ${marketingData.trends.conversionTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {marketingData.trends.conversionTrend >= 0 ? '+' : ''}{marketingData.trends.conversionTrend.toFixed(1)}% vs previous
                </div>
              </div>
            </div>
          ) : (
            /* No Data Message */
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">No marketing data available</div>
              <p className="text-gray-400 mb-6">Import some marketing data to see insights and analytics</p>
              <button
                onClick={() => router.push('/import')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Import Marketing Data
              </button>
            </div>
          )}

          {/* Show insights section even when no data - with placeholder content */}
          {!hasData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">Observations</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-gray-500 italic">No data available - Import marketing data to see observations</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-gray-500 italic">Import data via the Import page, then view detailed analytics on the Marketing page</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-gray-500 italic">Once data is imported, insights will appear here automatically</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">Key Insights</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-gray-500 italic">Use the Marketing page for comprehensive analytics and detailed insights</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-gray-500 italic">Track performance across channels and campaigns</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-gray-500 italic">Get AI-powered recommendations for optimization</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Key Insights - Only show if we have data */}
          {hasData && marketingData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">Top Performing Channels</h3>
                <div className="space-y-3">
                  {marketingData.metrics.topChannels && marketingData.metrics.topChannels.length > 0 ? (
                    marketingData.metrics.topChannels.slice(0, 3).map((channel, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">{channel.name}</span>
                        <span className="text-blue-600 font-semibold">{channel.sessions.toLocaleString()} sessions</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm">No channel data available</div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">Key Insights</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-gray-700">
                          Total sessions: {marketingData.metrics.totalSessions.toLocaleString()} 
                          {marketingData.trends.sessionTrend >= 0 ? ' (+' : ' ('}{marketingData.trends.sessionTrend.toFixed(1)}% vs previous)
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-gray-700">
                          Conversion rate: {marketingData.metrics.conversionRate.toFixed(1)}% 
                          {marketingData.trends.conversionTrend >= 0 ? ' (+' : ' ('}{marketingData.trends.conversionTrend.toFixed(1)}% vs previous)
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-gray-700">
                          Total revenue: ${marketingData.metrics.totalRevenue.toLocaleString()} 
                          {marketingData.trends.revenueTrend >= 0 ? ' (+' : ' ('}{marketingData.trends.revenueTrend.toFixed(1)}% vs previous)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => router.push('/marketing')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              View Detailed Analytics
            </button>
            <button
              onClick={() => router.push('/dashboard/reports')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              View Saved Reports
            </button>
          </div>
        </div>

        {/* CODI AI Chat Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">CODI AI Assistant</h2>
                <p className="text-purple-100 text-sm">Ask me anything about your marketing data</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-purple-600' 
                      : 'bg-gradient-to-r from-orange-400 to-yellow-500'
                  }`}>
                    {message.type === 'user' ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                      </svg>
                    )}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 max-w-lg ${
                    message.type === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}>
                    <p className="leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-purple-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3 max-w-3xl">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-orange-400 to-yellow-500">
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
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex gap-3">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask CODI AI about your marketing data..."
                className="flex-1 p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                rows="2"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}