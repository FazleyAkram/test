'use client'

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from "@/context/AuthContext";

const Header = () => {
    const router = useRouter();
    const { user, isLoading, logout } = useAuth();

    const pathname = usePathname();
    const showBackButton = pathname !== '/dashboard';
    const isCompact = [
      '/import',
      '/view-data',
      '/reports',
      '/templates',
      '/admin/users'
    ].includes(pathname) 
      || /^\/templates\/[^\/]+$/.test(pathname)
      || /^\/reports\/[^\/]+$/.test(pathname)
      || /^\/reports\/[^\/]+\/edit$/.test(pathname);

    const handleLogout = () => {
      logout();
      router.push("/login");
    };

    const handleGoBack = () => {
      router.back(); // This will go to the previous page instead of landing page
    };

    return (
        <div className="relative w-full bg-background-dark py-5 flex flex-col items-center">
            {/* Back Button - Top Left of Screen */}
            {showBackButton && (
              <button 
                onClick={handleGoBack}
                className="absolute top-4 left-4 z-50 px-4 py-2 bg-primary text-background-dark rounded hover:bg-primary-dark transition"
              >
                ← Back
              </button>
            )}

            {/* Logo */}
            <button 
              onClick={() => router.push('/dashboard')} 
                className={`z-10 hover:opacity-80 transition flex flex-col items-center text-center`}
              >
              <Image 
                                src="/codi-logo.png"
                alt="CODi Logo" 
                width={isCompact ? 80 : 160}
                height={isCompact ? 80 : 160}
                className="mx-auto"
              />
              <h1
                className={`${
                  isCompact ? 'text-2xl' : 'text-5xl'
                } font-bold text-primary tracking-wide mt-2`}
              >
                CODi EVALUATION
            </h1>
            <h2
              className={`${
                isCompact ? 'text-lg' : 'text-3xl'
              } font-serif text-primary -mt-2`}
            >
                SYSTEM
            </h2>
            </button>

            <button 
              onClick={handleLogout}
              className="absolute top-4 right-4 z-50 px-4 py-2 bg-primary text-background-dark rounded hover:bg-primary-dark transition"
            >
              Logout
            </button>
        </div>
    );
};

export default Header;
