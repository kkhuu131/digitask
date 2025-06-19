import { useState, useEffect } from 'react';
import { useWeeklyBossStore } from '../store/weeklyBossStore';
import { useDigimonStore } from '../store/petStore';
import { useNotificationStore } from '../store/notificationStore';
import DigimonSprite from './DigimonSprite';
import TypeAttributeIcon from './TypeAttributeIcon';
import TeamBattleAnimation from './TeamBattleAnimation';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Shield, Sword, Clock, Trophy, Gift } from 'lucide-react';
import { digimonLookup } from '@/utils/digimonLookup';
import { DigimonType, DigimonAttribute } from '../store/battleStore';

const WeeklyBossRaid = () => {
  const {
    currentEvent,
    userParticipation,
    loading,
    battleLoading,
    error,
    currentBossBattle,
    dailyBossBattlesRemaining,
    fetchCurrentEvent,
    fetchUserParticipation,
    startBossBattle,
    claimRewards,
    clearCurrentBattle,
    checkDailyBossBattleLimit,
    getPhaseDescription,
    getDaysRemaining,
    getProgressPercentage,
    getBossHealthPercentage,
    canBattle,
    getRewardTier,
    calculateRewards,
  } = useWeeklyBossStore();

  const { allUserDigimon } = useDigimonStore();
  const teamDigimon = allUserDigimon.filter(d => d.is_on_team);

  const [showBattleAnimation, setShowBattleAnimation] = useState(false);
  const [lastBattleId, setLastBattleId] = useState<string | null>(null);
  const [isProcessingBattle, setIsProcessingBattle] = useState(false);

  // Initial load - clear any old battle state
  useEffect(() => {
    clearCurrentBattle();
    fetchCurrentEvent();
    fetchUserParticipation();
    checkDailyBossBattleLimit();
  }, []);

  // Handle boss battle animation - only for new battles and when not already processing
  useEffect(() => {
    if (currentBossBattle && 
        currentBossBattle.id !== lastBattleId && 
        !isProcessingBattle && 
        !showBattleAnimation) {
      console.log('Starting new battle animation:', currentBossBattle.id);
      setIsProcessingBattle(true);
      setShowBattleAnimation(true);
      setLastBattleId(currentBossBattle.id);
    }
  }, [currentBossBattle, lastBattleId, isProcessingBattle, showBattleAnimation]);

  const handleBattleComplete = () => {
    console.log('Battle animation completed');
    setShowBattleAnimation(false);
    
    // Show results notification
    if (currentBossBattle) {
      const damage = currentBossBattle.totalDamageDealt || 0;
      const bossDefeated = currentBossBattle.boss_defeated || false;
      const bossName = currentEvent?.boss_name || 'Boss';
      
      // Show success notification with damage dealt
      useNotificationStore.getState().addNotification({
        message: bossDefeated 
          ? `💀 ${bossName} defeated! You dealt ${damage.toLocaleString()} damage!`
          : `⚔️ You dealt ${damage.toLocaleString()} damage to ${bossName}!`,
        type: "success",
      });
    }
    
    // Use setTimeout to ensure all state updates complete before clearing
    setTimeout(() => {
      console.log('Clearing battle state and refreshing data');
      clearCurrentBattle();
      setIsProcessingBattle(false);
      
      // Refresh data after clearing battle state
      fetchCurrentEvent();
      fetchUserParticipation();
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4">
        <p className="text-red-700 dark:text-red-300">Error: {error}</p>
        <button
          onClick={() => fetchCurrentEvent()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">No weekly boss event is currently active.</p>
      </div>
    );
  }

  const bossHealthPercentage = getBossHealthPercentage();
  const daysRemaining = getDaysRemaining();
  const rewardTier = getRewardTier();
  const rewards = calculateRewards();

  return (
    <div className="space-y-6">
      {/* Boss Header */}
      <div className="bg-gradient-to-r from-red-500 to-purple-600 rounded-lg p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{currentEvent.boss_name}</h1>
            <p className="text-red-100 mb-2 text-sm sm:text-base">{currentEvent.boss_description}</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {daysRemaining} days remaining
              </span>
              {/* <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {currentEvent.participants_count} participants
              </span> */}
            </div>
          </div>
          <div className="text-center sm:text-right flex-shrink-0">
            <div className="text-3xl sm:text-4xl font-bold mb-1">#{currentEvent.boss_config?.rotation_order}</div>
            <div className="text-sm opacity-80">Week {currentEvent.week_start_date}</div>
          </div>
        </div>
      </div>

      {/* Phase Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold dark:text-gray-100">
            Phase {currentEvent.phase}: {currentEvent.phase === 1 ? 'Weakening' : currentEvent.phase === 2 ? 'Battle' : 'Complete'}
          </h2>
          <div className="flex items-center gap-2">
            {currentEvent.phase === 1 && <Shield className="h-5 w-5 text-blue-500" />}
            {currentEvent.phase === 2 && <Sword className="h-5 w-5 text-red-500" />}
            {currentEvent.phase === 3 && <Trophy className="h-5 w-5 text-yellow-500" />}
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">{getPhaseDescription()}</p>

        {/* Phase 1: Progress Bar */}
        {currentEvent.phase === 1 && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium dark:text-gray-300">Community Progress</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentEvent.global_progress} / {currentEvent.target_progress}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
              <motion.div
                className="bg-blue-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage()}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Complete tasks to contribute to the community effort!
            </p>
          </div>
        )}

        {/* Phase 2: Boss Health */}
        {currentEvent.phase === 2 && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Boss Health</span>
              <span className="text-right">
                <span className="hidden sm:inline">{currentEvent.boss_current_hp.toLocaleString()} / {currentEvent.boss_max_hp.toLocaleString()}</span>
                <span className="sm:hidden">{Math.round(currentEvent.boss_current_hp / 1000)}K / {Math.round(currentEvent.boss_max_hp / 1000)}K</span>
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-red-500 to-red-700 h-3 rounded-full transition-all duration-300"
                style={{ width: `${bossHealthPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Battle the boss with your team to deal damage!
            </p>
            <div className="mt-3 pt-3 border-t dark:border-gray-600">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 text-sm">
                <span className="font-medium dark:text-gray-300">Daily Boss Battles:</span>
                <span className={`font-semibold ${
                  dailyBossBattlesRemaining > 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {dailyBossBattlesRemaining} remaining
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Reset daily • Maximum 5 battles per day during battle phase
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Boss Sprite and Info */}
      {currentEvent.boss_config && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="relative flex justify-center sm:justify-start">
              <DigimonSprite
                digimonName={digimonLookup[currentEvent.boss_config.boss_digimon_id].name}
                size="lg"
                fallbackSpriteUrl={digimonLookup[currentEvent.boss_config.boss_digimon_id].sprite_url}
              />
              {currentEvent.phase === 2 && bossHealthPercentage <= 25 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  CRITICAL!
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <TypeAttributeIcon 
                    type={digimonLookup[currentEvent.boss_config.boss_digimon_id].type as DigimonType} 
                    attribute={digimonLookup[currentEvent.boss_config.boss_digimon_id].attribute as DigimonAttribute}
                    size="sm"
                  />
                  <span className="text-lg font-semibold dark:text-gray-100">Level 99</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {currentEvent.boss_config.stat_multiplier}x Stats
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Special Abilities:</span>
                  <ul className="mt-1 space-y-1">
                    {currentEvent.boss_config.special_abilities.map((ability, index) => (
                      <li key={index} className="text-gray-600 dark:text-gray-300 break-words">
                        • {ability}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-medium">Reward Multiplier:</span>
                  <p className="text-yellow-600 dark:text-yellow-400 font-semibold">
                    {currentEvent.boss_config.reward_multiplier}x
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Battle Section */}
      {currentEvent.phase === 2 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border dark:border-gray-700">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 dark:text-gray-100">Battle Arena</h3>
          
          {teamDigimon.length === 0 ? (
            <div className="text-center py-8">
              {(!userParticipation || userParticipation.tasks_contributed <= 0) ? (
                <div>
                  <p className="text-amber-600 dark:text-amber-400 mb-2 font-semibold">
                    ⚠️ Phase 1 participation required!
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm sm:text-base">
                    You must complete tasks during weekdays (Phase 1) to participate in boss battles.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Come back during the next Phase 1 (Monday-Friday) to contribute!
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm sm:text-base">
                    You need at least one Digimon on your team to battle the boss.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Go to your Digimon collection and add team members.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {teamDigimon.map((digimon) => (
                  <div key={digimon.id} className="border dark:border-gray-600 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <DigimonSprite
                        digimonName={digimonLookup[digimon.digimon_id].name}
                        fallbackSpriteUrl={digimonLookup[digimon.digimon_id].sprite_url}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium dark:text-gray-100 truncate">
                          {digimon.name || digimonLookup[digimon.digimon_id].name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Level {digimon.current_level}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                {canBattle() ? (
                  <button
                    onClick={startBossBattle}
                    disabled={battleLoading}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
                  >
                    {battleLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Battling...
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5" />
                        Challenge Boss
                      </>
                    )}
                  </button>
                ) : (
                  <div className="text-center px-4">
                    <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm sm:text-base break-words">
                      {currentEvent.is_defeated ? 'Boss has been defeated!' : 
                       (!userParticipation || userParticipation.tasks_contributed <= 0) ? 
                       'Phase 1 participation required! Complete tasks during weekdays to unlock battles.' :
                       dailyBossBattlesRemaining <= 0 ?
                       'Daily boss battle limit reached! Try again tomorrow.' :
                       'Boss battle not available'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Progress */}
      {userParticipation && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border dark:border-gray-700">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 dark:text-gray-100 flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Your Progress
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {userParticipation.tasks_contributed}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Tasks Contributed</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
                {userParticipation.battle_attempts}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Battle Attempts</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                <span className="hidden sm:inline">{userParticipation.total_damage_dealt.toLocaleString()}</span>
                <span className="sm:hidden">{Math.round(userParticipation.total_damage_dealt / 1000)}K</span>
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Damage</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                <span className="hidden sm:inline">{userParticipation.best_single_damage.toLocaleString()}</span>
                <span className="sm:hidden">{Math.round(userParticipation.best_single_damage / 1000)}K</span>
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Best Single Hit</div>
            </div>
          </div>

          {/* Participation Tier */}
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <span className="font-medium dark:text-gray-100">Participation Level:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold self-start ${
                rewardTier >= 3 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                rewardTier >= 2 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' :
                rewardTier >= 1 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {rewardTier >= 3 ? 'Victor' : rewardTier >= 2 ? 'Battler' : rewardTier >= 1 ? 'Participant' : 'Observer'}
              </span>
            </div>
          </div>

          {/* Rewards Section */}
          {rewards && (
            <div className="border-t dark:border-gray-600 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <h4 className="font-semibold dark:text-gray-100 flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  Available Rewards
                </h4>
                {!userParticipation.rewards_claimed && currentEvent.phase === 3 && (
                  <button
                    onClick={claimRewards}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium self-start sm:self-auto"
                  >
                    Claim Rewards
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-yellow-600 dark:text-yellow-400">
                    {rewards.bits.toLocaleString()}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Bits</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600 dark:text-blue-400">
                    {rewards.experience.toLocaleString()}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">EXP</div>
                </div>
                {rewards.title && (
                  <div className="text-center">
                    <div className="font-semibold text-purple-600 dark:text-purple-400 break-words">
                      {rewards.title}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">Title</div>
                  </div>
                )}
                {rewards.special_item && (
                  <div className="text-center">
                    <div className="font-semibold text-green-600 dark:text-green-400 break-words">
                      {rewards.special_item}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">Special Item</div>
                  </div>
                )}
              </div>
              {userParticipation.rewards_claimed && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2 text-center">
                  ✓ Rewards claimed!
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Battle Animation */}
      <AnimatePresence>
        {showBattleAnimation && currentBossBattle && (
          <TeamBattleAnimation
            teamBattle={currentBossBattle}
            onComplete={handleBattleComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WeeklyBossRaid; 