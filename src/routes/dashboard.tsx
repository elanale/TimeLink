// src/routes/dashboard.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthContext";
import EmploymentClock from '@/components/Clock';
import TeamStatusView from "@/components/TeamStatusView"; // <-- IMPORT
import OrgSettingsView from "@/components/OrgSettingsView";   // <-- IMPORT

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
  // 1) Get the complete user state from the context
  const { user, profile, loading, emailVerified, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();

  // 2) redirect to login if not logged in (no change here)
  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login", replace: true });
    }
  }, [user, loading, navigate]);

  // 3) show a "please verify" screen (no change here)
  if (!loading && user && !emailVerified) {
    return (
      <main className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 max-w-lg text-center">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">
            Email Not Verified
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Please verify your email before accessing the dashboard.
            <br />
            Check your inbox (and spam) for the verification link.
          </p>
        </div>
      </main>
    );
  }

  // 4) Wait until all auth data is loaded (user and firestore profile)
  if (loading || !user || !profile) {
    return null; // Or a full-page loading spinner
  }

  // 5) At this point: user, profile, and roles are all loaded and verified
  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 space-y-6">
        {/* UPDATED: Personalized header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome, {profile.firstName || user.displayName}!
          </h1>
          <p className="text-md text-gray-500 dark:text-gray-400 capitalize mt-1">
            Role: {profile.role}
          </p>
        </div>

        {/* --- Employee View (Always visible for all roles) --- */}
        <EmploymentClock />

        {/* --- Manager View (Renders for Managers and Admins) --- */}
        {isManager && <TeamStatusView />}

        {/* --- Admin View (Renders for Admins only) --- */}
        {isAdmin && <OrgSettingsView />}
      </div>
    </main>
  );
}