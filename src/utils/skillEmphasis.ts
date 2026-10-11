export const SKILL_EMPHASIS_DURATION_MS = 500;
export const SKILL_EMPHASIS_TIME_SCALE = 0.5;
const SKILL_EMPHASIS_COOLDOWN_MS = 1700;

export interface SkillEmphasisState {
  windupIds: string[];
  remainingMs: number;
  cooldownMs: number;
}

export const createSkillEmphasisState = (): SkillEmphasisState => ({
  windupIds: [],
  remainingMs: 0,
  cooldownMs: 0,
});

/** One bounded window for all simultaneous skills; overlaps never restart or stack it. */
export function advanceSkillEmphasis(
  previous: SkillEmphasisState,
  deltaMs: number,
  windupIds: string[],
  enabled: boolean
): SkillEmphasisState {
  if (!enabled) return { windupIds, remainingMs: 0, cooldownMs: 0 };
  const delta = Math.max(0, deltaMs);
  let remainingMs = Math.max(0, previous.remainingMs - delta);
  let cooldownMs = Math.max(0, previous.cooldownMs - delta);
  const newWindup = windupIds.some((id) => !previous.windupIds.includes(id));
  if (windupIds.length === 0) remainingMs = 0;
  if (newWindup && remainingMs === 0 && cooldownMs === 0) {
    remainingMs = SKILL_EMPHASIS_DURATION_MS;
    cooldownMs = SKILL_EMPHASIS_COOLDOWN_MS;
  }
  return { windupIds, remainingMs, cooldownMs };
}

/** Use the strongest slowdown, never multiply independent cinematics. */
export function skillPlaybackScale(state: SkillEmphasisState, cinematicScale = 1) {
  return Math.min(cinematicScale, state.remainingMs > 0 ? SKILL_EMPHASIS_TIME_SCALE : 1);
}
