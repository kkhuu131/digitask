import React from 'react';

const StatProgressMeter: React.FC = () => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Stat Progression</h3>
      <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
              Daily Stat Cap Removed!
            </h4>
            <div className="mt-1 text-sm text-green-700 dark:text-green-300">
              You can now gain unlimited stats per day. Complete tasks to strengthen your Digimon without restrictions!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatProgressMeter; 