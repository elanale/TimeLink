import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { applyActionCode } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/components/firebase";

//Handling email verification for new signups
export const Route = createFileRoute("/verify")({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oobCode = params.get("oobCode");

    if (!oobCode) {
      setStatus("Invalid verification link.");
      return;
    }

    applyActionCode(auth, oobCode)
      .then(() => {
        setStatus("✅ Email verified successfully!");
        setTimeout(() => {
          navigate({ to: "/login" });
        }, 3000);
      })
      .catch(() => {
        setStatus("❌ Link expired or already used.");
      });
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow text-center text-lg">
        {status}
      </div>
    </main>
  );
}
