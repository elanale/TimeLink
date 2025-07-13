import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  getAuth,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { InvitationService } from "../services/invitationService";
import { UserService } from "../services/userService";

export const Route = createFileRoute("/finishSignUp")({
  component: FinishSignUpPage,
});

function FinishSignUpPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying link...");
  const [emailInput, setEmailInput] = useState("");
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [error, setError] = useState("");
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const doSignIn = async () => {
      const auth = getAuth();
      const url = window.location.href;

      if (!isSignInWithEmailLink(auth, url)) {
        setError("Invalid or expired sign-in link.");
        return;
      }

      const storedEmail = window.localStorage.getItem("emailForSignIn");
      if (!storedEmail) {
        setShowEmailPrompt(true); // wait for user input
        return;
      }

      try {
        const result = await signInWithEmailLink(auth, storedEmail, url);
        window.localStorage.removeItem("emailForSignIn");

        const token = new URLSearchParams(window.location.search).get("token");
        if (!token) {
          setError("Invite token missing from link.");
          return;
        }

        const invite = await InvitationService.getPublicInvitationByToken(token);
        if (!invite) {
          setError("This invitation has expired or is invalid.");
          return;
        }

        setSignedIn(true);
        setMessage("Signed in successfully! You may now finish your profile.");
      } catch (err: any) {
        console.error("Sign-in error:", err);
        setError(`Failed to complete sign-in: ${err?.message || err}`);
      }
    };

    doSignIn();
  }, [navigate]);

  const handleManualEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    window.localStorage.setItem("emailForSignIn", emailInput);
    window.location.reload(); // Triggers useEffect again
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const email = auth.currentUser?.email;
      const url = window.location.href;
      const token = new URLSearchParams(url).get("token");

      if (!token || !email) {
        setError("Missing token or email.");
        return;
      }

      const invite = await InvitationService.getPublicInvitationByToken(token);
      if (!invite) {
        setError("This invitation has expired or is invalid.");
        return;
      }

      await UserService.createUserFromInvitation(auth.currentUser, invite, {
        firstName,
        lastName,
        phone: phone || undefined,
      });

      setMessage("Profile completed! Redirecting...");
      navigate({ to: "/dashboard", replace: true });
    } catch (err: any) {
      console.error(err);
      setError("Failed to complete profile.");
    }
  };

  // UI rendering
  if (showEmailPrompt) {
    return (
      <main className="p-6 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">Enter Your Email</h1>
        <form onSubmit={handleManualEmailSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Your email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="p-2 border rounded w-full"
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
            Continue
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      {error && <div className="text-red-500 font-semibold mb-4">{error}</div>}

      {!signedIn ? (
        <div>{message}</div>
      ) : (
        <>
          <h1 className="text-xl font-bold mb-4">Finish Your Profile</h1>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="p-2 border rounded w-full"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="p-2 border rounded w-full"
              required
            />
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="p-2 border rounded w-full"
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
              Complete Sign Up
            </button>
          </form>
        </>
      )}
    </main>
  );
}
