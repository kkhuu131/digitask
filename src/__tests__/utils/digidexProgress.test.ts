import { expect, it } from 'vitest';
import { DIGIMON_LOOKUP_TABLE } from '../../constants/digimonLookup';
import {
  DIGIDEX_TOTAL,
  getDigidexPercentage,
  getDigidexProgress,
} from '../../utils/digidexProgress';

it('uses the whole catalog and the same percentage for every discovery display', () => {
  const ids = Object.values(DIGIMON_LOOKUP_TABLE).map((digimon) => digimon.id);
  expect(DIGIDEX_TOTAL).toBe(new Set(ids).size);
  expect(getDigidexProgress(ids)).toEqual({
    count: DIGIDEX_TOTAL,
    total: DIGIDEX_TOTAL,
    percentage: 100,
  });
  const progress = getDigidexProgress([...ids.slice(0, 50), ids[0], -1]);
  expect(progress.count).toBe(50);
  expect(progress.percentage).toBe(getDigidexPercentage(50));
  expect(progress.percentage).toBe(Math.round((50 / ids.length) * 100));
  expect(getDigidexProgress([]).percentage).toBe(0);
});
