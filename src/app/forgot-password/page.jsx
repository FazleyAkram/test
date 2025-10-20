"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setMessage(data.message || "If an account with that email exists, a reset link has been sent.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="forgot-password-page">
      {/* Background Effects */}
      <div className="forgot-password-background">
        <div className="bg-gradient"></div>
      </div>

      {/* Back Navigation */}
      <div className="back-navigation">
        <Link href="/login" className="back-link">
          <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Login
        </Link>
      </div>

      {/* Main Content */}
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          {/* Header */}
          <div className="forgot-password-header">
            <div className="logo-container">
              <Image
                src="/logos/side.png"
                alt="CODi Logo"
                width={300}
                height={70}
                className="forgot-password-logo"
              />
            </div>
            <h2 className="forgot-password-title">Reset Your Password</h2>
            <p className="forgot-password-subtitle">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          {/* Forgot Password Form */}
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="form-input"
                required
                disabled={loading}
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

            {message && (
              <div className="success-message">
                <svg className="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {message}
              </div>
            )}

            <button type="submit" className="forgot-password-button" disabled={loading}>
              {loading ? (
                <>
                  <svg className="loading-spinner" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  Send Reset Link
                  <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </>
              )}
            </button>

            <div className="form-links">
              <Link href="/login" className="form-link">
                <svg className="link-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Back to Login
              </Link>
              <Link href="/signup" className="form-link">
                Create Account
              </Link>
            </div>
          </form>

          {/* Info Section */}
          <div className="card-info">
            <div className="info-item">
              <svg className="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <h4 className="info-title">Secure Process</h4>
                <p className="info-description">Your password reset link is encrypted and expires in 1 hour</p>
              </div>
            </div>
            <div className="info-item">
              <svg className="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="info-title">Didn't receive an email?</h4>
                <p className="info-description">Check your spam folder or try again in a few minutes</p>
              </div>
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

        .forgot-password-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #365B5E 0%, #4a7378 100%);
          position: relative;
          overflow: hidden;
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .forgot-password-background {
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

        .forgot-password-container {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          min-height: 100vh;
          width: 100%;
        }

        .forgot-password-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 520px;
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

        .forgot-password-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .logo-container {
          margin-bottom: 1.5rem;
          animation: logoFloat 3s ease-in-out infinite;
          display: flex;
          justify-content: center;
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .forgot-password-logo {
          width: auto;
          height: auto;
          max-width: 100%;
        }

        .forgot-password-title {
          color: #303D23;
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          animation: fadeIn 0.8s ease 0.2s both;
        }

        .forgot-password-subtitle {
          color: #7F8C8D;
          font-size: 0.95rem;
          line-height: 1.5;
          animation: fadeIn 0.8s ease 0.4s both;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .forgot-password-form {
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

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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

        .success-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #f0fdf4;
          border: 1px solid #4ade80;
          color: #16a34a;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          animation: slideDown 0.4s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .success-icon {
          width: 1.25rem;
          height: 1.25rem;
          flex-shrink: 0;
        }

        .forgot-password-button {
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

        .forgot-password-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(54, 91, 94, 0.3);
        }

        .forgot-password-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .forgot-password-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .button-icon {
          width: 1.25rem;
          height: 1.25rem;
          transition: transform 0.2s ease;
        }

        .forgot-password-button:hover:not(:disabled) .button-icon {
          transform: translateX(3px);
        }

        .loading-spinner {
          width: 1.25rem;
          height: 1.25rem;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .form-link:hover {
          color: #E59853;
        }

        .link-icon {
          width: 1rem;
          height: 1rem;
        }

        .card-info {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding-top: 1.5rem;
          border-top: 1px solid #E5E5E5;
        }

        .info-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .info-icon {
          width: 1.5rem;
          height: 1.5rem;
          color: #E59853;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .info-title {
          color: #303D23;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .info-description {
          color: #7F8C8D;
          font-size: 0.85rem;
          line-height: 1.4;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .forgot-password-container {
            padding: 1rem;
          }
          
          .forgot-password-card {
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

          .form-link {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .forgot-password-card {
            padding: 1.5rem;
          }

          .forgot-password-title {
            font-size: 1.5rem;
          }

          .forgot-password-subtitle {
            font-size: 0.9rem;
          }

          .card-info {
            gap: 1rem;
          }

          .info-title {
            font-size: 0.85rem;
          }

          .info-description {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}