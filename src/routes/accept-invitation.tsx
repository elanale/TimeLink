// src/routes/accept-invitation.tsx

import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { InvitationService } from "@/services/invitationService";
import { UserService } from "@/services/userService";
import { OrganizationService } from "@/services/organizationService";
import type { Invitation, Organization } from "@/types/models";
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

  // Get the 'token' from the URL query parameters
  const { token } = useSearch({
    from: '/accept-invitation',
  });

  // State for the invitation and registration process
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
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
        const fetchedInvitation = await InvitationService.getInvitationByToken(token as string);

        if (!fetchedInvitation) {
          setError("This invitation is invalid, expired, or has already been used.");
          setIsValidating(false);
          return;
        }

        // Token is valid, fetch organization details
        const fetchedOrg = await OrganizationService.getOrganization(fetchedInvitation.organizationId);
        
        setInvitation(fetchedInvitation);
        setOrganization(fetchedOrg);

        // Pre-fill form fields
        if (fetchedInvitation.firstName) setFirstName(fetchedInvitation.firstName);
        if (fetchedInvitation.lastName) setLastName(fetchedInvitation.lastName);

      } catch (err) {
        console.error("Token validation error:", err);
        setError("An error occurred while validating your invitation. Please try again later.");
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  // Handle the final registration form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName || !lastName) {
      setError("First and last name are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (!invitation) {
      setError("Invitation details are missing. Please refresh.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create the user in Firebase Authentication
      const userCred = await createUserWithEmailAndPassword(auth, invitation.email, password);

      // 2. Update their auth profile display name
      await updateProfile(userCred.user, {
        displayName: `${firstName} ${lastName}`,
      });

      // 3. Create the user document in Firestore using our service
      await UserService.createUserFromInvitation(userCred.user, invitation, {
        firstName,
        lastName,
      });

      // 4. Mark the invitation as accepted so it can't be reused
      await InvitationService.acceptInvitation(invitation.id);
      
      // 5. Send a verification email (optional but good practice)
      await sendEmailVerification(userCred.user);

      // Success!
      alert("Account created successfully! You will now be redirected to the login page.");
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

  // Show loading state while validating the token
  if (isValidating) {
    return (
      <main className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-white">Validating your invitation...</p>
      </main>
    );
  }

  // Show error if token is invalid
  if (error && !invitation) {
    return (
      <main className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Invitation Error</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <Link to="/login" className="text-blue-600 hover:underline">
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  // Show the registration form if token is valid
  if (invitation && organization) {
    return (
      <main className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-6"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Join {organization.name}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Create your account to accept the invitation.
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="email"
              value={invitation.email}
              disabled
              className="w-full p-2 rounded border bg-gray-100 dark:bg-gray-700 dark:text-gray-400"
            />
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
              placeholder="Create Password"
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
            {isSubmitting ? "Creating Account..." : "Accept & Create Account"}
          </button>
        </form>
      </main>
    );
  }

  // Fallback case
  return null;
}