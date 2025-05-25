import React, { useState, useEffect, useRef } from 'react';
import { useDigimonStore, UserDigimon } from '../store/petStore';
import { motion } from 'framer-motion';
import PageTutorial from '../components/PageTutorial';
import { DialogueStep } from '../components/DigimonDialogue';
import DigimonSprite from '../components/DigimonSprite';
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
    <>
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">DigiFarm</h1>
      </div>
      
      <TabGroup selectedIndex={selectedTab} onChange={setSelectedTab}>
        <TabList className="flex space-x-1 rounded-xl bg-blue-100 p-1 mb-6">
          <Tab 
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
               ${selected ? 'bg-white shadow' : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-600'}`
            }
          >
            Manage
          </Tab>
          <Tab 
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
               ${selected ? 'bg-white shadow' : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-600'}`
            }
          >
            Playground
          </Tab>
        </TabList>
        
        <TabPanels>
          {/* Storage Tab */}
          <TabPanel>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">Digimon Storage</h2>
                </div>
                
                <p className="mt-2 text-gray-600 text-sm">
                  Manage your Digimon collection by moving them between party and storage. 
                  Stored Digimon don't gain any experience.
                </p>
              </div>
              
              <div className="p-5 grid gap-6">
                {/* Active Party Section */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">Party</h3>
                    <span className="text-sm text-blue-600 font-medium">{activePartyCount}/{maxActivePartySize}</span>
                  </div>
                  
                  {(!allUserDigimon || allUserDigimon.length === 0) ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <p className="text-gray-500 text-sm">No Digimon in your active party</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {allUserDigimon.map(digimon => (
                        <div 
                          key={digimon.id} 
                          className="bg-white rounded-lg border border-gray-100 p-3 flex flex-col items-center relative transition-shadow hover:shadow-md"
                        >
                          
                          <div className="w-16 h-16 mb-2 flex items-center justify-center">
                            <DigimonSprite 
                              digimonName={digimon.digimon?.name || ''} 
                              fallbackSpriteUrl={digimon.digimon?.sprite_url || ''}
                              size="sm"
                            />
                          </div>
                          
                          <div className="text-center">
                            <div className="text-xs font-semibold text-gray-800 mb-0.5 truncate w-full max-w-[120px]">
                              {digimon.name || digimon.digimon?.name}
                            </div>
                            <div className="text-xs text-gray-500 mb-2">Lv. {digimon.current_level}</div>
                          </div>
                          
                          {digimon.is_active ? (
                            <div className="w-full text-xs text-center px-3 py-1.5 rounded-md font-medium bg-gray-100 text-gray-400 cursor-not-allowed">
                              Active
                            </div>
                          ) : (
                            <button
                              onClick={() => handleTransferToStorage(digimon.id)}
                              disabled={transferringDigimon === digimon.id || activePartyCount <= 1}
                              className={`w-full text-xs px-3 py-1.5 rounded-md font-medium transition-colors
                                ${transferringDigimon === digimon.id 
                                  ? 'bg-gray-100 text-gray-400 cursor-wait' 
                                  : activePartyCount <= 1 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                            >
                              {transferringDigimon === digimon.id ? 'Moving...' : 'Store'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
                
                {/* Storage Section */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">Storage</h3>
                    <span className="text-sm text-gray-600 font-medium">{storageDigimon?.length || 0} Digimon</span>
                  </div>
                  
                  {(!storageDigimon || storageDigimon.length === 0) ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <p className="text-gray-500 text-sm">No Digimon in storage</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {storageDigimon.map(digimon => (
                        <div 
                          key={digimon.id} 
                          className="bg-gray-50 rounded-lg border border-gray-100 p-3 flex flex-col items-center transition-shadow hover:shadow-md"
                        >
                          <div className="w-16 h-16 mb-2 flex items-center justify-center">
                            <DigimonSprite 
                            digimonName={digimon.digimon?.name || ''} 
                            fallbackSpriteUrl={digimon.digimon?.sprite_url || ''}
                            size="sm"
                            />
                          </div>
                          
                          <div className="text-center">
                            <div className="text-xs font-semibold text-gray-700 mb-0.5 truncate w-full max-w-[120px]">
                              {digimon.name || digimon.digimon?.name}
                            </div>
                            <div className="text-xs text-gray-500 mb-2">Lv. {digimon.current_level}</div>
                          </div>
                          
                          <button
                            onClick={() => handleTransferToActiveParty(digimon.id)}
                            disabled={transferringDigimon === digimon.id || activePartyCount >= maxActivePartySize}
                            className={`w-full text-xs px-3 py-1.5 rounded-md font-medium transition-colors
                              ${transferringDigimon === digimon.id 
                                ? 'bg-gray-200 text-gray-400 cursor-wait' 
                                : activePartyCount >= maxActivePartySize
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                  : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                          >
                            {transferringDigimon === digimon.id ? 'Moving...' : 'Activate'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
                
                {/* Info Box */}
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm text-amber-800">
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium mb-1.5">Storage Rules:</p>
                      <ul className="space-y-1 pl-1">
                        <li className="flex items-start">
                          <span className="mr-1.5">•</span>
                          <span>Your active Digimon cannot be moved to storage</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-1.5">•</span>
                          <span>Digimon in storage don't lose happiness or gain experience</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-1.5">•</span>
                          <span>Your active party is limited to {maxActivePartySize} Digimon</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Playground Tab */}
          <TabPanel>
            <p className="text-gray-600 mb-6">
              Watch your Digimon play and interact! Click on a Digimon to interact with them.
            </p>
            
            <div 
              ref={playgroundRef}
              className="relative w-full sm:w-4/5 md:w-3/4 lg:w-2/3 mx-auto h-[500px] md:h-[600px] bg-gray-100 rounded-xl border-4 border-blue-300 overflow-hidden"
            >
              {/* Render Digimon */}
              {playgroundDigimon.map(digimon => (
                <motion.div
                  key={digimon.id}
                  className="absolute cursor-pointer"
                  style={{
                    left: `${digimon.x}%`,
                    top: `${digimon.y}%`,
                    zIndex: Math.floor(digimon.y * 10) + 10,
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
                >
                  {/* Digimon sprite - Use DigimonSprite for animated user Digimon */}
                  {'digimon' in digimon && digimon.hasAnimatedSprites ? (
                    <div className="transform scale-75 md:scale-100" style={{ 
                      transform: `scaleX(${digimon.facingDirection === 'left' ? 1 : -1})`,
                    }}>
                      <DigimonSprite
                        digimonName={digimon.digimon?.name || ''}
                        fallbackSpriteUrl={digimon.digimon?.sprite_url || '/assets/digimon/agumon_professor.png'}
                        size="sm"
                        showHappinessAnimations={true}
                        currentSpriteType={digimon.animationState}
                      />
                    </div>
                  ) : (
                    // Simple sprite image for non-animated Digimon or NPCs
                    <div 
                      className="w-12 h-12 flex items-center justify-center transform"
                      style={{ 
                        imageRendering: 'pixelated',
                        pointerEvents: 'none',
                        transform: `scaleX(${digimon.facingDirection === 'left' ? 1 : -1})`
                      }}
                    >
                      <img 
                        src={'digimon' in digimon ? digimon.digimon?.sprite_url : (digimon as NPCDigimon).sprite_url} 
                        alt={'digimon' in digimon ? (digimon.name || digimon.digimon?.name || 'Digimon') : digimon.name}
                        className="max-w-full max-h-full w-16 h-16 md:w-24 md:h-24"
                        style={{ 
                          imageRendering: 'pixelated',
                          transform: !('digimon' in digimon) ? 'scale(1)' : 'none'
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Digimon name label - only show when clicked */}
                  {showNameFor === digimon.id && (
                    <div 
                      className="absolute -bottom-2 md:-bottom-2 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 px-1 md:px-2 py-0.5 rounded text-[10px] md:text-xs whitespace-nowrap"
                      style={{ pointerEvents: 'none' }}
                    >
                      {'digimon' in digimon ? (digimon.name || digimon.digimon?.name) : digimon.name}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
    <PageTutorial tutorialId="playground_intro" steps={playgroundPageTutorialSteps} />
    </>
  );
};

export default DigimonPlayground; 