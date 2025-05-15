import React from "react";
import { useBattleSpeedStore } from "../store/battleSpeedStore";

const BattleSpeedControl: React.FC = () => {
  const { speedMultiplier, setSpeedMultiplier } = useBattleSpeedStore();
  
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setSpeedMultiplier(value as 1 | 2 | 3 | 4);
  };
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 bg-white p-3 rounded-lg shadow-sm">
      <span className="text-sm font-medium text-gray-700">Speed</span>
      <div className="flex items-center w-full pb-2">
        <span className="text-xs text-gray-500 mr-2">1x</span>
        <div className="relative flex-1">
          <input
            type="range"
            min="1"
            max="4"
            step="1"
            value={speedMultiplier}
            onChange={handleSpeedChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer touch-action-manipulation"
            style={{
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
          />
          {/* Custom styling for better mobile experience */}
          <style dangerouslySetInnerHTML={{ __html: `
            input[type=range] {
              -webkit-appearance: none;
              width: 100%;
              background: transparent;
            }
            
            input[type=range]::-webkit-slider-thumb {
              -webkit-appearance: none;
              height: 20px;
              width: 20px;
              border-radius: 50%;
              background: #3b82f6;
              cursor: pointer;
              margin-top: -8px; /* You need this for Chrome */
              box-shadow: 0 0 2px rgba(0,0,0,0.2);
            }
            
            input[type=range]::-moz-range-thumb {
              height: 20px;
              width: 20px;
              border-radius: 50%;
              background: #3b82f6;
              cursor: pointer;
              border: none;
              box-shadow: 0 0 2px rgba(0,0,0,0.2);
            }
            
            input[type=range]::-webkit-slider-runnable-track {
              width: 100%;
              height: 4px;
              cursor: pointer;
              background: #ddd;
              border-radius: 4px;
            }
            
            input[type=range]::-moz-range-track {
              width: 100%;
              height: 4px;
              cursor: pointer;
              background: #ddd;
              border-radius: 4px;
            }
            
            input[type=range]:focus {
              outline: none;
            }
          `}} />
        </div>
        <span className="text-xs text-gray-500 ml-2">4x</span>
      </div>
    </div>
  );
};

export default BattleSpeedControl; 