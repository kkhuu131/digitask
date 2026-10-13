import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Coins } from 'lucide-react';
import BattleDigimonSprite from './BattleDigimonSprite';
import type { BattleDigimon } from '../types/battle';

export type BattleResultFighter = Pick<
  BattleDigimon,
  'id' | 'name' | 'digimon_name' | 'sprite_url'
>;

interface BattleResultsScreenProps {
  winner: 'user' | 'opponent';
  bitsReward: number;
  placementBits?: number;
  timeLimit?: boolean;
  userTeam: BattleResultFighter[];
  contextLabel?: string;
  description?: string;
  continueLabel?: string;
  onContinue: () => void;
}

export default function BattleResultsScreen({
  winner,
  bitsReward,
  placementBits = 0,
  timeLimit,
  userTeam,
  contextLabel,
  description,
  continueLabel = 'Continue',
  onContinue,
}: BattleResultsScreenProps) {
  const won = winner === 'user';
  const reducedMotion = useReducedMotion();
  const [spriteToggle, setSpriteToggle] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => setSpriteToggle((toggle) => !toggle), 700);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  const rewards = [
    { label: placementBits > 0 ? 'Battle reward' : 'Bits earned', amount: bitsReward },
    ...(placementBits > 0 ? [{ label: 'Placement bonus', amount: placementBits }] : []),
  ];

  return (
    <motion.section
      className="card !p-0 w-full max-w-lg mx-auto overflow-hidden"
      aria-labelledby="battle-result-heading"
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="px-4 sm:px-6 pt-8 pb-6 text-center">
        {contextLabel && <p className="ui-description mb-2">{contextLabel}</p>}
        <motion.h2
          id="battle-result-heading"
          className={`font-heading text-5xl font-semibold mb-1 ${
            won ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-500 dark:text-red-400'
          }`}
          initial={reducedMotion ? false : { scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', damping: 12, stiffness: 200 }}
        >
          {won ? 'Victory!' : 'Defeated'}
        </motion.h2>
        <p className="font-body text-sm text-gray-500 dark:text-gray-400">
          {description ?? (won ? 'Your team emerged victorious!' : 'Your team fought bravely.')}
          {timeLimit && ' Time limit reached; the result was decided by remaining team HP.'}
        </p>
      </div>

      <div className="px-4 sm:px-6 pb-6">
        <div
          className={`grid gap-2 sm:gap-6 py-5 mb-4 rounded-xl ${
            won ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : 'bg-red-50/50 dark:bg-red-950/20'
          }`}
          style={{ gridTemplateColumns: `repeat(${Math.max(1, userTeam.length)}, minmax(0, 1fr))` }}
        >
          {userTeam.map((digimon, index) => (
            <motion.div
              key={digimon.id}
              className="flex min-w-0 flex-col items-center gap-1.5"
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + index * 0.08, duration: 0.35 }}
            >
              <BattleDigimonSprite
                digimonName={digimon.digimon_name}
                fallbackSpriteUrl={digimon.sprite_url}
                size="xl"
                className="max-w-full"
                animationState={won ? 'victory' : 'defeat'}
                spriteToggle={reducedMotion ? false : spriteToggle}
              />
              <span className="max-w-full break-words px-1 text-center text-xs font-heading font-semibold text-gray-700 dark:text-gray-300">
                {digimon.name}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-dark-100 bg-gray-50 dark:bg-dark-200 p-4 mb-5">
          <h3 className="text-xs font-heading font-extrabold tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-3">
            Rewards
          </h3>
          <dl className="space-y-2">
            {rewards.map(({ label, amount }) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <dt className="flex items-center gap-2 text-sm font-body text-gray-600 dark:text-gray-400">
                  <Coins
                    className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
                    aria-hidden="true"
                  />
                  {label}
                </dt>
                <dd className="text-sm font-heading font-semibold text-amber-600 dark:text-amber-400">
                  +{amount.toLocaleString()} Bits
                </dd>
              </div>
            ))}
          </dl>
          {!won && !description && (
            <p className="text-xs font-body text-gray-500 dark:text-gray-400 mt-2">
              Win next time for a bigger reward!
            </p>
          )}
        </div>

        <button
          onClick={onContinue}
          className="w-full btn-primary py-3 text-base font-heading font-semibold rounded-xl"
        >
          {continueLabel}
        </button>
      </div>
    </motion.section>
  );
}
