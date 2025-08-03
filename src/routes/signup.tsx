// src/routes/signup.tsx

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { auth } from "@/components/firebase";
import { OrganizationService } from "@/services/organizationService";
import { UserService } from "@/services/userService";

//Route to handle signup for new accounts
export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

const REQUIRE_EDU_CHECK = false;

function SignupPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Form state
  const [step, setStep] = useState<"account" | "organization">("account");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Account fields
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  // Organization fields
  const [orgName, setOrgName] = useState<string>("");
  const [orgPhone, setOrgPhone] = useState<string>("");
  const [industry, setIndustry] = useState<string>("");
  const [orgSize, setOrgSize] = useState<"small" | "medium" | "large">(
    "small"
  );

  // Redirect authenticated users away from signup,
  // but don't interrupt the flow when submitting
  useEffect(() => {
    if (!loading && user && !isSubmitting) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [user, loading, isSubmitting, navigate]);

  //Form validation
  function validateAccountStep(): boolean {
    if (!firstName || !lastName || !email || !password) {
      setError("All fields are required");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (
      REQUIRE_EDU_CHECK &&
      !email.trim().toLowerCase().endsWith(".edu")
    ) {
      setError("You must sign up with a .edu email address");
      return false;
    }
    return true;
  }

  const handleAccountStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (validateAccountStep()) {
      setStep("organization");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!orgName.trim()) {
      setError("Organization name is required");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Create Firebase auth user (auto-signs in)
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 2. Update display name
      await updateProfile(userCred.user, {
        displayName: `${firstName} ${lastName}`,
      });

      // 3. Create organization record
      const organizationId = await OrganizationService.createOrganization({
        name: orgName,
        email,
        phone: orgPhone,
        industry,
        size: orgSize,
      });

      // 4. Create admin user in Firestore
      await UserService.createAdminUser(
        userCred.user,
        organizationId,
        {
          firstName,
          lastName,
          phone: orgPhone,
        }
      );

      // 6. Sign out the newly created user
      await signOut(auth);

      // 7. Redirect to login
      navigate({ to: "/login", replace: true });
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Render ----
  if (step === "account") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
        <form
          onSubmit={handleAccountStep}
          className="max-w-md w-full space-y-6 rounded-lg bg-white p-8 shadow-md dark:bg-gray-800"
        >
          <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            Create Your Account
          </h1>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded border p-2 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded border p-2 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border p-2 dark:bg-gray-700 dark:text-white"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border p-2 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded border p-2 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {error && <p className="text-center text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
          >
            Continue
          </button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Log in
            </a>
          </p>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <form
        onSubmit={handleSignup}
        className="max-w-md w-full space-y-6 rounded-lg bg-white p-8 shadow-md dark:bg-gray-800"
      >
        <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
          Organization Details
        </h1>

        <input
          type="text"
          placeholder="Organization Name"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          className="w-full rounded border p-2 dark:bg-gray-700 dark:text-white"
        />

        <input
          type="tel"
          placeholder="Organization Phone (optional)"
          value={orgPhone}
          onChange={(e) => setOrgPhone(e.target.value)}
          className="w-full rounded border p-2 dark:bg-gray-700 dark:text-white"
        />

        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="w-full rounded border p-2 dark:bg-gray-700 dark:text-white"
        >
          <option value="">Select Industry (optional)</option>
          <option value="construction">Construction</option>
          <option value="manufacturing">Manufacturing</option>
          <option value="retail">Retail</option>
          <option value="healthcare">Healthcare</option>
          <option value="education">Education</option>
          <option value="technology">Technology</option>
          <option value="hospitality">Hospitality</option>
          <option value="other">Other</option>
        </select>

        <select
          value={orgSize}
          onChange={(e) => setOrgSize(e.target.value as any)}
          className="w-full rounded border p-2 dark:bg-gray-700 dark:text-white"
        >
          <option value="small">1–50 employees</option>
          <option value="medium">51–200 employees</option>
          <option value="large">200+ employees</option>
        </select>

        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setStep("account")}
            disabled={isSubmitting}
            className="flex-1 rounded bg-gray-300 py-2 text-gray-800 hover:bg-gray-400"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded bg-green-600 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? "Creating…" : "Create Account"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          By creating an account you agree to our Terms & Privacy Policy.
        </p>
      </form>
    </main>
  );
}
