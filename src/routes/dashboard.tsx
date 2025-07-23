// src/routes/dashboard.tsx - TEMPORARILY SKIP EMAIL VERIFICATION

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthContext";
import EmploymentClock from '@/components/Clock';
import TeamStatusView from "@/components/TeamStatusView";
import OrgSettingsView from "@/components/OrgSettingsView";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Dashboard - TimeLink" },
      { name: "description", content: "Dashboard for TimeLink." },
    ],
  }),
});

export default function Dashboard() {
  const { user, profile, loading, emailVerified, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login", replace: true });
    }
  }, [user, loading, navigate]);

  // TEMPORARILY COMMENTED OUT EMAIL VERIFICATION CHECK
  // if (!loading && user && !emailVerified) {
  //   return (
  //     <main className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
  //       <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 max-w-lg text-center">
  //         <h2 className="text-xl font-bold text-yellow-400 mb-4">
  //           Email Not Verified
  //         </h2>
  //         <p className="text-gray-700 dark:text-gray-300">
  //           Please verify your email before accessing the dashboard.
  //           <br />
  //           Check your inbox (and spam) for the verification link.
  //         </p>
  //       </div>
  //     </main>
  //   );
  // }

  // Wait until all auth data is loaded (user and firestore profile)
  if (loading || !user) {
    return (
      <main className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </main>
    );
  }

  // Show message if profile is missing (Firestore data wasn't created)
  if (!profile) {
    return (
      <main className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 max-w-lg text-center">
          <h2 className="text-xl font-bold text-red-400 mb-4">
            Profile Not Found
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Your user profile wasn't created properly during signup.
          </p>
          <p className="text-sm text-gray-500">
            User ID: {user.uid}<br/>
            Email: {user.email}
          </p>
          <div className="mt-4 text-xs text-gray-400">
            This usually happens when Firestore rules block document creation during signup.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 space-y-6">
        {/* Personalized header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome, {profile.firstName || user.displayName}!
          </h1>
          <p className="text-md text-gray-500 dark:text-gray-400 capitalize mt-1">
            Role: {profile.role}
          </p>
          <div className="text-xs text-gray-400 mt-1">
            ⚠️ Email verification temporarily disabled for testing
          </div>
        </div>

        {/* Employee Clock View (Visible for Employees only) */}
        {!(isManager) && <EmploymentClock />}

        {/* Manager View (Renders for Managers and Admins) */}
        {isManager && <TeamStatusView />}

        {/* Admin View (Renders for Admins only) */}
        {isAdmin && <OrgSettingsView />}
      </div>
    </main>
  );
}