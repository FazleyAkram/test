"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      {/* Background */}
      <div className="login-background">
        <div className="bg-overlay"></div>
      </div>

      {/* Back Navigation */}
      <div className="back-navigation">
        <Link href="/" className="back-link">
          <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Main Content */}
      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="logo-container">
              <Image 
                src="/codi-logo.png"
                alt="CODi Logo" 
                width={80}
                height={80}
                className="login-logo"
              />
            </div>
            <h1 className="login-title">
              CODi <span className="title-accent">Intelligence</span>
            </h1>
            <p className="login-subtitle">Marketing Analytics Platform</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>

            {error && (
              <div className="error-message">
                <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="login-button">
              Sign In
              <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </button>

            <div className="form-links">
              <Link href="/signup" className="form-link">
                Create Account
              </Link>
              <Link href="/forgot-password" className="form-link">
                Reset Password
              </Link>
            </div>
          </form>
        </div>

        {/* Side Information */}
        <div className="login-info">
          <div className="info-content">
            <h3 className="info-title">Marketing Intelligence Platform</h3>
            <p className="info-description">
              Comprehensive analysis of your marketing performance with AI-driven insights 
              and strategic recommendations for data-driven growth.
            </p>
            <div className="info-features">
              <div className="info-feature">
                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                12-Month Historical Analysis
              </div>
              <div className="info-feature">
                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                AI-Powered Recommendations
              </div>
              <div className="info-feature">
                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                Interactive Data Consultation
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display', sans-serif;
        }

        .login-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .bg-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
                      radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.08) 0%, transparent 50%);
          animation: pulse 8s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .back-navigation {
          position: absolute;
          top: 2rem;
          left: 2rem;
          z-index: 10;
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
          text-decoration: none;
          font-weight: 500;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          transition: all 0.2s ease;
          font-size: 0.95rem;
        }

        .back-link:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateX(-2px);
        }

        .back-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .login-container {
          position: relative;
          z-index: 2;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 1200px;
          margin: 0 auto;
          align-items: center;
          gap: 4rem;
          padding: 2rem;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          padding: 3rem;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
          animation: slideInLeft 0.8s ease-out;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .logo-container {
          margin-bottom: 1.5rem;
        }

        .login-logo {
          border-radius: 20px;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
        }

        .login-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .title-accent {
          color: #667eea;
        }

        .login-subtitle {
          color: #64748b;
          font-size: 1rem;
          font-weight: 500;
        }

        .login-form {
          width: 100%;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          color: #374151;
          font-weight: 500;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }

        .form-input {
          width: 100%;
          padding: 1rem 1.25rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: #f9fafb;
          color: #1e293b;
          font-size: 1rem;
          transition: all 0.2s ease;
          outline: none;
        }

        .form-input:focus {
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          transform: translateY(-1px);
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }

        .error-icon {
          width: 1.25rem;
          height: 1.25rem;
          flex-shrink: 0;
        }

        .login-button {
          width: 100%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .login-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.25);
        }

        .button-icon {
          width: 1.25rem;
          height: 1.25rem;
          transition: transform 0.2s ease;
        }

        .login-button:hover .button-icon {
          transform: translateX(3px);
        }

        .form-links {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
        }

        .form-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition: color 0.2s ease;
        }

        .form-link:hover {
          color: #5a67d8;
          text-decoration: underline;
        }

        /* Right Side Info Panel */
        .login-info {
          color: white;
          animation: slideInRight 0.8s ease-out;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .info-content {
          max-width: 400px;
        }

        .info-title {
          font-size: 2.25rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .info-description {
          font-size: 1.1rem;
          margin-bottom: 2.5rem;
          opacity: 0.9;
          line-height: 1.6;
        }

        .info-features {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .info-feature {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-weight: 500;
          font-size: 1rem;
        }

        .feature-icon {
          width: 1.5rem;
          height: 1.5rem;
          color: #fbbf24;
          flex-shrink: 0;
        }

        /* Mobile Responsive */
        @media (max-width: 1024px) {
          .login-container {
            grid-template-columns: 1fr;
            gap: 3rem;
            justify-items: center;
            text-align: center;
          }
          
          .login-info {
            order: -1;
            max-width: 500px;
          }
        }

        @media (max-width: 768px) {
          .login-container {
            padding: 1rem;
            gap: 2rem;
          }
          
          .login-card {
            padding: 2rem 1.5rem;
            width: 100%;
            max-width: 400px;
          }
          
          .login-title {
            font-size: 2rem;
          }
          
          .info-title {
            font-size: 1.75rem;
          }
          
          .info-description {
            font-size: 1rem;
          }
          
          .back-navigation {
            top: 1rem;
            left: 1rem;
          }
          
          .form-links {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
          }
        }

        @media (max-width: 480px) {
          .info-features {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
