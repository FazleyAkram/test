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
      <div className="login-background">
        <div className="bg-gradient"></div>
      </div>

      <div className="back-navigation">
        <Link href="/" className="back-link">
          <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <Link href="/" className="logo-container">
              <Image
                src="/logos/side.png"
                alt="CODi Logo"
                width={300}
                height={70}
                className="login-logo"
              />
            </Link>
            <p className="login-subtitle">Marketing. Managed. </p>
          </div>

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="login-button">
              Sign In
              <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            <div className="form-links">
              <Link href="/signup" className="form-link">
                Create Account
              </Link>
              <Link href="/forgot-password" className="form-link">
                Forgot Password
              </Link>
            </div>
          </form>

          <div className="card-features">
            <div className="card-feature">
              <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>12-Month Analysis</span>
            </div>
            <div className="card-feature">
              <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>AI-Powered Insights</span>
            </div>
            <div className="card-feature">
              <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Interactive Analysis</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #365B5E 0%, #4a7378 100%);
          position: relative;
          overflow: hidden;
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .bg-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 30% 70%, rgba(229, 152, 83, 0.15) 0%, transparent 50%),
                      radial-gradient(circle at 70% 30%, rgba(163, 188, 186, 0.15) 0%, transparent 50%);
          animation: gradientShift 8s ease-in-out infinite;
        }

        @keyframes gradientShift {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .back-navigation {
          position: fixed;
          top: 2rem;
          left: 2rem;
          z-index: 10;
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #F0F0EE;
          text-decoration: none;
          font-weight: 500;
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          background: rgba(240, 240, 238, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(240, 240, 238, 0.15);
          transition: all 0.2s ease;
          font-size: 0.95rem;
        }

        .back-link:hover {
          background: rgba(240, 240, 238, 0.15);
          transform: translateX(-3px);
        }

        .back-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .login-container {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          min-height: 100vh;
          width: 100%;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 480px;
          animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .logo-container {
          margin-bottom: 1rem;
          animation: logoFloat 3s ease-in-out infinite;
          display: flex;
          justify-content: center;
          cursor: pointer;
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .login-logo {
          width: auto;
          height: auto;
          max-width: 100%;
        }

        .login-subtitle {
          color: #335b5eff;
          font-size: 1.1rem;
          font-weight: 500;
          animation: fadeIn 0.8s ease 0.4s both;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .login-form {
          width: 100%;
          animation: fadeIn 0.8s ease 0.6s both;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          color: #303D23;
          font-weight: 600;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }

        .form-input {
          width: 100%;
          padding: 1rem 1.25rem;
          border: 2px solid #E5E5E5;
          border-radius: 8px;
          background: #F0F0EE;
          color: #303D23;
          font-size: 1rem;
          transition: all 0.2s ease;
          outline: none;
          font-family: 'Roboto', sans-serif;
        }

        .form-input:focus {
          border-color: #365B5E;
          background: white;
          box-shadow: 0 0 0 3px rgba(54, 91, 94, 0.1);
          transform: translateY(-1px);
        }

        .form-input::placeholder {
          color: #A3BCBA;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #fef2f2;
          border: 1px solid #FF6F61;
          color: #dc2626;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          animation: shake 0.4s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .error-icon {
          width: 1.25rem;
          height: 1.25rem;
          flex-shrink: 0;
        }

        .login-button {
          width: 100%;
          background: linear-gradient(135deg, #365B5E, #4a7378);
          color: #F0F0EE;
          border: none;
          padding: 1.1rem 2rem;
          border-radius: 8px;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 15px rgba(54, 91, 94, 0.2);
        }

        .login-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(54, 91, 94, 0.3);
        }

        .login-button:active {
          transform: translateY(0);
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
          padding-top: 1rem;
          border-top: 1px solid #E5E5E5;
          margin-bottom: 2rem;
        }

        .form-link {
          color: #365B5E;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition: color 0.2s ease;
        }

        .form-link:hover {
          color: #E59853;
        }

        .card-features {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid #E5E5E5;
        }

        .card-feature {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #7F8C8D;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .feature-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #E59853;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .login-container {
            padding: 1rem;
          }
          
          .login-card {
            padding: 2rem 1.5rem;
            max-width: 100%;
          }
          
          .back-navigation {
            top: 1rem;
            left: 1rem;
          }
          
          .form-links {
            flex-direction: column;
            text-align: center;
            gap: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 1.5rem;
          }

          .card-features {
            gap: 0.75rem;
          }

          .card-feature {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}