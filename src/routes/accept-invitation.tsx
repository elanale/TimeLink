// src/routes/accept-invitation.tsx

import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { InvitationService } from "@/services/invitationService";
import { UserService } from "@/services/userService";
import type { PublicInvitationToken } from "@/types/models";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { auth } from "@/components/firebase";
import { useAuth } from "@/components/AuthContext";
import { Link } from "@tanstack/react-router";

// Define the route
export const Route = createFileRoute("/accept-invitation")({
  validateSearch: (search: Record<string, unknown>): { token?: string } => {
    return {
      token: search.token as string | undefined,
    };
  },
  component: AcceptInvitationPage,
});

function AcceptInvitationPage() {
  const navigate = useNavigate();
  const { user: authUser, loading: authLoading } = useAuth();
  const { token } = useSearch({ from: '/accept-invitation' });

  const [publicInvitation, setPublicInvitation] = useState<PublicInvitationToken | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && authUser) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [authUser, authLoading, navigate]);

  // Validate the invitation token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("No invitation token found. Please use the link provided in your email.");
        setIsValidating(false);
        return;
      }
      try {
        const publicInvite = await InvitationService.getPublicInvitationByToken(token);
        if (!publicInvite) {
          setError("This invitation is invalid, expired, or has already been used.");
          setIsValidating(false);
          return;
        }
        setPublicInvitation(publicInvite);
      } catch (err) {
        console.error("Token validation error:", err);
        setError("An error occurred while validating your invitation. Please try again later.");
      } finally {
        setIsValidating(false);
      }
    };
    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName || !lastName) return setError("First and last name are required.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (password.length < 6) return setError("Password must be at least 6 characters long.");
    if (!publicInvitation || !token) return setError("Invitation details are missing. Please refresh.");

    setIsSubmitting(true);

    try {
      // 1. Create the user in Firebase Authentication
      const userCred = await createUserWithEmailAndPassword(auth, publicInvitation.email, password);

      // 2. Update their auth profile display name
      await updateProfile(userCred.user, {
        displayName: `${firstName} ${lastName}`,
      });

      // 3. Create the user document in Firestore using our service.
      await UserService.createUserFromInvitation(userCred.user, publicInvitation, {
        firstName,
        lastName,
      });

      // 4. Mark the invitation as accepted using the new service method.
      await InvitationService.markInvitationAsAccepted(token, publicInvitation.invitationId);
      
      // 5. Send a verification email (commented out for testing)
      // await sendEmailVerification(userCred.user);

      alert("Account created successfully! A verification email has been sent. Please verify your email before logging in.");
      navigate({ to: "/login" });

    } catch (err: any) {
      console.error("Accept invitation error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError("An account with this email already exists. Please log in instead.");
      } else {
        setError(err.message || "Failed to create account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isValidating) {
    return (
      <main className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-white">Validating invitation...</div>
      </main>
    );
  }

  // Error state
  if (error && !publicInvitation) {
    return (
      <main className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 max-w-lg text-center">
          <h2 className="text-xl font-bold text-red-400 mb-4">Invalid Invitation</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
          <Link
            to="/login"
            className="text-blue-600 hover:underline"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  // Form state
  if (publicInvitation) {
    return (
      <main className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-6"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Join {publicInvitation.organizationName}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              You've been invited as a {publicInvitation.role} by {publicInvitation.invitedByName}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Email:</strong> {publicInvitation.email}
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white"
              />
            </div>

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded disabled:opacity-50"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </main>
    );
  }

  // Fallback (shouldn't reach here)
  return null;
}