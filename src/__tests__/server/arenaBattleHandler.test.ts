import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createArenaBattleHandler } from '../../server/arenaBattleHandler';

const request = (body: unknown, auth = true) =>
  new Request('https://example.test/arena-battle', {
    method: 'POST',
    headers: auth ? { Authorization: 'Bearer user-token' } : {},
    body: JSON.stringify(body),
  });
describe('arena server request boundary', () => {
  const authenticate = vi.fn();
  const rpc = vi.fn();
  const insertOffers = vi.fn();
  const handler = createArenaBattleHandler({ authenticate, rpc, insertOffers });
  beforeEach(() => {
    vi.resetAllMocks();
    authenticate.mockResolvedValue('verified-user');
  });
  it('rejects missing and invalid authentication before database access', async () => {
    expect((await handler(request({ action: 'options' }, false))).status).toBe(401);
    authenticate.mockResolvedValue(null);
    expect((await handler(request({ action: 'options' }))).status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
  });
  it('returns a committed result on retry without another simulation or settlement', async () => {
    const saved = {
      id: 'same-request',
      user_id: 'verified-user',
      status: 'settled',
      replay: { winner: 'user' },
    };
    rpc.mockResolvedValue(saved);
    const response = await handler(
      request({
        action: 'start',
        requestId: 'same-request',
        userId: 'spoofed-user',
        offerId: 'offer',
        teamIds: ['pet'],
        strategies: ['balanced'],
        bitsReward: 999999,
      })
    );
    expect(await response.json()).toEqual({ battle: saved });
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc.mock.calls[0][1].p_user_id).toBe('verified-user');
    expect(rpc.mock.calls[0][1]).not.toHaveProperty('bitsReward');
  });
  it('leaves a prepared request uncharged if simulation cannot run', async () => {
    rpc.mockResolvedValue({ status: 'prepared', engine_version: 999 });
    const response = await handler(request({ action: 'resume', requestId: 'pending' }));
    expect(response.status).toBe(409);
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).not.toHaveBeenCalledWith('settle_arena_battle', expect.anything());
  });
  it('reuses server-issued offers without generating replacements', async () => {
    const context = {
      offers: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      pending: null,
      latest: null,
    };
    rpc.mockResolvedValue(context);
    expect(await (await handler(request({ action: 'options' }))).json()).toEqual(context);
    expect(insertOffers).not.toHaveBeenCalled();
  });
  it('keeps saved results accessible after the user no longer has party Digimon', async () => {
    const latest = { id: 'saved-battle', status: 'settled' };
    rpc.mockResolvedValue({ offers: [], party: [], pending: null, latest });
    const response = await handler(request({ action: 'options' }));
    expect(await response.json()).toEqual({ offers: [], pending: null, latest });
    expect(insertOffers).not.toHaveBeenCalled();
  });
});
