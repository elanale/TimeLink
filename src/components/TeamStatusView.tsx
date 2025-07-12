// src/components/TeamStatusView.tsx
import React from 'react';

const TeamStatusView: React.FC = () => {
  return (
    <div className="p-6 mt-6 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
        Team Status
      </h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        A real-time overview of your team's clock-in status and daily plans will appear here.
      </p>
    </div>
  );
};

export default TeamStatusView;