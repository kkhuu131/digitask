import { describe, expect, it } from 'vitest';
import {
  advanceSkillEmphasis,
  createSkillEmphasisState,
  skillPlaybackScale,
} from '../../utils/skillEmphasis';

describe('skill emphasis playback', () => {
  it('shares a bounded half-speed window without stacking or restarting on overlaps', () => {
    const first = advanceSkillEmphasis(createSkillEmphasisState(), 0, ['a'], true);
    expect(skillPlaybackScale(first)).toBe(0.5);
    const overlapping = advanceSkillEmphasis(first, 200, ['a', 'b'], true);
    expect(overlapping.remainingMs).toBe(300);
    expect(skillPlaybackScale(overlapping, 0.7)).toBe(0.5);
    const ended = advanceSkillEmphasis(overlapping, 300, ['b', 'c'], true);
    expect(ended.remainingMs).toBe(0);
    expect(skillPlaybackScale(ended)).toBe(1);
    expect(skillPlaybackScale(ended, 0.7)).toBe(0.7);
  });
  it('handles simultaneous starts, cancellation, cooldown and later skills', () => {
    const first = advanceSkillEmphasis(createSkillEmphasisState(), 0, ['a', 'b'], true);
    const cancelled = advanceSkillEmphasis(first, 100, [], true);
    expect(skillPlaybackScale(cancelled)).toBe(1);
    expect(advanceSkillEmphasis(cancelled, 100, ['c'], true).remainingMs).toBe(0);
    const later = advanceSkillEmphasis(cancelled, 1700, ['d'], true);
    expect(later.remainingMs).toBe(500);
    expect(advanceSkillEmphasis(later, 2000, ['d'], true).remainingMs).toBe(0);
  });
  it('skips emphasis for reduced motion', () => {
    const active = advanceSkillEmphasis(createSkillEmphasisState(), 0, ['a'], true);
    const disabled = advanceSkillEmphasis(active, 16, ['a', 'b'], false);
    expect(disabled.remainingMs).toBe(0);
    expect(skillPlaybackScale(disabled)).toBe(1);
    expect(advanceSkillEmphasis(disabled, 16, ['a', 'b'], true).remainingMs).toBe(0);
  });
});
