import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Trophy, Lock } from 'lucide-react';
import {
  UserTournament,
  TournamentPlacement,
  RoundResult,
  TournamentOpponentDigimon,
  BracketSlot,
} from '../types/tournament';
import DigimonSprite from './DigimonSprite';

interface TournamentBracketProps {
  tournament: UserTournament | null;
  roundResults: RoundResult[];
  currentRound: number;
  finalPlacement: TournamentPlacement | null;
  weeklyTaskCount: number;
  isCompleted: boolean;
  userUsername?: string;
  userAvatarUrl?: string;
}

// ── Sub-components ──────────────────────────────────────────────────────────

const TeamSprites: React.FC<{ team: TournamentOpponentDigimon[] }> = ({ team }) => (
  <div className="flex items-center justify-center gap-2 my-2">
    {team.slice(0, 3).map((d, i) => (
      <div key={i} className="w-6 h-6">
        <DigimonSprite
          digimonName={d.name}
          fallbackSpriteUrl={d.sprite_url}
          size="xs"
          showHappinessAnimations={true}
        />
      </div>
    ))}
  </div>
);

// A single team slot card used in the QF column
interface SlotCardProps {
  slot: BracketSlot;
  result?: 'win' | 'loss';
  isCurrent?: boolean;
  userUsername?: string;
  userAvatarUrl?: string;
}

const SlotCard: React.FC<SlotCardProps> = ({
  slot,
  result,
  isCurrent,
  userUsername,
  userAvatarUrl,
}) => {
  const isUser = !!slot.is_user;
  const displayName = isUser ? (userUsername ?? 'You') : slot.name;

  const base =
    'flex flex-col px-2.5 py-2 rounded-lg border text-xs font-medium transition-all duration-200 min-w-[120px]';

  let colorClass: string;
  if (isUser) {
    colorClass = `bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 ${result === 'win' ? 'shadow-md shadow-green-400/30' : result === 'loss' ? 'opacity-50' : isCurrent ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''}`;
  } else if (isCurrent) {
    colorClass =
      'bg-indigo-50 dark:bg-accent-900/20 border-indigo-300 dark:border-accent-700 ring-2 ring-indigo-300 dark:ring-accent-600';
  } else if (result === 'loss') {
    colorClass = 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900 opacity-60';
  } else if (result === 'win') {
    colorClass = 'bg-gray-100 dark:bg-dark-200 border-gray-200 dark:border-dark-100 opacity-70';
  } else {
    colorClass = 'bg-white dark:bg-dark-300 border-gray-200 dark:border-dark-100';
  }

  return (
    <div className={`${base} ${colorClass}`}>
      <div className="flex items-center gap-1.5">
        {isUser && userAvatarUrl ? (
          <img
            src={userAvatarUrl}
            alt={displayName}
            className="w-5 h-5 rounded-full object-cover flex-shrink-0"
          />
        ) : isUser ? (
          <div className="w-5 h-5 rounded-full bg-blue-300 dark:bg-blue-600 flex-shrink-0" />
        ) : null}
        <span
          className={`truncate max-w-[100px] ${isUser ? 'text-blue-800 dark:text-blue-200' : 'text-gray-700 dark:text-gray-200'}`}
        >
          {displayName}
        </span>
        {result === 'win' && !isUser && <span className="ml-auto text-green-500">✓</span>}
        {result === 'loss' && !isUser && <span className="ml-auto text-green-500">✓</span>}
        {result === 'win' && isUser && <span className="ml-auto text-green-500">✓</span>}
        {result === 'loss' && isUser && <span className="ml-auto text-red-500">✗</span>}
      </div>
      {slot.is_user ? (
        // Empty row keeps user card same height as opponent cards
        <div className="h-6 mt-1" />
      ) : slot.team && slot.team.length > 0 ? (
        <TeamSprites team={slot.team} />
      ) : (
        <div className="h-6 mt-1" />
      )}
    </div>
  );
};

// Bracket connector — L-shaped line connecting two QF slots to a SF node
const Connector: React.FC<{ active?: boolean }> = ({ active }) => (
  <div className="flex flex-col items-end w-3 self-stretch">
    <div
      className={`flex-1 border-r-2 border-t-2 rounded-tr-md ${active ? 'border-indigo-400 dark:border-accent-500' : 'border-gray-200 dark:border-dark-100'}`}
    />
    <div
      className={`flex-1 border-r-2 border-b-2 rounded-br-md ${active ? 'border-indigo-400 dark:border-accent-500' : 'border-gray-200 dark:border-dark-100'}`}
    />
  </div>
);

