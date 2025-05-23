import React, { useState } from 'react';
import { DigimonType, DigimonAttribute } from '../store/battleStore';

interface TypeAttributeIconProps {
  type: DigimonType;
  attribute: DigimonAttribute;
  size?: 'sm' | 'md' | 'lg' | 'xs';
  showLabel?: boolean;
  className?: string;
  showTooltip?: boolean;
}

const TypeAttributeIcon: React.FC<TypeAttributeIconProps> = ({ 
  type, 
  attribute, 
  size = 'md',
  showLabel = false,
  className = '',
  showTooltip = false
}) => {
  // State to control tooltip position
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  
  // Normalize inputs to handle case inconsistencies
  const normalizedType = type?.toLowerCase() || 'unknown';
  const normalizedAttribute = attribute?.toLowerCase() || 'neutral';
  
  // Generate the image path based on type and attribute
  const imagePath = `/assets/type-attribute/${normalizedType}_${normalizedAttribute}.png`;
  
  // Size classes for the icon itself
  const iconSizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-16 h-16'
  };
  
  // Size classes for the background circle
  const backgroundSizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-5 h-5',
    md: 'w-10 h-10',
    lg: 'w-20 h-20'
  };
  
  // Helper functions for type and attribute advantages
  const getTypeStrong = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'vaccine': return 'Virus';
      case 'virus': return 'Data';
      case 'data': return 'Vaccine';
      case 'free': return 'None';
      default: return 'None';
    }
  };
  
  const getTypeWeak = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'vaccine': return 'Data';
      case 'virus': return 'Vaccine';
      case 'data': return 'Virus';
      case 'free': return 'None';
      default: return 'None';
    }
  };
  
  const getAttributeStrong = (attr: string): string => {
    switch (attr.toLowerCase()) {
      case 'fire': return 'Plant';
      case 'water': return 'Fire';
      case 'plant': return 'Water';
      case 'electric': return 'Wind';
      case 'wind': return 'Earth';
      case 'earth': return 'Electric';
      case 'light': return 'Dark';
      case 'dark': return 'Light';
      case 'neutral': return 'None';
      default: return 'None';
    }
  };
  
  const getAttributeWeak = (attr: string): string => {
    switch (attr.toLowerCase()) {
      case 'fire': return 'Water';
      case 'water': return 'Plant';
      case 'plant': return 'Fire';
      case 'electric': return 'Earth';
      case 'wind': return 'Electric';
      case 'earth': return 'Wind';
      case 'light': return 'Dark';
      case 'dark': return 'Light';
      case 'neutral': return 'None';
      default: return 'None';
    }
  };
  
  // Handle mouse enter to check position and adjust tooltip
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!showTooltip) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Check if there's enough space above
    if (rect.top < 180) {
      setTooltipPosition('bottom');
    } else {
      setTooltipPosition('top');
    }
  };
  
  // Get tooltip position classes
  const getTooltipPositionClasses = () => {
    switch (tooltipPosition) {
      case 'bottom':
        return 'top-full mt-2';
      case 'left':
        return 'right-full mr-2 -translate-y-1/2 top-1/2';
      case 'right':
        return 'left-full ml-2 -translate-y-1/2 top-1/2';
      case 'top':
      default:
        return 'bottom-full mb-2';
    }
  };
  
  return (
    <div 
      className={`flex items-center ${className} relative group cursor-help`}
      onMouseEnter={handleMouseEnter}
    >
      {/* Background Circle */}
      <div className={`relative flex items-center justify-center ${backgroundSizeClasses[size]}`}>
        <div className={`absolute inset-0 bg-black opacity-20 rounded-full`}></div>
        {/* Icon Image */}
        <img 
          src={imagePath} 
          alt={`${type}/${attribute}`}
          className={`relative ${iconSizeClasses[size]} object-contain`}
          style={{ imageRendering: 'pixelated' }}
          onError={(e) => {
            console.error(`Failed to load image: ${imagePath}`);
            (e.target as HTMLImageElement).src = '/assets/type-attribute/unknown_neutral.png';
          }}
        />
      </div>
      
      {showLabel && (
        <span className="ml-1 text-xs">
          {type}/{attribute}
        </span>
      )}
      
      {/* Compact tooltip */}
      {showTooltip && (
        <div className={`absolute ${getTooltipPositionClasses()} left-1/2 transform -translate-x-1/2 shadow-lg rounded-md overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 w-56`}>
          
          <div className="bg-white p-2 text-xs">
            {/* Type section */}
            <div className="mb-2">
              <div className="text-center mb-1">
                <span className="font-bold text-primary-700 text-sm">{type}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-1">
                <div className="bg-green-50 border border-green-100 rounded p-1">
                  <div className="text-green-700 font-medium">Strong vs:</div>
                  <div className="font-medium">{getTypeStrong(type)}</div>
                </div>
                <div className="bg-red-50 border border-red-100 rounded p-1">
                  <div className="text-red-700 font-medium">Weak vs:</div>
                  <div className="font-medium">{getTypeWeak(type)}</div>
                </div>
              </div>
            </div>
            
            {/* Divider */}
            <div className="border-t border-gray-200 my-1"></div>
            
            {/* Attribute section */}
            <div>
              <div className="text-center mb-1">
                <span className="font-bold text-primary-700 text-sm">{attribute}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-1">
                <div className="bg-green-50 border border-green-100 rounded p-1">
                  <div className="text-green-700 font-medium">Strong vs:</div>
                  <div className="font-medium">{getAttributeStrong(attribute)}</div>
                </div>
                <div className="bg-red-50 border border-red-100 rounded p-1">
                  <div className="text-red-700 font-medium">Weak vs:</div>
                  <div className="font-medium">{getAttributeWeak(attribute)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypeAttributeIcon; 