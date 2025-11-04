import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDigimonStore, UserDigimon } from '../store/petStore';
import DigimonDetailModal from './DigimonDetailModal';
import TypeAttributeIcon from './TypeAttributeIcon';
import DigimonSprite from './DigimonSprite';
import { getEvolutions } from '../utils/evolutionsHelper';
import { calculateFinalStats } from '../utils/digimonStatCalculation';
import type { SpriteType } from '../utils/spriteManager';

const PartyMembersGrid: React.FC = () => {
  const { allUserDigimon, userDigimon, setActiveDigimon } = useDigimonStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedDigimon, setSelectedDigimon] = useState<UserDigimon | null>(null);
  
  // Track previous levels to detect level ups
  const previousLevelsRef = useRef<Record<string, number>>({});
  
  // Track level up animations (sprite type for each digimon)
  const [levelUpSprites, setLevelUpSprites] = useState<Record<string, SpriteType | null>>({});
  
  // Track evolution eligibility for each Digimon
  const [evolutionEligible, setEvolutionEligible] = useState<Record<string, boolean>>({});

  // Memoize non-active Digimon to prevent infinite loops
  const nonActiveDigimon = useMemo(() => 
    allUserDigimon.filter(d => d.id !== userDigimon?.id),
    [allUserDigimon, userDigimon?.id]
  );
  
  // Create a stable key for dependency tracking
  const digimonLevelsKey = useMemo(() => 
    nonActiveDigimon.map(d => `${d.id}:${d.current_level}`).join(','),
    [nonActiveDigimon]
  );

  // Check evolution eligibility for each Digimon
  useEffect(() => {
    const checkEvolutions = () => {
      const eligibility: Record<string, boolean> = {};
      
      for (const digimon of nonActiveDigimon) {
        if (!digimon.digimon_id) continue;
        
        try {
          const evolutionPaths = getEvolutions(digimon.digimon_id);
          
          // Check if any evolution path meets requirements
          const canEvolve = evolutionPaths.some((path) => {
            // Check level requirement
            if (digimon.current_level < path.level_required) return false;
            
            // Check stat requirements if they exist
            if (path.stat_requirements) {
              const stats = calculateFinalStats(digimon);
              const statReqs = path.stat_requirements;
              
              // Check each stat requirement
              if (statReqs.hp && stats.hp < statReqs.hp) return false;
              if (statReqs.sp && stats.sp < statReqs.sp) return false;
              if (statReqs.atk && stats.atk < statReqs.atk) return false;
              if (statReqs.def && stats.def < statReqs.def) return false;
              if (statReqs.int && stats.int < statReqs.int) return false;
              if (statReqs.spd && stats.spd < statReqs.spd) return false;
              if (statReqs.abi && (digimon.abi || 0) < statReqs.abi) return false;
            }
            
            return true;
          });
          
          eligibility[digimon.id] = canEvolve;
        } catch (error) {
          console.error(`Error checking evolution for ${digimon.id}:`, error);
          eligibility[digimon.id] = false;
        }
      }
      
      setEvolutionEligible(eligibility);
    };
    
    if (nonActiveDigimon.length > 0) {
      checkEvolutions();
    }
  }, [digimonLevelsKey]);

  // Detect level ups and trigger animation
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];
    const timeouts: NodeJS.Timeout[] = [];
    
    for (const digimon of nonActiveDigimon) {
      const previousLevel = previousLevelsRef.current[digimon.id] ?? digimon.current_level;
      const currentLevel = digimon.current_level;
      
      // If level increased, trigger animation
      if (currentLevel > previousLevel) {
        // Start with happy sprite
        setLevelUpSprites(prev => ({ ...prev, [digimon.id]: 'happy' }));
        
        // Alternate between happy and cheer every 500ms
        let spriteToggle = true;
        const interval = setInterval(() => {
          setLevelUpSprites(prev => ({
            ...prev,
            [digimon.id]: spriteToggle ? 'cheer' : 'happy'
          }));
          spriteToggle = !spriteToggle;
        }, 500);
        
        intervals.push(interval);
        
        // Stop animation after 3 seconds
        const timeout = setTimeout(() => {
          clearInterval(interval);
          setLevelUpSprites(prev => {
            const updated = { ...prev };
            delete updated[digimon.id];
            return updated;
          });
        }, 3000);
        
        timeouts.push(timeout);
      }
      
      // Update previous level
      previousLevelsRef.current[digimon.id] = currentLevel;
    }
    
    // Cleanup function
    return () => {
      intervals.forEach(interval => clearInterval(interval));
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [digimonLevelsKey]);

  if (nonActiveDigimon.length === 0) {
    return null; // Don't render if no non-active Digimon
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-2">
        {nonActiveDigimon.slice(0, 8).map((digimon) => {
          // Calculate experience progress
          const expForCurrentLevel = digimon.current_level * 20;
          const expProgress = Math.min(100, (digimon.experience_points / expForCurrentLevel) * 100);
          
          return (
            <div
              key={digimon.id}
              className="relative bg-gray-100 dark:bg-dark-200 rounded-lg p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-dark-400 transition-colors "
              onClick={() => {
                setSelectedDigimon(digimon);
                setShowModal(true);
              }}
            >
              {/* Type Attribute Icon - Top Right */}
              {digimon.digimon?.type && digimon.digimon?.attribute && (
                <div className="absolute top-1 right-1 z-10">
                  <TypeAttributeIcon 
                    type={digimon.digimon.type as any} 
                    attribute={digimon.digimon.attribute as any} 
                    size="sm" 
                  />
                </div>
              )}
              
              {/* Digimon Sprite - Center */}
              <div className="w-full aspect-square flex items-center justify-center relative">
                <DigimonSprite
                  digimonName={digimon.digimon?.name || 'Agumon'}
                  fallbackSpriteUrl={digimon.digimon?.sprite_url || ''}
                  happiness={digimon.happiness}
                  size="xs"
                  currentSpriteType={levelUpSprites[digimon.id] || undefined}
                  enableHopping={evolutionEligible[digimon.id] || false}
                />
              </div>
              
              {/* Level and Experience Bar - Bottom */}
              <div className="absolute bottom-1 left-1 right-1 flex items-center gap-1">
                {/* Level */}
                <span className={`text-xs font-bold px-1 rounded transition-all duration-300 ${
                  levelUpSprites[digimon.id] 
                    ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-200/90 dark:bg-yellow-900/60 animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.8)]' 
                    : 'text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80'
                }`}>
                  {digimon.current_level}
                </span>
                
                {/* Experience Progress Bar */}
                <div className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden mr-1 relative">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      levelUpSprites[digimon.id] 
                        ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.6)]' 
                        : 'bg-purple-500'
                    }`}
                    style={{ width: `${expProgress}%` }}
                  />
                  {/* Glow effect overlay */}
                  {levelUpSprites[digimon.id] && (
                    <div 
                      className="absolute inset-0 bg-yellow-400/40 rounded-full blur-sm animate-pulse"
                      style={{ width: `${expProgress}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {showModal && selectedDigimon && (
        <DigimonDetailModal
          selectedDigimon={selectedDigimon}
          onClose={() => {
            setShowModal(false);
            setSelectedDigimon(null);
          }}
          onSetActive={async (digimonId: string) => {
            try {
              await setActiveDigimon(digimonId);
              setShowModal(false);
              setSelectedDigimon(null);
            } catch (error) {
              console.error('Error setting active Digimon:', error);
            }
          }}
          onNameChange={(updatedDigimon) => {
            // Update the store directly
            useDigimonStore.getState().updateDigimonName(updatedDigimon.id, updatedDigimon.name || '');
            
            // Dispatch the custom event to notify other components
            const event = new CustomEvent('digimon-name-changed', {
              detail: { digimonId: updatedDigimon.id }
            });
            window.dispatchEvent(event);
          }}
          className="z-40"
        />
      )}
    </>
  );
};

export default PartyMembersGrid;
