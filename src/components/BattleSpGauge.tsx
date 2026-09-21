import {
  battleSpGaugePercent,
  normalizeBattleSp,
  normalizeBattleSpCapacity,
} from '../engine/battleSp';

interface BattleSpGaugeProps {
  battleSp: unknown;
  capacity: unknown;
  techniqueCost?: unknown;
  compact?: boolean;
}

const BattleSpGauge = ({
  battleSp,
  capacity,
  techniqueCost,
  compact = false,
}: BattleSpGaugeProps) => {
  const safeCapacity = normalizeBattleSpCapacity(capacity);
  const safeBattleSp = normalizeBattleSp(battleSp, safeCapacity);
  const percentage = battleSpGaugePercent(safeBattleSp, safeCapacity);
  const parsedCost = typeof techniqueCost === 'number' ? techniqueCost : Number.NaN;
  const safeCost = Number.isFinite(parsedCost)
    ? Math.max(0, Math.min(safeCapacity, parsedCost))
    : null;
  const ready = safeCost !== null && safeBattleSp >= safeCost;

  return (
    <div className="min-w-0" data-battle-sp-gauge="true">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="font-heading text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          SP
        </span>
        <span className="font-body text-xs tabular-nums text-gray-600 dark:text-gray-300">
          {Math.round(safeBattleSp)} / {Math.round(safeCapacity)}
        </span>
      </div>
      <div
        className={`relative overflow-hidden rounded-full bg-gray-200 dark:bg-dark-100 ${compact ? 'h-1.5' : 'h-2.5'}`}
        role="meter"
        aria-label="Technique SP"
        aria-valuemin={0}
        aria-valuemax={safeCapacity}
        aria-valuenow={safeBattleSp}
      >
        <div
          className={`h-full rounded-full bg-accent-500 ${ready ? 'shadow-[0_0_10px_rgba(245,158,11,0.75)]' : ''}`}
          style={{ width: `${percentage}%` }}
        />
        {safeCost !== null && safeCost > 0 && safeCost < safeCapacity && (
          <div
            aria-hidden="true"
            className="absolute inset-y-0 w-px bg-gray-900/70 dark:bg-white/80"
            style={{ left: `${battleSpGaugePercent(safeCost, safeCapacity)}%` }}
          />
        )}
      </div>
    </div>
  );
};

export default BattleSpGauge;
