import React from 'react';
import { useDigimonStore } from '../store/petStore';
import { getDailyStatCap } from '../utils/statCaps';

const StatProgressMeter: React.FC = () => {
  const { userDigimon } = useDigimonStore();
  
  if (!userDigimon || !userDigimon.digimon) return null;
  
  const stage = userDigimon.digimon.stage;
  const cap = getDailyStatCap(stage);
  const current = userDigimon.daily_stat_gains;
  const percentage = Math.min(100, (current / cap) * 100);
  
  // Determine color based on percentage
  let colorClass = 'bg-green-500';
  if (percentage > 66) colorClass = 'bg-yellow-500';
  if (percentage > 90) colorClass = 'bg-red-500';
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <h3 className="text-lg font-semibold">Stats gained today</h3>
        <span>{current}/{cap}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${colorClass}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StatProgressMeter; 