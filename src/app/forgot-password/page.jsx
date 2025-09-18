"use client"
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from 'react';


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-dark">
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-5xl font-bold text-primary tracking-wide">CODi EVALUATION</h1>
        <h2 className="text-3xl font-serif text-primary -mt-2">SYSTEM</h2>
        <div className="mt-2 mb-4">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="24" fill="#3AB0FF"/><text x="50%" y="60%" textAnchor="middle" fill="#0E1A2B" fontSize="2.2em" fontFamily="Arial" dy=".3em">C</text></svg>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-xs gap-4">
        <h3 className="font-semibold mb-2 text-primary">Forgot Password</h3>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-primary placeholder:text-gray-400"
          required
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {message && <div className="text-green-600 text-sm">{message}</div>}
        <button
          type="submit"
          className="w-full bg-primary text-background-dark py-2 rounded-full font-semibold hover:bg-primary-dark transition-colors"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
        <div className="text-center mt-2">
          <Link href="/login" className="text-primary underline">Back to Login</Link>
        </div>
      </form>
    </div>
  );
} 