// Node shown at the SF or GF intersection
interface RoundNodeProps {
  label: string;
  sublabel?: string;
  active?: boolean;
  won?: boolean;
  lost?: boolean;
  locked?: boolean;
  isFinal?: boolean;
}

const RoundNode: React.FC<RoundNodeProps> = ({
  label,
  sublabel,
  active,
  won,
  lost,
  locked,
  isFinal,
}) => (
  <div
    className={`self-center px-2.5 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap text-center ${
      won
        ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300'
        : lost
          ? 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400'
          : active
            ? 'bg-indigo-100 dark:bg-accent-900/30 border-indigo-300 dark:border-accent-700 text-indigo-700 dark:text-accent-300'
            : locked
              ? 'bg-gray-50 dark:bg-dark-400 border-dashed border-gray-300 dark:border-dark-100 text-gray-400 dark:text-gray-500'
              : isFinal
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-300'
                : 'bg-gray-100 dark:bg-dark-200 border-gray-200 dark:border-dark-100 text-gray-500 dark:text-gray-400'
    }`}
  >
    <div>{label}</div>
    {sublabel && <div className="text-[10px] opacity-75 mt-0.5">{sublabel}</div>}
  </div>
);

const PLACEMENT_LABELS: Record<string, string> = {
  qf_loss: 'Top 8',
  sf_loss: 'Top 4',
  gf_loss: 'Runner-Up',
  champion: 'Champion',
};
const PLACEMENT_COLORS: Record<string, string> = {
  qf_loss: 'text-orange-500',
  sf_loss: 'text-gray-500',
  gf_loss: 'text-yellow-500',
  champion: 'text-amber-500',
};

// ── Main component ───────────────────────────────────────────────────────────

