import React, { useState, useEffect, useRef } from 'react';
import { useDigimonStore, UserDigimon } from '../store/petStore';
import { motion } from 'framer-motion';

const DigimonPlayground: React.FC = () => {
  const { allUserDigimon, fetchAllUserDigimon } = useDigimonStore();
  const [playgroundDigimon, setPlaygroundDigimon] = useState<PlaygroundDigimon[]>([]);
  const [selectedDigimon, setSelectedDigimon] = useState<PlaygroundDigimon | null>(null);
  const playgroundRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const initializedRef = useRef(false);
  
  // Define the PlaygroundDigimon type with position and behavior properties
  interface PlaygroundDigimon extends UserDigimon {
    x: number;
    y: number;
    direction: number; // in radians
    speed: number;
    behavior: 'wander' | 'energetic' | 'lazy' | 'curious';
    behaviorTimer: number;
    isMoving: boolean;
    isPickedUp: boolean;
    facingDirection: 'left' | 'right';
    lastBehaviorChange: number;
  }

  // Fetch user's Digimon on component mount
  useEffect(() => {
    fetchAllUserDigimon();
  }, [fetchAllUserDigimon]);

  // Initialize playground Digimon when allUserDigimon changes
  useEffect(() => {
    if (allUserDigimon.length > 0 && !initializedRef.current) {
      // Mark as initialized to prevent re-initialization
      initializedRef.current = true;
      
      const initializedDigimon = allUserDigimon.map(digimon => {
        // Assign random positions within the playground
        const x = Math.random() * 80 + 10; // 10% to 90% of width
        const y = Math.random() * 80 + 10; // 10% to 90% of height
        
        // Assign random behavior
        const behaviors: ('wander' | 'energetic' | 'lazy' | 'curious')[] = ['wander', 'energetic', 'lazy', 'curious'];
        const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
        
        // Assign speed based on behavior and Digimon's SPD stat - REDUCED SPEEDS
        let speed = 0.015;
        if (behavior === 'energetic') speed = 0.1;
        if (behavior === 'lazy') speed = 0.005;
        if (behavior === 'wander') speed = 0.015;
        if (behavior === 'curious') speed = 0.02;
        
        // Adjust speed based on Digimon's SPD stat if available
        if (digimon.digimon?.spd) {
          const spdFactor = digimon.digimon.spd / 100; // Normalize SPD to a smaller factor
          speed *= (0.5 + spdFactor); // Reduced base speed + SPD influence
        }
        
        return {
          ...digimon,
          x,
          y,
          direction: Math.random() * Math.PI * 2,
          speed,
          behavior,
          behaviorTimer: 0,
          isMoving: true,
          isPickedUp: false,
          facingDirection: Math.random() > 0.5 ? 'left' as const : 'right' as const,
          lastBehaviorChange: Date.now()
        };
      });
      
      setPlaygroundDigimon(initializedDigimon);
    }
  }, [allUserDigimon]);

  // Reset initialization state when component unmounts
  useEffect(() => {
    return () => {
      initializedRef.current = false;
    };
  }, []);

  // Animation loop for Digimon movement
  useEffect(() => {
    if (playgroundDigimon.length === 0) return;
    
    const updateDigimonPositions = () => {
      const now = Date.now();
      
      // Get the actual playground dimensions
      const playground = playgroundRef.current;
      if (!playground) {
        animationFrameRef.current = requestAnimationFrame(updateDigimonPositions);
        return;
      }
      
      const playgroundRect = playground.getBoundingClientRect();
      const playgroundWidth = playgroundRect.width;
      const playgroundHeight = playgroundRect.height;
      
      setPlaygroundDigimon(prevDigimon => {
        return prevDigimon.map(digimon => {
          // Skip if Digimon is picked up
          if (digimon.isPickedUp) return digimon;
          
          // Chance to change behavior every 5-10 seconds
          const behaviorChangeProbability = (now - digimon.lastBehaviorChange) / 1000 / 15; // 0-1 over 15 seconds
          if (Math.random() < behaviorChangeProbability) {
            const behaviors: ('wander' | 'energetic' | 'lazy' | 'curious')[] = ['wander', 'energetic', 'lazy', 'curious'];
            const newBehavior = behaviors[Math.floor(Math.random() * behaviors.length)];
            
            // Update speed based on new behavior - REDUCED SPEEDS
            let newSpeed = 0.015;
            if (newBehavior === 'energetic') newSpeed = 0.1;
            if (newBehavior === 'lazy') newSpeed = 0.005;
            if (newBehavior === 'wander') newSpeed = 0.015;
            if (newBehavior === 'curious') newSpeed = 0.02;
            
            // Adjust speed based on Digimon's SPD stat if available
            if (digimon.digimon?.spd) {
              const spdFactor = digimon.digimon.spd / 75;
              newSpeed *= (0.5 + spdFactor);
            }
            
            return {
              ...digimon,
              behavior: newBehavior,
              speed: newSpeed,
              lastBehaviorChange: now
            };
          }
          
          // Behavior-specific movement patterns
          let newX = digimon.x;
          let newY = digimon.y;
          let newDirection = digimon.direction;
          let newIsMoving = digimon.isMoving;
          let newFacingDirection = digimon.facingDirection;
          
          // Increment behavior timer
          const newBehaviorTimer = digimon.behaviorTimer + 1;
          
          switch (digimon.behavior) {
            case 'wander':
              // Occasionally change direction or pause
              if (Math.random() < 0.01) {
                newDirection = Math.random() * Math.PI * 2;
                newFacingDirection = Math.cos(newDirection) < 0 ? 'left' : 'right';
              }
              if (Math.random() < 0.005) { // Reduced from 0.01
                newIsMoving = !newIsMoving;
              }
              
              if (newIsMoving) {
                newX += Math.cos(newDirection) * digimon.speed;
                newY += Math.sin(newDirection) * digimon.speed;
              }
              break;
              
            case 'energetic':
              // Quick, erratic movements with bursts of speed
              if (Math.random() < 0.03) {
                newDirection = Math.random() * Math.PI * 2;
                newFacingDirection = Math.cos(newDirection) < 0 ? 'left' : 'right';
              }
              
              // Occasional sprint
              const sprintFactor = Math.random() < 0.05 ? 1.5 : 1; // Reduced from 2
              
              newX += Math.cos(newDirection) * digimon.speed * sprintFactor;
              newY += Math.sin(newDirection) * digimon.speed * sprintFactor;
              break;
              
            case 'lazy':
              // Mostly stationary with occasional slow movement
              if (newBehaviorTimer % 150 === 0) { // Increased from 100
                newIsMoving = Math.random() < 0.3;
                if (newIsMoving) {
                  newDirection = Math.random() * Math.PI * 2;
                  newFacingDirection = Math.cos(newDirection) < 0 ? 'left' : 'right';
                }
              }
              
              if (newIsMoving && newBehaviorTimer % 4 === 0) { // Move even slower
                newX += Math.cos(newDirection) * digimon.speed;
                newY += Math.sin(newDirection) * digimon.speed;
              }
              break;
              
            case 'curious':
              // Move toward a point of interest, then pause to "look around"
              if (newBehaviorTimer % 200 === 0 || !newIsMoving) { // Increased from 150
                // Toggle between moving and looking
                newIsMoving = !newIsMoving;
                
                if (newIsMoving) {
                  // Pick a new point of interest
                  newDirection = Math.random() * Math.PI * 2;
                  newFacingDirection = Math.cos(newDirection) < 0 ? 'left' : 'right';
                }
              }
              
              // When "looking around" while stationary, occasionally change direction
              if (!newIsMoving && Math.random() < 0.03) { // Reduced from 0.05
                newFacingDirection = newFacingDirection === 'left' ? 'right' : 'left';
              }
              
              if (newIsMoving) {
                newX += Math.cos(newDirection) * digimon.speed;
                newY += Math.sin(newDirection) * digimon.speed;
              }
              break;
          }
          
          // Convert percentage positions to actual pixel positions
          const pixelX = (newX / 100) * playgroundWidth;
          const pixelY = (newY / 100) * playgroundHeight;
          
          // Boundary checks to keep Digimon within the playground with a small margin
          // Only allow a small portion of the Digimon to go outside the visible area
          const digimonSize = 24; // Half the size of Digimon sprite (since we want at least half to be visible)
          const margin = digimonSize; // Positive margin keeps them mostly inside
          
          if (pixelX < margin) {
            // Hit left boundary, bounce back
            newX = (margin / playgroundWidth) * 100;
            newDirection = Math.PI - newDirection;
            newFacingDirection = 'right';
          } else if (pixelX > playgroundWidth - margin) {
            // Hit right boundary, bounce back
            newX = ((playgroundWidth - margin) / playgroundWidth) * 100;
            newDirection = Math.PI - newDirection;
            newFacingDirection = 'left';
          }
          
          if (pixelY < margin) {
            // Hit top boundary, bounce back
            newY = (margin / playgroundHeight) * 100;
            newDirection = -newDirection;
          } else if (pixelY > playgroundHeight - margin) {
            // Hit bottom boundary, bounce back
            newY = ((playgroundHeight - margin) / playgroundHeight) * 100;
            newDirection = -newDirection;
          }
          
          // If Digimon goes too far outside, teleport them back to a random position
          // This is a safety check in case they somehow escape the boundaries
          const maxOutsideDistance = digimonSize / 2; // Much stricter limit
          if (
            pixelX < -maxOutsideDistance || 
            pixelX > playgroundWidth + maxOutsideDistance ||
            pixelY < -maxOutsideDistance || 
            pixelY > playgroundHeight + maxOutsideDistance
          ) {
            // Teleport to a random position within the playground
            newX = Math.random() * 60 + 20; // 20% to 80% of width (more centered)
            newY = Math.random() * 60 + 20; // 20% to 80% of height (more centered)
            newDirection = Math.random() * Math.PI * 2;
            newFacingDirection = Math.cos(newDirection) < 0 ? 'left' : 'right';
          }
          
          return {
            ...digimon,
            x: newX,
            y: newY,
            direction: newDirection,
            isMoving: newIsMoving,
            behaviorTimer: newBehaviorTimer,
            facingDirection: newFacingDirection
          };
        });
      });
      
      animationFrameRef.current = requestAnimationFrame(updateDigimonPositions);
    };
    
    animationFrameRef.current = requestAnimationFrame(updateDigimonPositions);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [playgroundDigimon.length]);
  
  // Handle mouse movement when a Digimon is picked up
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectedDigimon || !playgroundRef.current) return;
    
    const playground = playgroundRef.current;
    const rect = playground.getBoundingClientRect();
    
    // Calculate position as percentage of playground dimensions
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPlaygroundDigimon(prevDigimon => 
      prevDigimon.map(digimon => 
        digimon.id === selectedDigimon.id 
          ? { ...digimon, x, y } 
          : digimon
      )
    );
  };
  
  // Handle clicking on a Digimon
  const handleDigimonClick = (digimon: PlaygroundDigimon, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (selectedDigimon?.id === digimon.id) {
      // If already selected, deselect
      setSelectedDigimon(null);
      
      // Update the Digimon to not be picked up
      setPlaygroundDigimon(prevDigimon => 
        prevDigimon.map(d => 
          d.id === digimon.id 
            ? { ...d, isPickedUp: false } 
            : d
        )
      );
    } else {
      // Select this Digimon
      setSelectedDigimon(digimon);
      
      // Update the Digimon to be picked up
      setPlaygroundDigimon(prevDigimon => 
        prevDigimon.map(d => 
          d.id === digimon.id 
            ? { ...d, isPickedUp: true } 
            : d
        )
      );
    }
  };
  
  // Handle clicking on the playground
  const handlePlaygroundClick = (e: React.MouseEvent) => {
    if (!selectedDigimon || !playgroundRef.current) return;
    
    const playground = playgroundRef.current;
    const rect = playground.getBoundingClientRect();
    
    // Calculate position as percentage of playground dimensions
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Update the Digimon position and deselect it
    setPlaygroundDigimon(prevDigimon => 
      prevDigimon.map(digimon => 
        digimon.id === selectedDigimon.id 
          ? { 
              ...digimon, 
              x, 
              y, 
              isPickedUp: false,
              // Give it a random new direction when dropped
              direction: Math.random() * Math.PI * 2,
              facingDirection: Math.random() > 0.5 ? 'left' : 'right'
            } 
          : digimon
      )
    );
    
    setSelectedDigimon(null);
  };
  
  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Digimon Playground</h1>
      </div>
      
      <p className="text-gray-600 mb-6">
        Watch your Digimon play and interact! Click on a Digimon to pick it up, then click anywhere to drop it.
      </p>
      
      <div 
        ref={playgroundRef}
        className="relative w-full sm:w-4/5 md:w-3/4 lg:w-2/3 mx-auto h-[500px] md:h-[600px] bg-gray-100 rounded-xl border-4 border-blue-300 overflow-hidden"
        onClick={handlePlaygroundClick}
        onMouseMove={handleMouseMove}
      >
        {/* Render each Digimon */}
        {playgroundDigimon.map(digimon => (
          <motion.div
            key={digimon.id}
            className="absolute cursor-pointer"
            style={{
              left: `${digimon.x}%`,
              top: `${digimon.y}%`,
              zIndex: digimon.isPickedUp ? 999 : Math.floor(digimon.y * 10) + 10,
              filter: selectedDigimon?.id === digimon.id ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))' : 'none'
            }}
            animate={
              selectedDigimon?.id === digimon.id 
                ? { 
                    scale: [1, 1.1, 1],
                    transition: { repeat: Infinity, duration: 1 }
                  } 
                : {}
            }
            onClick={(e) => handleDigimonClick(digimon, e)}
          >
            {/* Digimon sprite with scaleX applied only to the sprite */}
            <div 
              className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center transform"
              style={{ 
                imageRendering: 'pixelated',
                pointerEvents: 'none',
                transform: `scaleX(${digimon.facingDirection === 'left' ? 1 : -1})`
              }}
            >
              <img 
                src={digimon.digimon?.sprite_url} 
                alt={digimon.name || digimon.digimon?.name || 'Digimon'} 
                className="max-w-full max-h-full w-16 h-16 md:w-24 md:h-24"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            
            {/* Digimon name label - now outside the flipped container */}
            <div 
              className="absolute -bottom-5 md:-bottom-6 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 px-1 md:px-2 py-0.5 rounded text-[10px] md:text-xs whitespace-nowrap"
              style={{ pointerEvents: 'none' }}
            >
              {digimon.name || digimon.digimon?.name}
            </div>
            
            {/* Behavior indicator - also outside the flipped container */}
            {digimon.behavior === 'energetic' && (
              <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2 text-[10px] md:text-xs">
                💨
              </div>
            )}
            {digimon.behavior === 'lazy' && (
              <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2 text-[10px] md:text-xs">
                💤
              </div>
            )}
            {digimon.behavior === 'curious' && !digimon.isMoving && (
              <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2 text-[10px] md:text-xs">
                ❓
              </div>
            )}
          </motion.div>
        ))}
        
      </div>
    </div>
  );
};

export default DigimonPlayground; 