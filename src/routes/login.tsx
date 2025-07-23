// Uses email verification

// import { createFileRoute, useNavigate } from "@tanstack/react-router";
// import { signInWithEmailAndPassword, signOut } from "firebase/auth";
// import { useEffect, useState } from "react";
// import { useAuth } from "@/components/AuthContext";
// import { auth } from "@/components/firebase";

// export const Route = createFileRoute("/login")({
//   component: LoginPage,
// });

// function LoginPage() {
//   const navigate = useNavigate();
//   const { user, loading } = useAuth();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   // ✅ Check for verified status before navigating
//   useEffect(() => {
//     const verifyAndNavigate = async () => {
//       if (user) {
//         await user.reload();
//         if (user.emailVerified) {
//           navigate({ to: "/dashboard" });
//         } else {
//           setError("Please verify your email before logging in.");
//           await signOut(auth);
//         }
//       }
//     };

//     if (!loading && user) {
//       verifyAndNavigate();
//     }
//   }, [user, loading, navigate]);

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const userCred = await signInWithEmailAndPassword(auth, email, password);

//       await userCred.user.reload();
//       if (!userCred.user.emailVerified) {
//         await signOut(auth);
//         return setError("Please verify your email before logging in.");
//       }

//       navigate({ to: "/dashboard" });
//     } catch (err: any) {
//       setError(err.message || "Login failed.");
//     }
//   };

//   return (
//     <main className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
//       <form
//         onSubmit={handleLogin}
//         className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-6"
//       >
//         <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Log In</h1>

//         <input
//           type="email"
//           placeholder=".edu Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//           className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white"
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//           className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white"
//         />

//         {error && <p className="text-sm text-red-500">{error}</p>}

//         <button
//           type="submit"
//           className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
//         >
//           Log In
//         </button>

//         <p className="text-center text-sm text-gray-600 dark:text-gray-300">
//           Don't have an account?{" "}
//           <a href="/signup" className="text-blue-600 hover:underline">
//             Sign up here
//           </a>
//         </p>
//       </form>
//     </main>
//   );
// }

// src/routes/login.tsx (Temporary fix - skip email verification)

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { auth } from "@/components/firebase";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showResend, setShowResend] = useState(false);

  // TEMPORARY: Skip email verification check for testing
  useEffect(() => {
    if (!loading && user) {
      // Skip email verification for now
      navigate({ to: "/dashboard" });
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowResend(false);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);

      // TEMPORARY: Skip email verification check
      // await userCred.user.reload();
      // if (!userCred.user.emailVerified) {
      //   setError("Please verify your email before logging in.");
      //   setShowResend(true);
      //   return;
      // }

      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err.message || "Login failed.");
    }
  };

  const handleResendVerification = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setError("Verification email sent! Check your inbox and spam folder.");
      }
    } catch (err: any) {
      setError("Failed to send verification email: " + err.message);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-6"
      >
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Log In</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white"
        />

        <div className="relative">
          <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="
              w-full p-2 pr-10 rounded border dark:bg-gray-700 dark:text-white
              appearance-none
              [&::-ms-reveal]:hidden [&::-ms-clear]:hidden
              [&::-webkit-textfield-decoration-container]:hidden
              [&::-webkit-clear-button]:hidden
              [&::-webkit-credentials-auto-fill-button]:hidden
              [&::-webkit-contacts-auto-fill-button]:hidden
              "
          />
          <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(p => !p)}
              onMouseDown={(e) => e.preventDefault()}
              className="absolute inset-y-0 right-2 flex items-center text-sm text-gray-500 dark:text-gray-300"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-500 space-y-2">
            <p>{error}</p>
            {showResend && (
              <button
                type="button"
                onClick={handleResendVerification}
                className="text-blue-600 hover:underline"
              >
                Resend verification email
              </button>
            )}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          Log In
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-300">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up here
          </a>
        </p>

        <div className="text-xs text-gray-500 text-center">
          <p>⚠️ Email verification temporarily disabled for testing</p>
        </div>
      </form>
    </main>
  );
}