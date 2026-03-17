import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, ChevronRight, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useDigimonStore, UserDigimon } from '../store/petStore';
import { useInteractiveBattleStore } from '../store/interactiveBattleStore';
import { useCurrencyStore } from '../store/currencyStore';
import { useTitleStore } from '../store/titleStore';
import { useTournamentStore, PLACEMENT_BITS } from '../store/tournamentStore';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import InteractiveBattle from '../components/InteractiveBattle';
import DigimonSprite from '@/components/DigimonSprite';
import TournamentBracket from '../components/TournamentBracket';
import BattleTeamSelector, { OpponentDigimonPreview } from '../components/BattleTeamSelector';

const PLACEMENT_LABELS: Record<string, string> = {
  qf_loss: 'Top 8',
  sf_loss: 'Top 4',
  gf_loss: 'Runner-Up',
  champion: 'Champion',
};

const ROUND_NAMES: Record<number, string> = { 1: 'Quarterfinal', 2: 'Semifinal', 3: 'Grand Final' };

const BITS_WIN: Record<string, number>  = { easy: 75, medium: 100, hard: 200 };
const BITS_LOSS: Record<string, number> = { easy: 50, medium: 50,  hard: 40  };

const Tournament: React.FC = () => {
  const { user, userProfile } = useAuthStore();
  const { allUserDigimon, fetchAllUserDigimon } = useDigimonStore();
  const {
    isBattleActive,
    startInteractiveBattle,
    endBattle: endInteractiveBattle,
  } = useInteractiveBattleStore();
  const {
    currentTournament,
    weeklyTaskCount,
    loading,
    error,
    fetchTournament,
    enterTournament,
    recordRoundResult,
    isUnlocked,
    isActive,
    isCompleted,
    getCurrentRoundOpponent,
  } = useTournamentStore();

  const [enterLoading, setEnterLoading] = useState(false);
  const [enterError, setEnterError] = useState<string | null>(null);
  const [devResetting, setDevResetting] = useState(false);

  const handleDevReset = async () => {
    if (!currentTournament) return;
    setDevResetting(true);
    try {
      await supabase.from('user_tournaments').delete().eq('id', currentTournament.id);
      await fetchTournament();
      await enterTournament();
    } catch (err) {
      console.error('Dev reset failed:', err);
    } finally {
      setDevResetting(false);
    }
  };
  const [isSelectingTeam, setIsSelectingTeam] = useState(false);
  const [battleTeam, setBattleTeam] = useState<UserDigimon[]>([]);
  const [roundResultState, setRoundResultState] = useState<{
    round: number;
    winner: 'user' | 'opponent';
    bits: number;
    placementBits: number;
  } | null>(null);

  // Non-storage party Digimon available for selection
  const partyDigimon = allUserDigimon.filter(d => !d.is_in_storage);

  useEffect(() => {
    fetchTournament();
    fetchAllUserDigimon();
  }, [user?.id]);

  const handleEnter = async () => {
    setEnterError(null);
    setEnterLoading(true);
    try {
      await enterTournament();
    } catch (err) {
      setEnterError((err as Error).message);
    } finally {
      setEnterLoading(false);
    }
  };

  // Step 1: open team selector
  const handleFightClick = () => {
    if (!currentTournament) return;
    setIsSelectingTeam(true);
  };

  // Step 2: team confirmed — start battle (no ticket cost)
  const handleConfirmTeam = async (selectedTeam: UserDigimon[]) => {
    if (!currentTournament) return;
    setIsSelectingTeam(false);
    setBattleTeam(selectedTeam);

    const roundKey = String(currentTournament.current_round) as '1' | '2' | '3';
    const roundData = currentTournament.bracket.rounds[roundKey];

    const userTeamData = selectedTeam.map(d => ({
      ...d,
      digimon: DIGIMON_LOOKUP_TABLE[d.digimon_id as keyof typeof DIGIMON_LOOKUP_TABLE],
    }));

    const opponentTeamData = roundData.opponent.team.map(d => ({
      ...d,
      digimon_id: d.digimon_id,
      digimon: DIGIMON_LOOKUP_TABLE[d.digimon_id as keyof typeof DIGIMON_LOOKUP_TABLE],
    }));

    await startInteractiveBattle(userTeamData, opponentTeamData);
  };

  const handleBattleComplete = async (result: { winner: 'user' | 'opponent'; turns: any[]; userDigimon?: any[] }) => {
    if (!currentTournament) return;

    const round = currentTournament.current_round;
    const roundKey = String(round) as '1' | '2' | '3';
    const roundData = currentTournament.bracket.rounds[roundKey];
    const difficulty = roundData.difficulty;
    const isWin = result.winner === 'user';

    // Per-battle bits
    const bitsReward = isWin ? BITS_WIN[difficulty] : BITS_LOSS[difficulty];
    useCurrencyStore.getState().addCurrency('bits', bitsReward);

    // Record in team_battles
    try {
      if (user) {
        await supabase.from('team_battles').insert({
          user_id: user.id,
          winner_id: isWin ? user.id : null,
          user_team: battleTeam.map(d => ({
            ...d,
            digimon: DIGIMON_LOOKUP_TABLE[d.digimon_id as keyof typeof DIGIMON_LOOKUP_TABLE],
          })),
          opponent_team: roundData.opponent.team.map((d: any) => ({
            ...d,
            digimon: DIGIMON_LOOKUP_TABLE[d.digimon_id as keyof typeof DIGIMON_LOOKUP_TABLE],
          })),
          turns: result.turns,
          created_at: new Date().toISOString(),
        });

        if (isWin) {
          const { data: profile } = await supabase.from('profiles').select('battles_won').eq('id', user.id).single();
          if (profile) await useTitleStore.getState().checkBattleTitles((profile.battles_won ?? 0) + 1);
        }
      }
    } catch {}

    // End battle state first — must happen before recordRoundResult
    endInteractiveBattle();

    // Placement bits for the result screen
    let placementBits = 0;
    if (!isWin) {
      const keys = ['qf_loss', 'sf_loss', 'gf_loss'];
      placementBits = PLACEMENT_BITS[keys[round - 1]] ?? 0;
    } else if (round === 3) {
      placementBits = PLACEMENT_BITS.champion;
    }

    await recordRoundResult(round, isWin ? 'win' : 'loss');

    setRoundResultState({ round, winner: result.winner, bits: bitsReward, placementBits });
    setBattleTeam([]);
  };

  const handleContinue = () => setRoundResultState(null);

  // ─── Render helpers ───────────────────────────────────────────────────────────

  const isLockedState   = !isUnlocked() && !currentTournament;
  const isNotEntered    = isUnlocked() && !currentTournament && !isCompleted();
  const isActiveState   = isActive() && !isBattleActive && !roundResultState && !isSelectingTeam;
  const isFinishedState = isCompleted();

  const currentOpponent = getCurrentRoundOpponent();
  const roundKey = currentTournament ? (String(currentTournament.current_round) as '1' | '2' | '3') : null;
  const currentRoundData = roundKey ? currentTournament?.bracket.rounds[roundKey] : null;
  const hasNoParty = partyDigimon.length === 0;
  const isBossRound = currentTournament?.current_round === 3;

  const nextTournamentDate = (() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + daysUntilMonday);
    return monday.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  })();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8 text-center relative">
        {import.meta.env.DEV && currentTournament && (
          <button
            onClick={handleDevReset}
            disabled={devResetting}
            className="absolute right-0 top-0 text-xs px-2 py-1 bg-gray-200 dark:bg-dark-200 hover:bg-gray-300 dark:hover:bg-dark-100 text-gray-700 dark:text-gray-300 rounded transition-colors disabled:opacity-50"
          >
            {devResetting ? 'Resetting…' : '♻️ Reset'}
          </button>
        )}
        <motion.h1
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-heading font-semibold dark:text-gray-100 mb-2 flex items-center justify-center gap-3"
        >
          <Trophy className="w-8 h-8 text-amber-500" />
          Weekly Tournament
        </motion.h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Complete 10 tasks this week to enter · 3 rounds · Prizes up to 1,500 bits
        </p>
      </div>

      {/* Interactive Battle (full-page takeover) */}
      {isBattleActive && (
        <InteractiveBattle
          userDigimon={battleTeam.map(d => ({
            ...d,
            digimon: DIGIMON_LOOKUP_TABLE[d.digimon_id as keyof typeof DIGIMON_LOOKUP_TABLE],
          }))}
          battleOption={{ difficulty: currentRoundData?.difficulty ?? 'medium' }}
          showRewards={false}
          skipResultScreen={true}
          onBattleComplete={handleBattleComplete}
        />
      )}

      {/* Team Selector (full-section takeover) */}
      <AnimatePresence mode="wait">
        {isSelectingTeam && currentOpponent && currentRoundData && (
          <BattleTeamSelector
            key="tournament-team-selector"
            opponentName={currentOpponent.display_name}
            opponentTeam={currentOpponent.team as OpponentDigimonPreview[]}
            partyDigimon={partyDigimon}
            contextLabel={`Round ${currentTournament!.current_round} · ${ROUND_NAMES[currentTournament!.current_round] ?? ''}`}
            isFree={true}
            confirmLabel="Fight"
            onConfirm={handleConfirmTeam}
            onBack={() => setIsSelectingTeam(false)}
          />
        )}
      </AnimatePresence>

      {/* Inter-round result modal */}
      <AnimatePresence>
        {roundResultState && (
          <motion.div
            key="round-result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white dark:bg-dark-300 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
              {roundResultState.winner === 'user' ? (
                <>
                  <div className="text-5xl mb-3">{roundResultState.round === 3 ? '🏆' : '⚔️'}</div>
                  <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {roundResultState.round === 3 ? 'Champion!' : 'Victory!'}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                    {roundResultState.round < 3
                      ? `Advancing to ${ROUND_NAMES[roundResultState.round + 1] ?? 'next round'}`
                      : 'You conquered the tournament!'}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-3">💔</div>
                  <h2 className="text-2xl font-bold text-red-500 dark:text-red-400 mb-1">Defeated</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                    You reached {PLACEMENT_LABELS[['', 'qf_loss', 'sf_loss', 'gf_loss'][roundResultState.round]!]}
                  </p>
                </>
              )}

              <div className="bg-gray-50 dark:bg-dark-400 rounded-xl p-4 mb-6 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Battle reward</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">+{roundResultState.bits} bits</span>
                </div>
                {roundResultState.placementBits > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Placement bonus</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">+{roundResultState.placementBits} bits</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleContinue}
                className="w-full py-3 bg-indigo-500 dark:bg-accent-600 hover:bg-indigo-600 dark:hover:bg-accent-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {roundResultState.winner === 'user' && roundResultState.round < 3
                  ? <><span>Continue</span><ChevronRight className="w-4 h-4" /></>
                  : 'Close'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content — hidden while battle/selector/result active */}
      {!isBattleActive && !isSelectingTeam && !roundResultState && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>

          {/* Bracket */}
          <div className="bg-white dark:bg-dark-300 rounded-2xl border border-gray-200 dark:border-dark-100 p-6 mb-6 relative overflow-hidden">
            <TournamentBracket
              tournament={currentTournament}
              roundResults={currentTournament?.round_results ?? []}
              currentRound={currentTournament?.current_round ?? 1}
              finalPlacement={currentTournament?.final_placement ?? null}
              weeklyTaskCount={weeklyTaskCount}
              isCompleted={isFinishedState}
              userUsername={userProfile?.username}
              userAvatarUrl={userProfile?.avatar_url}
            />
          </div>

          {/* State 1: Locked */}
          {isLockedState && (
            <div className="bg-gray-50 dark:bg-dark-300 rounded-2xl border border-gray-200 dark:border-dark-100 p-6">
              <h3 className="font-heading font-semibold text-gray-800 dark:text-gray-100 mb-3">How it works</h3>
              <div className="space-y-3 text-sm font-body text-gray-600 dark:text-gray-400">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <p>Complete <span className="font-semibold text-gray-800 dark:text-gray-200">10 tasks</span> during the week to unlock your entry slot.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <p>Fight through <span className="font-semibold text-gray-800 dark:text-gray-200">3 rounds</span> — Quarterfinal, Semifinal, and Grand Final — each against a tougher opponent.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <p>Earn <span className="font-semibold text-amber-600 dark:text-amber-400">bits</span> for every round you win — up to <span className="font-semibold text-amber-600 dark:text-amber-400">1,500 bits</span> if you become Champion.</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-body">
                {[
                  { label: 'QF loss', bits: 100 },
                  { label: 'SF loss', bits: 300 },
                  { label: 'GF loss', bits: 600 },
                  { label: '🏆 Champion', bits: 1500 },
                ].map(({ label, bits }) => (
                  <div key={label} className="flex justify-between bg-white dark:bg-dark-200 rounded-lg px-3 py-2 border border-gray-200 dark:border-dark-100">
                    <span className="text-gray-500 dark:text-gray-400">{label}</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">{bits.toLocaleString()} bits</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* State 2: Unlocked, not entered */}
          {isNotEntered && (
            <div className="bg-indigo-50 dark:bg-accent-900/20 rounded-2xl border border-indigo-200 dark:border-accent-700 p-6">
              <h3 className="font-bold text-indigo-800 dark:text-accent-300 text-lg mb-2">Tournament Open!</h3>
              <p className="text-sm text-indigo-600 dark:text-accent-400 mb-4">
                3 rounds · Free to play · Prizes scale by placement
              </p>

              <div className="grid grid-cols-2 gap-2 mb-5 text-sm">
                {[
                  { label: 'QF loss', bits: 100 },
                  { label: 'SF loss', bits: 300 },
                  { label: 'GF loss', bits: 600 },
                  { label: '🏆 Champion', bits: 1500 },
                ].map(({ label, bits }) => (
                  <div key={label} className="flex justify-between bg-white dark:bg-dark-300 rounded-lg px-3 py-2 border border-indigo-100 dark:border-accent-800">
                    <span className="text-gray-600 dark:text-gray-300">{label}</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">{bits.toLocaleString()} bits</span>
                  </div>
                ))}
              </div>

              {enterError && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mb-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {enterError}
                </div>
              )}

              <button
                onClick={handleEnter}
                disabled={enterLoading || hasNoParty}
                title={hasNoParty ? 'Add Digimon to your party first' : undefined}
                className="w-full py-3 bg-indigo-500 dark:bg-accent-600 hover:bg-indigo-600 dark:hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
              >
                {enterLoading ? 'Entering…' : hasNoParty ? 'No party Digimon' : 'Enter Tournament'}
              </button>
            </div>
          )}

          {/* State 3: Active */}
          {isActiveState && currentOpponent && currentRoundData && (
            <div className="bg-white dark:bg-dark-300 rounded-2xl border border-gray-200 dark:border-dark-100 p-6">
              {/* Round header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">
                    Round {currentTournament!.current_round} of 3
                  </div>
                  <h3 className="text-xl font-bold dark:text-gray-100 flex items-center gap-2">
                    {currentRoundData.round_name}
                    {isBossRound && <Crown className="w-5 h-5 text-amber-500" />}
                  </h3>
                </div>
                <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                  <div>vs</div>
                  <div className="font-semibold text-gray-700 dark:text-gray-200">{currentOpponent.display_name}</div>
                </div>
              </div>

              {/* Opponent team preview */}
              <div className="flex gap-3 justify-center p-4 bg-gray-50 dark:bg-dark-400 rounded-xl mb-4">
                {currentOpponent.team.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 relative">
                      <DigimonSprite
                        digimonName={d.name}
                        fallbackSpriteUrl={d.sprite_url}
                        size="sm"
                        showHappinessAnimations={true}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Lv.{d.current_level}</span>
                  </div>
                ))}
              </div>

              {enterError && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mb-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {enterError}
                </div>
              )}

              <button
                onClick={handleFightClick}
                disabled={hasNoParty}
                className="w-full py-3 bg-indigo-500 dark:bg-accent-600 hover:bg-indigo-600 dark:hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {hasNoParty ? 'No party Digimon' : 'Select Team & Fight'}
              </button>
            </div>
          )}

          {/* State 4: Completed / Expired */}
          {isFinishedState && (
            <div className="bg-white dark:bg-dark-300 rounded-2xl border border-gray-200 dark:border-dark-100 p-6 text-center">
              {currentTournament?.status === 'expired' ? (
                <>
                  <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Tournament expired</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Next tournament opens {nextTournamentDate}</p>
                </>
              ) : (
                <>
                  {currentTournament?.final_placement && (
                    <div className="mb-3">
                      <div className="text-4xl mb-2">
                        {currentTournament.final_placement === 'champion' ? '🏆' : '🎖️'}
                      </div>
                      <h3 className="text-xl font-bold dark:text-gray-100">
                        {PLACEMENT_LABELS[currentTournament.final_placement]}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {currentTournament.final_placement === 'champion'
                          ? "You conquered this week's tournament!"
                          : `You made it to the ${PLACEMENT_LABELS[currentTournament.final_placement]} stage.`}
                      </p>
                    </div>
                  )}
                  <div className="text-sm text-gray-400 dark:text-gray-500">
                    Next tournament opens {nextTournamentDate}
                  </div>
                </>
              )}
            </div>
          )}

          {loading && !currentTournament && (
            <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-4">Loading tournament…</div>
          )}
          {error && !loading && (
            <div className="text-center text-red-500 text-sm py-4">{error}</div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Tournament;
