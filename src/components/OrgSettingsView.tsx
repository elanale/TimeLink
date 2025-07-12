// src/components/OrgSettingsView.tsx
import React from 'react';

const OrgSettingsView: React.FC = () => {
  return (
    <div className="p-6 mt-6 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
        Organization Settings
      </h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Controls for managing users, organization details, and other admin-level settings will be available here.
      </p>
    </div>
  );
};

export default OrgSettingsView;