
"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from 'next/image';

export default function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!token) {
      setError("Invalid or missing token.");
      return;
    }
    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setMessage(data.message || "Password reset successful. You can now log in.");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-purple-700/20 to-purple-800/20 animate-pulse"></div>
      </div>

      {/* Back Navigation */}
      <div className="absolute top-6 left-6 z-50">
        <button 
          onClick={handleGoBack}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Header Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-white/20 text-center">
            <div className="mb-6">
              <Image 
                src="/codi-logo.png"
                alt="CODi Logo" 
                width={80}
                height={80}
                className="mx-auto rounded-2xl shadow-lg"
              />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              CODi <span className="text-orange-300">Intelligence</span>
            </h1>
            <p className="text-white/80 text-lg">Marketing Analytics Platform</p>
          </div>

          {/* Reset Password Form Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Your Password</h2>
              <p className="text-gray-600">Enter your new password below</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">New Password</label>
                <input
                  type="password"
                  placeholder="Enter your new password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-4 rounded-xl border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full p-4 rounded-xl border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {error}
                </div>
              )}

              {message && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-400 to-yellow-500 text-white py-4 rounded-xl font-semibold hover:from-orange-500 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Resetting Password...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </button>

              <div className="text-center">
                <Link 
                  href="/login" 
                  className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </div>

          {/* Security Info */}
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-3">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <h3 className="text-white font-medium">Security Information</h3>
            </div>
            <p className="text-white/80 text-sm">
              Choose a strong password with at least 8 characters, including uppercase and lowercase letters, numbers, and special characters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}