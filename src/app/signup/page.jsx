"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { useAuth } from "@/context/AuthContext";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const router = useRouter();
  const { signup } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Check password strength when password field changes
    if (name === "password") {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    if (password.length === 0) {
      setPasswordStrength("");
    } else if (password.length < 6) {
      setPasswordStrength("weak");
    } else if (password.length < 10) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("strong");
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      await signup(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Sign up failed");
    }
  };

  return (
    <div className="signup-page">
      {/* Background Effects */}
      <div className="signup-background">
        <div className="bg-gradient"></div>
      </div>

      {/* Back Navigation */}
      <div className="back-navigation">
        <Link href="/" className="back-link">
          <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Main Content */}
      <div className="signup-container">
        <div className="signup-card">
          {/* Header */}
          <div className="signup-header">
            <div className="logo-container">
              <Image
                src="/logos/side.png"
                alt="CODi Logo"
                width={300}
                height={70}
                className="signup-logo"
              />
            </div>
            <p className="signup-subtitle">Start Your Marketing Journey</p>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSignUp} className="signup-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                name="company"
                placeholder="Enter your company name"
                value={formData.company}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
              />
              {passwordStrength && (
                <div className={`password-strength ${passwordStrength}`}>
                  <div className="strength-bar">
                    <div className="strength-fill"></div>
                  </div>
                  <span className="strength-text">
                    {passwordStrength === "weak" && "Weak"}
                    {passwordStrength === "medium" && "Medium"}
                    {passwordStrength === "strong" && "Strong"}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
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

            <button type="submit" className="signup-button">
              Create Account
              <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            <div className="form-links">
              <span className="link-text">Already have an account?</span>
              <Link href="/login" className="form-link">
                Sign In
              </Link>
            </div>
          </form>

          {/* Features */}
          <div className="card-features">
            <div className="card-feature">
              <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Secure & Protected</span>
            </div>
            <div className="card-feature">
              <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Instant Access</span>
            </div>
            <div className="card-feature">
              <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Free Trial Available</span>
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

        .signup-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #365B5E 0%, #4a7378 100%);
          position: relative;
          overflow: hidden;
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .signup-background {
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

        .signup-container {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          min-height: 100vh;
          width: 100%;
        }

        .signup-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 580px;
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

        .signup-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .logo-container {
          margin-bottom: 1rem;
          animation: logoFloat 3s ease-in-out infinite;
          display: flex;
          justify-content: center;
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .signup-logo {
          width: auto;
          height: auto;
          max-width: 100%;
        }

        .signup-subtitle {
          color: #335b5eff;
          font-size: 1.1rem;
          font-weight: 500;
          animation: fadeIn 0.8s ease 0.4s both;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .signup-form {
          width: 100%;
          animation: fadeIn 0.8s ease 0.6s both;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
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

        .password-strength {
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .strength-bar {
          flex: 1;
          height: 4px;
          background: #E5E5E5;
          border-radius: 2px;
          overflow: hidden;
        }

        .strength-fill {
          height: 100%;
          transition: all 0.3s ease;
          border-radius: 2px;
        }

        .password-strength.weak .strength-fill {
          width: 33%;
          background: #FF6F61;
        }

        .password-strength.medium .strength-fill {
          width: 66%;
          background: #E59853;
        }

        .password-strength.strong .strength-fill {
          width: 100%;
          background: #4a7378;
        }

        .strength-text {
          font-size: 0.85rem;
          font-weight: 500;
          min-width: 60px;
        }

        .password-strength.weak .strength-text {
          color: #FF6F61;
        }

        .password-strength.medium .strength-text {
          color: #E59853;
        }

        .password-strength.strong .strength-text {
          color: #4a7378;
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

        .signup-button {
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

        .signup-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(54, 91, 94, 0.3);
        }

        .signup-button:active {
          transform: translateY(0);
        }

        .button-icon {
          width: 1.25rem;
          height: 1.25rem;
          transition: transform 0.2s ease;
        }

        .signup-button:hover .button-icon {
          transform: translateX(3px);
        }

        .form-links {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid #E5E5E5;
          margin-bottom: 2rem;
        }

        .link-text {
          color: #7F8C8D;
          font-size: 0.95rem;
        }

        .form-link {
          color: #365B5E;
          text-decoration: none;
          font-weight: 600;
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

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .signup-container {
            padding: 1rem;
          }
          
          .signup-card {
            padding: 2rem 1.5rem;
            max-width: 100%;
          }
          
          .back-navigation {
            top: 1rem;
            left: 1rem;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }

        @media (max-width: 480px) {
          .signup-card {
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