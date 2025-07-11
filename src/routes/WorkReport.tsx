import React from 'react';

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
                    <p className="text-gray-700 dark:text-gray-300">
                        (form fields go here)
                    </p>
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
                        onClick={() => {
                            onSave({ plan: status === 'in' ? '' : undefined, report: status === 'out' ? '' : undefined });
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