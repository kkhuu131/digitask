import React, { useState, useEffect, useRef } from 'react';
import { useDigimonStore, UserDigimon } from '../store/petStore';
import { motion } from 'framer-motion';
import PageTutorial from '../components/PageTutorial';
import { DialogueStep } from '../components/DigimonDialogue';
import DigimonSprite from '../components/DigimonSprite';
import TypeAttributeIcon from '../components/TypeAttributeIcon';
import { ANIMATED_DIGIMON } from '../constants/animatedDigimonList';
import { Tab, TabList, TabPanel, TabPanels, TabGroup} from '@headlessui/react';

// Define a type for NPC Digimon
interface NPCDigimon {
  id: string;
  name: string;
  sprite_url: string;
  x: number;
  y: number;
  direction: number;
  speed: number;
  behavior: 'wander' | 'energetic' | 'lazy' | 'curious';
  behaviorTimer: number;
  isMoving: boolean;
  facingDirection: 'left' | 'right';
  lastBehaviorChange: number;
  isHopping: boolean;
  animationState: 'idle1' | 'idle2' | 'happy' | 'cheer';
  animationTimer: number;
  hasAnimatedSprites: boolean;
}

const DigimonPlayground: React.FC = () => {
  const { 
    allUserDigimon,
    storageDigimon, 
    fetchAllUserDigimon, 
    fetchStorageDigimon,
    moveToStorage,
    moveToActiveParty,
    activePartyCount,
    maxActivePartySize
  } = useDigimonStore();
  
  const [playgroundDigimon, setPlaygroundDigimon] = useState<(PlaygroundDigimon | NPCDigimon)[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const playgroundRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const initializedRef = useRef(false);
  const [hoppingDigimon, setHoppingDigimon] = useState<string | null>(null);
  const [showNameFor, setShowNameFor] = useState<string | null>(null);
  const [transferringDigimon, setTransferringDigimon] = useState<string | null>(null);
  
  // Define the PlaygroundDigimon type with position and behavior properties
  interface PlaygroundDigimon extends UserDigimon {
    x: number;
    y: number;
    direction: number; // in radians
    speed: number;
    behavior: 'wander' | 'energetic' | 'lazy' | 'curious';
    behaviorTimer: number;
    isMoving: boolean;
    facingDirection: 'left' | 'right';
    lastBehaviorChange: number;
    isHopping: boolean;
    animationState: 'idle1' | 'idle2' | 'happy' | 'cheer';
    animationTimer: number;
    hasAnimatedSprites: boolean;
  }

  // Define our NPC residents
  const createNPCDigimon = (): NPCDigimon[] => {
    const now = Date.now();
    return [
      {
        id: 'bokomon-npc',
        name: 'Bokomon',
        sprite_url: '/assets/digimon/bokomon.png',
        x: 20 + Math.random() * 10, // Left side of farm
        y: 50 + Math.random() * 20,
        direction: Math.random() * Math.PI * 2,
        speed: 0.01, // Bokomon moves slowly, mostly stays in place
        behavior: 'curious',
        behaviorTimer: 0,
        isMoving: true,
        facingDirection: 'right',
        lastBehaviorChange: now,
        isHopping: false,
        animationState: 'idle1',
        animationTimer: now,
        hasAnimatedSprites: false
      },
      {
        id: 'neemon-npc',
        name: 'Neemon',
        sprite_url: '/assets/digimon/neemon.png',
        x: 70 + Math.random() * 10, // Right side of farm
        y: 50 + Math.random() * 20,
        direction: Math.random() * Math.PI * 2,
        speed: 0.03, // Neemon is a bit more energetic
        behavior: 'energetic',
        behaviorTimer: 0,
        isMoving: true,
        facingDirection: 'left',
        lastBehaviorChange: now,
        isHopping: false,
        animationState: 'idle1',
        animationTimer: now,
        hasAnimatedSprites: false
      }
    ];
  };

  // Fetch user's Digimon on component mount
  useEffect(() => {
    fetchAllUserDigimon();
    fetchStorageDigimon();
  }, [fetchAllUserDigimon, fetchStorageDigimon]);

  // Start animation loop
  useEffect(() => {
    if (playgroundDigimon.length === 0) return;
    
    const animateDigimon = () => {
      updateDigimonPositions();
      animationFrameRef.current = requestAnimationFrame(animateDigimon);
    };
    
    animationFrameRef.current = requestAnimationFrame(animateDigimon);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [playgroundDigimon.length]);
  
  const updateDigimonPositions = () => {
    // Current timestamp for time-based behaviors
    const now = Date.now();
    
    setPlaygroundDigimon(prevDigimon => {
      return prevDigimon.map(digimon => {
        // Skip if Digimon is hopping
        if (digimon.isHopping) return digimon;
        
        let updatedDigimon = { ...digimon };

        // Update animation state
        const animationTimeDiff = now - updatedDigimon.animationTimer;
        if (animationTimeDiff > 750 && updatedDigimon.hasAnimatedSprites) {
          // Toggle between idle1 and idle2 for animated sprites
          const newAnimationState = updatedDigimon.animationState === 'idle1' ? 'idle2' : 'idle1';
          
          // Occasionally show happy animation for energetic behavior
          if (updatedDigimon.behavior === 'energetic' && Math.random() < 0.2) {
            updatedDigimon = {
              ...updatedDigimon,
              animationState: Math.random() < 0.5 ? 'happy' : 'cheer',
              animationTimer: now
            };
          } else {
            updatedDigimon = {
              ...updatedDigimon,
              animationState: newAnimationState,
              animationTimer: now
            };
          }
        }

        // Handle behavior changes
        const behaviorChangeProbability = (now - updatedDigimon.lastBehaviorChange) / 1000 / 15;
        if (Math.random() < behaviorChangeProbability) {
          const availableBehaviors: ('wander' | 'energetic' | 'lazy' | 'curious')[] = 
            ['wander', 'energetic', 'lazy', 'curious'];
          
          // Make energetic more common to increase activity
          const weightedBehaviors = [
            ...availableBehaviors,
            'energetic', 'energetic', 'wander' // Add extra instances to increase probability
          ];
          
          // For NPCs, keep their core behavior traits
          if (updatedDigimon.id === 'bokomon-npc') {
            updatedDigimon.behavior = Math.random() < 0.7 ? 'curious' : 'wander';
          } else if (updatedDigimon.id === 'neemon-npc') {
            updatedDigimon.behavior = Math.random() < 0.7 ? 'energetic' : 'wander';
          } else {
            // User's Digimon can have any behavior
            const newBehavior = weightedBehaviors[Math.floor(Math.random() * weightedBehaviors.length)] as 'wander' | 'energetic' | 'lazy' | 'curious';
            updatedDigimon.behavior = newBehavior;
          }
          
          let newSpeed = 0.015;
          if (updatedDigimon.behavior === 'energetic') newSpeed = 0.15;
          if (updatedDigimon.behavior === 'lazy') newSpeed = 0.008;
          if (updatedDigimon.behavior === 'wander') newSpeed = 0.025;
          if (updatedDigimon.behavior === 'curious') newSpeed = 0.03;
          
          // Apply speed modifiers for user Digimon
          if ('digimon' in updatedDigimon && updatedDigimon.digimon?.spd) {
            const spdFactor = updatedDigimon.digimon.spd / 75;
            newSpeed *= (0.5 + spdFactor);
          }
          
          // If behavior changes to energetic, trigger a happy animation
          if (updatedDigimon.behavior === 'energetic' && updatedDigimon.hasAnimatedSprites) {
            updatedDigimon = {
              ...updatedDigimon,
              animationState: 'happy',
              animationTimer: now
            };
          }
          
          updatedDigimon = {
            ...updatedDigimon,
            speed: newSpeed,
            lastBehaviorChange: now
          };
        }

        // Process behavior-specific movement
        let newX = updatedDigimon.x;
        let newY = updatedDigimon.y;
        let newDirection = updatedDigimon.direction;
        let newIsMoving = updatedDigimon.isMoving;
        let newFacingDirection = updatedDigimon.facingDirection;

        // Higher chance of movement for all behaviors
        if (Math.random() < 0.02) {
          newIsMoving = !newIsMoving;
        }

        // Special interaction - Bokomon and Neemon occasionally move toward each other
        if ((updatedDigimon.id === 'bokomon-npc' || updatedDigimon.id === 'neemon-npc') && Math.random() < 0.2) {
          // Find the other NPC
          const otherNpcId = updatedDigimon.id === 'bokomon-npc' ? 'neemon-npc' : 'bokomon-npc';
          const otherNpc = prevDigimon.find(d => d.id === otherNpcId);
          
          if (otherNpc) {
            // Calculate direction toward the other NPC
            const dx = otherNpc.x - updatedDigimon.x;
            const dy = otherNpc.y - updatedDigimon.y;
            
            // Only move toward them if they're more than 15% away
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 15) {
              updatedDigimon.direction = Math.atan2(dy, dx);
              updatedDigimon.facingDirection = Math.cos(updatedDigimon.direction) < 0 ? 'left' : 'right';
              updatedDigimon.isMoving = true;
            } else {
              // If they're close enough, have them face each other
              updatedDigimon.facingDirection = updatedDigimon.id === 'bokomon-npc' ? 'right' : 'left';
              // And occasionally make them hop with excitement
              if (Math.random() < 0.05) {
                updatedDigimon.isHopping = true;
                setHoppingDigimon(updatedDigimon.id);
                setTimeout(() => {
                  setHoppingDigimon(null);
                  setPlaygroundDigimon(prev => prev.map(d => 
                    d.id === updatedDigimon.id ? { ...d, isHopping: false } : d
                  ));
                }, 1000);
              }
            }
          }
        } else {
          // Regular behavior processing
          switch (updatedDigimon.behavior) {
            case 'wander':
              // Standard movement, occasionally change direction
              if (Math.random() < 0.01) {
                newDirection = Math.random() * Math.PI * 2;
                newFacingDirection = Math.cos(newDirection) < 0 ? 'left' : 'right';
              }
              break;
              
            case 'energetic':
              // Change direction more frequently, moves faster
              if (Math.random() < 0.03) {
                newDirection = Math.random() * Math.PI * 2;
                newFacingDirection = Math.cos(newDirection) < 0 ? 'left' : 'right';
              }
              // Random hops
              if (Math.random() < 0.002) {
                // Start hop animation later
                setTimeout(() => {
                  setHoppingDigimon(updatedDigimon.id);
                  setPlaygroundDigimon(prev => prev.map(d => 
                    d.id === updatedDigimon.id ? { ...d, isHopping: true } : d
                  ));
                  
                  // End hop animation after 1 second
                  setTimeout(() => {
                    setHoppingDigimon(null);
                    setPlaygroundDigimon(prev => prev.map(d => 
                      d.id === updatedDigimon.id ? { ...d, isHopping: false } : d
                    ));
                  }, 1000);
                }, 100);
              }
              break;
              
            case 'lazy':
              // Rarely moves, mostly stays in place
              if (Math.random() < 0.005) {
                newIsMoving = false;
              }
              if (Math.random() < 0.01) {
                newDirection = Math.random() * Math.PI * 2;
                newFacingDirection = Math.cos(newDirection) < 0 ? 'left' : 'right';
              }
              break;
              
            case 'curious':
              // Change direction more often, explore
              if (Math.random() < 0.02) {
                newDirection = Math.random() * Math.PI * 2;
                newFacingDirection = Math.cos(newDirection) < 0 ? 'left' : 'right';
              }
              // Occasional pauses to "look around"
              if (Math.random() < 0.01) {
                newIsMoving = false;
                
                // After a pause, start moving again in a new direction
                setTimeout(() => {
                  setPlaygroundDigimon(prev => prev.map(d => {
                    if (d.id === updatedDigimon.id) {
                      const randomDir = Math.random() * Math.PI * 2;
                      return {
                        ...d,
                        isMoving: true,
                        direction: randomDir,
                        facingDirection: Math.cos(randomDir) < 0 ? 'left' : 'right'
                      };
                    }
                    return d;
                  }));
                }, 1000 + Math.random() * 2000);
              }
              break;
          }
        }

        // Apply movement if digimon is moving
        if (newIsMoving) {
          newX += Math.cos(newDirection) * updatedDigimon.speed;
          newY += Math.sin(newDirection) * updatedDigimon.speed;
          
          // Boundary checking - bounce off the edges
          if (newX < 2 || newX > 98) {
            newDirection = Math.PI - newDirection;
            newFacingDirection = Math.cos(newDirection) < 0 ? 'left' : 'right';
            newX = Math.max(2, Math.min(98, newX)); // Clamp within boundaries
          }
          
          if (newY < 2 || newY > 98) {
            newDirection = -newDirection;
            newY = Math.max(2, Math.min(98, newY)); // Clamp within boundaries
          }
        }

        // For NPC Digimon, ensure more random movement
        if (updatedDigimon.id === 'bokomon-npc' || updatedDigimon.id === 'neemon-npc') {
          // Occasionally change direction randomly for NPCs to prevent them appearing to gravitate
          if (Math.random() < 0.02) { // 2% chance per frame to change direction
            updatedDigimon.direction = Math.random() * Math.PI * 2;
            updatedDigimon.facingDirection = Math.cos(updatedDigimon.direction) < 0 ? 'left' : 'right';
          }
          
          // Ensure they don't get stuck in corners
          if (updatedDigimon.x < 10 || updatedDigimon.x > 90 || updatedDigimon.y < 10 || updatedDigimon.y > 90) {
            // If near boundary, point toward center but with randomness
            const centerX = 50;
            const centerY = 50;
            // Add randomness to avoid them both moving to exact center
            const targetX = centerX + (Math.random() * 40 - 20);
            const targetY = centerY + (Math.random() * 40 - 20);
            
            // Calculate angle to this random point
            const dx = targetX - updatedDigimon.x;
            const dy = targetY - updatedDigimon.y;
            updatedDigimon.direction = Math.atan2(dy, dx);
            updatedDigimon.facingDirection = Math.cos(updatedDigimon.direction) < 0 ? 'left' : 'right';
          }
        }

        // Return updated digimon
        return {
          ...updatedDigimon,
          x: newX,
          y: newY,
          direction: newDirection,
          isMoving: newIsMoving,
          facingDirection: newFacingDirection
        };
      });
    });
  };
  
  // Handle click on Digimon
  const handleDigimonClick = (digimon: PlaygroundDigimon | NPCDigimon, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Toggle name display
    if (showNameFor === digimon.id) {
      setShowNameFor(null);
    } else {
      setShowNameFor(digimon.id);
    }
    
    // Start hopping animation
    setHoppingDigimon(digimon.id);
    setPlaygroundDigimon(prev => prev.map(d => 
      d.id === digimon.id ? { ...d, isHopping: true } : d
    ));
    
    // For NPCs, set a special animation or behavior
    if (digimon.id === 'bokomon-npc' || digimon.id === 'neemon-npc') {
      // Make Neemon and Bokomon always hop toward each other when clicked
      const otherNPCId = digimon.id === 'bokomon-npc' ? 'neemon-npc' : 'bokomon-npc';
      const otherNPC = playgroundDigimon.find(d => d.id === otherNPCId);
      
      if (otherNPC) {
        const dx = otherNPC.x - digimon.x;
        const dy = otherNPC.y - digimon.y;
        const newDirection = Math.atan2(dy, dx);
        
        setPlaygroundDigimon(prev => prev.map(d => {
          if (d.id === digimon.id) {
            return {
              ...d,
              direction: newDirection,
              facingDirection: Math.cos(newDirection) < 0 ? 'left' : 'right',
              isMoving: true,
              speed: 0.1 // Move faster toward other NPC
            };
          }
          return d;
        }));
      }
    }
    
    // End hopping animation after 1 second
    setTimeout(() => {
      setHoppingDigimon(null);
      setPlaygroundDigimon(prev => prev.map(d => 
        d.id === digimon.id ? { ...d, isHopping: false } : d
      ));
    }, 1000);
  };

  // Initialize Digimon in the playground
  useEffect(() => {
    if (storageDigimon.length > 0 && !initializedRef.current) {
      initializedRef.current = true;
      
      // Create playground Digimon from user's Digimon
      const newPlaygroundDigimon = storageDigimon.map(digimon => {
        // Random position
        const x = 10 + Math.random() * 80; // Keep away from edges
        const y = 10 + Math.random() * 80;
        
        // Random behavior
        const behaviors: ('wander' | 'energetic' | 'lazy' | 'curious')[] = ['wander', 'energetic', 'lazy', 'curious'];
        const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
        
        // Assign speed based on behavior
        let speed = 0.025;
        if (behavior === 'energetic') speed = 0.15;
        if (behavior === 'lazy') speed = 0.008;
        if (behavior === 'wander') speed = 0.025;
        if (behavior === 'curious') speed = 0.03;
        
        // Adjust speed based on Digimon's SPD stat if available
        if (digimon.digimon?.spd) {
          const spdFactor = digimon.digimon.spd / 75;
          speed *= (0.5 + spdFactor);
        }
        
        // Random starting direction
        const direction = Math.random() * Math.PI * 2;
        const facingDirection = Math.cos(direction) < 0 ? 'left' : 'right';
        
        // Check if this Digimon has animated sprites
        const hasAnimatedSprites = digimon.digimon?.name ? ANIMATED_DIGIMON.includes(digimon.digimon.name) : false;
        
        return {
          ...digimon,
          x,
          y,
          direction,
          speed,
          behavior,
          behaviorTimer: 0,
          isMoving: Math.random() > 0.3, // 70% chance to start moving
          facingDirection,
          lastBehaviorChange: Date.now(),
          isHopping: false,
          animationState: 'idle1',
          animationTimer: Date.now(),
          hasAnimatedSprites
        } as PlaygroundDigimon;
      });
      
      // Add our NPC Digimon
      const npcDigimon = createNPCDigimon();
      
      // Set the combined playground Digimon
      setPlaygroundDigimon([...newPlaygroundDigimon, ...npcDigimon]);
    }
  }, [storageDigimon]);
  
  const playgroundPageTutorialSteps: DialogueStep[] = [
    {
      speaker: 'neemon',
      text: "Oh hey, tamer! Welcome to the DigiFarm!"
    },
    {
      speaker: 'bokomon',
      text: "Yes, welcome! I'm Bokomon and this is Neemon. We'll help take care of your Digimon here."
    },
    {
      speaker: 'neemon',
      text: "This is where your Digimon can relax and play with each other!"
    },
    {
      speaker: 'bokomon',
      text: "It's important for them to socialize, you know. Even digital monsters need friends."
    },
    {
      speaker: 'neemon',
      text: "Click on any of us to say hello! We love the attention!"
    },
  ];

  // Handle transfer to storage
  const handleTransferToStorage = async (digimonId: string) => {
    setTransferringDigimon(digimonId);
    await moveToStorage(digimonId);
    setTransferringDigimon(null);
  };

  // Handle transfer to active party
  const handleTransferToActiveParty = async (digimonId: string) => {
    setTransferringDigimon(digimonId);
    await moveToActiveParty(digimonId);
    setTransferringDigimon(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Reduced width for playground area */}
        <div className="w-full md:w-1/2">
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-2 dark:text-gray-100">DigiFarm</h1>
            <p className="text-gray-600 dark:text-gray-300">This is where you store Digimon that you aren't using in your party.</p>
          </div>
          
          {/* Playground Area - this is where the Digimon move around */}
          <div 
            ref={playgroundRef}
            className="w-full aspect-video bg-green-100 dark:bg-green-900/30 rounded-lg shadow-inner border border-green-200 dark:border-green-800 relative overflow-hidden"
            style={{
              backgroundImage: `url('/assets/bg/grass-pattern.png')`,
              backgroundRepeat: 'repeat',
              backgroundSize: '200px'
            }}
          >
            {/* Digimon within the playground */}
            {playgroundDigimon.map(digimon => {
              const isUserDigimon = 'digimon_id' in digimon;
              const name = isUserDigimon 
                ? (digimon as PlaygroundDigimon).name || (digimon as PlaygroundDigimon).digimon?.name
                : (digimon as NPCDigimon).name;
              
              const spriteUrl = isUserDigimon
                ? (digimon as PlaygroundDigimon).digimon?.sprite_url || ''
                : (digimon as NPCDigimon).sprite_url;
              
              const digimonName = isUserDigimon
                ? (digimon as PlaygroundDigimon).digimon?.name || ''
                : (digimon as NPCDigimon).name;
              
              return (
                <div
                  key={digimon.id}
                  className="absolute cursor-pointer z-10"
                  style={{
                    left: `${digimon.x}%`,
                    top: `${digimon.y}%`,
                    // Flip the transform for correct facing direction
                    transform: `translate(-50%, -50%) scaleX(${digimon.facingDirection === 'right' ? -1 : 1})`,
                    transition: digimon.isMoving ? 'none' : 'left 0.5s, top 0.5s'
                  }}
                  onClick={(e) => handleDigimonClick(digimon, e)}
                >
                  {/* Show name on hover */}
                  {showNameFor === digimon.id && (
                    <div 
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 bg-white dark:bg-dark-300 px-2 py-1 rounded shadow-sm text-xs whitespace-nowrap z-20"
                      style={{ transform: `translateX(-50%) scaleX(${digimon.facingDirection === 'right' ? -1 : 1})` }}
                    >
                      {name}
                    </div>
                  )}
                  
                  <motion.div 
                    animate={digimon.isHopping ? { y: [0, -15, 0] } : {}}
                    transition={digimon.isHopping ? { duration: 0.5, times: [0, 0.5, 1] } : {}}
                    onAnimationComplete={() => {
                      if (digimon.isHopping && digimon.id === hoppingDigimon) {
                        setHoppingDigimon(null);
                        // Update the hopping state for this digimon
                        setPlaygroundDigimon(prev => 
                          prev.map(d => 
                            d.id === digimon.id ? { ...d, isHopping: false } : d
                          )
                        );
                      }
                    }}
                  >
                    <DigimonSprite
                      digimonName={digimonName}
                      fallbackSpriteUrl={spriteUrl}
                      size="sm"
                      showHappinessAnimations={false}
                      enableHopping={false}
                      currentSpriteType={digimon.hasAnimatedSprites ? digimon.animationState : undefined}
                    />
                  </motion.div>
                </div>
              );
            })}
            
            {/* Removed decorative assets (trees, rocks, etc.) */}
          </div>
      </div>
        
        {/* Increased width for management panel */}
        <div className="w-full md:w-1/2">
          <div className="bg-white dark:bg-dark-300 rounded-lg shadow-sm border border-gray-200 dark:border-dark-200 p-4">
      
      <TabGroup selectedIndex={selectedTab} onChange={setSelectedTab}>
              <TabList className="flex space-x-1 rounded-lg bg-gray-100 dark:bg-dark-200 p-1 mb-4">
          <Tab 
            className={({ selected }) =>
                    `w-full py-2 text-sm font-medium leading-5 rounded-md transition-colors
                    ${
                      selected
                        ? 'bg-white dark:bg-dark-100 text-primary-600 dark:text-accent-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-100/50'
                    }`
                  }
                >
                  Party
          </Tab>
          <Tab 
            className={({ selected }) =>
                    `w-full py-2 text-sm font-medium leading-5 rounded-md transition-colors
                    ${
                      selected
                        ? 'bg-white dark:bg-dark-100 text-primary-600 dark:text-accent-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-100/50'
                    }`
                  }
                >
                  DigiFarm
          </Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Manage your active Digimon party. You can have up to {maxActivePartySize} Digimon.
                  </p>
                  
                  {/* Active Party Grid - compact cards matching party style */}
                  <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[500px] overflow-y-auto pr-1">
                    {allUserDigimon
                      .filter(digimon => !digimon.is_in_storage)
                      .sort((a, b) => {
                        if (a.is_active && !b.is_active) return -1;
                        if (!a.is_active && b.is_active) return 1;
                        return 0;
                      })
                      .map(digimon => (
                        <div
                          key={digimon.id}
                          className={`relative bg-gray-50 dark:bg-dark-200 rounded-lg p-2 border ${digimon.is_active ? 'border-purple-300 dark:border-purple-700' : 'border-gray-200 dark:border-dark-400'}`}
                        >
                          {/* Active badge */}
                          {digimon.is_active && (
                            <div className="absolute top-1 left-1 text-[10px] px-1 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200">Active</div>
                          )}
                          {/* Type icon */}
                          {digimon.digimon?.type && digimon.digimon?.attribute && (
                            <div className="absolute top-1 right-1 z-10">
                              <TypeAttributeIcon 
                                type={digimon.digimon.type as any} 
                                attribute={digimon.digimon.attribute as any} 
                                size="sm" 
                              />
                            </div>
                          )}
                          <div className="w-full aspect-square flex items-center justify-center">
                            <DigimonSprite
                              digimonName={digimon.digimon?.name || ''}
                              fallbackSpriteUrl={digimon.digimon?.sprite_url || ''}
                              size="xs"
                              showHappinessAnimations={false}
                            />
                          </div>
                          {/* Level + exp bar */}
                          <div className="absolute bottom-1 left-1 right-1 flex items-center gap-1">
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 px-1 rounded">{digimon.current_level}</span>
                            <div className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden">
                              {(() => {
                                const expForCurrentLevel = digimon.current_level * 20;
                                const expProgress = Math.min(100, (digimon.experience_points / expForCurrentLevel) * 100);
                                return <div className="bg-purple-500 h-full transition-all" style={{ width: `${expProgress}%` }} />;
                              })()}
                            </div>
                            <button
                              onClick={() => handleTransferToStorage(digimon.id)}
                              disabled={transferringDigimon === digimon.id || digimon.is_active}
                              className={`text-[10px] px-2 py-0.5 rounded flex items-center justify-center ${transferringDigimon === digimon.id ? 'bg-gray-200 dark:bg-gray-600 text-gray-500' : digimon.is_active ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 cursor-not-allowed' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/30'}`}
                              title="Send to Storage"
                              aria-label="Send to Storage"
                            >
                              {transferringDigimon === digimon.id ? '...' : (
                                // Arrow pointing right
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                </TabPanel>
                
                <TabPanel>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Your Digimon in storage. These Digimon don't receive experience or participate in battles.
                  </p>
                  
                  {/* Storage Grid - compact cards matching party style */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[500px] overflow-y-auto pr-1">
                    {storageDigimon.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400 col-span-2">
                        No Digimon in storage
                    </div>
                  ) : (
                      storageDigimon.map(digimon => (
                        <div
                          key={digimon.id}
                          className="relative bg-white dark:bg-dark-200 rounded-lg p-2 border border-gray-200 dark:border-dark-400"
                        >
                          {/* Type icon */}
                          {digimon.digimon?.type && digimon.digimon?.attribute && (
                            <div className="absolute top-1 right-1 z-10">
                              <TypeAttributeIcon 
                                type={digimon.digimon.type as any} 
                                attribute={digimon.digimon.attribute as any} 
                                size="sm" 
                              />
                            </div>
                          )}
                          <div className="w-full aspect-square flex items-center justify-center">
                            <DigimonSprite 
                              digimonName={digimon.digimon?.name || ''}
                              fallbackSpriteUrl={digimon.digimon?.sprite_url || ''}
                              size="xs"
                              showHappinessAnimations={false}
                            />
                          </div>
                          <div className="absolute bottom-1 left-1 right-1 flex items-center gap-1">
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 px-1 rounded">{digimon.current_level}</span>
                            <div className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden">
                              {(() => {
                                const expForCurrentLevel = digimon.current_level * 20;
                                const expProgress = Math.min(100, (digimon.experience_points / expForCurrentLevel) * 100);
                                return <div className="bg-green-500 h-full transition-all" style={{ width: `${expProgress}%` }} />;
                              })()}
                            </div>
                            <button
                              onClick={() => handleTransferToActiveParty(digimon.id)}
                              disabled={transferringDigimon === digimon.id || activePartyCount >= maxActivePartySize}
                              className={`text-[10px] px-2 py-0.5 rounded flex items-center justify-center ${transferringDigimon === digimon.id ? 'bg-gray-200 dark:bg-gray-600 text-gray-500' : activePartyCount >= maxActivePartySize ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 cursor-not-allowed' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/30'}`}
                              title={activePartyCount >= maxActivePartySize ? 'Party Full' : 'Add to Party'}
                              aria-label={activePartyCount >= maxActivePartySize ? 'Party Full' : 'Add to Party'}
                            >
                              {transferringDigimon === digimon.id 
                                ? '...' 
                                : (
                                  // Plus icon
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                  </svg>
                                )}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabPanel>
              </TabPanels>
            </TabGroup>
                </div>
              </div>
            </div>
      
      <PageTutorial 
        tutorialId="digifarm_intro" 
        steps={playgroundPageTutorialSteps} 
      />
    </div>
  );
};

export default DigimonPlayground; 