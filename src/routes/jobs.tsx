// src/routes/jobs.tsx

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthContext";
import { JobService } from "@/services/jobService";
import type { Job } from "@/types/models";

//Jobs Page, allows employers to create and manage employee jobs
export const Route = createFileRoute("/jobs")({
  component: JobsPage,
});

//Wrapper function for the jobs dashboard
function JobsPage() {
  const navigate = useNavigate();
  const { user, profile, loading, isManager } = useAuth();
  
  // State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled' | 'paused'>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");
  
  // Statistics
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    overdueJobs: 0,
    totalHours: 0,
    totalCost: 0
  });

  // Redirect if not authorized
  useEffect(() => {
    if (!loading && (!user || !isManager)) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [user, loading, isManager, navigate]);

  // Load jobs and statistics
  useEffect(() => {
    const loadJobs = async () => {
      if (!profile?.organizationId) return;
      
      try {
        setLoadingJobs(true);
        
        // Load jobs
        const jobsList = await JobService.getOrganizationJobs(profile.organizationId);
        setJobs(jobsList);
        setFilteredJobs(jobsList);
        
        // Load statistics
        const statistics = await JobService.getJobStatistics(profile.organizationId);
        setStats(statistics);
        
      } catch (err: any) {
        console.error("Error loading jobs:", err);
        setError(err.message || "Failed to load jobs");
      } finally {
        setLoadingJobs(false);
      }
    };
    
    if (profile) {
      loadJobs();
    }
  }, [profile]);

  // Filter jobs based on status and search
  useEffect(() => {
    let filtered = jobs;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.jobNumber.toLowerCase().includes(search) ||
        job.jobName.toLowerCase().includes(search) ||
        job.clientName?.toLowerCase().includes(search) ||
        job.location?.toLowerCase().includes(search)
      );
    }
    
    setFilteredJobs(filtered);
  }, [jobs, statusFilter, searchTerm]);

  const handleCompleteJob = async () => {
    if (!selectedJob || !user) return;
    
    try {
      setError("");
      await JobService.completeJob(selectedJob.id, user.uid, completionNotes);
      
      // Refresh jobs
      const jobsList = await JobService.getOrganizationJobs(profile!.organizationId);
      setJobs(jobsList);
      
      // Update statistics
      const statistics = await JobService.getJobStatistics(profile!.organizationId);
      setStats(statistics);
      
      setShowCompleteModal(false);
      setSelectedJob(null);
      setCompletionNotes("");
    } catch (err: any) {
      setError(err.message || "Failed to complete job");
    }
  };

  const handleCancelJob = async (job: Job) => {
    if (!user) return;
    
    const reason = prompt("Please provide a reason for cancelling this job:");
    if (reason === null) return; // User cancelled the prompt
    
    try {
      setError("");
      await JobService.cancelJob(job.id, user.uid, reason);
      
      // Refresh jobs
      const jobsList = await JobService.getOrganizationJobs(profile!.organizationId);
      setJobs(jobsList);
      
      // Update statistics
      const statistics = await JobService.getJobStatistics(profile!.organizationId);
      setStats(statistics);
    } catch (err: any) {
      setError(err.message || "Failed to cancel job");
    }
  };

  const getStatusBadgeClasses = (status: Job['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPriorityBadgeClasses = (priority?: Job['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return '';
    }
  };

  if (loading || !profile) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Job Management
          </h1>
          <button
            onClick={() => navigate({ to: "/createJobs" })}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Create New Job
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalJobs}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Jobs</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.activeJobs}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Active</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.completedJobs}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.overdueJobs}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Overdue</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.totalHours.toFixed(1)}h
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Hours</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              ${stats.totalCost.toFixed(0)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Labor Cost</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-2 rounded border dark:bg-gray-700 dark:text-white"
            />
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="p-2 rounded border dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Jobs Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {loadingJobs ? (
            <div className="p-6 text-center">Loading jobs...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? "No jobs found matching your criteria" 
                : "No jobs created yet"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Job #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredJobs.map((job) => {
                    const isOverdue = job.dueDate && job.dueDate.toDate() < new Date() && job.status === 'active';
                    
                    return (
                      <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {job.jobNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          <div>
                            <div className="font-medium">{job.jobName}</div>
                            {job.location && (
                              <div className="text-xs text-gray-500">{job.location}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {job.clientName || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClasses(job.status)}`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {job.priority && (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeClasses(job.priority)}`}>
                              {job.priority}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          <div>
                            <div>{(job.actualHours || 0).toFixed(1)}h</div>
                            {job.estimatedHours && (
                              <div className="text-xs text-gray-500">
                                of {job.estimatedHours}h
                              </div>
                            )}
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                          {job.dueDate ? job.dueDate.toDate().toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            {job.status === 'active' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedJob(job);
                                    setShowCompleteModal(true);
                                  }}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() => handleCancelJob(job)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {/* TODO: Navigate to job details */}}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Complete Job Modal */}
        {showCompleteModal && selectedJob && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowCompleteModal(false)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Complete Job
              </h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Completing job: <strong>{selectedJob.jobNumber} - {selectedJob.jobName}</strong>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Total hours logged: <strong>{(selectedJob.actualHours || 0).toFixed(1)}</strong>
                </p>
              </div>

              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                rows={4}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 mb-4"
                placeholder="Add completion notes (optional)..."
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCompleteJob}
                  className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
                >
                  Complete Job
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}