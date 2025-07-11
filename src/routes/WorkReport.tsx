import React from 'react';

export default function WorkReport(props: {
    isOpen: boolean;
    status: 'in' | 'out';
    onSave: (payload: { plan? : string; report? : string; }) => void;
    onClose: () => void;
}) {
    const {isOpen, status, onSave, onClose} = props;
    if (!isOpen) return null;

    return (
        <div>
            <p>Work Report: Clocking ({status})</p>
            <button onClick={onClose}>Close</button>
        </div>
    );
}