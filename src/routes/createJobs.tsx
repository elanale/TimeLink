import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { JobService } from "@/services/createJobService";
import { useAuth } from "@/components/AuthContext"; // ✅ Get profile and user

export const Route = createFileRoute("/createJobs")({
  component: CreateJobsPage,
});

function CreateJobsPage() {
  const [jobNumber, setJobNumber] = useState("");
  const [jobName, setJobName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { user, profile } = useAuth(); // ✅ Fix is here

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!user) throw new Error("You must be signed in");
      if (!profile?.organizationId) throw new Error("Missing organization ID in user profile");

      await JobService.createJob({
        jobNumber,
        jobName,
        organizationId: profile.organizationId, // ✅ Use profile’s org ID
        createdBy: user.uid,
      });

      setMessage("Job created successfully!");
      setJobNumber("");
      setJobName("");
      setError("");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create job");
    }
  };

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create a Job</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Job Number"
          value={jobNumber}
          onChange={(e) => setJobNumber(e.target.value)}
          className="p-2 border rounded w-full"
          required
        />
        <input
          type="text"
          placeholder="Job Name"
          value={jobName}
          onChange={(e) => setJobName(e.target.value)}
          className="p-2 border rounded w-full"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Save Job
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {message && <p className="text-green-600 mt-4">{message}</p>}
    </main>
  );
}
