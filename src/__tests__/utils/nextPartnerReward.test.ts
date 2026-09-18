import { describe, expect, it } from 'vitest';
import { nextPartnerReward } from '../../utils/nextPartnerReward';
import { TITLES } from '../../constants/titles';
import type { UserTitle } from '../../store/titleStore';

const earned = (title_id: number, claimed_at: string | null = '2026-09-18'): UserTitle => ({
  id: title_id,
  title_id,
  claimed_at,
  earned_at: '2026-09-18',
  is_displayed: false,
});
describe('next partner reward', () => {
  it('tracks each reward path independently and advances its claimed milestone', () => {
    const progress = { tasks: 30, streak: 2, battles: 4 };
    expect(nextPartnerReward([earned(503)], progress, 'tasks_completed')?.target).toBe(50);
    expect(nextPartnerReward([], progress, 'longest_streak')?.target).toBe(7);
    expect(nextPartnerReward([], progress, 'battle_wins')?.target).toBe(10);
    expect(nextPartnerReward([], progress, 'digimon_stage')?.title.requirement_value).toBe('Mega');
    expect(nextPartnerReward([earned(301, null)], progress, 'tasks_completed')?.ready).toBe(false);
    expect(nextPartnerReward([earned(301, null)], progress, 'battle_wins')?.ready).toBe(true);
  });
  it('shows ready rewards before incomplete milestones, even without progress', () => {
    const next = nextPartnerReward([earned(301, null)], null);
    expect(next?.ready).toBe(true);
    expect(next?.userTitleId).toBe(301);
  });
  it('chooses the closest measured milestone and retains accurate counts', () => {
    const next = nextPartnerReward([], { tasks: 18, streak: 2, battles: 4 });
    expect(next?.title.id).toBe(503);
    expect(next?.current).toBe(18);
    expect(next?.target).toBe(25);
  });
  it('moves to a different milestone after a reward is claimed', () => {
    const next = nextPartnerReward([earned(503)], { tasks: 30, streak: 6, battles: 4 });
    expect(next?.title.id).toBe(402);
    expect(next?.current).toBe(6);
    expect(next?.target).toBe(7);
  });
  it('allows outstanding legacy rewards but never targets unearned legacy titles', () => {
    expect(nextPartnerReward([earned(3, null)], null)?.title.id).toBe(3);
    expect(nextPartnerReward([], { tasks: 0, streak: 0, battles: 0 })?.title.category).not.toBe(
      'campaign'
    );
  });
  it('does not invent numeric progress when counts are unavailable', () => {
    expect(nextPartnerReward([], null)?.current).toBeNull();
  });
  it('recognizes when every active partner achievement is earned', () => {
    const all = TITLES.filter(
      (title) => title.category !== 'campaign' && title.rewards?.digiEggPool?.length
    ).map((title) => earned(title.id));
    expect(nextPartnerReward(all, { tasks: 1000, streak: 365, battles: 1000 })).toBeNull();
  });
});
