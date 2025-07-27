// src/components/WorkReport.tsx
import React, { useState, useEffect } from 'react';
import { JobService } from '@/services/jobService';
import { useAuth } from '@/components/AuthContext';
import type { Job } from '@/types/models';

export default function WorkReport(props: {
    isOpen: boolean;
    status: 'in' | 'out';
    onSave: (payload: { 
        plan?: string; 
        report?: string; 
        jobId?: string;
        jobNumber?: string;
        jobName?: string;
    }) => void;
    onClose: () => void;
}) {
    const { isOpen, status, onSave, onClose } = props;
    const { profile } = useAuth();
    
    const [plan, setPlan] = useState('');
    const [report, setReport] = useState('');
    const [error, setError] = useState('');
    
    // Job selection state
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [loadingJobs, setLoadingJobs] = useState(false);

    // Load active jobs when modal opens for clock-in
    useEffect(() => {
        const loadJobs = async () => {
            if (!profile?.organizationId || status !== 'in' || !isOpen) return;
            
            try {
                setLoadingJobs(true);
                const activeJobs = await JobService.getOrganizationJobs(
                    profile.organizationId, 
                    'active'
                );
                setJobs(activeJobs);
            } catch (err) {
                console.error("Error loading jobs:", err);
                setError("Failed to load jobs");
            } finally {
                setLoadingJobs(false);
            }
        };
        
        if (isOpen) {
            loadJobs();
        }
    }, [isOpen, profile, status]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setPlan('');
            setReport('');
            setError('');
            setSelectedJobId('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = () => {
        onClose();
    };

    const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

    const handleSave = () => {
        setError('');
        
        if (status === 'in') {
            // Validate job selection
            if (!selectedJobId) {
                setError('Please select a job');
                return;
            }
            
            // Validate plan
            const planValue = plan.trim();
            if (!planValue) {
                setError('Please describe what you plan to work on');
                return;
            }
            if (planValue.length > 500) {
                setError('Plan must be 500 characters or less');
                return;
            }
            
            // Get selected job details
            const selectedJob = jobs.find(j => j.id === selectedJobId);
            if (!selectedJob) {
                setError('Invalid job selected');
                return;
            }
            
            onSave({
                plan: planValue,
                jobId: selectedJob.id,
                jobNumber: selectedJob.jobNumber,
                jobName: selectedJob.jobName
            });
        } else {
            // Clock out - validate report
            const reportValue = report.trim();
            if (!reportValue) {
                setError('Please describe what you accomplished');
                return;
            }
            if (reportValue.length > 500) {
                setError('Report must be 500 characters or less');
                return;
            }
            
            onSave({ report: reportValue });
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-lg"
                onClick={stopPropagation}
            >
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    {status === 'in'
                        ? 'Clock In - What will you work on?'
                        : 'Clock Out - What did you accomplish?'}
                </h2>

                <div className="space-y-4 mb-4">
                    {status === 'in' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Select Job *
                            </label>
                            {loadingJobs ? (
                                <div className="text-sm text-gray-500 p-2">Loading jobs...</div>
                            ) : jobs.length === 0 ? (
                                <div className="text-sm text-red-500 p-2">
                                    No active jobs available. Please contact your manager.
                                </div>
                            ) : (
                                <select
                                    value={selectedJobId}
                                    onChange={(e) => {
                                        setError('');
                                        setSelectedJobId(e.target.value);
                                    }}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="">-- Select a job --</option>
                                    {jobs.map((job) => (
                                        <option key={job.id} value={job.id}>
                                            {job.jobNumber} - {job.jobName}
                                            {job.location && ` (${job.location})`}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {status === 'in' ? 'Daily Plan *' : 'Work Report *'}
                        </label>
                        <textarea
                            value={status === 'in' ? plan : report}
                            onChange={(e) => {
                                setError('');
                                status === 'in' ? setPlan(e.target.value) : setReport(e.target.value);
                            }}
                            rows={4}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            placeholder={
                                status === 'in'
                                    ? 'Today I plan to...'
                                    : 'Today I accomplished...'
                            }
                        />
                    </div>
                    
                    {error && (
                        <p className="text-red-500 text-sm mt-1">{error}</p>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={status === 'in' && jobs.length === 0}
                        className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === 'in' ? 'Clock In' : 'Clock Out'}
                    </button>
                </div>
            </div>
        </div>
    );
}