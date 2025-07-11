import React, { useState } from 'react';

export default function WorkReport(props: {
    isOpen: boolean;
    status: 'in' | 'out';
    onSave: (payload: { plan? : string; report? : string; }) => void;
    onClose: () => void;
}) {
    const {isOpen, status, onSave, onClose} = props;

    if (!isOpen) return null;

    const handleBackdropClick = () => {
        onClose();
    };

    const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

    const [plan, setPlan] = useState('');
    const [report, setReport] = useState('');
    const [error, setError] = useState('');

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
                        ? 'What will you work on today?'
                        : 'What did you accomplish today?'}
                </h2>

                <div className="space-y-4 mb-4">
                    <textarea
                        value={status === 'in' ? plan : report}
                        onChange={e => {
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
                        onClick ={() => {
                            const value = (status === 'in' ? plan : report).trim();
                            if (!value) { setError('This field is required.'); return; }
                            if (value.length > 500) { setError('Must be 500 characters or less.'); return; }
                            onSave(status === 'in' ? { plan : value } : { report : value});
                        }}
                        className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}