const TournamentBracket: React.FC<TournamentBracketProps> = ({
  tournament,
  roundResults,
  currentRound,
  finalPlacement,
  weeklyTaskCount,
  isCompleted,
  userUsername,
  userAvatarUrl,
}) => {
  const isLocked = weeklyTaskCount < 10 && !tournament;
  const slots = tournament?.bracket.visual_bracket.slots ?? [];
  const getSlot = (n: number): BracketSlot =>
    slots.find((s) => s.slot === n) ?? { slot: n, name: '???', team: [] };

  // Authoritative opponent data from rounds — always correct regardless of bracket format/age
  const bracketRounds = tournament?.bracket.rounds;
  const qfOpponent = bracketRounds?.['1']?.opponent;
  const sfOpponent = bracketRounds?.['2']?.opponent;
  const gfOpponent = bracketRounds?.['3']?.opponent;

  const getResult = (round: number): 'win' | 'loss' | 'upcoming' | 'locked' => {
    const r = roundResults.find((r) => r.round === round);
    if (r) return r.result;
    if (!isCompleted && round === currentRound) return 'upcoming';
    return 'locked';
  };

  const r1 = getResult(1);
  const r2 = getResult(2);
  const r3 = getResult(3);

  // Progressive reveal: SF shows after QF, GF shows after SF
  const sfRevealed = r1 === 'win' || r1 === 'loss' || currentRound >= 2 || isCompleted;
  const gfRevealed =
    (sfRevealed && (r2 === 'win' || r2 === 'loss')) || currentRound >= 3 || isCompleted;

  // SF1 node label (User's semi)
  const sf1Label = !sfRevealed
    ? 'SF'
    : r2 === 'win'
      ? 'Advanced'
      : r2 === 'loss'
        ? 'Eliminated'
        : r2 === 'upcoming'
          ? 'Up next'
          : 'SF';

  // GF node label
  const gfLabel = !gfRevealed
    ? 'Final'
    : r3 === 'win'
      ? '🏆 Champion'
      : r3 === 'loss'
        ? 'Runner-Up'
        : r3 === 'upcoming'
          ? 'Grand Final'
          : 'Final';

  const cleanName = (raw: BracketSlot): string =>
    !raw.name || raw.name === 'Wild Digimon' || raw.name === 'Filler Team' ? '???' : raw.name;

  // Slot references — real opponent slots override with authoritative rounds data
  // Slot 1 is always the user, even before the tournament is entered
  const s1: BracketSlot = { ...getSlot(1), is_user: true };
  const s2: BracketSlot = {
    slot: 2,
    name: qfOpponent?.display_name ?? cleanName(getSlot(2)),
    team:
      qfOpponent?.team && qfOpponent.team.length > 0 ? qfOpponent.team : (getSlot(2).team ?? []),
  };
  const s3: BracketSlot = { ...getSlot(3), name: cleanName(getSlot(3)) };
  const s4: BracketSlot = {
    slot: 4,
    name: sfOpponent?.display_name ?? cleanName(getSlot(4)),
    team:
      sfOpponent?.team && sfOpponent.team.length > 0 ? sfOpponent.team : (getSlot(4).team ?? []),
  };
  const s5: BracketSlot = { ...getSlot(5), name: cleanName(getSlot(5)) };
  const s6: BracketSlot = { ...getSlot(6), name: cleanName(getSlot(6)) };
  const s7: BracketSlot = { ...getSlot(7), name: cleanName(getSlot(7)) };
  const s8: BracketSlot = {
    slot: 8,
    name: gfOpponent?.display_name ?? getSlot(8).name,
    is_boss: true,
    team:
      gfOpponent?.team && gfOpponent.team.length > 0 ? gfOpponent.team : (getSlot(8).team ?? []),
  };

  const revealAnim = {
    initial: { opacity: 0, x: 12 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.35, ease: 'easeOut' },
  };

  // ── Desktop ────────────────────────────────────────────────────────────────
  const DesktopBracket = () => (
    <div className="hidden md:flex items-stretch gap-0 justify-center overflow-x-auto pb-2 select-none">
      {/* === LEFT QF COLUMN (pairs 1-2) === */}
      <div className="flex flex-col py-2 gap-2">
        {/* QF1 pair: User vs QF opp */}
        <SlotCard
          slot={s1}
          result={r1 === 'win' ? 'win' : r1 === 'loss' ? 'loss' : undefined}
          isCurrent={currentRound === 1 && !isCompleted}
          userUsername={userUsername}
          userAvatarUrl={userAvatarUrl}
        />
        <SlotCard
          slot={s2}
          result={r1 === 'win' ? 'loss' : r1 === 'loss' ? 'win' : undefined}
          isCurrent={currentRound === 1 && !isCompleted}
        />
        <div className="h-3" />
        {/* QF2 pair: Filler A vs SF opp */}
        <SlotCard slot={s3} />
        <SlotCard slot={s4} />
      </div>

      {/* QF left → SF left connectors */}
      <div className="flex flex-col justify-around py-2 gap-2">
        <Connector active={sfRevealed && r1 !== 'loss'} />
        <Connector active={sfRevealed} />
      </div>

      {/* === SF LEFT COLUMN === */}
      <div className="flex flex-col justify-around py-8 gap-4">
        <AnimatePresence>
          {sfRevealed ? (
            <motion.div key="sf1" {...revealAnim}>
              <RoundNode
                label={sf1Label}
                sublabel={r2 === 'upcoming' ? `vs ${s4.name}` : undefined}
                active={r2 === 'upcoming'}
                won={r2 === 'win'}
                lost={r2 === 'loss'}
              />
            </motion.div>
          ) : (
            <RoundNode key="sf1-locked" label="SF" locked />
          )}
        </AnimatePresence>
        {/* Other SF (always shows after user's QF resolves) */}
        <AnimatePresence>
          {sfRevealed ? (
            <motion.div key="sf2" {...revealAnim}>
              <RoundNode label="SF" sublabel="Other side" won />
            </motion.div>
          ) : (
            <RoundNode key="sf2-locked" label="SF" locked />
          )}
        </AnimatePresence>
      </div>

      {/* SF left → GF connector */}
      <div className="flex flex-col justify-around py-2">
        <Connector active={gfRevealed} />
      </div>

      {/* === GRAND FINAL NODE === */}
      <div className="flex flex-col justify-around py-16 px-1">
        <AnimatePresence>
          {gfRevealed ? (
            <motion.div key="gf" {...revealAnim}>
              <RoundNode
                label={gfLabel}
                sublabel={r3 === 'upcoming' ? `vs ${s8.name}` : undefined}
                active={r3 === 'upcoming'}
                won={r3 === 'win'}
                lost={r3 === 'loss'}
                isFinal={!r3 || r3 === 'upcoming'}
              />
            </motion.div>
          ) : (
            <RoundNode key="gf-locked" label="Final" locked />
          )}
        </AnimatePresence>
      </div>

      {/* GF → SF right connector (mirrored) */}
      <div className="flex flex-col justify-around py-2 scale-x-[-1]">
        <Connector active={gfRevealed} />
      </div>

      {/* === SF RIGHT COLUMN === */}
      <div className="flex flex-col justify-around py-8 gap-4">
        <AnimatePresence>
          {sfRevealed ? (
            <motion.div key="sf3" {...revealAnim}>
              <RoundNode label="SF" sublabel="Other side" won />
            </motion.div>
          ) : (
            <RoundNode key="sf3-locked" label="SF" locked />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {sfRevealed ? (
            <motion.div key="sf4" {...revealAnim}>
              <RoundNode label="SF" sublabel="Other side" won />
            </motion.div>
          ) : (
            <RoundNode key="sf4-locked" label="SF" locked />
          )}
        </AnimatePresence>
      </div>

      {/* SF right → QF right connectors (mirrored) */}
      <div className="flex flex-col justify-around py-2 gap-2 scale-x-[-1]">
        <Connector active={false} />
        <Connector active={false} />
      </div>

      {/* === RIGHT QF COLUMN (pairs 3-4) === */}
      <div className="flex flex-col py-2 gap-2">
        {/* QF3 pair: Filler B vs Filler C */}
        <SlotCard slot={s5} />
        <SlotCard slot={s6} />
        <div className="h-3" />
        {/* QF4 pair: Filler D vs Boss */}
        <SlotCard slot={s7} />
        <SlotCard slot={s8} />
      </div>
    </div>
  );

  // ── Mobile (vertical round cards) ─────────────────────────────────────────
  const MobileBracket = () => (
    <div className="md:hidden flex flex-col gap-3">
      {[1, 2, 3].map((round) => {
        const result = getResult(round);
        const roundKey = String(round) as '1' | '2' | '3';
        const roundData = tournament?.bracket.rounds[roundKey];
        const roundName =
          roundData?.round_name ?? ['Quarterfinal', 'Semifinal', 'Grand Final'][round - 1];
        const isCurrentRound = result === 'upcoming';
        const isLocked = result === 'locked';

        const sfHidden = round >= 2 && !sfRevealed;
        const gfHidden = round >= 3 && !gfRevealed;
        const hidden = sfHidden || gfHidden;

        const opponentName = hidden
          ? '???'
          : round === 3 && !gfRevealed
            ? '???'
            : (roundData?.opponent.display_name ?? '???');
        const team = hidden ? [] : (roundData?.opponent.team ?? []);

        return (
          <motion.div
            key={round}
            layout
            className={`rounded-lg border p-3 transition-all duration-300 ${
              result === 'win'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : result === 'loss'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 opacity-70'
                  : isCurrentRound
                    ? 'bg-indigo-50 dark:bg-accent-900/20 border-indigo-200 dark:border-accent-700'
                    : hidden
                      ? 'bg-gray-50 dark:bg-dark-400 border-dashed border-gray-200 dark:border-dark-200 opacity-50'
                      : 'bg-gray-50 dark:bg-dark-300 border-gray-200 dark:border-dark-100 opacity-60'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Round {round}</div>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
                  {roundName}
                  {round === 3 && gfRevealed && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                </div>
                {hidden ? (
                  <div className="text-xs text-gray-400 dark:text-gray-500 italic">
                    Unlocks as you advance
                  </div>
                ) : (
                  <>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      vs {opponentName}
                    </div>
                    {team.length > 0 && <TeamSprites team={team} />}
                  </>
                )}
              </div>
              <div className="flex-shrink-0 pt-1">
                {result === 'win' && <span className="text-green-500 font-bold text-lg">✓</span>}
                {result === 'loss' && <span className="text-red-500 font-bold text-lg">✗</span>}
                {isCurrentRound && (
                  <span className="text-indigo-500 dark:text-accent-400 text-xs font-semibold">
                    Up next
                  </span>
                )}
                {isLocked && !hidden && <Lock className="w-4 h-4 text-gray-400" />}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div className="relative">
      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/60 dark:bg-dark-400/60 backdrop-blur-sm rounded-xl">
          <Lock className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">
            {weeklyTaskCount} / 10 tasks this week
          </p>
          <div className="w-48 h-2 bg-gray-200 dark:bg-dark-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 dark:bg-accent-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (weeklyTaskCount / 10) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Complete daily tasks to unlock
          </p>
        </div>
      )}

      {/* Final placement banner */}
      {finalPlacement && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center justify-center gap-2"
        >
          <Trophy className={`w-5 h-5 ${PLACEMENT_COLORS[finalPlacement]}`} />
          <span className={`font-bold text-lg ${PLACEMENT_COLORS[finalPlacement]}`}>
            {PLACEMENT_LABELS[finalPlacement]}
          </span>
        </motion.div>
      )}

      <DesktopBracket />
      <MobileBracket />
    </div>
  );
};

export default TournamentBracket;
