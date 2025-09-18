"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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
        <h3 className="font-semibold mb-2 text-primary">Reset Password</h3>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-primary placeholder:text-gray-400"
          required
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
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
          {loading ? "Resetting..." : "Reset Password"}
        </button>
        <div className="text-center mt-2">
          <Link href="/login" className="text-primary underline">Back to Login</Link>
        </div>
      </form>
    </div>
  );
} 