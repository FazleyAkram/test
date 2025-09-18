"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Signup failed");
        return;
      }
      setSuccess("Signup successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
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
      <form onSubmit={handleSignup} className="flex flex-col items-center w-full max-w-xs gap-4">
        <h3 className="font-semibold mb-2 text-primary">Sign Up for CODi Marketing System</h3>
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-primary placeholder:text-gray-400"
          required
        />
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-primary placeholder:text-gray-400"
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-primary placeholder:text-gray-400"
          required
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <button
          type="submit"
          className="w-full bg-primary text-background-dark py-2 rounded-full font-semibold hover:bg-primary-dark transition-colors"
        >
          Sign Up
        </button>
        <div className="text-center mt-2">
          <Link href="/login" className="text-primary underline">Back to Login</Link>
        </div>
      </form>
    </div>
  );
} 