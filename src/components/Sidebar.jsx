'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname(); // This automatically gets the current URL path
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navigationItems = [
    { id: 'home', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', route: '/dashboard' },
    { id: 'import', label: 'Import Data', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12', route: '/import' },
    { id: 'summary', label: 'Retrospective Analysis', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', route: '/dashboard/summary' },
    { id: 'reports', label: 'View Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', route: '/dashboard/reports' },
  ];

  if (user?.isAdmin) {
    navigationItems.push({
      id: 'admin',
      label: 'Admin Panel',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      route: '/admin'
    });
  }

  // Function to check if a route is active
  const isActive = (route) => {
    if (route === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(route);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img 
          src="/logos/side.png" 
          alt="CODi Logo" 
          className="logo-image"
          style={{ width: '150px', marginBottom: '0.5rem', transform: 'scale(3)', transformOrigin: 'center' }}
        />
        <p className="sidebar-subtitle">Marketing. Managed.</p>
      </div>
      
      <nav className="sidebar-nav">
        {navigationItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => router.push(item.route)}
            className={`nav-item ${isActive(item.route) ? 'active' : ''}`}
            style={{ animationDelay: `${0.1 + index * 0.05}s` }}
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}/>
            </svg>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <p className="user-name">{user?.email?.split('@')[0]}</p>
            <p className="user-email">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <svg className="logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Logout
        </button>
      </div>

      <style jsx>{`
        .sidebar {
          width: 280px;
          background: white;
          border-right: 1px solid #E5E5E5;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          z-index: 100;
        }

        .sidebar-header {
          padding: 2rem 1.5rem;
          border-bottom: 1px solid #E5E5E5;
        }

        .logo-image {
          animation: scaleIn 0.6s ease-out 0.5s both;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0) scale(3);
            opacity: 0;
          }
          to {
            transform: scale(1) scale(3);
            opacity: 1;
          }
        }

        .sidebar-subtitle {
          font-size: 0.9rem;
          color: #7F8C8D;
          font-weight: 500;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.5rem 0;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          width: 100%;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: #7F8C8D;
          font-weight: 500;
          border-left: 3px solid transparent;
          position: relative;
          overflow: hidden;
        }

        .nav-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 0;
          height: 100%;
          background: linear-gradient(90deg, rgba(54, 91, 94, 0.05), transparent);
          transition: width 0.3s ease;
        }

        .nav-item:hover::before {
          width: 100%;
        }

        .nav-item:hover {
          background: #F0F0EE;
          color: #365B5E;
          transform: translateX(5px);
        }

        .nav-item:hover .nav-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .nav-item.active {
          background: rgba(54, 91, 94, 0.08);
          color: #365B5E;
          border-left-color: #E59853;
        }

        .nav-item.active::after {
          content: '';
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 6px;
          height: 6px;
          background: #E59853;
          border-radius: 50%;
          animation: dotPulse 2s ease-in-out infinite;
        }

        @keyframes dotPulse {
          0%, 100% {
            transform: translateY(-50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-50%) scale(1.5);
            opacity: 0.7;
          }
        }

        .nav-icon {
          width: 1.5rem;
          height: 1.5rem;
          flex-shrink: 0;
          transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .nav-label {
          font-size: 0.95rem;
        }

        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid #E5E5E5;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #365B5E, #A3BCBA);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .user-details {
          flex: 1;
          min-width: 0;
        }

        .user-name {
          font-weight: 600;
          color: #303D23;
          font-size: 0.9rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email {
          font-size: 0.8rem;
          color: #7F8C8D;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem;
          background: #F0F0EE;
          border: 1px solid #E5E5E5;
          border-radius: 8px;
          color: #7F8C8D;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .logout-btn:hover {
          background: #365B5E;
          color: white;
          border-color: #365B5E;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(54, 91, 94, 0.2);
        }

        .logout-btn:hover .logout-icon {
          transform: translateX(5px);
        }

        .logout-icon {
          width: 1.25rem;
          height: 1.25rem;
          transition: transform 0.3s ease;
        }

        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </aside>
  );
}