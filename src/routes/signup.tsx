// src/routes/signup.tsx

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { auth } from "@/components/firebase";
import { OrganizationService } from "@/services/organizationService";
import { UserService } from "@/services/userService";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  // Form state
  const [step, setStep] = useState<'account' | 'organization'>('account');
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Account info
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  // Organization info
  const [orgName, setOrgName] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [industry, setIndustry] = useState("");
  const [orgSize, setOrgSize] = useState<'small' | 'medium' | 'large'>('small');

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/dashboard" });
    }
  }, [user, loading]);

  const validateAccountStep = (): boolean => {
    if (!email || !password || !firstName || !lastName) {
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
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    return true;
  };

  const handleAccountStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (validateAccountStep()) {
      setStep('organization');
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
      // 1. Create Firebase auth user
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Update display name
      await updateProfile(userCred.user, { 
        displayName: `${firstName} ${lastName}` 
      });

      // 3. Create organization
      const organizationId = await OrganizationService.createOrganization({
        name: orgName,
        email: email, // Admin's email as org contact
        phone: orgPhone,
        industry: industry,
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

      // 5. Send email verification
      await sendEmailVerification(userCred.user);

      alert(
        "Account created successfully! Please check your email to verify your account before logging in."
      );
      
      navigate({ to: "/login" });
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'account') {
    return (
      <main className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
        <form
          onSubmit={handleAccountStep}
          className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-6"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create Your Account
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Step 1 of 2: Account Information
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
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white"
            />

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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            Continue
          </button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Log in
            </a>
          </p>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
      <form
        onSubmit={handleSignup}
        className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-6"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Organization Details
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Step 2 of 2: Set up your organization
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Organization Name"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
            className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white"
          />

          <input
            type="tel"
            placeholder="Organization Phone (optional)"
            value={orgPhone}
            onChange={(e) => setOrgPhone(e.target.value)}
            className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white"
          />

          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white"
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
            className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white"
          >
            <option value="small">1-50 employees</option>
            <option value="medium">51-200 employees</option>
            <option value="large">200+ employees</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setStep('account')}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded"
            disabled={isSubmitting}
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Account"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>
    </main>
  );
}