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

// Define the route (This part is correct and unchanged)
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

  // Redirect if user is already logged in (This part is correct and unchanged)
  useEffect(() => {
    if (!authLoading && authUser) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [authUser, authLoading, navigate]);

  // Validate the invitation token on component mount (This part is correct and unchanged)
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

  // --- THIS IS THE UPDATED PART ---
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
      //    We now pass the `publicInvitation` object directly.
      await UserService.createUserFromInvitation(userCred.user, publicInvitation, {
        firstName,
        lastName,
      });

      // 4. Mark the invitation as accepted using the new service method.
      await InvitationService.markInvitationAsAccepted(token, publicInvitation.invitationId);
      
      // 5. Send a verification email
      // await sendEmailVerification(userCred.user); // Uncomment when ready for production

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

  // --- THE REST OF THE COMPONENT (RENDERING) IS CORRECT AND UNCHANGED ---

  if (isValidating) { /* ...loading UI... */ }
  if (error && !publicInvitation) { /* ...error UI... */ }
  if (publicInvitation) { /* ...form UI... */ }
  return null;
}