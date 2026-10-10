import { describe, expect, it } from 'vitest';
import type { UserDigimon } from '../../store/petStore';
import {
  adjustAllocation,
  allocationTotal,
  bonusSnapshot,
  EMPTY_ALLOCATION,
  previewAllocation,
} from '../../utils/statAllocation';

const pet = {
  abi: 0,
  hp_bonus: 15,
  sp_bonus: 0,
  atk_bonus: 0,
  def_bonus: 0,
  int_bonus: 0,
  spd_bonus: 0,
} as UserDigimon;

describe('bonus stat drafts', () => {
  it('accepts rapid adjustments across stats only up to the combined cap', () => {
    let draft = EMPTY_ALLOCATION;
    const saved = { HP: 10, ATK: 10 };
    for (let i = 0; i < 10; i++) {
      draft = adjustAllocation(draft, i % 2 ? 'HP' : 'ATK', 1, pet, saved);
    }
    expect(allocationTotal(draft)).toBe(5);
    expect(previewAllocation(pet, draft).hp_bonus).toBe(17);
    expect(previewAllocation(pet, draft).atk_bonus).toBe(3);
    expect(pet.hp_bonus).toBe(15);
  });
  it('limits each stat to its saved balance independently', () => {
    let draft = adjustAllocation(EMPTY_ALLOCATION, 'HP', 1, pet, { HP: 1 });
    draft = adjustAllocation(draft, 'HP', 1, pet, { HP: 1 });
    draft = adjustAllocation(draft, 'SP', 1, pet, { HP: 1 });
    expect(draft.HP).toBe(1);
    expect(draft.SP).toBe(0);
  });
  it('undoes only draft points and frees a slot for another stat', () => {
    let draft = { ...EMPTY_ALLOCATION, ATK: 5 };
    draft = adjustAllocation(draft, 'HP', -1, pet, { HP: 2, ATK: 5 });
    expect(draft.HP).toBe(0);
    draft = adjustAllocation(draft, 'ATK', -1, pet, { HP: 2, ATK: 5 });
    draft = adjustAllocation(draft, 'HP', 1, pet, { HP: 2, ATK: 5 });
    expect(draft).toEqual({ ...EMPTY_ALLOCATION, HP: 1, ATK: 4 });
    expect(bonusSnapshot(pet).HP).toBe(15);
  });
  it('uses the current ABI and blocks already over-cap partners', () => {
    expect(
      adjustAllocation(EMPTY_ALLOCATION, 'HP', 1, { ...pet, hp_bonus: 21 }, { HP: 10 })
    ).toEqual(EMPTY_ALLOCATION);
    expect(
      adjustAllocation(EMPTY_ALLOCATION, 'HP', 1, { ...pet, hp_bonus: 20, abi: 1 }, { HP: 10 }).HP
    ).toBe(1);
  });
});
