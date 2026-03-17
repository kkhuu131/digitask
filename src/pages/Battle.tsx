import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDigimonStore, UserDigimon } from "../store/petStore";
import { useBattleStore, DigimonAttribute, DigimonType } from "../store/battleStore";
import { convertToBattleDigimon } from "../store/interactiveBattleStore";
import { useCurrencyStore } from "../store/currencyStore";
import { useTournamentStore } from "../store/tournamentStore";
import { supabase } from "../lib/supabase";
import ArenaBattle from "../components/ArenaBattle";
import StrategyPicker from "../components/StrategyPicker";
import BattleDigimonSprite from "../components/BattleDigimonSprite";
import { useAuthStore } from "../store/authStore";
import { useTitleStore } from "../store/titleStore";
import TypeAttributeIcon from "../components/TypeAttributeIcon";
import PageTutorial from "../components/PageTutorial";
import { DialogueStep } from "../components/DigimonDialogue";
import DigimonSprite from "@/components/DigimonSprite";
import { DIGIMON_LOOKUP_TABLE } from "../constants/digimonLookup";
import { AnimatePresence, motion } from "framer-motion";
import { Trophy, ShoppingBag, ChevronRight, Zap } from "lucide-react";
import BattleTeamSelector, { OpponentDigimonPreview } from "../components/BattleTeamSelector";
import { BattleDigimon } from "../types/battle";
import { Strategy } from "../engine/arenaTypes";

