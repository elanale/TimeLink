// src/components/WorkReport.tsx
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

export default function WorkReport(props: {
  isOpen: boolean;
  status: 'in' | 'out';
  onSave: (payload: { plan?: string; report?: string }) => void;
  onClose: () => void;
}) {
  const { isOpen, status, onSave, onClose } = props;
  const { profile } = useAuth(); // Get current user's org info

  const [jobNumber, setJobNumber] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleBackdropClick = () => onClose();
  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  const handleSave = async () => {
    const value = jobNumber.trim();

    if (status === 'in') {
      if (!value) {
        setError('Job number is required.');
        return;
      }

      if (value.length > 100) {
        setError('Job number must be under 100 characters.');
        return;
      }

      try {
        if (!profile?.organizationId) {
          setError('Missing organization information.');
          return;
        }

        const jobQuery = query(
          collection(db, 'jobs'),
          where('jobNumber', '==', value),
          where('organizationId', '==', profile.organizationId)
        );

        const snapshot = await getDocs(jobQuery);

        if (snapshot.empty) {
          setError('Job number not found.');
          return;
        }

        onSave({ plan: value });
        setError('');
      } catch (err) {
        console.error('Error verifying job number:', err);
        setError('Failed to verify job number.');
      }
    } else {
      // Clocking out – no input required
      onSave({});
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
            ? 'Enter Job Number to Clock In'
            : 'Clocking Out'}
        </h2>

        {status === 'in' && (
          <div className="space-y-4 mb-4">
            <input
              type="text"
              value={jobNumber}
              onChange={(e) => {
                setError('');
                setJobNumber(e.target.value);
              }}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder="e.g. JOB-123"
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
        )}

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
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
