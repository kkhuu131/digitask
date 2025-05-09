import React from 'react';
import { DigimonType, DigimonAttribute } from '../store/battleStore';

interface TypeAttributeIconProps {
  type: DigimonType;
  attribute: DigimonAttribute;
  size?: 'sm' | 'md' | 'lg' | 'xs';
  showLabel?: boolean;
  className?: string;
}

const TypeAttributeIcon: React.FC<TypeAttributeIconProps> = ({ 
  type, 
  attribute, 
  size = 'md',
  showLabel = false,
  className = ''
}) => {
  // Normalize inputs to handle case inconsistencies
  const normalizedType = type?.toLowerCase() || 'unknown';
  const normalizedAttribute = attribute?.toLowerCase() || 'neutral';
  
  // Generate the image path based on type and attribute
  const imagePath = `/assets/type-attribute/${normalizedType}_${normalizedAttribute}.png`;
  
  // Size classes for the icon itself - adjusted 'md' to be 2x original (32px)
  const iconSizeClasses = {
    xs: 'w-2 h-2', // 8px (1x)
    sm: 'w-4 h-4', // 16px (1x)
    md: 'w-8 h-8', // 32px (2x) - Changed from w-6 h-6
    lg: 'w-16 h-16' // 64px (4x) - Kept as is
  };
  
  // Size classes for the background circle (slightly larger) - adjusted 'md'
  const backgroundSizeClasses = {
    xs: 'w-3 h-3', // 8px
    sm: 'w-5 h-5', // 20px
    md: 'w-10 h-10', // 40px - Changed from w-7 h-7 (approx proportional adjustment)
    lg: 'w-20 h-20' // 80px - Changed from w-18 h-18 (approx proportional adjustment)
  };
  
  return (
    <div className={`flex items-center ${className}`}>
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
    </div>
  );
};

export default TypeAttributeIcon; 