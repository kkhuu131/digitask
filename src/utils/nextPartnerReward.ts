import { TITLES } from '../constants/titles';
import type { UserTitle } from '../store/titleStore';

export interface PartnerProgress {
  tasks: number;
  streak: number;
  battles: number;
}

export function nextPartnerReward(
  earned: UserTitle[],
  progress: PartnerProgress | null,
  requirementType?: string
) {
  const records = new Map(earned.map((record) => [record.title_id, record]));
  const rewards = TITLES.filter(
    (title) =>
      !!title.rewards?.digiEggPool?.length &&
      (!requirementType ||
        (title.category !== 'campaign' && title.requirement_type === requirementType))
  );
  const ready = rewards
    .filter((title) => records.get(title.id)?.claimed_at === null)
    .sort((a, b) => Number(a.category === 'campaign') - Number(b.category === 'campaign'))[0];
  if (ready)
    return {
      title: ready,
      ready: true,
      userTitleId: records.get(ready.id)!.id,
      current: null,
      target: null,
    };
  const remaining = rewards.filter(
    (title) => title.category !== 'campaign' && !records.has(title.id)
  );
  if (!remaining.length) return null;
  const count = (type: string) =>
    type === 'tasks_completed'
      ? progress?.tasks
      : type === 'longest_streak'
        ? progress?.streak
        : type === 'battle_wins'
          ? progress?.battles
          : undefined;
  const measured = remaining
    .filter((title) => count(title.requirement_type) !== undefined)
    .map((title) => ({
      title,
      current: Math.min(count(title.requirement_type)!, Number(title.requirement_value)),
      target: Number(title.requirement_value),
    }))
    .sort((a, b) => b.current / b.target - a.current / a.target);
  const next = measured[0];
  return {
    title: next?.title ?? remaining[0],
    ready: false,
    userTitleId: null,
    current: next?.current ?? null,
    target: next?.target ?? null,
  };
}
