// src/routes/invite.tsx

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthContext";
import { InvitationService } from "@/services/invitationService";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/components/firebase";

export const Route = createFileRoute("/invite")({
  component: InvitePage,
});

function InvitePage() {
  const navigate = useNavigate();
  const { user, profile, organization, loading, isManager } = useAuth();
  
  // Form state
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<'manager' | 'employee'>('employee');
  const [department, setDepartment] = useState("");
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // List of managers for dropdown
  const [managers, setManagers] = useState<any[]>([]);
  
  // Recent invitations
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);

  // Redirect if not authorized
  useEffect(() => {
    if (!loading && (!user || !isManager)) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [user, loading, isManager, navigate]);

  // Load managers for dropdown
  useEffect(() => {
    const loadManagers = async () => {
      if (!profile?.organizationId) return;
      
      const q = query(
        collection(db, 'users'),
        where('organizationId', '==', profile.organizationId),
        where('role', 'in', ['manager', 'admin'])
      );
      
      const snapshot = await getDocs(q);
      const managerList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setManagers(managerList);
    };
    
    if (profile) {
      loadManagers();
    }
  }, [profile]);

  // Load recent invitations
  useEffect(() => {
    const loadInvitations = async () => {
      if (!profile?.organizationId) return;
      
      try {
        const invites = await InvitationService.getOrganizationInvitations(
          profile.organizationId
        );
        setInvitations(invites);
      } catch (error) {
        console.error("Error loading invitations:", error);
      } finally {
        setLoadingInvitations(false);
      }
    };
    
    if (profile) {
      loadInvitations();
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const token = await InvitationService.createInvitation({
        organizationId: profile!.organizationId,
        email,
        role,
        invitedBy: user!.uid,
        invitedByName: profile!.displayName || profile!.email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        department: department || undefined,
        managerId: role === 'employee' ? (selectedManagerId || profile!.id) : undefined,
      });

      const inviteLink = InvitationService.buildInvitationLink(token);
      
      setSuccess(`Invitation sent successfully! Share this link with ${email}:`);
      
      // In a real app, you'd send an email here
      console.log("Invitation link:", inviteLink);
      
      // Show the link to copy
      navigator.clipboard.writeText(inviteLink);
      setSuccess(`Invitation link copied to clipboard! The link expires in 7 days.`);
      
      // Reset form
      setEmail("");
      setFirstName("");
      setLastName("");
      setDepartment("");
      setRole("employee");
      setSelectedManagerId("");
      
      // Reload invitations
      const invites = await InvitationService.getOrganizationInvitations(
        profile!.organizationId
      );
      setInvitations(invites);
      
    } catch (err: any) {
      setError(err.message || "Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const newToken = await InvitationService.resendInvitation(invitationId);
      const inviteLink = InvitationService.buildInvitationLink(newToken);
      navigator.clipboard.writeText(inviteLink);
      setSuccess("New invitation link copied to clipboard!");
      
      // Reload invitations
      const invites = await InvitationService.getOrganizationInvitations(
        profile!.organizationId
      );
      setInvitations(invites);
    } catch (err: any) {
      setError(err.message || "Failed to resend invitation");
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) return;
    
    try {
      await InvitationService.cancelInvitation(invitationId);
      
      // Reload invitations
      const invites = await InvitationService.getOrganizationInvitations(
        profile!.organizationId
      );
      setInvitations(invites);
      
      setSuccess("Invitation cancelled");
    } catch (err: any) {
      setError(err.message || "Failed to cancel invitation");
    }
  };

  if (loading || !profile) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Invite Team Members
        </h1>

        {/* Invitation Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Send New Invitation
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="Email Address *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="p-2 rounded border dark:bg-gray-700 dark:text-white"
              />
              
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'manager' | 'employee')}
                className="p-2 rounded border dark:bg-gray-700 dark:text-white"
                disabled={profile.role !== 'admin'} 
              >
                <option value="employee">Employee</option>
                {profile.role === 'admin' && (
                  <option value="manager">Manager</option>
                )}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name (optional)"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="p-2 rounded border dark:bg-gray-700 dark:text-white"
              />
              
              <input
                type="text"
                placeholder="Last Name (optional)"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="p-2 rounded border dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Department (optional)"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="p-2 rounded border dark:bg-gray-700 dark:text-white"
              />
              
              {role === 'employee' && (
                <select
                  value={selectedManagerId}
                  onChange={(e) => setSelectedManagerId(e.target.value)}
                  className="p-2 rounded border dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Manager (optional)</option>
                  {managers.map(manager => (
                    <option key={manager.id} value={manager.id}>
                      {manager.displayName || manager.email}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Invitation"}
            </button>
          </form>
        </div>

        {/* Recent Invitations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Recent Invitations
          </h2>
          
          {loadingInvitations ? (
            <p>Loading invitations...</p>
          ) : invitations.length === 0 ? (
            <p className="text-gray-500">No invitations sent yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Sent</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((invite) => (
                    <tr key={invite.id} className="border-t dark:border-gray-600">
                      <td className="px-4 py-2">{invite.email}</td>
                      <td className="px-4 py-2 capitalize">{invite.role}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-block px-2 py-1 text-xs rounded ${
                          invite.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : invite.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {invite.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {invite.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
                      </td>
                      <td className="px-4 py-2">
                        {invite.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleResendInvitation(invite.id)}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Resend
                            </button>
                            <button
                              onClick={() => handleCancelInvitation(invite.id)}
                              className="text-red-600 hover:underline text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}