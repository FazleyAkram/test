"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotificationHelpers } from '@/context/NotificationContext';
import Sidebar from '@/components/Sidebar.jsx';
import ChatBotWindow from '@/components/ChatBotWindow';

import { FiUsers } from "react-icons/fi";

// Import User type from AuthContext
import type { User } from "@/context/AuthContext";

function Modal({ children }: any) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-96 max-w-md mx-4 transform transition-all">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { showError } = useNotificationHelpers();
  const [ usersLoading, setUsersLoading ] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [wipeStatus, setWipeStatus] = useState<'idle' | 'wiping' | 'wiped'>('idle');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
      return;
    }
    if (user && !user.isAdmin) {
      router.replace("/dashboard");
      return;
    }
    fetchUsers();
  }, [user, isLoading, router]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await fetch("/api/admin/users", {
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) throw new Error("Failed to approve user");
      setSuccess("User approved successfully");
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to approve user");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handlePromote = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/promote`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) throw new Error("Failed to promote user");
      setSuccess("User promoted to admin successfully");
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to promote user");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleRemoveAdmin = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/remove-admin`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) throw new Error("Failed to remove admin privileges");
      setSuccess("Admin privileges removed successfully");
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to remove admin privileges");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleWipeDatabase = async () => {
    setWipeStatus('wiping');

    try {
      const res = await fetch('/api/admin/wipe', { 
        method: 'DELETE',
        credentials: 'include'
      });
      const result = await res.json();

      if (result.success) {
        setWipeStatus('wiped');
        setTimeout(() => {
          setWipeStatus('idle');
          setShowWipeModal(false);
        }, 2000);
      } else {
        showError('Wipe Failed', "Wipe failed: " + (result.error || "Unknown error"));
        setWipeStatus('idle');
      }
    } catch (err) {
      console.error("Wipe error:", err);
      showError('Error', "Unexpected error occurred.");
      setWipeStatus('idle');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F0F0EE' }}>
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
            <span className="text-gray-700 font-medium">Loading admin panel...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen" style={{ display: 'flex', background: '#F0F0EE' }}>
        <Sidebar />

        <div className="max-w-7xl mx-auto px-6 py-8" style={{ marginLeft: '280px', flex: 1 }}>
          {/* Page Header */}
          <div className="mb-8">
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#303D23', marginBottom: '0.5rem', fontFamily: 'Questrial, sans-serif' }}>Admin Control Panel</h1>
            <p style={{ fontSize: '1.1rem', color: '#7F8C8D' }}>Manage users and system settings</p>
          </div>

          {/* Super Admin Badge */}
          {user?.isSuperAdmin && (
            <div className="mb-6 flex justify-center">
              <div className="bg-red-100 border border-red-200 rounded-xl px-6 py-3 flex items-center gap-3">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <span className="text-red-800 font-semibold">Super Administrator</span>
                <span className="text-red-600">Full System Access</span>
              </div>
            </div>
          )}

          {/* Alerts */}
          {error && (
            <div className="mb-6 max-w-4xl mx-auto">
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {error}
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 max-w-4xl mx-auto">
              <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                </svg>
                {success}
              </div>
            </div>
          )}

          {/* User Management Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="px-8 py-6" style={{ background: 'linear-gradient(135deg, #365B5E, #A3BCBA)' }}>
              <div className="flex items-center gap-3">
                <FiUsers size={32} style={{color: "white"}} />
                <h2 className="text-2xl font-bold text-white">User Management</h2>
              </div>
            </div>

            <div className="p-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Company</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Role</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Created</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((userData, index) => (
                      <tr key={userData.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        <td className="py-4 px-4 text-gray-800">{userData.email}</td>
                        <td className="py-4 px-4 text-gray-800">{userData.company || 'N/A'}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            userData.isApproved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {userData.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            userData.isSuperAdmin ? 'bg-red-100 text-red-800' : 
                            userData.isAdmin ? 'bg-purple-100 text-purple-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {userData.isSuperAdmin ? 'Super Admin' : userData.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {userData.createdAt ? new Date(userData.createdAt as unknown as string).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            {!userData.isApproved && (
                              <button
                                onClick={() => handleApprove(userData.id)}
                                style={{
                                  padding: '0.5rem 1rem',
                                  background: 'linear-gradient(135deg, #365B5E, #A3BCBA)',
                                  color: 'white',
                                  fontSize: '0.875rem',
                                  borderRadius: '0.5rem',
                                  border: 'none',
                                  cursor: 'pointer',
                                  transition: 'opacity 0.2s'
                                }}
                              >
                                Approve
                              </button>
                            )}
                            {!userData.isAdmin && (
                              <button
                                onClick={() => handlePromote(userData.id)}
                                style={{
                                  padding: '0.5rem 1rem',
                                  background: '#E59853',
                                  color: 'white',
                                  fontSize: '0.875rem',
                                  borderRadius: '0.5rem',
                                  border: 'none',
                                  cursor: 'pointer',
                                  transition: 'opacity 0.2s'
                                }}
                              >
                                Make Admin
                              </button>
                            )}
                            {userData.isAdmin && !userData.isSuperAdmin && (
                              <button
                                onClick={() => handleRemoveAdmin(userData.id)}
                                style={{
                                  padding: '0.5rem 1rem',
                                  background: '#e74c3c',
                                  color: 'white',
                                  fontSize: '0.875rem',
                                  borderRadius: '0.5rem',
                                  border: 'none',
                                  cursor: 'pointer',
                                  transition: 'opacity 0.2s'
                                }}
                              >
                                Remove Admin
                              </button>
                            )}
                            {userData.isSuperAdmin && (
                              <span className="text-gray-400 text-sm italic px-3 py-1">
                                Protected
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {usersLoading && (
                <div className="text-center py-12">
                  <FiUsers size={32} />
                  <p className="text-gray-500 text-lg">Loading users...</p>
                </div>
              )}

              {!usersLoading && users.length === 0 && (
                <div className="text-center py-12">
                  <FiUsers size={32} />
                  <p className="text-gray-500 text-lg">No users found</p>
                </div>
              )}
            </div>
          </div>

          
          {/* Database Management Card */}
          {/*
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
            <div className="px-8 py-6" style={{ background: '#E59853' }}>
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/>
                </svg>
                <h2 className="text-2xl font-bold text-white">Database Management</h2>
              </div>
            </div>

            <div className="p-8">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                  <div>
                    <h3 className="text-orange-800 font-semibold mb-2">Danger Zone</h3>
                    <p className="text-orange-700 text-sm mb-4">
                      This action will permanently delete all data in the database. This cannot be undone.
                    </p>
                    <button
                      onClick={() => setShowWipeModal(true)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: '#E59853',
                        color: 'white',
                        fontWeight: 600,
                        borderRadius: '0.75rem',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(229, 152, 83, 0.3)',
                        transition: 'all 0.2s'
                      }}
                    >
                      Wipe Entire Database
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          */}
        </div>
      </div>

      {/* Chat Button */}
      {/*
      <button
        onClick={() => setIsChatOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '4rem',
          height: '4rem',
          background: 'linear-gradient(135deg, #E59853, #FF6F61)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          boxShadow: '0 4px 20px rgba(229, 152, 83, 0.3)',
          cursor: 'pointer',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Chat with CODi"
      >
        <svg style={{ width: '2rem', height: '2rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      <ChatBotWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      */}

      {/* Confirmation Modal */}
      {showWipeModal && wipeStatus === 'idle' && (
        <Modal>
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Confirm Database Wipe
            </h3>
            <p className="text-gray-600 mb-8">
              Are you absolutely sure? This will permanently delete all data and cannot be recovered.
            </p>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowWipeModal(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleWipeDatabase}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
              >
                Confirm Wipe
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Wiping Progress Modal */}
      {wipeStatus === 'wiping' && (
        <Modal>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Wiping Database</h3>
            <p className="text-gray-600">Please wait while we process your request...</p>
          </div>
        </Modal>
      )}

      {/* Success Modal */}
      {wipeStatus === 'wiped' && (
        <Modal>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Database Wiped Successfully</h3>
            <p className="text-gray-600">All data has been permanently removed from the system.</p>
          </div>
        </Modal>
      )}
    </>
  );
}