import React, { useState, useEffect } from 'react';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import DigimonSprite from './DigimonSprite';

const DigimonShowcase: React.FC = () => {
  const [digimonImages, setDigimonImages] = useState<Array<{id: number, name: string, sprite: string}>>([]);
  
  useEffect(() => {
    // Convert the lookup table to an array
    const allDigimon = Object.values(DIGIMON_LOOKUP_TABLE).map(digimon => ({
      id: digimon.id,
      name: digimon.name,
      sprite: digimon.sprite_url
    }));
    
    // Shuffle array and pick 30 random Digimon
    const shuffled = [...allDigimon].sort(() => 0.5 - Math.random());
    const selectedDigimon = shuffled.slice(0, 30);
    
    setDigimonImages(selectedDigimon);
  }, []);
  
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2 p-4 bg-white rounded-lg shadow-md dark:bg-gray-900/80 dark:border dark:border-gray-700">
      {digimonImages.map((digimon) => (
        <div 
          key={digimon.id} 
          className="flex items-center justify-center p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700"
          title={digimon.name}
        >
          <DigimonSprite digimonName={digimon.name} fallbackSpriteUrl={digimon.sprite} size="sm" />
        </div>
      ))}
    </div>
  );
};

export default DigimonShowcase; 