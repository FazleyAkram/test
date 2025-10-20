import React, { useEffect } from 'react';

const LandingPage = () => {
  useEffect(() => {
    const handleNavClick = (e) => {
      if (e.target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    };

    document.addEventListener('click', handleNavClick);

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
      observer.observe(el);
    });

    return () => {
      document.removeEventListener('click', handleNavClick);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <style>{`
        {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          color: #303D23;
        }

        landing-page {
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          color: #303D23;
        }

        header {
          position: fixed;
          top: 0;
          width: 100%;
          background: rgba(240, 240, 238, 0.98);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(54, 91, 94, 0.1);
          z-index: 1000;
          padding: 1.25rem 0;
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        .logo-text {
          font-family: 'Questrial', sans-serif;
          font-size: 1.75rem;
          font-weight: 800;
          color: #365B5E;
          letter-spacing: -0.02em;
        }

        .logo-accent {
          font-size: 1rem;
          font-weight: 500;
          color: #7F8C8D;
        }

        .nav-links {
          display: flex;
          list-style: none;
          gap: 2.5rem;
          margin: 0;
        }

        .nav-links a {
          color: #303D23;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          position: relative;
        }

        .nav-links a:hover {
          color: #365B5E;
        }

        .nav-links a::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: #365B5E;
          transition: width 0.2s ease;
        }

        .nav-links a:hover::after {
          width: 100%;
        }

        hero {
          background: linear-gradient(135deg, #365B5E 0%, #A3BCBA 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 80%, rgba(229, 152, 83, 0.15) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(163, 188, 186, 0.15) 0%, transparent 50%);
          animation: pulse 8s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        .hero-grid {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .hero-content {
          color: #F0F0EE;
        }

        .hero-badge {
          display: inline-block;
          background: rgba(240, 240, 238, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(240, 240, 238, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 25px;
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
          letter-spacing: 0.02em;
        }

        .hero-title {
          font-family: 'Questrial', sans-serif;
          font-size: 3.75rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          letter-spacing: -0.03em;
        }

        .title-accent {
          background: linear-gradient(135deg, #E59853, #FF6F61);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          opacity: 0.95;
          line-height: 1.6;
          font-weight: 400;
        }

        .hero-stats {
          display: flex;
          gap: 2rem;
          margin-bottom: 2.5rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: #E59853;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.85rem;
          opacity: 0.9;
          font-weight: 500;
          margin-top: 0.25rem;
        }

        .hero-cta {
          display: flex;
        }

        .btn-primary {
          background: #F0F0EE;
          color: #365B5E;
          padding: 1rem 2rem;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.05rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        }

        .btn-icon {
          width: 1.25rem;
          height: 1.25rem;
          transition: transform 0.2s ease;
        }

        .btn-primary:hover .btn-icon {
          transform: translateX(3px);
        }

        hero-visual {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .dashboard-preview {
          background: rgba(240, 240, 238, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(240, 240, 238, 0.2);
          border-radius: 20px;
          padding: 1.5rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(240, 240, 238, 0.1);
        }

        .preview-dots {
          display: flex;
          gap: 0.5rem;
        }

        .preview-dots span {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 50%;
          background: rgba(240, 240, 238, 0.3);
        }

        .preview-title {
          color: #F0F0EE;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .preview-content {
          display: flex;
          flex-direction: column;
        }

        .metric-card {
          background: rgba(240, 240, 238, 0.1);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1rem;
          text-align: center;
        }

        .metric-label {
          color: rgba(240, 240, 238, 0.8);
          font-size: 0.8rem;
          margin-bottom: 0.5rem;
        }

        .metric-value {
          color: #E59853;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .chart-placeholder {
          height: 80px;
          background: rgba(240, 240, 238, 0.05);
          border-radius: 8px;
          position: relative;
          overflow: hidden;
        }

        .chart-placeholder::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: linear-gradient(90deg, transparent, rgba(229, 152, 83, 0.3), transparent);
          clip-path: polygon(0 100%, 20% 60%, 40% 80%, 60% 40%, 80% 70%, 100% 30%, 100% 100%);
        }

        features {
          padding: 6rem 0;
          background: #F0F0EE;
        }

        .section-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-title {
          font-family: 'Questrial', sans-serif;
          font-size: 2.75rem;
          font-weight: 700;
          color: #303D23;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }

        .section-subtitle {
          font-size: 1.2rem;
          color: #7F8C8D;
          max-width: 700px;
          margin: 0 auto;
          font-weight: 400;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 16px;
          padding: 2.5rem;
          transition: all 0.3s ease;
          position: relative;
        }

        .feature-card:hover {
          border-color: #365B5E;
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(54, 91, 94, 0.08);
        }

        .feature-icon {
          width: 3rem;
          height: 3rem;
          color: #365B5E;
          margin-bottom: 1.5rem;
        }

        .feature-card h3 {
          font-family: 'Questrial', sans-serif;
          font-size: 1.4rem;
          font-weight: 600;
          color: #303D23;
          margin-bottom: 1rem;
          letter-spacing: -0.01em;
        }

        .feature-card p {
          color: #7F8C8D;
          line-height: 1.6;
          font-size: 1rem;
        }

        process {
          padding: 6rem 0;
          background: white;
        }

        .process-flow {
          max-width: 900px;
          margin: 0 auto;
        }

        .process-step {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 2rem;
          margin-bottom: 3rem;
          align-items: start;
        }

        .step-visual {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .step-number {
          width: 4rem;
          height: 4rem;
          background: linear-gradient(135deg, #365B5E, #A3BCBA);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }

        .step-connector {
          width: 2px;
          height: 60px;
          background: linear-gradient(to bottom, #365B5E, transparent);
          opacity: 0.3;
        }

        .process-step:last-child .step-connector {
          display: none;
        }

        .step-content h3 {
          font-family: 'Questrial', sans-serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #303D23;
          margin-bottom: 0.75rem;
          letter-spacing: -0.01em;
        }

        step-content p {
          color: #7F8C8D;
          line-height: 1.6;
          font-size: 1.05rem;
        }

        cta-section {
          background: linear-gradient(135deg, #365B5E 0%, #A3BCBA 100%);
          padding: 5rem 0;
        }

        .cta-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .cta-content {
          text-align: center;
          color: #F0F0EE;
        }

        .cta-title {
          font-family: 'Questrial', sans-serif;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }

        .cta-description {
          font-size: 1.2rem;
          margin-bottom: 2.5rem;
          opacity: 0.95;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .btn-cta {
          background: #F0F0EE;
          color: #365B5E;
          padding: 1.25rem 2.5rem;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.1rem;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          transition: all 0.3s ease;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        }

        .btn-cta:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
        }

        footer {
          background: #303D23;
          color: #F0F0EE;
          padding: 3rem 0 1.5rem;
        }

        .footer-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .footer-content {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 3rem;
          align-items: start;
          margin-bottom: 2rem;
        }

        .footer-brand {
          max-width: 400px;
        }

        .footer-logo {
          font-family: 'Questrial', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #A3BCBA;
          margin-bottom: 0.5rem;
        }

        .footer-tagline {
          color: #A3BCBA;
          font-size: 1rem;
        }

        .footer-links {
          display: flex;
          gap: 2rem;
        }

        .footer-links a {
          color: #A3BCBA;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .footer-links a:hover {
          color: #F0F0EE;
        }

        .footer-bottom {
          padding-top: 2rem;
          border-top: 1px solid rgba(163, 188, 186, 0.2);
          text-align: center;
        }

        .footer-bottom p {
          color: #A3BCBA;
          font-size: 0.9rem;
        }

        fade-in {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }

        .fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 1024px) {
          hero-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
            text-align: center;
          }
          
          .hero-visual {
            order: -1;
          }

          .hero-cta {
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-description {
            font-size: 1.1rem;
          }
          
          .nav-links {
            display: none;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .process-step {
            grid-template-columns: 80px 1fr;
            gap: 1.5rem;
          }
          
          .hero-stats {
            justify-content: center;
          }
          
          .footer-content {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
          }
          
          .footer-links {
            justify-content: center;
          }
        }
      `}</style>
      
      <div className="landing-page">
        <header className="header">
          <nav className="nav-container">
            <div className="logo">
              <span className="logo-text">CODi</span>
              <span className="logo-accent">Intelligence</span>
            </div>
            <ul className="nav-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#process">Process</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
        </header>

        <main>
          <section className="hero">
            <div className="hero-grid">
              <div className="hero-content">
                <div className="hero-badge">Marketing Analytics Platform</div>
                <h1 className="hero-title">
                  Transform Marketing Data into 
                  <span className="title-accent"> Strategic Insights</span>
                </h1>
                <p className="hero-description">
                  Comprehensive AI-driven analysis of your marketing performance across all channels. 
                  Get actionable recommendations backed by 12 months of historical data.
                </p>
                <div className="hero-stats">
                  <div className="stat-item">
                    <div className="stat-number">12+</div>
                    <div className="stat-label">Months Analysis</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">AI</div>
                    <div className="stat-label">Powered Insights</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">360°</div>
                    <div className="stat-label">Performance View</div>
                  </div>
                </div>
                <div className="hero-cta">
                  <a href="/login" className="btn-primary">
                    Access Platform
                    <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                  </a>
                </div>
              </div>
              <div className="hero-visual">
                <div className="dashboard-preview">
                  <div className="preview-header">
                    <div className="preview-dots">
                      <span></span><span></span><span></span>
                    </div>
                    <div className="preview-title">CODi Analytics</div>
                  </div>
                  <div className="preview-content">
                    <div className="metric-card">
                      <div className="metric-label">Conversion Rate</div>
                      <div className="metric-value">+23.5%</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-label">Traffic Growth</div>
                      <div className="metric-value">+187%</div>
                    </div>
                    <div className="chart-placeholder"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="features">
            <div className="section-container">
              <div className="section-header fade-in">
                <h2 className="section-title">Platform Capabilities</h2>
                <p className="section-subtitle">
                  Comprehensive marketing intelligence tools designed for data-driven professionals
                </p>
              </div>
              
              <div className="features-grid">
                <div className="feature-card fade-in">
                  <div className="feature-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                  <h3>Historical Performance Analysis</h3>
                  <p>12-month deep dive across Google Analytics, social platforms, and campaign data with trend identification.</p>
                </div>
                
                <div className="feature-card fade-in">
                  <div className="feature-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                  <h3>AI-Powered Recommendations</h3>
                  <p>Machine learning algorithms analyze patterns to provide strategic guidance and optimization opportunities.</p>
                </div>
                
                <div className="feature-card fade-in">
                  <div className="feature-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
                    </svg>
                  </div>
                  <h3>Performance Benchmarking</h3>
                  <p>Compare metrics against industry standards and competitive analysis to identify market positioning.</p>
                </div>
                
                <div className="feature-card fade-in">
                  <div className="feature-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </div>
                  <h3>Interactive Analysis</h3>
                  <p>Query your data with natural language and receive detailed explanations for informed decision making.</p>
                </div>
                
                <div className="feature-card fade-in">
                  <div className="feature-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  </div>
                  <h3>Audience Segmentation</h3>
                  <p>Detailed demographic analysis, behavioral patterns, and customer journey mapping for targeted strategies.</p>
                </div>
                
                <div className="feature-card fade-in">
                  <div className="feature-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                  </div>
                  <h3>Strategic Recommendations</h3>
                  <p>Actionable insights for immediate optimization and long-term growth planning with ROI projections.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="process" className="process">
            <div className="section-container">
              <div className="section-header fade-in">
                <h2 className="section-title">Analysis Methodology</h2>
                <p className="section-subtitle">Systematic approach to marketing intelligence and strategic planning</p>
              </div>
              
              <div className="process-flow">
                <div className="process-step fade-in">
                  <div className="step-visual">
                    <div className="step-number">01</div>
                    <div className="step-connector"></div>
                  </div>
                  <div className="step-content">
                    <h3>Data Integration</h3>
                    <p>Secure connection to marketing platforms with automated data validation and quality assessment.</p>
                  </div>
                </div>
                
                <div className="process-step fade-in">
                  <div className="step-visual">
                    <div className="step-number">02</div>
                    <div className="step-connector"></div>
                  </div>
                  <div className="step-content">
                    <h3>Intelligence Processing</h3>
                    <p>AI algorithms analyze performance patterns, audience behavior, and campaign effectiveness metrics.</p>
                  </div>
                </div>
                
                <div className="process-step fade-in">
                  <div className="step-visual">
                    <div className="step-number">03</div>
                    <div className="step-connector"></div>
                  </div>
                  <div className="step-content">
                    <h3>Strategic Analysis</h3>
                    <p>Generate comprehensive reports with benchmarking data and optimization recommendations.</p>
                  </div>
                </div>
                
                <div className="process-step fade-in">
                  <div className="step-visual">
                    <div className="step-number">04</div>
                  </div>
                  <div className="step-content">
                    <h3>Implementation Guidance</h3>
                    <p>Interactive consultation to prioritize initiatives and execute data-driven marketing strategies.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="cta-section">
            <div className="cta-container">
              <div className="cta-content">
                <h2 className="cta-title">Ready to Optimize Your Marketing Strategy?</h2>
                <p className="cta-description">
                  Join marketing professionals who use data-driven insights to accelerate growth and improve ROI.
                </p>
                <a href="/login" className="btn-cta">
                  Start Analysis
                  <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </a>
              </div>
            </div>
          </section>
        </main>

        <footer id="contact" className="footer">
          <div className="footer-container">
            <div className="footer-content">
              <div className="footer-brand">
                <div className="footer-logo">CODi Intelligence</div>
                <p className="footer-tagline">Marketing analytics for strategic growth</p>
              </div>
              <div className="footer-links">
                <a href="#features">Platform</a>
                <a href="#process">Methodology</a>
                <a href="#contact">Support</a>
              </div>
            </div>
            <div className="footer-bottom">
              <p>© 2025 CODi Marketing Intelligence Platform. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;