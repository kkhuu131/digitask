import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ range: vi.fn(), eq: vi.fn(), order: vi.fn() }));
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: mocks.eq,
      }),
    }),
  },
}));

import { fetchDigimonHistory } from '../../lib/digimonHistory';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.eq.mockReturnValue({ order: mocks.order });
  mocks.order.mockReturnValue({ range: mocks.range });
});

it('loads history beyond the API row limit and preserves repeated species in order', async () => {
  const records = Array.from({ length: 1001 }, (_, index) => ({
    id: index + 1,
    user_digimon_id: 'pet-a',
    digimon_id: index % 2 === 0 ? 1 : 2,
    recorded_at: '2026-09-18T00:00:00Z',
    is_starting_point: index === 0,
    is_backfilled: false,
  }));
  mocks.range.mockImplementation((start: number, end: number) =>
    Promise.resolve({ data: records.slice(start, end + 1), error: null })
  );
  expect(await fetchDigimonHistory('pet-a')).toEqual(records);
  expect(mocks.eq).toHaveBeenCalledWith('user_digimon_id', 'pet-a');
  expect(mocks.order).toHaveBeenCalledWith('id', { ascending: true });
});

it('reports a failed later page instead of presenting incomplete history', async () => {
  mocks.range
    .mockResolvedValueOnce({ data: Array.from({ length: 500 }, () => ({ id: 1 })), error: null })
    .mockResolvedValueOnce({ data: null, error: new Error('offline') });
  await expect(fetchDigimonHistory('pet-a')).rejects.toThrow('offline');
});
