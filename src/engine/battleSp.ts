export const DEFAULT_BATTLE_SP_CAPACITY = 100;
export const BASE_BATTLE_SP_PER_SECOND = 4;
export const PREVIOUS_BATTLE_SP_PER_SECOND = 12;
export const BATTLE_SP_STAT_SCALE = 300;
export const MAX_BATTLE_SP_CHARGE_MULTIPLIER = 2.5;

export interface BattleSpKeyframe {
  t: number;
  battleSp: unknown;
  battleSpCapacity: unknown;
  /** A snap frame holds the previous value until its timestamp, then applies immediately. */
  transition?: 'interpolate' | 'snap';
}

export interface BattleSpState {
  battleSp: number;
  battleSpCapacity: number;
}

export function finiteNumber(value: unknown, fallback: number): number {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : Number.NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeBattleSpCapacity(value: unknown): number {
  return Math.max(1, finiteNumber(value, DEFAULT_BATTLE_SP_CAPACITY));
}

export function normalizeBattleSp(value: unknown, capacity: unknown): number {
  const safeCapacity = normalizeBattleSpCapacity(capacity);
  return Math.max(0, Math.min(safeCapacity, finiteNumber(value, 0)));
}

export function battleSpGaugePercent(value: unknown, capacity: unknown): number {
  const safeCapacity = normalizeBattleSpCapacity(capacity);
  return (normalizeBattleSp(value, safeCapacity) / safeCapacity) * 100;
}

export function battleSpChargePerSecond(
  persistentSp: unknown,
  basePerSecond = BASE_BATTLE_SP_PER_SECOND
): number {
  const safePersistentSp = Math.max(0, finiteNumber(persistentSp, 0));
  const multiplier = Math.min(
    MAX_BATTLE_SP_CHARGE_MULTIPLIER,
    1 + safePersistentSp / BATTLE_SP_STAT_SCALE
  );
  return basePerSecond * multiplier;
}

export function chargeBattleSp(
  current: unknown,
  capacity: unknown,
  persistentSp: unknown,
  deltaMs: unknown,
  basePerSecond = BASE_BATTLE_SP_PER_SECOND
): number {
  const safeCapacity = normalizeBattleSpCapacity(capacity);
  const safeDeltaMs = Math.max(0, finiteNumber(deltaMs, 0));
  const next =
    normalizeBattleSp(current, safeCapacity) +
    battleSpChargePerSecond(persistentSp, basePerSecond) * (safeDeltaMs / 1000);
  return normalizeBattleSp(next, safeCapacity);
}

export function spendBattleSp(current: unknown, capacity: unknown, cost: unknown): number | null {
  const safeCapacity = normalizeBattleSpCapacity(capacity);
  const safeCurrent = normalizeBattleSp(current, safeCapacity);
  const safeCost = Math.max(0, finiteNumber(cost, Number.NaN));
  if (!Number.isFinite(safeCost) || safeCost > safeCurrent) return null;
  return normalizeBattleSp(safeCurrent - safeCost, safeCapacity);
}

export function legacySkillGaugePercent(
  remainingMs: unknown,
  cycleTotalMs: unknown,
  isWindingUp: boolean
): number {
  if (isWindingUp) return 100;
  const safeTotal = Math.max(1, finiteNumber(cycleTotalMs, 6000));
  const safeRemaining = Math.max(0, finiteNumber(remainingMs, safeTotal));
  return Math.max(0, Math.min(100, (1 - safeRemaining / safeTotal) * 100));
}

export function sampleBattleSp(
  keyframes: readonly BattleSpKeyframe[],
  elapsedMs: unknown
): BattleSpState {
  if (keyframes.length === 0) {
    return { battleSp: 0, battleSpCapacity: DEFAULT_BATTLE_SP_CAPACITY };
  }

  const elapsed = Math.max(0, finiteNumber(elapsedMs, 0));
  let previous = keyframes[0];
  let next: BattleSpKeyframe | undefined;

  for (let index = 1; index < keyframes.length; index += 1) {
    if (keyframes[index].t > elapsed) {
      next = keyframes[index];
      break;
    }
    previous = keyframes[index];
  }

  const previousCapacity = normalizeBattleSpCapacity(previous.battleSpCapacity);
  const previousSp = normalizeBattleSp(previous.battleSp, previousCapacity);
  if (!next || next.transition === 'snap') {
    return { battleSp: previousSp, battleSpCapacity: previousCapacity };
  }

  const nextCapacity = normalizeBattleSpCapacity(next.battleSpCapacity);
  const nextSp = normalizeBattleSp(next.battleSp, nextCapacity);
  const start = Math.max(0, finiteNumber(previous.t, 0));
  const end = Math.max(start, finiteNumber(next.t, start));
  const fraction = end === start ? 1 : Math.max(0, Math.min(1, (elapsed - start) / (end - start)));
  const capacity = previousCapacity + (nextCapacity - previousCapacity) * fraction;
  const battleSp = previousSp + (nextSp - previousSp) * fraction;
  return {
    battleSp: normalizeBattleSp(battleSp, capacity),
    battleSpCapacity: normalizeBattleSpCapacity(capacity),
  };
}
