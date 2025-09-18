"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Header from '@/components/header/Header.jsx';
import ChatBot from '@/components/ChatBot';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-content">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-page">
      {/* Background with same gradient and animations */}
      <div className="dashboard-background">
        <div className="dashboard-bg-animation"></div>
      </div>

      <Header />
      
      <div className="dashboard-container">
        <div className="dashboard-content">
          {/* Welcome Section */}
          <div className="welcome-section">
            <h1 className="dashboard-title">CODi Marketing System</h1>
            <p className="dashboard-subtitle">Welcome to your marketing analytics dashboard</p>
            <p className="user-greeting">Hello, {user?.email}</p>
          </div>
          
          {/* Action Cards */}
          <div className="action-cards">
            <button 
              onClick={() => router.push('/import')} 
              className="action-card import-card"
            >
              <div className="card-icon">📊</div>
              <h3>Import Marketing Data</h3>
              <p>Connect your analytics and start your review</p>
            </button>

            <button 
              onClick={() => router.push('/dashboard/reports')} 
              className="action-card reports-card"
            >
              <div className="card-icon">📈</div>
              <h3>View Reports</h3>
              <p>Analyze your marketing performance and insights</p>
            </button>

            <button 
              onClick={() => router.push('/marketing')} 
              className="action-card marketing-card"
            >
              <div className="card-icon">📊</div>
              <h3>Marketing Analytics</h3>
              <p>Advanced analytics with AI insights and interactive charts</p>
            </button>
            
            {user?.isAdmin && (
              <button 
                onClick={() => router.push('/admin')} 
                className="action-card admin-card"
              >
                <div className="card-icon">⚙️</div>
                <h3>System Management</h3>
                <p>Manage users and system settings</p>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Button */}
      <button
        onClick={() => {
          console.log('Chat button clicked, setting isChatOpen to true');
          setIsChatOpen(true);
        }}
        className="chat-button"
        title="Chat with CODI Assistant"
      >
        <svg className="chat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* ChatBot Component */}
      <ChatBot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />

      <style jsx>{`
        .dashboard-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow-x: hidden;
          font-family: 'Arial', sans-serif;
        }

        .dashboard-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .dashboard-bg-animation {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="a" cx="50%" cy="50%"><stop offset="0%" style="stop-color:rgba(255,255,255,0.1)"/><stop offset="100%" style="stop-color:rgba(255,255,255,0)"/></radialGradient></defs><circle cx="200" cy="300" r="100" fill="url(%23a)" opacity="0.6"><animate attributeName="r" values="100;150;100" dur="4s" repeatCount="indefinite"/></circle><circle cx="800" cy="200" r="80" fill="url(%23a)" opacity="0.4"><animate attributeName="r" values="80;120;80" dur="3s" repeatCount="indefinite"/></circle><circle cx="600" cy="700" r="120" fill="url(%23a)" opacity="0.5"><animate attributeName="r" values="120;180;120" dur="5s" repeatCount="indefinite"/></circle></svg>');
          animation: float 20s infinite linear;
        }

        @keyframes float {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(100px); }
        }

        .dashboard-loading {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-content {
          color: white;
          font-size: 1.25rem;
          font-weight: 500;
        }

        .dashboard-container {
          position: relative;
          z-index: 2;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          padding-top: 6rem; /* Account for fixed header */
        }

        .dashboard-content {
          max-width: 1200px;
          width: 100%;
          text-align: center;
        }

        .welcome-section {
          margin-bottom: 4rem;
          animation: slideInUp 0.8s ease-out;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dashboard-title {
          font-size: 4rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .dashboard-subtitle {
          font-size: 1.5rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 1rem;
        }

        .user-greeting {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }

        .action-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .action-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 25px;
          padding: 3rem 2rem;
          color: white;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          animation: slideInUp 0.8s ease-out;
          text-decoration: none;
          display: block;
        }

        .import-card {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }

        .reports-card {
          animation-delay: 0.4s;
          animation-fill-mode: both;
        }

        .marketing-card {
          animation-delay: 0.6s;
          animation-fill-mode: both;
        }

        .admin-card {
          animation-delay: 0.8s;
          animation-fill-mode: both;
        }

        .action-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: all 0.5s ease;
        }

        .action-card:hover::before {
          left: 100%;
        }

        .action-card:hover {
          transform: translateY(-10px);
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .card-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        .action-card h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: white;
        }

        .action-card p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1rem;
          line-height: 1.5;
        }

        .chat-button {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          width: 4rem;
          height: 4rem;
          background: linear-gradient(45deg, #ff6b6b, #ffa726);
          color: white;
          border: none;
          border-radius: 50%;
          box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 40;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-button:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 35px rgba(255, 107, 107, 0.4);
        }

        .chat-icon {
          width: 2rem;
          height: 2rem;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .dashboard-title {
            font-size: 2.5rem;
          }
          
          .dashboard-subtitle {
            font-size: 1.2rem;
          }
          
          .action-cards {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .action-card {
            padding: 2rem 1.5rem;
          }
          
          .dashboard-container {
            padding: 1rem;
            padding-top: 5rem;
          }
        }

        /* Remove debug info in production */
        .fixed.top-20.right-4 {
          display: none;
        }
      `}</style>
    </div>
  );
}