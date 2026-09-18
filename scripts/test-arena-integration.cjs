// Local-only HTTP integration test. Never accepts production URLs or keys.
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const status = spawnSync(process.execPath, ['node_modules/supabase/dist/supabase.js',
  'status', '--output', 'json', '--agent', 'no'], { encoding: 'utf8' });
if (status.status !== 0) throw new Error('Start the local Supabase Auth/API stack first');
const settings = JSON.parse(status.stdout);
const api = new URL(settings.API_URL);
if (!['127.0.0.1', 'localhost'].includes(api.hostname) || api.port !== '54321') {
  throw new Error('Refusing to run fixtures outside the local Supabase API');
}
const anon = settings.ANON_KEY;
const service = settings.SERVICE_ROLE_KEY;
if (!anon || !service) throw new Error('Local credentials are unavailable');
const users = [];
async function call(path, method = 'GET', body, token = service, extra = {}) {
  return fetch(`${api.origin}/${path}`, {
    method, headers: { apikey: token === service ? service : anon,
      Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...extra },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}
async function json(path, method, body, token, extra) {
  const response = await call(path, method, body, token, extra);
  const text = await response.text();
  if (!response.ok) throw new Error(`Local ${path.split('?')[0]} failed (${response.status}): ${text}`);
  return text ? JSON.parse(text) : null;
}
async function createUser() {
  const tag = randomUUID(); const password = randomUUID() + 'Aa1!';
  const user = await json('auth/v1/admin/users', 'POST', {
    email: `arena-${tag}@example.invalid`, password, email_confirm: true,
  });
  users.push(user.id);
  const session = await json('auth/v1/token?grant_type=password', 'POST', {
    email: user.email, password,
  }, anon);
  return { id: user.id, token: session.access_token };
}
async function run() {
  try {
    let ready = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      try {
        const response = await call('functions/v1/arena-battle','POST',{ action: 'options' },anon);
        const body = await response.json();
        if (response.status === 401 && body.error === 'Session expired. Please sign in again.') { ready = true; break; }
      } catch { /* Edge Runtime is still starting. */ }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    if (!ready) throw new Error('Serve the local arena function before running HTTP integration tests');
    const user = await createUser();
    await json('rest/v1/profiles', 'POST', { id: user.id, username: `arena-${user.id}`, battle_energy: 3 });
    const pets = [18, 23, 24].map((id) => ({ id: randomUUID(), user_id: user.id,
      digimon_id: id, name: '', current_level: 20, is_on_team: true, is_in_storage: false }));
    await json('rest/v1/user_digimon', 'POST', pets);
    const endpoint = 'functions/v1/arena-battle';
    const anonymous = await call(endpoint, 'POST', { action: 'options' }, anon);
    assert.equal(anonymous.status, 401);
    const context = await json(endpoint, 'POST', { action: 'options' }, user.token);
    assert.equal(context.offers.length, 3);
    const offer = context.offers.find((o) => o.difficulty === 'medium');
    const requestId = randomUUID();
    const body = { action: 'start', requestId, offerId: offer.id, teamIds: pets.map((p) => p.id),
      strategies: ['aggressive', 'balanced', 'defensive'], winner: 'user', bitsReward: 999999 };
    const before = performance.now();
    // Two tabs/double click: both must receive one committed battle.
    const [first, retry] = await Promise.all([
      json(endpoint, 'POST', body, user.token), json(endpoint, 'POST', body, user.token),
    ]);
    const saved = first.battle;
    assert.equal(saved.status, 'settled');
    assert.deepEqual(saved, retry.battle);
    assert.equal(saved.bits_reward, saved.replay.winner === 'user' ? 200 : 50);
    const profile = (await json(`rest/v1/profiles?id=eq.${user.id}&select=battle_energy,battles_completed,battles_won`))[0];
    assert.equal(profile.battle_energy, 2);
    assert.equal(profile.battles_completed, 1);
    assert.equal(profile.battles_won, saved.replay.winner === 'user' ? 1 : 0);
    const currency = (await json(`rest/v1/user_currency?user_id=eq.${user.id}&select=bits`))[0];
    assert.equal(currency.bits, 2000 + saved.bits_reward);
    // Never play/complete an animation: the next visit still finds result/rewards.
    const reopened = await json(endpoint, 'POST', { action: 'options' }, user.token);
    assert.equal(reopened.latest.id, requestId);
    const resumed = await json(endpoint, 'POST', { action: 'resume', requestId }, user.token);
    assert.deepEqual(resumed.battle, saved);
    const forged = await call('rest/v1/rpc/settle_arena_battle', 'POST', {
      p_user_id: user.id, p_request_id: requestId, p_replay: { winner: 'user' },
    }, user.token);
    assert.equal(forged.ok, false);
    const other = await createUser();
    await json('rest/v1/profiles','POST',{ id: other.id, username: `arena-${other.id}`, battle_energy: 0 });
    const privateRows = await json('rest/v1/arena_battle_requests?select=id', 'GET', undefined, other.token);
    assert.deepEqual(privateRows, []);
    const crossUser = await call(endpoint, 'POST', { action: 'resume', requestId }, other.token);
    assert.equal(crossUser.ok, false);
    // Persist a start intent without charging, then disconnect during the Edge request.
    const interruptedId = randomUUID();
    await json('rest/v1/rpc/prepare_arena_battle','POST', {
      p_user_id: user.id, p_request_id: interruptedId, p_offer_id: reopened.offers[0].id,
      p_team_ids: pets.map((p) => p.id), p_strategies: ['balanced','balanced','balanced'],
    });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10);
    try {
      await fetch(`${api.origin}/${endpoint}`, { method: 'POST', signal: controller.signal,
        headers: { apikey: anon, Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resume', requestId: interruptedId }) });
    } catch (error) { if (error.name !== 'AbortError') throw error; }
    finally { clearTimeout(timer); }
    const recovered = await json(endpoint,'POST',{ action: 'resume', requestId: interruptedId },user.token);
    assert.equal(recovered.battle.id, interruptedId);
    assert.equal(recovered.battle.status, 'settled');
    const afterDisconnect = (await json(`rest/v1/profiles?id=eq.${user.id}&select=battle_energy,battles_completed`))[0];
    assert.equal(afterDisconnect.battle_energy,1);
    assert.equal(afterDisconnect.battles_completed,2);
    const afterCurrency = (await json(`rest/v1/user_currency?user_id=eq.${user.id}&select=bits`))[0];
    assert.equal(afterCurrency.bits,2000+saved.bits_reward+recovered.battle.bits_reward);
    console.log(`Local authenticated Edge flow passed: concurrent starts, aborted-request recovery, saved result without playback, resume and role isolation (${Math.round(performance.now() - before)}ms).`);
  } finally {
    // Delete only these freshly created local fixtures, in dependency order.
    for (const id of users) {
      for (const table of ['arena_battle_requests', 'arena_battle_offers', 'team_battles',
        'user_digimon', 'user_discovered_digimon', 'user_currency']) {
        await json(`rest/v1/${table}?user_id=eq.${id}`, 'DELETE');
      }
      await json(`rest/v1/profiles?id=eq.${id}`, 'DELETE');
      await json(`auth/v1/admin/users/${id}`, 'DELETE');
    }
    console.log('Local integration fixtures removed.');
  }
}
run().catch((error) => { console.error(error.message); process.exitCode = 1; });
