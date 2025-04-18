import React, { useEffect, useState } from 'react';
import { useDigimonStore } from '../store/petStore';

const StatProgressMeter: React.FC = () => {
  const { allUserDigimon, userDailyStatGains, calculateDailyStatCap, fetchUserDailyStatGains, loading } = useDigimonStore();
  const [cap, setCap] = useState(0);
  
  // Fetch the latest daily stat gains and calculate cap when the component mounts or data changes
  useEffect(() => {
    const updateData = async () => {
      // Fetch the latest daily stat gains
      await fetchUserDailyStatGains();
      
      // Calculate the cap based on the number of digimon owned
      const calculatedCap = calculateDailyStatCap();
      setCap(calculatedCap);
    };
    
    updateData();
    
    // Set up an interval to periodically update the data
    const intervalId = setInterval(updateData, 5000);
    
    return () => clearInterval(intervalId);
  }, [fetchUserDailyStatGains, calculateDailyStatCap, allUserDigimon.length]);
  
  // Calculate percentage of cap used
  const percentage = cap > 0 ? Math.min(100, (userDailyStatGains / cap) * 100) : 0;
  
  // Determine color based on percentage
  let colorClass = 'bg-green-500';
  if (percentage > 66) colorClass = 'bg-yellow-500';
  if (percentage > 90) colorClass = 'bg-red-500';
  
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Stats Gained Today</h3>
      <div className="flex justify-between text-sm mb-1">
        <div className="text-sm mb-1">
          Cumulative Points
        </div>
        <span>
          {loading ? (
            <span className="text-gray-400">Loading...</span>
          ) : (
            `${userDailyStatGains}/${cap}`
          )}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${colorClass} transition-all duration-300`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-500 mt-2">
        Daily stat cap increases with each Digimon you own.
      </div>
    </div>
  );
};

export default StatProgressMeter; 