const Battle = () => {
  const navigate = useNavigate();
  const { userDigimon, digimonData, allUserDigimon, fetchAllUserDigimon } = useDigimonStore();
  const {
    battleOptions,
    getBattleOptions,
    loading,
    error
  } = useBattleStore();
  const {
    currentTournament,
    weeklyTaskCount,
    fetchTournament,
    isUnlocked,
    isActive,
    isCompleted,
  } = useTournamentStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchAllUserDigimon();
    fetchTournament();
    const battleStore = useBattleStore.getState();
    if (
      battleStore.shouldRefreshOptions ||
      battleStore.battleOptions.length === 0 ||
      !battleStore.lastOptionsRefresh
    ) {
      getBattleOptions();
    }
  }, [user?.id]);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [pendingOption, setPendingOption] = useState<(typeof battleOptions)[0] | null>(null);
  const [battleTeam, setBattleTeam] = useState<UserDigimon[]>([]);
  const [localLoading, setLocalLoading] = useState(false);

  // Arena-specific state
  const [showStrategyPicker, setShowStrategyPicker] = useState(false);
  const [arenaBattleActive, setArenaBattleActive] = useState(false);
  const [preparedUserTeam, setPreparedUserTeam] = useState<BattleDigimon[] | null>(null);
  const [preparedOpponentTeam, setPreparedOpponentTeam] = useState<BattleDigimon[] | null>(null);
  const [userStrategies, setUserStrategies] = useState<Strategy[]>([]);
  // After arena battle ends: holds winner + bits reward for the results screen
  const [arenaResult, setArenaResult] = useState<{ winner: 'user' | 'opponent'; bitsReward: number } | null>(null);

  // Non-storage party Digimon available for selection
  const partyDigimon = allUserDigimon.filter(d => !d.is_in_storage);

  useEffect(() => {
    const loadBattleData = async () => {
      await useBattleStore.getState().fetchTeamBattleHistory();
    };
    loadBattleData();
  }, []);

  const [energy, setEnergy] = useState<{ current: number; max: number }>({ current: 0, max: 10 });
  useEffect(() => {
    const fetchEnergy = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('battle_energy, max_battle_energy')
        .eq('id', userData.user.id)
        .single();
      if (profile) setEnergy({ current: profile.battle_energy ?? 0, max: profile.max_battle_energy ?? 10 });
    };
    fetchEnergy();
    const onEnergyUpdated = () => fetchEnergy();
    window.addEventListener('energy-updated', onEnergyUpdated);
    return () => window.removeEventListener('energy-updated', onEnergyUpdated);
  }, []);

  // Step 1: user clicks a difficulty card — open team selector
  const handleSelectOption = (option: (typeof battleOptions)[0]) => {
    setPendingOption(option);
  };

  // Step 2: user confirms team — spend ticket + branch on battle mode
  const handleConfirmTeam = async (selectedTeam: UserDigimon[]) => {
    if (!pendingOption || localLoading) return;
    try {
      setLocalLoading(true);
      setSelectedOption(pendingOption.id);

      // Spend 1 battle ticket
      const { data: spentOk } = await supabase.rpc('spend_energy_self', { p_amount: 1 });
      if (!spentOk) {
        alert('Not enough Battle Tickets. Complete tasks to earn tickets!');
        return;
      }
      window.dispatchEvent(new Event('energy-updated'));

      const userTeamData = selectedTeam.map(d => ({
        ...d,
        digimon: DIGIMON_LOOKUP_TABLE[d.digimon_id as keyof typeof DIGIMON_LOOKUP_TABLE],
      }));
      const opponentTeamData = pendingOption.team.digimon.map((d: any) => ({
        ...d,
        digimon_id: d.digimon_id || d.id,
        digimon: DIGIMON_LOOKUP_TABLE[(d.digimon_id || d.id) as keyof typeof DIGIMON_LOOKUP_TABLE],
      }));

      setBattleTeam(selectedTeam);

      // Arena battle path
      const userBattle = userTeamData.map(d => convertToBattleDigimon(d, true));
      const opponentBattle = opponentTeamData.map(d => convertToBattleDigimon(d, false));
      setPreparedUserTeam(userBattle);
      setPreparedOpponentTeam(opponentBattle);
      setShowStrategyPicker(true);
    } finally {
      setLocalLoading(false);
    }
  };

  // Step 2b (arena only): user picks strategies → start arena
  const handleStartArenaBattle = (strategies: Strategy[]) => {
    setUserStrategies(strategies);
    setShowStrategyPicker(false);
    setArenaBattleActive(true);
  };

  const handleArenaBattleComplete = async (result: { winner: 'user' | 'opponent'; turns: any[] }) => {
    try {
      const currentOption = battleOptions.find(opt => opt.id === selectedOption);
      if (!currentOption) {
        setArenaBattleActive(false);
        return;
      }

      const bitsReward = (() => {
        const won = result.winner === 'user';
        const d = currentOption.difficulty;
        if (won) return d === 'hard' ? 200 : d === 'medium' ? 100 : 75;
        return d === 'hard' ? 40 : 50;
      })();
      useCurrencyStore.getState().addCurrency('bits', bitsReward);

      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const userId = userData.user.id;
          const isUserWin = result.winner === 'user';
          const winnerId = isUserWin
            ? userId
            : currentOption.isWild ? null : currentOption.team.user_id ?? null;

          await supabase.from('team_battles').insert({
            user_id: userId,
            ...(currentOption.isWild ? {} : { opponent_id: currentOption.team.user_id }),
            winner_id: winnerId,
            user_team: battleTeam.map(d => ({
              ...d,
              digimon: DIGIMON_LOOKUP_TABLE[d.digimon_id as keyof typeof DIGIMON_LOOKUP_TABLE],
            })),
            opponent_team: currentOption.team.digimon.map((d: any) => ({
              ...d,
              digimon_id: d.digimon_id || d.id,
              digimon: DIGIMON_LOOKUP_TABLE[(d.digimon_id || d.id) as keyof typeof DIGIMON_LOOKUP_TABLE],
            })),
            created_at: new Date().toISOString(),
            turns: result.turns,
          });

          if (isUserWin) {
            try { await supabase.rpc('check_and_set_first_win_self'); } catch {}
          }

          const { data: profile } = await supabase
            .from('profiles')
            .select('battles_won, battles_completed')
            .eq('id', userId)
            .single();

          if (profile) {
            const newWon = isUserWin ? (profile.battles_won || 0) + 1 : (profile.battles_won || 0);
            await supabase
              .from('profiles')
              .update({ battles_completed: (profile.battles_completed || 0) + 1, battles_won: newWon })
              .eq('id', userId);
            if (isUserWin) await useTitleStore.getState().checkBattleTitles(newWon);
          }
        }
      } catch {}

      // Show results screen — preparedUserTeam intentionally kept so the screen can render Digimon sprites.
      setArenaBattleActive(false);
      setArenaResult({ winner: result.winner, bitsReward });

      // Refresh data in the background
      fetchAllUserDigimon();
      useBattleStore.getState().fetchTeamBattleHistory();
      getBattleOptions(true);
    } catch {
      setArenaBattleActive(false);
    }
  };

  // Called when the user clicks Continue on the arena results screen
  const handleArenaResultsContinue = () => {
    setArenaResult(null);
    setPreparedUserTeam(null);
    setPreparedOpponentTeam(null);
    setUserStrategies([]);
    setSelectedOption(null);
    setPendingOption(null);
    setBattleTeam([]);
  };

  const digimonPageTutorialSteps: DialogueStep[] = [
    { speaker: 'bokomon', text: "Welcome to Daily AI Battles! Battle against AI-generated teams to earn experience and level up your team." },
    { speaker: 'neemon', text: "Ooh, some of these Digimon look pretty tough!" },
    { speaker: 'bokomon', text: "Choose a difficulty, then pick up to 3 Digimon for your battle team. Each battle costs 1 ticket — complete tasks to earn more!" },
    { speaker: 'neemon', text: "W-wait, what happens if we lose?" },
    { speaker: 'bokomon', text: "No need to worry! Your Digimon won't die — they just earn less experience." },
    { speaker: 'both', text: "Good luck, Tamer!" },
  ];

  if (!userDigimon || !digimonData) {
    return <div className="text-center py-12"><p>Loading your Digimon...</p></div>;
  }

  const difficultyConfig = {
    easy: {
      label: 'Easy',
      reward: 75,
      accentBorder: 'border-l-emerald-500',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
      rewardColor: 'text-emerald-600 dark:text-emerald-400',
      button: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    },
    medium: {
      label: 'Medium',
      reward: 100,
      accentBorder: 'border-l-amber-500',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      rewardColor: 'text-amber-600 dark:text-amber-400',
      button: 'bg-amber-500 hover:bg-amber-400 text-white',
    },
    hard: {
      label: 'Hard',
      reward: 200,
      accentBorder: 'border-l-red-500',
      badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
      rewardColor: 'text-red-600 dark:text-red-400',
      button: 'bg-red-600 hover:bg-red-500 text-white',
    },
  } as const;

  // Computed tournament status label
  const tournamentStatusLabel = (() => {
    if (isCompleted() && currentTournament) {
      const p = currentTournament.final_placement;
      return p === 'champion' ? 'Champion this week!' : `Placed Top ${p === 'gf_loss' ? '2' : p === 'sf_loss' ? '4' : '8'}`;
    }
    if (isActive() && currentTournament) {
      return `Round ${currentTournament.current_round}/3 in progress`;
    }
    if (isUnlocked()) return 'Ready to enter!';
    return `${weeklyTaskCount}/10 tasks to unlock`;
  })();

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-heading font-semibold dark:text-gray-100 mb-6">Battle</h1>

        {/* ── Hub navigation cards (always visible in idle state) ── */}
        {!arenaResult && !arenaBattleActive && !showStrategyPicker && !pendingOption && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {/* Daily AI — active/current */}
            <div className="card border-l-4 border-l-primary-500 dark:border-l-accent-500 flex items-center gap-3 py-3 px-4">
              <div className="p-2 rounded-lg bg-primary-50 dark:bg-accent-900/30 shrink-0">
                <Zap className="w-4 h-4 text-primary-600 dark:text-accent-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-heading font-semibold text-gray-900 dark:text-gray-100">Arena</p>
                <p className="text-xs font-body text-gray-500 dark:text-gray-400 truncate">
                  {energy.current}/{energy.max} tickets remaining
                </p>
              </div>
            </div>

            {/* Tournament — navigates to /tournament */}
            <button
              onClick={() => navigate('/tournament')}
              className="card flex items-center gap-3 py-3 px-4 text-left hover:shadow-md transition-all duration-150 cursor-pointer w-full"
            >
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 shrink-0">
                <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-heading font-semibold text-gray-900 dark:text-gray-100">Weekly Tournament</p>
                <p className="text-xs font-body text-gray-500 dark:text-gray-400 truncate">{tournamentStatusLabel}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
            </button>

            {/* Store — navigates to /store */}
            <button
              onClick={() => navigate('/store')}
              className="card flex items-center gap-3 py-3 px-4 text-left hover:shadow-md transition-all duration-150 cursor-pointer w-full"
            >
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 shrink-0">
                <ShoppingBag className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-heading font-semibold text-gray-900 dark:text-gray-100">Neemon's Store</p>
                <p className="text-xs font-body text-gray-500 dark:text-gray-400 truncate">Stat boosters &amp; items</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
            </button>
          </div>
        )}

        {/* ── Main battle content ── */}
        {arenaResult && preparedUserTeam ? (
          <ArenaResultsScreen
            winner={arenaResult.winner}
            bitsReward={arenaResult.bitsReward}
            userTeam={preparedUserTeam}
            onContinue={handleArenaResultsContinue}
          />
        ) : arenaBattleActive && preparedUserTeam && preparedOpponentTeam ? (
          <ArenaBattle
            userTeam={preparedUserTeam}
            opponentTeam={preparedOpponentTeam}
            userStrategies={userStrategies}
            onBattleComplete={handleArenaBattleComplete}
          />
        ) : (
          <AnimatePresence mode="wait">
            {showStrategyPicker && preparedUserTeam ? (
              <StrategyPicker
                key="strategy-picker"
                team={preparedUserTeam}
                onConfirm={handleStartArenaBattle}
                onBack={() => {
                  setShowStrategyPicker(false);
                  setPreparedUserTeam(null);
                  setPreparedOpponentTeam(null);
                  setPendingOption(null);
                  setSelectedOption(null);
                }}
              />
            ) : pendingOption ? (
              <BattleTeamSelector
                key="team-selector"
                opponentName={pendingOption.team.username || pendingOption.team.display_name || 'Opponent'}
                opponentTeam={(pendingOption.team.digimon as OpponentDigimonPreview[])}
                partyDigimon={partyDigimon}
                contextLabel={`${pendingOption.difficulty.charAt(0).toUpperCase() + pendingOption.difficulty.slice(1)} · ${pendingOption.isWild ? 'Wild' : 'AI'}`}
                isFree={false}
                costLabel="1 ticket"
                confirmLabel="Fight!"
                onConfirm={handleConfirmTeam}
                onBack={() => setPendingOption(null)}
                loading={localLoading}
              />
            ) : (
              <motion.div
                key="battle-options"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* Daily AI section header */}
                <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-heading font-semibold dark:text-gray-100">Arena</h2>
                    <p className="text-xs font-body text-gray-500 dark:text-gray-400 mt-0.5">Pick a difficulty and send your team in · 1 ticket each</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {import.meta.env.DEV && (
                      <button
                        onClick={() => getBattleOptions(true)}
                        className="text-xs px-2.5 py-1.5 bg-gray-100 dark:bg-dark-200 hover:bg-gray-200 dark:hover:bg-dark-100 text-gray-700 dark:text-gray-300 rounded-md transition-colors cursor-pointer border border-gray-200 dark:border-dark-100"
                        disabled={loading}
                      >
                        {loading ? '...' : 'Refresh'}
                      </button>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="mb-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-3 rounded-r-lg">
                    <p className="text-sm font-body text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                {loading ? (
                  <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500 dark:border-accent-500" />
                  </div>
                ) : battleOptions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400 font-body text-sm">
                    No battle options available. Try adding Digimon to your party.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {battleOptions.map((option, idx) => {
                      const cfg = difficultyConfig[option.difficulty as keyof typeof difficultyConfig] ?? difficultyConfig.easy;
                      const canBattle = !loading && !localLoading && partyDigimon.length >= 1 && energy.current >= 1;
                      return (
                        <motion.div
                          key={option.id}
                          className={`card !p-0 overflow-hidden border-l-4 ${cfg.accentBorder} hover:shadow-md transition-all duration-150`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.06, duration: 0.2 }}
                        >
                          <div className="px-5 py-4 flex items-center gap-4 sm:gap-6">
                            {/* Difficulty info */}
                            <div className="w-24 shrink-0">
                              <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold font-body ${cfg.badge}`}>
                                {cfg.label}
                              </span>
                              <p className={`text-sm font-heading font-bold mt-2 ${cfg.rewardColor}`}>+{cfg.reward}</p>
                              <p className="text-[11px] font-body text-gray-400 dark:text-gray-500">bits on win</p>
                            </div>

                            {/* Digimon sprites */}
                            <div className="flex items-center gap-3 sm:gap-5 flex-1 justify-center min-h-[80px]">
                              {option.team.digimon.map((digimon: any) => (
                                <div key={`${digimon.id}-${digimon.name}`} className="flex flex-col items-center gap-1">
                                  <div className="relative w-16 h-16 flex items-center justify-center">
                                    <DigimonSprite
                                      digimonName={digimon.name}
                                      fallbackSpriteUrl={digimon.sprite_url}
                                      showHappinessAnimations={true}
                                      size="sm"
                                    />
                                    {digimon.type && digimon.attribute && (
                                      <div className="absolute -top-1 -right-1">
                                        <TypeAttributeIcon
                                          type={digimon.type as DigimonType}
                                          attribute={digimon.attribute as DigimonAttribute}
                                          size="sm"
                                          showLabel={false}
                                        />
                                      </div>
                                    )}
                                    <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold text-white bg-black/50 rounded-b px-1 leading-4">
                                      Lv.{digimon.current_level}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-body text-gray-400 dark:text-gray-500 truncate max-w-[64px] text-center">
                                    {digimon.name}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Opponent + fight */}
                            <div className="shrink-0 text-right w-28 sm:w-32">
                              <p className="text-[11px] font-body text-gray-400 dark:text-gray-500 uppercase tracking-wide">Opponent</p>
                              <p className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200 truncate mt-0.5">
                                {option.team.username || option.team.display_name}
                              </p>
                              <button
                                onClick={() => handleSelectOption(option)}
                                disabled={!canBattle}
                                className={`mt-2.5 w-full py-2 rounded-lg text-sm font-semibold font-body transition-colors cursor-pointer ${
                                  !canBattle
                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                    : `${cfg.button}`
                                }`}
                              >
                                {partyDigimon.length < 1 ? 'Need Digimon' : energy.current < 1 ? 'No Tickets' : 'Fight!'}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    <p className="text-center text-xs font-body text-gray-400 dark:text-gray-500 pt-1">
                      Options refresh after each battle · Complete tasks to earn tickets
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
      <PageTutorial tutorialId="battle_intro" steps={digimonPageTutorialSteps} />
    </>
  );
};

// ─── ArenaResultsScreen ───────────────────────────────────────────────────────

const ArenaResultsScreen: React.FC<{
  winner: 'user' | 'opponent';
  bitsReward: number;
  userTeam: BattleDigimon[];
  onContinue: () => void;
}> = ({ winner, bitsReward, userTeam, onContinue }) => {
  const won = winner === 'user';
  const [spriteToggle, setSpriteToggle] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setSpriteToggle(t => !t), 700);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      className="card !p-0 overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Coloured header band */}
      <div className={`px-6 pt-8 pb-6 text-center ${
        won
          ? 'bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/40 dark:to-dark-300'
          : 'bg-gradient-to-b from-red-50 to-white dark:from-red-950/40 dark:to-dark-300'
      }`}>
        <motion.p
          className={`font-heading text-5xl font-semibold mb-1 ${
            won ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-500 dark:text-red-400'
          }`}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', damping: 12, stiffness: 200 }}
        >
          {won ? 'Victory!' : 'Defeated'}
        </motion.p>
        <p className="font-body text-sm text-gray-500 dark:text-gray-400">
          {won ? 'Your team emerged victorious!' : 'Your team fought bravely.'}
        </p>
      </div>

      <div className="px-6 pb-6">
        {/* Digimon team celebration / mourning */}
        <div className={`flex justify-center gap-6 py-5 mb-4 rounded-xl ${
          won ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : 'bg-red-50/50 dark:bg-red-950/20'
        }`}>
          {userTeam.map((d, i) => (
            <motion.div
              key={d.id}
              className="flex flex-col items-center gap-1.5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + i * 0.08, duration: 0.35 }}
            >
              <BattleDigimonSprite
                digimonName={d.digimon_name}
                fallbackSpriteUrl={d.sprite_url}
                size="xl"
                animationState={won ? 'victory' : 'defeat'}
                spriteToggle={spriteToggle}
              />
              <span className="text-xs font-heading font-semibold text-gray-700 dark:text-gray-300">
                {d.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Rewards */}
        <div className="rounded-xl border border-gray-200 dark:border-dark-100 bg-gray-50 dark:bg-dark-200 p-4 mb-5">
          <h3 className="text-xs font-heading font-extrabold tracking-widest uppercase text-gray-400 dark:text-gray-500 mb-3">
            Rewards
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-sm font-body text-gray-600 dark:text-gray-400">Bits earned</span>
            </div>
            <span className="text-sm font-heading font-semibold text-amber-600 dark:text-amber-400">
              +{bitsReward}
            </span>
          </div>
          {!won && (
            <p className="text-xs font-body text-gray-400 dark:text-gray-500 mt-2">
              Win next time for a bigger reward!
            </p>
          )}
        </div>

        <button
          onClick={onContinue}
          className="w-full btn-primary py-3 text-base font-heading font-semibold rounded-xl"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
};

export default Battle;
