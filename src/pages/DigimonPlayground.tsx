import React, { useState, useEffect, useRef } from 'react';
import { useDigimonStore, UserDigimon } from '../store/petStore';
import { motion } from 'framer-motion';
import PageTutorial from '../components/PageTutorial';
import { DialogueStep } from '../components/DigimonDialogue';

const DigimonPlayground: React.FC = () => {
  const { allUserDigimon, fetchAllUserDigimon } = useDigimonStore();
  const [playgroundDigimon, setPlaygroundDigimon] = useState<PlaygroundDigimon[]>([]);
  const [selectedDigimon, setSelectedDigimon] = useState<PlaygroundDigimon | null>(null);
  const playgroundRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const initializedRef = useRef(false);
  const [poopLocations, setPoopLocations] = useState<PoopLocation[]>([]);
  const [draggedItem, setDraggedItem] = useState<'food' | 'bandage' | null>(null);
  const [showHearts, setShowHearts] = useState<string | null>(null);
  const [hoppingDigimon, setHoppingDigimon] = useState<string | null>(null);
  const [showNameFor, setShowNameFor] = useState<string | null>(null);
  
  // Constants for event timing
  const EVENT_COOLDOWN = 30000; // 30 seconds minimum between events
  const EVENT_CHANCES = {
    hungry: 0.0002,
    hurt: 0.00015,
    poop: 0.0001,
  };

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
    state: 'normal' | 'hungry' | 'hurt';
    lastEventTime: number;
    lastStateChange: number;
    isHopping: boolean;
  }

  interface PoopLocation {
    id: string;
    x: number;
    y: number;
    digimonId: string;
  }

  // Fetch user's Digimon on component mount
  useEffect(() => {
    fetchAllUserDigimon();
  }, [fetchAllUserDigimon]);

  // Initialize playground Digimon when allUserDigimon changes
  useEffect(() => {
    if (allUserDigimon.length > 0 && !initializedRef.current) {
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
          lastBehaviorChange: Date.now(),
          state: 'normal' as const,
          lastEventTime: Date.now(),
          lastStateChange: Date.now(),
          isHopping: false,
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
          // Skip if Digimon is picked up or hopping
          if (digimon.isPickedUp || digimon.isHopping) return digimon;
          
          let updatedDigimon = { ...digimon };
          
          // Handle random events (separate from movement)
          if (now - digimon.lastEventTime >= EVENT_COOLDOWN && digimon.state === 'normal') {
            if (Math.random() < EVENT_CHANCES.hungry) {
              updatedDigimon = {
                ...updatedDigimon,
                state: 'hungry',
                lastEventTime: now,
                lastStateChange: now,
                speed: digimon.speed * 0.5
              };
            } else if (Math.random() < EVENT_CHANCES.hurt) {
              updatedDigimon = {
                ...updatedDigimon,
                state: 'hurt',
                lastEventTime: now,
                lastStateChange: now,
                speed: digimon.speed * 0.5
              };
            } else if (Math.random() < EVENT_CHANCES.poop) {
              setPoopLocations(prev => {
                const filtered = prev.filter(p => p.digimonId !== digimon.id);
                return [...filtered, {
                  id: `poop-${digimon.id}-${Date.now()}`,
                  x: digimon.x,
                  y: digimon.y,
                  digimonId: digimon.id
                }];
              });
              updatedDigimon.lastEventTime = now;
            }
          }

          // Handle behavior changes (separate from events)
          const behaviorChangeProbability = (now - updatedDigimon.lastBehaviorChange) / 1000 / 15;
          if (Math.random() < behaviorChangeProbability) {
            // Filter out 'energetic' if Digimon is hungry or hurt
            const availableBehaviors: ('wander' | 'energetic' | 'lazy' | 'curious')[] = 
              updatedDigimon.state === 'normal' 
                ? ['wander', 'energetic', 'lazy', 'curious']
                : ['wander', 'lazy', 'curious'];
            
            const newBehavior = availableBehaviors[Math.floor(Math.random() * availableBehaviors.length)];
            
            let newSpeed = 0.015;
            if (newBehavior === 'energetic') newSpeed = 0.1;
            if (newBehavior === 'lazy') newSpeed = 0.005;
            if (newBehavior === 'wander') newSpeed = 0.015;
            if (newBehavior === 'curious') newSpeed = 0.02;
            
            // Apply speed modifiers
            if (updatedDigimon.digimon?.spd) {
              const spdFactor = updatedDigimon.digimon.spd / 75;
              newSpeed *= (0.5 + spdFactor);
            }
            
            // Apply state-based speed reduction if needed
            if (updatedDigimon.state === 'hungry' || updatedDigimon.state === 'hurt') {
              newSpeed *= 0.5;
            }
            
            updatedDigimon = {
              ...updatedDigimon,
              behavior: newBehavior,
              speed: newSpeed,
              lastBehaviorChange: now
            };
          }

          // Always process movement (unless picked up)
          let newX = updatedDigimon.x;
          let newY = updatedDigimon.y;
          let newDirection = updatedDigimon.direction;
          let newIsMoving = updatedDigimon.isMoving;
          let newFacingDirection = updatedDigimon.facingDirection;

          // Process behavior-specific movement
          switch (updatedDigimon.behavior) {
            case 'wander':
              if (Math.random() < 0.01) {
                newDirection = Math.random() * Math.PI * 2;
                newFacingDirection = Math.cos(newDirection) < 0 ? 'left' : 'right';
              }
              if (Math.random() < 0.005) {
                newIsMoving = !newIsMoving;
              }
              
              if (newIsMoving) {
                newX += Math.cos(newDirection) * updatedDigimon.speed;
                newY += Math.sin(newDirection) * updatedDigimon.speed;
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
              
              newX += Math.cos(newDirection) * updatedDigimon.speed * sprintFactor;
              newY += Math.sin(newDirection) * updatedDigimon.speed * sprintFactor;
              break;
              
            case 'lazy':
              // Mostly stationary with occasional slow movement
              if (updatedDigimon.behaviorTimer % 150 === 0) { // Increased from 100
                newIsMoving = Math.random() < 0.3;
                if (newIsMoving) {
                  newDirection = Math.random() * Math.PI * 2;
                  newFacingDirection = Math.cos(newDirection) < 0 ? 'left' : 'right';
                }
              }
              
              if (newIsMoving && updatedDigimon.behaviorTimer % 4 === 0) { // Move even slower
                newX += Math.cos(newDirection) * updatedDigimon.speed;
                newY += Math.sin(newDirection) * updatedDigimon.speed;
              }
              break;
              
            case 'curious':
              // Move toward a point of interest, then pause to "look around"
              if (updatedDigimon.behaviorTimer % 200 === 0 || !newIsMoving) { // Increased from 150
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
                newX += Math.cos(newDirection) * updatedDigimon.speed;
                newY += Math.sin(newDirection) * updatedDigimon.speed;
              }
              break;
          }
          
          // Boundary checks
          newX = Math.max(0, Math.min(100, newX));
          newY = Math.max(0, Math.min(100, newY));
          
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
            ...updatedDigimon,
            x: newX,
            y: newY,
            direction: newDirection,
            isMoving: newIsMoving,
            facingDirection: newFacingDirection,
            behaviorTimer: updatedDigimon.behaviorTimer + 1
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
      setSelectedDigimon(null);
      setShowNameFor(null);
    } else {
      setSelectedDigimon(digimon);
      setShowNameFor(digimon.id);
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
    setShowNameFor(null); // Clear name display when clicking playground
  };
  
  // Add handlers for items
  const handleItemDragStart = (item: 'food' | 'bandage') => {
    setDraggedItem(item);
  };

  const handleItemDrop = async (e: React.DragEvent, digimon: PlaygroundDigimon) => {
    e.preventDefault();
    
    if (!draggedItem || digimon.isPickedUp) return;

    if ((draggedItem === 'food' && digimon.state === 'hungry') ||
        (draggedItem === 'bandage' && digimon.state === 'hurt')) {
      
      // Set hopping state
      setPlaygroundDigimon(prev =>
        prev.map(d => d.id === digimon.id ? {
          ...d,
          state: 'normal',
          speed: d.speed * 2,
          lastEventTime: Date.now(),
          isMoving: false,
          isHopping: true
        } : d)
      );

      setHoppingDigimon(digimon.id);
      setShowHearts(digimon.id);
      
      // Wait for hopping animation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear hopping state and resume movement
      setHoppingDigimon(null);
      setPlaygroundDigimon(prev =>
        prev.map(d => d.id === digimon.id ? {
          ...d,
          isMoving: true,
          isHopping: false
        } : d)
      );
      
      setShowHearts(null);
    }
    
    setDraggedItem(null);
  };

  // Add handler for cleaning poop
  const handlePoopClick = (poopId: string) => {
    setPoopLocations(prev => prev.filter(p => p.id !== poopId));
  };

  const playgroundPageTutorialSteps: DialogueStep[] = [
    {
      speaker: 'neemon',
      text: "Oh hey, tamer! Come play with us!"
    },
    {
      speaker: 'bokomon',
      text: "Hey, Neemon! What's up?"
    },
    {
      speaker: 'neemon',
      text: "Here, you can play with your Digimon in the playground!"
    },
    {
      speaker: 'bokomon',
      text: "These don't make us any stronger, you know."
    },
    {
      speaker: 'neemon',
      text: "But they're fun!"
    },
  ];

  return (
    <>
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
        {/* Render poops */}
        {poopLocations.map(poop => (
          <div
            key={poop.id}
            className="absolute cursor-pointer text-2xl transform"
            style={{
              left: `${poop.x}%`,
              top: `${poop.y}%`,
              zIndex: 5
            }}
            onClick={() => handlePoopClick(poop.id)}
          >
            💩
          </div>
        ))}

        {/* Render Digimon with state indicators */}
        {playgroundDigimon.map(digimon => (
          <motion.div
            key={digimon.id}
            className="absolute cursor-pointer"
            style={{
              left: `${digimon.x}%`,
              top: `${digimon.y}%`,
              zIndex: digimon.isPickedUp ? 999 : Math.floor(digimon.y * 10) + 10,
              filter: selectedDigimon?.id === digimon.id ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))' : 'none',
              padding: '20px',
              margin: '-20px',
            }}
            animate={hoppingDigimon === digimon.id ? {
              y: [0, -15, 0, -10, 0, -5, 0],
            } : {}}
            transition={hoppingDigimon === digimon.id ? {
              duration: 1,
              times: [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1],
              ease: "easeInOut"
            } : {}}
            onClick={(e) => handleDigimonClick(digimon, e)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleItemDrop(e, digimon)}
          >
            {/* Digimon sprite */}
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
            
            {/* Digimon name label - only show when clicked */}
            {showNameFor === digimon.id && (
              <div 
                className="absolute -bottom-5 md:-bottom-6 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 px-1 md:px-2 py-0.5 rounded text-[10px] md:text-xs whitespace-nowrap"
                style={{ pointerEvents: 'none' }}
              >
                {digimon.name || digimon.digimon?.name}
              </div>
            )}
            
            {/* State indicator */}
            {digimon.state !== 'normal' && (
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg px-2 py-1 shadow-md">
                {digimon.state === 'hungry' ? '🍖' : '🩹'}
              </div>
            )}
            
            {/* Hearts animation */}
            {showHearts === digimon.id && (
              <motion.div
                className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: -20, opacity: 0 }}
                transition={{ duration: 1 }}
              >
                ❤️
              </motion.div>
            )}
          </motion.div>
        ))}
        
      </div>

      {/* Item toolbar - now below the playground */}
      <div className="mt-4 flex justify-center gap-4">
        <div
          className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg cursor-grab shadow-md hover:bg-gray-200"
          draggable
          onDragStart={() => handleItemDragStart('food')}
        >
          🍖
        </div>
        <div
          className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg cursor-grab shadow-md hover:bg-gray-200"
          draggable
          onDragStart={() => handleItemDragStart('bandage')}
        >
          🩹
        </div>
      </div>
    </div>
    <PageTutorial tutorialId="playground_intro" steps={playgroundPageTutorialSteps} />
    </>
  );
};

export default DigimonPlayground; 