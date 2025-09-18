"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Header from '@/components/header/Header.jsx';

// Import User type from AuthContext
import type { User } from "@/context/AuthContext";


// Using User interface from AuthContext

function Modal({ children }: any) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
      <div className="bg-background-dark border border-primary/20 p-8 rounded-2xl shadow-xl w-96 transform transition-all">
        <div className="flex flex-col items-center text-primary">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [wipeStatus, setWipeStatus] = useState<'idle' | 'wiping' | 'wiped'>('idle');

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
      const response = await fetch("/api/admin/users", {
        credentials: 'include', // Include cookies
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError("Failed to load users");
    }
  };

  const handleApprove = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: "POST",
        credentials: 'include', // Include cookies
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) throw new Error("Failed to approve user");
      setSuccess("User approved successfully");
      fetchUsers();
    } catch (err) {
      setError("Failed to approve user");
    }
  };

  const handlePromote = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/promote`, {
        method: "POST",
        credentials: 'include', // Include cookies
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) throw new Error("Failed to promote user");
      setSuccess("User promoted to admin successfully");
      fetchUsers();
    } catch (err) {
      setError("Failed to promote user");
    }
  };

  const handleRemoveAdmin = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/remove-admin`, {
        method: "POST",
        credentials: 'include', // Include cookies
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) throw new Error("Failed to remove admin privileges");
      setSuccess("Admin privileges removed successfully");
      fetchUsers();
    } catch (err) {
      setError("Failed to remove admin privileges");
    }
  };

  const handleWipeDatabase = async () => {
    setWipeStatus('wiping');

    try {
      const res = await fetch('/api/admin/wipe', { 
        method: 'DELETE',
        credentials: 'include' // Include cookies
      });
      const result = await res.json();

      if (result.success) {
        setWipeStatus('wiped');
        setTimeout(() => {
          setWipeStatus('idle');
          setShowWipeModal(false);
        }, 1500);
      } else {
        if (!result.success) {
          alert("Wipe failed: " + (result.error || "Unknown error"));
        }
        setWipeStatus('idle');
      }
    } catch (err) {
      console.error("Wipe error:", err);
      alert("Unexpected error occurred.");
      setWipeStatus('idle');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-lg">Loading...</div>;
  }

  return (
    <>
             <div className="min-h-screen bg-background-dark p-0">
        <Header />

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center mb-6">
          </div>

                     <div className="bg-background-dark border border-primary/20 rounded-lg shadow-lg p-6">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-bold text-primary">User Management</h2>
               {user?.isSuperAdmin && (
                 <div className="flex items-center gap-2">
                   <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                     🔒 Super Admin
                   </span>
                   <span className="text-sm text-gray-500">
                     You have full system control
                   </span>
                 </div>
               )}
             </div>

                         {error && (
               <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded mb-4">
                 {error}
               </div>
             )}

             {success && (
               <div className="bg-green-900/20 border border-green-500/30 text-green-400 px-4 py-3 rounded mb-4">
                 {success}
               </div>
             )}

            <div className="overflow-x-auto">
                             <table className="min-w-full divide-y divide-primary/20">
                 <thead className="bg-primary/10">
                  <tr>
                                         <th className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">Email</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">Status</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">Role</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">Created At</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                                 <tbody className="bg-background-dark divide-y divide-primary/20">
                  {users.map((user) => (
                    <tr key={user.id}>
                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {user.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                                             <td className="px-6 py-4 whitespace-nowrap text-sm">
                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                           user.isSuperAdmin ? 'bg-red-100 text-red-800' : 
                           user.isAdmin ? 'bg-purple-100 text-purple-800' : 
                           'bg-gray-100 text-gray-800'
                         }`}>
                           {user.isSuperAdmin ? 'Super Admin' : user.isAdmin ? 'Admin' : 'User'}
                         </span>
                       </td>
                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-primary/70">
                         {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {!user.isApproved && (
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            Approve
                          </button>
                        )}
                        {!user.isAdmin && (
                          <button
                            onClick={() => handlePromote(user.id)}
                            className="text-purple-600 hover:text-purple-900 mr-4"
                          >
                            Make Admin
                          </button>
                        )}
                                                 {user.isAdmin && !user.isSuperAdmin && (
                           <button
                             onClick={() => handleRemoveAdmin(user.id)}
                             className="text-orange-600 hover:text-orange-900"
                           >
                             Remove Admin
                           </button>
                         )}
                         {user.isSuperAdmin && (
                           <span className="text-gray-400 text-sm italic">
                             Cannot be demoted
                           </span>
                         )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

                     <div className="bg-background-dark border border-primary/20 rounded-lg shadow-lg p-6 mt-5">
             <h2 className="text-2xl font-bold mb-6 text-primary">Database Management</h2>

            <button
              onClick={() => setShowWipeModal(true)}
              className="mb-4 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 transition"
            >
              Wipe Entire Database
            </button>
          </div>

        </div>
      </div>



      {showWipeModal && wipeStatus === 'idle' && (
        <Modal onClose={() => setShowWipeModal(false)} showClose>
          <div className="text-center">
                         <p className="text-lg font-semibold text-primary mb-4">
               Are you sure you want to wipe the entire database?
             </p>
             <p className="text-sm text-primary/70 mb-6">
               This action cannot be undone.
             </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowWipeModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleWipeDatabase}
                className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 transition"
              >
                Confirm Wipe
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Wiping Feedback */}
      {wipeStatus === 'wiping' && (
        <Modal>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a6192e] mx-auto mb-4"></div>
                         <p className="text-lg font-medium text-primary">Wiping database...</p>
          </div>
        </Modal>
      )}

      {wipeStatus === 'wiped' && (
        <Modal>
          <div className="text-center">
            <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
                         <p className="text-lg font-medium text-primary">Database wiped successfully!</p>
          </div>
        </Modal>
      )}
    </>

  );
} 