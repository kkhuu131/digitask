import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInteractiveBattleStore } from '../store/interactiveBattleStore';
import { BattleDigimon } from '../types/battle';
import BattleDigimonSprite from './BattleDigimonSprite';
import TypeAttributeIcon from './TypeAttributeIcon';
import { Sword } from 'lucide-react';
import { DigimonAttribute, DigimonType, TypeAdvantageMap, AttributeAdvantageMap } from '@/store/battleStore';

// Calculate damage multiplier based on type and attribute advantages
const calculateDamageMultiplier = (attacker: BattleDigimon, target: BattleDigimon) => {
  const typeMultiplier = TypeAdvantageMap[attacker.type as DigimonType]?.[target.type as DigimonType] ?? 1.0;
  const attributeMultiplier = AttributeAdvantageMap[attacker.attribute as DigimonAttribute]?.[target.attribute as DigimonAttribute] ?? 1.0;
  
  return {
    typeMultiplier,
    attributeMultiplier,
    totalMultiplier: typeMultiplier * attributeMultiplier
  };
};

// Get multiplier display text and color
const getMultiplierDisplay = (multiplier: number) => {
  if (multiplier > 1.5) {
    return { text: `${multiplier.toFixed(1)}x`, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30' };
  } else if (multiplier < 0.8) {
    return { text: `${multiplier.toFixed(1)}x`, color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30' };
  } else {
    return { text: `${multiplier.toFixed(1)}x`, color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-800/30' };
  }
};

interface InteractiveBattleProps {
  onBattleComplete: (result: { winner: 'user' | 'opponent'; turns: any[]; userDigimon?: any[] }) => void;
  userDigimon?: any[];
  battleOption?: {
    difficulty: 'easy' | 'medium' | 'hard';
  };
  showRewards?: boolean; // Whether to show bits reward in the result overlay
  skipResultScreen?: boolean; // Skip the result overlay entirely and fire onBattleComplete immediately
  customRewards?: {
    xp?: number;
    bits?: number;
  }; // Optional pre-calculated rewards (for Campaign battles)
}

const InteractiveBattle: React.FC<InteractiveBattleProps> = ({ onBattleComplete, userDigimon = [], battleOption, showRewards = true, skipResultScreen = false, customRewards }) => {
  const {
    currentBattle,
    isBattleActive,
    loading,
    error,
    selectTarget,
    getCurrentAttacker,
    // getAvailableTargets,
    getBattleStatus,
    endBattle,
  } = useInteractiveBattleStore();

  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [showDamage, setShowDamage] = useState<{ targetId: string; damage: number; isCritical: boolean; multiplier?: number } | null>(null);
  const [lastTurn, setLastTurn] = useState<any>(null);
  const [showBattleResult, setShowBattleResult] = useState<{ winner: 'user' | 'opponent'; show: boolean; bitsReward?: number } | null>(null);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [animationStates, setAnimationStates] = useState<{ [digimonId: string]: 'idle' | 'attacking' | 'hit' | 'cheering' | 'sad' | 'victory' | 'defeat' | 'dead' }>({});
  const [spriteToggle, setSpriteToggle] = useState(false);
  const hasCalledCompletionRef = useRef(false);

  const currentAttacker = getCurrentAttacker();
  // const availableTargets = getAvailableTargets();
  const battleStatus = getBattleStatus();
  
  // Compute upcoming turn order (up to 6), cycling through alive digimon by speed
  const getUpcomingTurnOrder = React.useCallback(() => {
    if (!currentBattle) return [] as BattleDigimon[];
    const alive = [...currentBattle.userTeam, ...currentBattle.opponentTeam].filter(d => d.isAlive);
    if (alive.length === 0) return [] as BattleDigimon[];
    const order = [...alive].sort((a, b) => b.stats.spd - a.stats.spd);
    const startIdx = Math.max(0, order.findIndex(d => d.id === currentBattle.currentAttacker));
    const result: BattleDigimon[] = [];
    for (let i = 0; i < Math.min(6, order.length); i++) {
      const idx = (startIdx + i) % order.length;
      result.push(order[idx]);
    }
    return result;
  }, [currentBattle]);

  // Calculate bits reward (same logic as auto battles)
  const calculateBitsReward = (difficulty: string, playerWon: boolean): number => {
    if (playerWon) {
      // Rewards for winning
      switch (difficulty) {
        case "hard":
          return 200;
        case "medium":
          return 100;
        case "easy":
          return 75;
        default:
          return 75;
      }
    } else {
      // Rewards for losing
      switch (difficulty) {
        case "hard":
          return 40;
        case "medium":
          return 50;
        case "easy":
          return 50;
        default:
          return 50;
      }
    }
  };

  // Handle battle completion with delay
  useEffect(() => {
    if (battleStatus.isBattleComplete && currentBattle && !showBattleResult) {
      // EXP is intentionally not awarded from battles — tasks are the EXP source.
      // Only calculate bits for display in the result overlay.
      let bitsReward = 0;
      if (showRewards && !skipResultScreen) {
        if (customRewards) {
          bitsReward = currentBattle.winner === 'user' ? (customRewards.bits || 0) : 0;
        } else if (battleOption) {
          bitsReward = calculateBitsReward(battleOption.difficulty, currentBattle.winner === 'user');
        }
      }

      if (skipResultScreen) {
        // Skip the overlay — fire onBattleComplete directly via show:false
        setShowBattleResult({ winner: currentBattle.winner!, show: false, bitsReward: 0 });
      } else {
        setShowBattleResult({ winner: currentBattle.winner!, show: true, bitsReward });
      }
    }
  }, [battleStatus.isBattleComplete, currentBattle, showBattleResult, battleOption, customRewards, showRewards, skipResultScreen]);

  // Handle actual battle completion after delay
  useEffect(() => {
    if (showBattleResult && !showBattleResult.show && currentBattle && !hasCalledCompletionRef.current) {
      hasCalledCompletionRef.current = true;
      const result = {
        winner: currentBattle.winner!,
        turns: currentBattle.turnHistory,
        userDigimon: userDigimon
      };
      onBattleComplete(result);
    }
  }, [showBattleResult, currentBattle]);

  // Handle damage display
  useEffect(() => {
    if (currentBattle && currentBattle.turnHistory.length > 0) {
      const latestTurn = currentBattle.turnHistory[currentBattle.turnHistory.length - 1];
      if (latestTurn !== lastTurn) {
        setLastTurn(latestTurn);
        
        // Calculate multiplier for damage display
        const attacker = [...currentBattle.userTeam, ...currentBattle.opponentTeam]
          .find(d => d.id === latestTurn.attacker.id);
        const target = [...currentBattle.userTeam, ...currentBattle.opponentTeam]
          .find(d => d.id === latestTurn.target.id);
        
        let multiplier = 1.0;
        if (attacker && target) {
          const multiplierData = calculateDamageMultiplier(attacker, target);
          multiplier = multiplierData.totalMultiplier;
        }
        
        setShowDamage({
          targetId: latestTurn.target.id,
          damage: latestTurn.damage,
          isCritical: latestTurn.isCritical,
          multiplier: multiplier,
        });
        
        // Hide damage display after 2 seconds
        setTimeout(() => setShowDamage(null), 2000);
      }
    }
  }, [currentBattle, lastTurn]);

  const handleTargetSelect = (targetId: string) => {
    if (!currentAttacker || !battleStatus.isPlayerTurn) return;
    
    setSelectedTarget(targetId);
  };

  // Auto-selection logic for when auto mode is enabled
  useEffect(() => {
    if (!currentBattle || !isAutoMode || !battleStatus.isPlayerTurn || !currentAttacker) return;
    
    // Only auto-select if it's a user's turn and no target is currently selected
    const isUserTurn = currentBattle.userTeam.some(d => d.id === currentAttacker.id);
    if (isUserTurn && !selectedTarget) {
      const availableTargets = currentBattle.opponentTeam.filter(d => d.isAlive);
      if (availableTargets.length > 0) {
        // Random target selection (can be upgraded to smarter AI later)
        const randomTarget = availableTargets[Math.floor(Math.random() * availableTargets.length)];
        setSelectedTarget(randomTarget.id);
      }
    }
  }, [currentBattle, isAutoMode, battleStatus.isPlayerTurn, currentAttacker, selectedTarget]);

  // Auto-confirm attack when auto mode is enabled and target is selected
  useEffect(() => {
    if (isAutoMode && selectedTarget && currentAttacker && battleStatus.isPlayerTurn && !loading) {
      // Small delay to show the target selection before auto-confirming
      const timer = setTimeout(() => {
        handleConfirmAttack();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isAutoMode, selectedTarget, currentAttacker, battleStatus.isPlayerTurn, loading]);

  // Centralized sprite timing - keeps all sprites synchronized
  useEffect(() => {
    const interval = setInterval(() => {
      setSpriteToggle(prev => !prev);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update animation states based on battle events
  useEffect(() => {
    if (!currentBattle) return;

    const newAnimationStates = { ...animationStates };

    // Set dead Digimon to dead animation, others to idle
    [...currentBattle.userTeam, ...currentBattle.opponentTeam].forEach(digimon => {
      if (!digimon.isAlive) {
        newAnimationStates[digimon.id] = 'dead';
      } else {
        newAnimationStates[digimon.id] = 'idle';
      }
    });

    // Set attacking animation for attacker and hit animation for target only when damage is being shown
    if (showDamage) {
      // Find the attacker from the last turn
      if (lastTurn && lastTurn.attacker) {
        newAnimationStates[lastTurn.attacker.id] = 'attacking';
      }
      newAnimationStates[showDamage.targetId] = 'hit';
    }

    // Set victory/defeat animations based on battle result
    if (showBattleResult) {
      const isUserWin = showBattleResult.winner === 'user';
      currentBattle.userTeam.forEach(digimon => {
        newAnimationStates[digimon.id] = isUserWin ? 'victory' : 'defeat';
      });
      currentBattle.opponentTeam.forEach(digimon => {
        newAnimationStates[digimon.id] = isUserWin ? 'defeat' : 'victory';
      });
    }

    setAnimationStates(newAnimationStates);
  }, [currentAttacker, showDamage, showBattleResult, currentBattle]);

  const handleConfirmAttack = async () => {
    if (!selectedTarget || !currentAttacker) return;
    
    try {
      await selectTarget({
        attackerId: currentAttacker.id,
        targetId: selectedTarget,
        action: { type: 'attack' },
      });
      setSelectedTarget(null);
    } catch (error) {
      console.error('Failed to process attack:', error);
    }
  };

  const renderDigimon = (digimon: BattleDigimon, isUserTeam: boolean) => {
    const hpPercentage = (digimon.stats.hp / digimon.stats.max_hp) * 100;
    const isSelected = selectedTarget === digimon.id;
    const isCurrentAttacker = currentAttacker?.id === digimon.id;
    const isTarget = showDamage?.targetId === digimon.id;
    const isLastTurnAttacker = lastTurn?.attacker?.id === digimon.id;
    const isLastTurnTarget = lastTurn?.target?.id === digimon.id;

    // Row container: info card separated from sprite
    return (
      <div
        key={digimon.id}
        className={`relative flex items-center w-full gap-6 ${
          isUserTeam ? 'justify-start' : 'justify-end flex-row-reverse'
        }`}
      >
        {/* Info Card */}
        <motion.div
          className={`relative w-44 shrink-0 p-3 rounded-lg border-2 transition-all duration-300 ${
            isUserTeam 
              ? 'bg-blue-50 border-blue-200 dark:bg-slate-800 dark:border-slate-600 text-left' 
              : 'bg-red-50 border-red-200 dark:bg-slate-800 dark:border-slate-600 text-right'
          } ${isCurrentAttacker ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''} ${isSelected ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''} ${!digimon.isAlive ? 'opacity-50 grayscale' : ''}`}
        >
          <div className="flex items-center gap-2 w-full">
          <TypeAttributeIcon type={digimon.type as DigimonType} attribute={digimon.attribute as DigimonAttribute} size="sm" />
            <h3 className="font-bold text-sm truncate max-w-[120px] dark:text-gray-100 text-gray-900">{digimon.name}</h3>
          </div>

          <div className="mt-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/70 text-white dark:bg-white/20 dark:text-white whitespace-nowrap">Lv.{digimon.current_level}</span>
              <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${hpPercentage > 60 ? 'bg-green-500' : hpPercentage > 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  initial={{ width: '100%' }}
                  animate={{ width: `${hpPercentage}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
            <p className={`text-[10px] mt-1 text-right text-gray-600 dark:text-gray-300`}>
              {digimon.stats.hp}/{digimon.stats.max_hp} HP
            </p>
          </div>

          {/* Status indicator */}
          {isCurrentAttacker && (
            <div className={`absolute -top-2 ${isUserTeam ? '-right-2' : '-left-2'} bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold`}>
              <Sword className="w-3 h-3" />
            </div>
          )}

          {!digimon.isAlive && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">DEFEATED</span>
            </div>
          )}
        </motion.div>

        {/* Sprite Panel */}
        <motion.div
          className={`relative flex items-center justify-center w-24 h-24 rounded-lg ${!digimon.isAlive ? 'opacity-50 grayscale' : ''} ${isSelected ? 'ring-2 ring-green-500' : ''}`}
          whileHover={digimon.isAlive ? { scale: 1.05 } : {}}
          whileTap={digimon.isAlive ? { scale: 0.95 } : {}}
          animate={
            isLastTurnAttacker
              ? { x: isUserTeam ? [0, 40, 0] : [0, -40, 0], y: [0, -6, 0] }
              // Phase 6.3 — screen-shake when this sprite is hit
              : isLastTurnTarget
                ? { x: [0, -6, 6, -4, 4, -2, 2, 0] }
                : { x: 0, y: 0 }
          }
          transition={
            isLastTurnAttacker
              ? { duration: 0.6, times: [0, 0.5, 1] }
              : isLastTurnTarget
                ? { duration: 0.3 }
                : {}
          }
          onClick={() => {
            if (battleStatus.isPlayerTurn && !isUserTeam && digimon.isAlive) {
              handleTargetSelect(digimon.id);
            }
          }}
        >
          <div className={`transition-transform ${isUserTeam ? 'scale-x-[-1]' : ''}`}>
            <BattleDigimonSprite
              digimonName={digimon.digimon_name}
              fallbackSpriteUrl={digimon.sprite_url}
              size={"sm"}
              animationState={animationStates[digimon.id] || 'idle'}
              isAnimating={showBattleResult?.show || false}
              spriteToggle={spriteToggle}
            />
          </div>

              {/* Phase 6.4 — enhanced damage popup: MISS grey, normal red, CRIT gold.
                  font-heading (Fredoka) gives it a game-feel pop. */}
              {isTarget && showDamage && (
                <motion.div
                  className={`absolute -top-4 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md text-sm font-heading font-bold whitespace-nowrap z-10 ${
                    showDamage.damage <= 0
                      ? 'bg-gray-500 text-gray-100'
                      : showDamage.isCritical
                        ? 'bg-yellow-400 text-black drop-shadow-[0_0_6px_rgba(250,204,21,0.8)]'
                        : 'bg-red-500 text-white'
                  }`}
                  initial={{ opacity: 0, y: 0, scale: 0.8 }}
                  animate={{ opacity: 1, y: -16, scale: 1 }}
                  exit={{ opacity: 0, y: -28 }}
                >
                  {showDamage.damage <= 0
                    ? 'MISS'
                    : showDamage.isCritical
                      ? `CRIT! ${showDamage.damage}`
                      : showDamage.damage}
                  {showDamage.multiplier && showDamage.multiplier !== 1.0 && showDamage.damage > 0 && (
                    <div className="text-[10px] opacity-90 text-center">
                      {getMultiplierDisplay(showDamage.multiplier).text}
                    </div>
                  )}
                </motion.div>
              )}

          {/* Hit flash */}
          {isLastTurnTarget && (
            <motion.div
              className="absolute inset-0 rounded-lg"
              initial={{ backgroundColor: 'rgba(255,255,255,0.0)' }}
              animate={{ backgroundColor: ['rgba(255,0,0,0.0)','rgba(255,0,0,0.25)','rgba(255,0,0,0.0)'] }}
              transition={{ duration: 0.4 }}
            />
          )}

          {/* Multiplier display for selected target */}
          {isSelected && currentAttacker && (
            <motion.div
              className="absolute -top-8 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {(() => {
                const multiplier = calculateDamageMultiplier(currentAttacker, digimon);
                const display = getMultiplierDisplay(multiplier.totalMultiplier);
                return (
                  <div className={`px-2 py-1 rounded-md text-xs font-bold ${display.bgColor} ${display.color}`}>
                    {display.text}
                  </div>
                );
              })()}
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  };

  if (!isBattleActive || !currentBattle) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing battle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 relative">
      {/* Battle Header */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-heading font-semibold mb-2 dark:text-gray-100 text-gray-900">Battle</h2>
      </div>

      {/* Battlefield + Turn Order layout */}
      <div className="flex items-start gap-4 mb-6">
        {/* Phase 6.5 — battlefield fades to grayscale on defeat */}
        <motion.div
          className="relative rounded-xl p-6 pt-12 overflow-hidden flex-1"
          animate={{
            filter: showBattleResult?.winner === 'opponent' ? 'grayscale(1)' : 'grayscale(0)',
          }}
          transition={{ duration: 1.5 }}
        >
          {/* Digital grid background - updated to match the image */}
          <div className="absolute inset-0 bg-green-900 bg-opacity-90">
          {/* Grid overlay */}
          <div 
            className="absolute inset-0" 
            style={{ 
              backgroundImage: 'linear-gradient(to right, rgba(144, 238, 144, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(144, 238, 144, 0.2) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              boxShadow: 'inset 0 0 50px rgba(0, 255, 0, 0.3)'
            }}
          ></div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-900 opacity-20"></div>
        </div>

          {/* Columns */}
          <div className="relative grid grid-cols-1 lg:grid-cols-2 max-w-6xl mx-auto px-4">
          {/* User column */}
          <div className='flex flex-col items-center'>
            <div className="flex flex-col gap-10">
              {currentBattle.userTeam.map(digimon => renderDigimon(digimon, true))}
            </div>
          </div>

          {/* Enemy column */}
          <div className='flex flex-col items-center'>
            <div className="flex flex-col gap-10 items-end">
              {currentBattle.opponentTeam.map(digimon => renderDigimon(digimon, false))}
            </div>
          </div>
        </div>

        {/* Close battlefield container before side panel */}
        </motion.div>

        {/* Turn Order Panel (outside the green grid) */}
        <div className="w-28 sm:w-32">
          <div className="bg-gray-300/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-400/20 dark:border-gray-600/20 p-2">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2 text-center">{battleStatus.isPlayerTurn ? 'Player Turn' : 'Enemy Turn'}</p>
            <div className="flex flex-col gap-2">
              {getUpcomingTurnOrder().map((d, idx) => (
                <div
                  key={`${d.id}-${idx}`}
                  className={`flex items-center justify-center h-12 rounded-md bg-white/10 dark:bg-white/5 ${
                    d.isOnUserTeam ? 'border-2 border-blue-500/60 dark:border-blue-400/60' : 'border-2 border-red-500/60 dark:border-red-400/60'
                  } ${idx === 0 ? 'border-4 border-yellow-500 dark:border-yellow-400' : ''}`}
                  title={`${d.name}`}
                >
                  <div>
                    <BattleDigimonSprite
                      digimonName={d.digimon_name}
                      fallbackSpriteUrl={d.sprite_url}
                      size={'xs'}
                      animationState={'idle'}
                      spriteToggle={false}
                    />
                  </div>
                </div>
              ))}
              {getUpcomingTurnOrder().length === 0 && (
                <div className="text-[11px] text-gray-600 dark:text-gray-400 text-center py-3">No turns</div>
              )}
            </div>
          </div>
          
          {/* Auto Mode Toggle - Always visible */}
          <div className="mt-3 bg-gray-300/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-400/20 dark:border-gray-600/20 p-2">
            <label className="flex items-center justify-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAutoMode}
                onChange={(e) => setIsAutoMode(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Auto
              </span>
            </label>
            {isAutoMode && (
              <div className="text-[10px] text-blue-600 dark:text-blue-400 text-center mt-1">
                Random target
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Battle Controls - Fixed height to prevent modal resizing */}
      {battleStatus.isPlayerTurn && !battleStatus.isBattleComplete && (
        <div className="text-center h-32 flex flex-col justify-center">
          <div className="mb-4">
            <p className="text-lg font-semibold text-blue-600">
              {currentAttacker?.name}'s Turn
            </p>
            <p className="text-sm text-gray-600">
              Select a target to attack
            </p>
          </div>

          {/* Fixed height container for button to prevent layout shift */}
          <div className="h-12 flex items-center justify-center">
            {selectedTarget && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <button
                  onClick={handleConfirmAttack}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {loading ? 'Processing...' : 'Confirm Attack'}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Opponent Turn Indicator - Fixed height to match battle controls */}
      {!battleStatus.isPlayerTurn && !battleStatus.isBattleComplete && (
        <div className="text-center h-32 flex flex-col justify-center">
          <div className="animate-pulse">
            <p className="text-lg font-semibold text-red-600">
              Opponent's Turn
            </p>
            <p className="text-sm text-gray-600">
              {currentAttacker?.name} is thinking...
            </p>
          </div>
        </div>
      )}

      {/* Battle Result Animation */}
      {showBattleResult && showBattleResult.show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-2xl max-w-md mx-4"
          >
              {/* Phase 6.5 — font-heading (Fredoka) gives the result a game-feel impact.
                Win = gold glow, Defeat = red. Emoji removed; text alone is more dramatic. */}
            <motion.h2
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className={`text-5xl font-heading font-bold mb-4 ${
                showBattleResult.winner === 'user'
                  ? 'text-yellow-400 drop-shadow-[0_2px_16px_rgba(250,204,21,0.7)]'
                  : 'text-red-500 drop-shadow-[0_2px_8px_rgba(239,68,68,0.5)]'
              }`}
            >
              {showBattleResult.winner === 'user' ? 'VICTORY!' : 'DEFEAT'}
            </motion.h2>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-600 dark:text-gray-300 mb-4"
            >
              {showBattleResult.winner === 'user' 
                ? 'Your Digimon fought bravely and emerged victorious!' 
                : 'Your Digimon have been defeated. Better luck next time!'
              }
            </motion.p>

            {/* Bits Reward */}
            {showRewards && showBattleResult.bitsReward && showBattleResult.bitsReward > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 mb-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-amber-700 dark:text-amber-300">Reward</span>
                  <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                    +{showBattleResult.bitsReward} bits
                  </span>
                </div>
              </motion.div>
            )}
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <button
                onClick={() => {
                  setShowBattleResult(prev => prev ? { ...prev, show: false } : null);
                }}
                className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
                  showBattleResult.winner === 'user' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Battle Complete (fallback) */}
      {battleStatus.isBattleComplete && !showBattleResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-4">
            {currentBattle.winner === 'user' ? 'Victory!' : 'Defeat!'}
          </h2>
          <button
            onClick={endBattle}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Continue
          </button>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Run Away Button - Positioned in bottom right of battle interface */}
      {!battleStatus.isBattleComplete && (
        <div className="absolute bottom-4 right-4 z-10">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to run away from this battle?')) {
                endBattle();
                onBattleComplete({ winner: 'opponent', turns: [], userDigimon });
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-colors duration-200 flex items-center gap-2"
            title="Run Away"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 7l5 5m0 0l-5 5m5-5H6" 
              />
            </svg>
            <span className="text-sm font-semibold">Run</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default InteractiveBattle;
