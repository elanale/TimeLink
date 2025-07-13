// src/components/NavBar.tsx - Added Invite navigation

import { Link, useNavigate } from "@tanstack/react-router";
import { signOut } from "firebase/auth";
import { useAuth } from "@/components/AuthContext";
import { auth } from "@/components/firebase";

export default function NavBar() {
  const { user, isManager, isAdmin } = useAuth(); // Added isManager and isAdmin
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate({ to: "/login" });
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          TimeLink
        </Link>

        <ul className="flex gap-6 items-center text-gray-700 dark:text-gray-200 font-medium">
          <li>
            <Link to="/" className="hover:text-blue-500 dark:hover:text-blue-300 transition">
              Home
            </Link>
          </li>

          {user && (
            <li>
              <Link to="/dashboard" className="hover:text-blue-500 dark:hover:text-blue-300 transition">
                Dashboard
              </Link>
            </li>
          )}

          {/* NEW: Invite + Create Job links for managers and admins */}
          {user && (isManager || isAdmin) && (
            <>
              <li>
                <Link to="/invite" className="hover:text-blue-500 dark:hover:text-blue-300 transition">
                  Invite Users
                </Link>
              </li>
              <li>
                <Link to="/createJobs" className="hover:text-blue-500 dark:hover:text-blue-300 transition">
                  Create Job
                </Link>
              </li>
            </>
          )}


          {!user && (
            <>
              <li>
                <Link to="/login" className="hover:text-blue-500 dark:hover:text-blue-300 transition">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-blue-500 dark:hover:text-blue-300 transition">
                  Sign Up
                </Link>
              </li>
            </>
          )}

          {user && (
            <li>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Logout
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}