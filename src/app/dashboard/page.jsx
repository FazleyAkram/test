"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ChatBotWindow from '@/components/ChatBotWindow';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  // state management for chat window and UI elements
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [showHowToUse, setShowHowToUse] = useState(false); // Controls "How CODi Works" dropdown

  // redirects to login if user is not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  
  useEffect(() => {
    // Trigger animations after component mounts
    setTimeout(() => setIsPageLoaded(true), 100);
  }, []);

  // Handle user logout
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <div className="loading-text"></div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

  // Navigation menu items for sidebar
  const navigationItems = [
    { id: 'home', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', route: '/dashboard' },
    { id: 'import', label: 'Import Data', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12', route: '/import' },
    { id: 'summary', label: 'Retrospective Analysis', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', route: '/dashboard/summary' },
    { id: 'reports', label: 'View Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', route: '/dashboard/reports' },
  ];

  if (user?.isAdmin) {
    navigationItems.push({
      id: 'admin',
      label: 'Admin Panel',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      route: '/admin'
    });
  }

  return (
    <div className="dashboard-page">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isPageLoaded ? 'loaded' : ''}`}>
        <div className="sidebar-header">
          <img 
            src="/logos/side.png" 
            alt="CODi Logo" 
            className="logo-image"
            style={{ width: '150px', marginBottom: '0.5rem', transform: 'scale(3)', transformOrigin: 'center' }}
          />
          <p className="sidebar-subtitle">Marketing. Managed.</p>
        </div>
        
        <nav className="sidebar-nav">
          {navigationItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => router.push(item.route)}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}/>
              </svg>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.email?.split('@')[0]}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <svg className="logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className={`welcome-container ${isPageLoaded ? 'loaded' : ''}`}>
          <h1 className="welcome-title">
            Welcome Back<span className="title-exclamation">!</span>
          </h1>

          <div className="action-buttons">
            <button onClick={() => router.push('/import')} className="get-started-btn">
              <span className="btn-text">Get Started</span>
              <span className="btn-glow"></span>
            </button>

            <button onClick={() => setShowHowToUse(!showHowToUse)} className="how-to-use-btn">
              <span className="btn-text">How</span>
              <img
                src="/logos/side.png"
                alt="CODi Logo"
                className="codi-logo-inline"
                style={{ width: '50px', transform: 'scale(3)', transformOrigin: 'center' }}
              />
              <span className="btn-text">Works</span>
              <svg className={`chevron-icon ${showHowToUse ? 'rotated' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* How to Use Dropdown */}
          <div className={`how-to-use-section ${showHowToUse ? 'expanded' : ''}`}>
            <div className="steps-container">
              {/* Step 1 */}
              <div className="step-item zigzag-left" style={{ animationDelay: '0.1s' }}>
                <div className="step-number">
                  <div className="animated-circle">
                    <div className="circle-pulse"></div>
                    <span className="number">1</span>
                  </div>
                </div>
                <div className="step-content">
                  <h3 className="step-title">Import Marketing Data</h3>
                  <p className="step-description">Follow our simple 3-step process to connect your Google Analytics and import your marketing data</p>

                  {/* Sub-steps */}
                  <div className="sub-steps">
                    <div className="sub-step">
                      <div className="sub-step-badge">1</div>
                      <div className="sub-step-text">
                        <strong>Connect Google Analytics</strong>
                        <p>Authorise CODi to access your Google Analytics account</p>
                      </div>
                    </div>
                    <div className="sub-step">
                      <div className="sub-step-badge">2</div>
                      <div className="sub-step-text">
                        <strong>Configure Google Analytics</strong>
                        <p>Select your property and choose start/end dates for your data</p>
                      </div>
                    </div>
                    <div className="sub-step">
                      <div className="sub-step-badge">3</div>
                      <div className="sub-step-text">
                        <strong>Process Marketing Data</strong>
                        <p>Sync your analytics and be automatically directed to CODi's Retrospective Analysis</p>
                      </div>
                    </div>
                  </div>

                  <div className="step-image-placeholder">
                    <div className="placeholder-navbar">
                      <div className="navbar-dot"></div>
                      <div className="navbar-dot"></div>
                      <div className="navbar-dot"></div>
                      <span className="navbar-title">Import Data Page</span>
                    </div>
                    <div className="placeholder-content">
                      <img src="/screenshots/import-page.png" alt="Import Data Page" className="placeholder-img" />
                      <div className="scroll-indicator">
                        <svg className="scroll-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <span>Scroll to explore</span>
                      </div>
                    </div>
                    <div className="animated-arrow arrow-down">↓</div>
                  </div>
                </div>
              </div>

              {/* Step 2*/}
              <div className="step-item zigzag-right" style={{ animationDelay: '0.2s' }}>
                <div className="step-content">
                  <h3 className="step-title">CODi Retrospective Analysis</h3>
                  <p className="step-description">CODi analyses your data and generates intelligent insights and actionable suggestions. Delve deeper with our interactive chat</p>

                  {/* Sub-steps */}
                  <div className="sub-steps">
                    <div className="sub-step">
                      <div className="sub-step-badge">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="sub-step-text">
                        <strong>AI-Generated Insights</strong>
                        <p>Automatic analysis produces Observations, Key Insights, and Actionable Recommendations</p>
                      </div>
                    </div>
                    <div className="sub-step">
                      <div className="sub-step-badge">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <div className="sub-step-text">
                        <strong>Interactive AI Chat</strong>
                        <p>Use the AI chat at the bottom to ask questions, request explanations, or dive deeper into any insight</p>
                      </div>
                    </div>
                    <div className="sub-step">
                      <div className="sub-step-badge">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                      </div>
                      <div className="sub-step-text">
                        <strong>Click to Explore</strong>
                        <p>Click on a Key Insight, Observation or Actionable Item and CODi will provide detailed explanations with evidence</p>
                      </div>
                    </div>
                  </div>

                  <div className="step-image-placeholder">
                    <div className="placeholder-navbar">
                      <div className="navbar-dot"></div>
                      <div className="navbar-dot"></div>
                      <div className="navbar-dot"></div>
                      <span className="navbar-title">Retrospective Analysis Page</span>
                    </div>
                    <div className="placeholder-content">
                      <img src="/screenshots/retrospective-analysis.png" alt="Retrospective Analysis Page" className="placeholder-img" />
                      <div className="scroll-indicator">
                        <svg className="scroll-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <span>Scroll to explore</span>
                      </div>
                    </div>
                    <div className="animated-arrow arrow-down">↓</div>
                  </div>
                </div>
                <div className="step-number">
                  <div className="animated-circle">
                    <div className="circle-pulse"></div>
                    <span className="number">2</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="step-item zigzag-left" style={{ animationDelay: '0.3s' }}>
                <div className="step-number">
                  <div className="animated-circle">
                    <div className="circle-pulse"></div>
                    <span className="number">3</span>
                  </div>
                </div>
                <div className="step-content">
                  <h3 className="step-title">View & Manage Reports</h3>
                  <p className="step-description">Explore comprehensive reports with interactive visualisations and detailed metrics</p>

                  {/* Sub-steps */}
                  <div className="sub-steps">
                    <div className="sub-step">
                      <div className="sub-step-badge">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="sub-step-text">
                        <strong>Your Report History</strong>
                        <p>Contains a report from every time your analytics have been synced, as well as any manually added reports</p>
                      </div>
                    </div>
                    <div className="sub-step">
                      <div className="sub-step-badge">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div className="sub-step-text">
                        <strong>Key Metrics Displayed</strong>
                        <p>Track Sessions, Users, Page Views, Bounce Rate, Avg. Session Duration, and Conversion metrics</p>
                      </div>
                    </div>
                    <div className="sub-step">
                      <div className="sub-step-badge">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                      </div>
                      <div className="sub-step-text">
                        <strong>Interactive Controls</strong>
                        <div className="control-buttons-list">
                          <div className="control-button-item">
                            <span className="control-arrow">→</span>
                            <div className="control-button-wrapper">
                              <div className="control-button control-button-edit">
                                <span>Edit</span>
                              </div>
                              <span className="control-desc">Modify reports</span>
                            </div>
                          </div>
                          <div className="control-button-item">
                            <span className="control-arrow">→</span>
                            <div className="control-button-wrapper">
                              <div className="control-button control-button-analysis">
                                <img
                                  src="/logos/side.png"
                                  alt="CODi Logo"
                                  className="control-logo"
                                  style={{ width: '30px', transform: 'scale(3)', transformOrigin: 'center' }}
                                />
                                <span>Analysis</span>
                              </div>
                              <span className="control-desc">Redirect to CODi AI for deeper insights</span>
                            </div>
                          </div>
                          <div className="control-button-item">
                            <span className="control-arrow">→</span>
                            <div className="control-button-wrapper">
                              <div className="control-button control-button-slideshow">
                                <span>Slideshow View</span>
                              </div>
                              <span className="control-desc">Visualise metrics in presentation mode</span>
                            </div>
                          </div>
                          <div className="control-button-item">
                            <span className="control-arrow">→</span>
                            <div className="control-button-wrapper">
                              <div className="control-button control-button-new">
                                <span>+ New Report</span>
                              </div>
                              <span className="control-desc">Generate custom reports from your data. Text, tables, and charts can be manually entered</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="step-image-placeholder">
                    <div className="placeholder-navbar">
                      <div className="navbar-dot"></div>
                      <div className="navbar-dot"></div>
                      <div className="navbar-dot"></div>
                      <span className="navbar-title">View Reports Page</span>
                    </div>
                    <div className="placeholder-content">
                      <img src="/screenshots/viewreports.png" alt="View Reports Page" className="placeholder-img" />
                      <div className="scroll-indicator">
                        <svg className="scroll-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <span>Scroll to explore</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Final CTA */}
              <div className="step-cta">
                <button onClick={() => router.push('/import')} className="cta-button">
                  <span>Get Started</span>
                  <svg className="cta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="chat-button"
        title="Chat with CODi"
      >
        <svg className="chat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <div className="chat-button-ripple"></div>
      </button>

      <ChatBotWindow 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
      />

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .dashboard-page {
          min-height: 100vh;
          background: #F0F0EE;
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex;
        }

        /* Enhanced Loading Screen */
        .dashboard-loading {
          min-height: 100vh;
          background: linear-gradient(135deg, #365B5E 0%, #4a7378 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2rem;
        }

        .loading-spinner {
          position: relative;
          width: 80px;
          height: 80px;
        }

        .spinner-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 4px solid transparent;
          border-top-color: #E59853;
          border-radius: 50%;
          animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
        }

        .spinner-ring:nth-child(2) {
          border-top-color: #A3BCBA;
          animation-delay: -0.5s;
          width: 70%;
          height: 70%;
          top: 15%;
          left: 15%;
        }

        .spinner-ring:nth-child(3) {
          border-top-color: #4A90E2;
          animation-delay: -1s;
          width: 40%;
          height: 40%;
          top: 30%;
          left: 30%;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          color: #F0F0EE;
          font-size: 1.1rem;
          font-weight: 500;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Sidebar Animations */
        .sidebar {
          width: 280px;
          background: white;
          border-right: 1px solid #E5E5E5;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          z-index: 100;
          transform: translateX(-100%);
          transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .sidebar.loaded {
          transform: translateX(0);
        }

        .sidebar-header {
          padding: 2rem 1.5rem;
          border-bottom: 1px solid #E5E5E5;
          animation: fadeInDown 0.8s ease-out 0.3s both;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .logo-image {
          animation: scaleIn 0.6s ease-out 0.5s both;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0) scale(3);
            opacity: 0;
          }
          to {
            transform: scale(1) scale(3);
            opacity: 1;
          }
        }

        .sidebar-subtitle {
          font-size: 0.9rem;
          color: #7F8C8D;
          font-weight: 500;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.5rem 0;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          width: 100%;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: #7F8C8D;
          font-weight: 500;
          border-left: 3px solid transparent;
          position: relative;
          overflow: hidden;
          opacity: 0;
          transform: translateX(-20px);
          animation: slideInLeft 0.5s ease-out forwards;
        }

        @keyframes slideInLeft {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .nav-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 0;
          height: 100%;
          background: linear-gradient(90deg, rgba(54, 91, 94, 0.05), transparent);
          transition: width 0.3s ease;
        }

        .nav-item:hover::before {
          width: 100%;
        }

        .nav-item:hover {
          background: #F0F0EE;
          color: #365B5E;
          transform: translateX(5px);
        }

        .nav-item:hover .nav-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .nav-item.active {
          background: rgba(54, 91, 94, 0.08);
          color: #365B5E;
          border-left-color: #E59853;
        }

        .nav-item.active::after {
          content: '';
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 6px;
          height: 6px;
          background: #E59853;
          border-radius: 50%;
          animation: dotPulse 2s ease-in-out infinite;
        }

        @keyframes dotPulse {
          0%, 100% {
            transform: translateY(-50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-50%) scale(1.5);
            opacity: 0.7;
          }
        }

        .nav-icon {
          width: 1.5rem;
          height: 1.5rem;
          flex-shrink: 0;
          transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .nav-label {
          font-size: 0.95rem;
        }

        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid #E5E5E5;
          animation: fadeInUp 0.6s ease-out 0.8s both;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #365B5E, #A3BCBA);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.1rem;
          animation: avatarPulse 3s ease-in-out infinite;
          position: relative;
        }

        @keyframes avatarPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(54, 91, 94, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(54, 91, 94, 0);
          }
        }

        .user-details {
          flex: 1;
          min-width: 0;
        }

        .user-name {
          font-weight: 600;
          color: #303D23;
          font-size: 0.9rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email {
          font-size: 0.8rem;
          color: #7F8C8D;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem;
          background: #F0F0EE;
          border: 1px solid #E5E5E5;
          border-radius: 8px;
          color: #7F8C8D;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          position: relative;
          overflow: hidden;
        }

        .logout-btn:hover {
          background: #365B5E;
          color: white;
          border-color: #365B5E;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(54, 91, 94, 0.2);
        }

        .logout-btn:hover .logout-icon {
          transform: translateX(5px);
        }

        .logout-icon {
          width: 1.25rem;
          height: 1.25rem;
          transition: transform 0.3s ease;
        }

        /* Main Content Animations */
        .main-content {
          flex: 1;
          margin-left: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }

        .welcome-container {
          text-align: center;
          opacity: 0;
          transform: scale(0.9);
          transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .welcome-container.loaded {
          opacity: 1;
          transform: scale(1);
        }

        .welcome-title {
          font-family: 'Questrial', sans-serif;
          font-size: 3.5rem;
          font-weight: 700;
          color: #3d3123ff;
          margin-bottom: 2.5rem;
          background: linear-gradient(135deg, #365B5E, #E59853, #A3BCBA);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 4s ease infinite;
          background-size: 200% 200%;
          text-shadow: 0 4px 10px rgba(54, 91, 94, 0.1);
        }

        .title-exclamation {
          display: inline-block;
          animation: bounceExclamation 1.5s ease-in-out infinite;
        }

        @keyframes bounceExclamation {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(-10deg);
          }
        }

        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .get-started-btn {
          padding: 1rem 2.5rem;
          background: linear-gradient(135deg, #365B5E, #A3BCBA);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.15rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          box-shadow: 0 4px 15px rgba(54, 91, 94, 0.2);
          position: relative;
          overflow: hidden;
          animation: buttonFloat 3s ease-in-out infinite;
          min-width: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @keyframes buttonFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .get-started-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }

        .get-started-btn:hover::before {
          left: 100%;
        }

        .get-started-btn:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 8px 25px rgba(54, 91, 94, 0.4);
          background: linear-gradient(135deg, #2d4a4d, #8da9a7);
        }

        .get-started-btn:active {
          transform: translateY(-2px) scale(1.02);
        }

        .btn-text {
          position: relative;
          z-index: 1;
        }

        .btn-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .get-started-btn:hover .btn-glow {
          width: 300px;
          height: 300px;
        }

        /* Chat Button with Enhanced Animations */
        .chat-button {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 4rem;
          height: 4rem;
          background: linear-gradient(135deg, #E59853, #FF6F61);
          color: white;
          border: none;
          border-radius: 50%;
          box-shadow: 0 4px 20px rgba(229, 152, 83, 0.3);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: chatFloat 3s ease-in-out infinite;
        }

        @keyframes chatFloat {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(-5deg);
          }
          75% {
            transform: translateY(-5px) rotate(5deg);
          }
        }

        .chat-button::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: inherit;
          border-radius: 50%;
          animation: ripple 2s ease-out infinite;
        }

        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .chat-button:hover {
          transform: scale(1.15) rotate(10deg);
          box-shadow: 0 8px 30px rgba(229, 152, 83, 0.5);
          animation: none;
        }

        .chat-button:active {
          transform: scale(0.95);
        }

        .chat-icon {
          width: 2rem;
          height: 2rem;
          position: relative;
          z-index: 1;
          animation: iconBounce 2s ease-in-out infinite;
        }

        @keyframes iconBounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .chat-button-ripple {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid #E59853;
          animation: rippleEffect 2s ease-out infinite;
          animation-delay: 0.5s;
        }

        @keyframes rippleEffect {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        /* Smooth scrollbar */
        .sidebar-nav::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: #A3BCBA;
          border-radius: 3px;
          transition: background 0.3s;
        }

        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: #365B5E;
        }

        /* Action Buttons Container */
        .action-buttons {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        /* How to Use Button */
        .how-to-use-btn {
          padding: 1rem 2.5rem;
          background: linear-gradient(135deg, #F4A261, #E59853);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.15rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          box-shadow: 0 4px 15px rgba(244, 162, 97, 0.25);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          position: relative;
          overflow: hidden;
          animation: buttonFloat 3s ease-in-out infinite;
          animation-delay: 0.5s;
          outline: none;
          min-width: 240px;
          justify-content: center;
        }

        .how-to-use-btn:focus {
          outline: none;
        }

        .how-to-use-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }

        .how-to-use-btn:hover::before {
          left: 100%;
        }

        .how-to-use-btn:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 8px 25px rgba(244, 162, 97, 0.4);
          background: linear-gradient(135deg, #F4A261, #E59853);
        }

        .how-to-use-btn:active {
          transform: translateY(-2px) scale(1.02);
        }

        .chevron-icon {
          width: 1.25rem;
          height: 1.25rem;
          transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .chevron-icon.rotated {
          transform: rotate(180deg);
        }

        /* How to Use Section */
        .how-to-use-section {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          margin-top: 0;
        }

        .how-to-use-section.expanded {
          max-height: 5000px;
          opacity: 1;
          margin-top: 3rem;
          margin-bottom: 4rem;
        }

        .steps-container {
          background: white;
          border-radius: 20px;
          padding: 4rem 3rem 3rem 3rem;
          box-shadow: 0 10px 40px rgba(54, 91, 94, 0.1);
          max-width: 1100px;
          margin: 0 auto;
        }

        /* Step Item */
        .step-item {
          display: flex;
          gap: 3rem;
          margin-bottom: 4rem;
          opacity: 0;
          transform: translateY(20px);
          animation: stepFadeIn 0.6s ease-out forwards;
          align-items: center;
        }

        .step-item.zigzag-left {
          flex-direction: row;
        }

        .step-item.zigzag-right {
          flex-direction: row-reverse;
        }

        @keyframes stepFadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .step-number {
          flex-shrink: 0;
          min-width: 100px;
          display: flex;
          justify-content: center;
        }

        .animated-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #E59853, #D4873E);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 0 4px 15px rgba(229, 152, 83, 0.3);
          animation: circlePulse 2s ease-in-out infinite;
        }

        @keyframes circlePulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .circle-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: inherit;
          animation: pulseRing 2s ease-out infinite;
        }

        @keyframes pulseRing {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .number {
          position: relative;
          z-index: 1;
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .step-content {
          flex: 1;
          position: relative;
        }

        .step-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #365B5E;
          margin-bottom: 0.75rem;
        }

        .step-description {
          color: #7F8C8D;
          font-size: 1.1rem;
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }

        .step-image-placeholder {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          border: 2px solid #E5E5E5;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .step-image-placeholder:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(54, 91, 94, 0.15);
          border-color: #A3BCBA;
        }

        .placeholder-navbar {
          background: linear-gradient(135deg, #365B5E, #4A7377);
          padding: 0.75rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .navbar-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transition: background 0.3s ease;
        }

        .navbar-dot:nth-child(1) {
          background: #FF5F57;
        }

        .navbar-dot:nth-child(2) {
          background: #FFBD2E;
        }

        .navbar-dot:nth-child(3) {
          background: #28CA42;
        }

        .navbar-title {
          color: white;
          font-size: 0.9rem;
          font-weight: 500;
          margin-left: 0.5rem;
        }

        .placeholder-content {
          background: #f8f8f8;
          overflow-y: auto;
          overflow-x: hidden;
          max-height: 400px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }

        .placeholder-content::-webkit-scrollbar {
          width: 8px;
        }

        .placeholder-content::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .placeholder-content::-webkit-scrollbar-thumb {
          background: #A3BCBA;
          border-radius: 4px;
        }

        .placeholder-content::-webkit-scrollbar-thumb:hover {
          background: #365B5E;
        }

        .placeholder-img {
          width: 100%;
          height: auto;
          display: block;
        }

        /* Scroll Indicator */
        .scroll-indicator {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          background: rgba(54, 91, 94, 0.9);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          color: white;
          font-size: 0.75rem;
          font-weight: 500;
          animation: scrollPulse 2s ease-in-out infinite;
          z-index: 10;
          pointer-events: none;
        }

        @keyframes scrollPulse {
          0%, 100% {
            opacity: 0.7;
            transform: translateX(-50%) translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateX(-50%) translateY(5px);
          }
        }

        .scroll-icon {
          width: 1rem;
          height: 1rem;
        }

        /* Sub-steps Container */
        .sub-steps {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
          margin-top: 1.5rem;
        }

        .sub-step {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          padding: 1rem;
          background: linear-gradient(135deg, rgba(163, 188, 186, 0.08), rgba(54, 91, 94, 0.05));
          border-radius: 12px;
          border-left: 3px solid #E59853;
          transition: all 0.3s ease;
          animation: subStepSlideIn 0.5s ease-out backwards;
        }

        .sub-step:nth-child(1) {
          animation-delay: 0.1s;
        }

        .sub-step:nth-child(2) {
          animation-delay: 0.2s;
        }

        .sub-step:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes subStepSlideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .sub-step:hover {
          background: linear-gradient(135deg, rgba(163, 188, 186, 0.12), rgba(54, 91, 94, 0.08));
          transform: translateX(5px);
          box-shadow: 0 4px 12px rgba(54, 91, 94, 0.1);
        }

        .sub-step-badge {
          width: 32px;
          height: 32px;
          min-width: 32px;
          background: linear-gradient(135deg, #E59853, #D4873E);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(229, 152, 83, 0.3);
        }

        .sub-step-badge svg {
          width: 18px;
          height: 18px;
        }

        .sub-step-text {
          flex: 1;
        }

        .sub-step-text strong {
          display: block;
          color: #365B5E;
          font-size: 1rem;
          margin-bottom: 0.25rem;
          font-weight: 600;
        }

        .sub-step-text p {
          color: #7F8C8D;
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0;
        }

        /* Control Buttons List */
        .control-buttons-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
          align-items: center;
        }

        .control-button-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          width: 100%;
          max-width: 600px;
        }

        .control-arrow {
          color: #E59853;
          font-size: 1.5rem;
          font-weight: bold;
          line-height: 1;
          flex-shrink: 0;
        }

        .control-button-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
          align-items: center;
        }

        .control-button {
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-size: 0.95rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: fit-content;
          transition: transform 0.2s ease;
        }

        .control-button:hover {
          transform: translateY(-2px);
        }

        .control-button-edit {
          background: #E59853;
        }

        .control-button-analysis {
          background: linear-gradient(135deg, #A3BCBA, #365B5E);
        }

        .control-button-slideshow {
          background: linear-gradient(135deg, #3AB0FF, #00C49F);
        }

        .control-button-new {
          background: linear-gradient(135deg, #365B5E, #A3BCBA);
        }

        .control-logo {
          width: 30px;
          transform: scale(3);
          transform-origin: center;
        }

        .control-desc {
          color: #7F8C8D;
          font-size: 0.85rem;
          line-height: 1.4;
          text-align: center;
        }

        .animated-arrow {
          position: absolute;
          bottom: -3rem;
          left: 50%;
          transform: translateX(-50%);
          font-size: 3rem;
          font-weight: bold;
          color: #E59853;
        }

        .arrow-down {
          animation: arrowFloatDown 2s ease-in-out infinite;
        }

        @keyframes arrowFloatDown {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          50% {
            transform: translateX(-50%) translateY(15px);
          }
        }

        /* Get started button at end, ie call to action */
        .step-cta {
          text-align: center;
          margin-top: 5rem;
          padding-top: 2rem;
          padding-bottom: 3rem;
          margin-bottom: 2rem;
        }

        .cta-button {
          padding: 1.25rem 3rem;
          background: linear-gradient(135deg, #365B5E, #A3BCBA);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.3rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          box-shadow: 0 4px 15px rgba(54, 91, 94, 0.2);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          position: relative;
          overflow: hidden;
        }

        .cta-button span {
          display: flex;
          align-items: center;
        }

        .cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }

        .cta-button:hover::before {
          left: 100%;
        }

        .cta-button:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 10px 30px rgba(54, 91, 94, 0.35);
          background: linear-gradient(135deg, #2d4a4d, #8fa9a7);
        }

        .cta-icon {
          width: 1.5rem;
          height: 1.5rem;
          transition: transform 0.3s ease;
        }

        .cta-button:hover .cta-icon {
          transform: translateX(5px);
        }

      `}</style>
    </div>
  );
}