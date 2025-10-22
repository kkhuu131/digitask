import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInteractiveBattleStore } from '../store/interactiveBattleStore';
import { BattleDigimon } from '../types/battle';
import DigimonSprite from './DigimonSprite';
import TypeAttributeIcon from './TypeAttributeIcon';
import { Sword } from 'lucide-react';
import { DigimonAttribute, DigimonType } from '@/store/battleStore';

// Type and Attribute advantage maps (copied from battleStore.ts)
const TypeAdvantageMap: Record<DigimonType, Record<DigimonType, number>> = {
  Vaccine: {
    Virus: 2.0,
    Data: 0.5,
    Vaccine: 1.0,
    Free: 1.0,
  },
  Virus: {
    Data: 2.0,
    Vaccine: 0.5,
    Virus: 1.0,
    Free: 1.0,
  },
  Data: {
    Vaccine: 2.0,
    Virus: 0.5,
    Data: 1.0,
    Free: 1.0,
  },
  Free: {
    Vaccine: 1.0,
    Virus: 1.0,
    Data: 1.0,
    Free: 1.0,
  },
};

const AttributeAdvantageMap: Record<DigimonAttribute, Record<DigimonAttribute, number>> = {
  Plant: {
    Plant: 1.0,
    Water: 1.5,
    Fire: 1.0,
    Electric: 1.0,
    Wind: 1.0,
    Earth: 1.0,
    Dark: 1.0,
    Light: 1.0,
    Neutral: 1.0,
  },
  Water: {
    Plant: 1.0,
    Water: 1.0,
    Fire: 1.5,
    Electric: 1.0,
    Wind: 1.0,
    Earth: 1.0,
    Dark: 1.0,
    Light: 1.0,
    Neutral: 1.0,
  },
  Fire: {
    Plant: 1.5,
    Water: 1.0,
    Fire: 1.0,
    Electric: 1.0,
    Wind: 1.0,
    Earth: 1.0,
    Dark: 1.0,
    Light: 1.0,
    Neutral: 1.0,
  },
  Electric: {
    Plant: 1.0,
    Water: 1.0,
    Fire: 1.0,
    Electric: 1.0,
    Wind: 1.5,
    Earth: 1.0,
    Dark: 1.0,
    Light: 1.0,
    Neutral: 1.0,
  },
  Wind: {
    Plant: 1.0,
    Water: 1.0,
    Fire: 1.0,
    Electric: 1.0,
    Wind: 1.0,
    Earth: 1.5,
    Dark: 1.0,
    Light: 1.0,
    Neutral: 1.0,
  },
  Earth: {
    Plant: 1.0,
    Water: 1.0,
    Fire: 1.0,
    Electric: 1.5,
    Wind: 1.0,
    Earth: 1.0,
    Dark: 1.0,
    Light: 1.0,
    Neutral: 1.0,
  },
  Dark: {
    Plant: 1.0,
    Water: 1.0,
    Fire: 1.0,
    Electric: 1.0,
    Wind: 1.0,
    Earth: 1.0,
    Dark: 1.0,
    Light: 1.5,
    Neutral: 1.0,
  },
  Light: {
    Plant: 1.0,
    Water: 1.0,
    Fire: 1.0,
    Electric: 1.0,
    Wind: 1.0,
    Earth: 1.0,
    Dark: 1.5,
    Light: 1.0,
    Neutral: 1.0,
  },
  Neutral: {
    Plant: 1.0,
    Water: 1.0,
    Fire: 1.0,
    Electric: 1.0,
    Wind: 1.0,
    Earth: 1.0,
    Dark: 1.0,
    Light: 1.0,
    Neutral: 1.0,
  },
};

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
  onBattleComplete: (result: { winner: 'user' | 'opponent'; turns: any[] }) => void;
}

const InteractiveBattle: React.FC<InteractiveBattleProps> = ({ onBattleComplete }) => {
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

  // Handle battle completion
  useEffect(() => {
    if (battleStatus.isBattleComplete && currentBattle) {
      const result = {
        winner: currentBattle.winner!,
        turns: currentBattle.turnHistory,
      };
      onBattleComplete(result);
    }
  }, [battleStatus.isBattleComplete, currentBattle, onBattleComplete]);

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
              : { x: 0, y: 0 }
          }
          transition={isLastTurnAttacker ? { duration: 0.6, times: [0, 0.5, 1] } : {}}
          onClick={() => {
            if (battleStatus.isPlayerTurn && !isUserTeam && digimon.isAlive) {
              handleTargetSelect(digimon.id);
            }
          }}
        >
          <div className={`transition-transform ${isUserTeam ? 'scale-x-[-1]' : ''}`}>
            <DigimonSprite
              digimonName={digimon.digimon_name}
              fallbackSpriteUrl={digimon.sprite_url}
              size={"sm"}
            />
          </div>

              {/* Damage pop */}
              {isTarget && showDamage && (
                <motion.div
                  className="absolute -top-3 bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-bold"
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: -12 }}
                  exit={{ opacity: 0, y: -24 }}
                >
                  {showDamage.isCritical ? 'CRIT ' : ''}{showDamage.damage}
                  {showDamage.multiplier && showDamage.multiplier !== 1.0 && (
                    <div className="text-[10px] opacity-80">
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
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Battle Header */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold mb-2 dark:text-gray-100 text-gray-900">Battle</h2>
      </div>

      {/* Battlefield + Turn Order layout */}
      <div className="flex items-start gap-4 mb-6">
        {/* Battlefield with digital grid background */}
        <div className="relative rounded-xl p-6 pt-12 overflow-hidden flex-1">
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
        </div>

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
                    <DigimonSprite
                      digimonName={d.digimon_name}
                      fallbackSpriteUrl={d.sprite_url}
                      size={'xs'}
                    />
                  </div>
                </div>
              ))}
              {getUpcomingTurnOrder().length === 0 && (
                <div className="text-[11px] text-gray-600 dark:text-gray-400 text-center py-3">No turns</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Battle Controls */}
      {battleStatus.isPlayerTurn && !battleStatus.isBattleComplete && (
        <div className="text-center">
          <div className="mb-4">
            <p className="text-lg font-semibold text-blue-600">
              {currentAttacker?.name}'s Turn
            </p>
            <p className="text-sm text-gray-600">
              Select a target to attack
            </p>
          </div>

          {selectedTarget && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
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
      )}

      {/* Opponent Turn Indicator */}
      {!battleStatus.isPlayerTurn && !battleStatus.isBattleComplete && (
        <div className="text-center">
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

      {/* Battle Complete */}
      {battleStatus.isBattleComplete && (
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
    </div>
  );
};

export default InteractiveBattle;
