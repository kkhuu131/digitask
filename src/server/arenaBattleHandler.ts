import { calculateUserPowerRating, generateBattleOption } from '../engine/arenaOpponents';
import { simulateArena, ARENA_ENGINE_VERSION } from '../engine/arenaReplay';
import { convertToBattleDigimon } from '../utils/convertToBattleDigimon';

export interface ArenaServerDependencies {
  authenticate: (token: string) => Promise<string | null>;
  rpc: (name: string, args: Record<string, unknown>) => Promise<any>;
  insertOffers: (offers: Record<string, unknown>[]) => Promise<any[]>;
}
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function createArenaBattleHandler(deps: ArenaServerDependencies) {
  return async (request: Request): Promise<Response> => {
    const respond = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return respond({ error: 'Method not allowed' }, 405);
    try {
      const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
      if (!token) return respond({ error: 'Sign in to use the arena' }, 401);
      const userId = await deps.authenticate(token);
      if (!userId) return respond({ error: 'Session expired. Please sign in again.' }, 401);
      const body = await request.json();
      if (body.action === 'options') {
        const context = await deps.rpc('arena_battle_context', { p_user_id: userId });
        let offers = context.offers;
        // A completed fight invalidates one option; issue a fresh complete set.
        if (offers.length !== 3 || body.forceRefresh === true) {
          if (!context.party.length)
            return respond({ offers: [], pending: context.pending, latest: context.latest });
          const rated = context.party.filter((d: any) => d.is_on_team);
          const power = calculateUserPowerRating(rated.length ? rated : context.party);
          offers = await deps.insertOffers(
            ['easy', 'medium', 'hard'].map((difficulty) => {
              const option = generateBattleOption(power, difficulty);
              return {
                user_id: userId,
                difficulty,
                opponent_name: option.team.username,
                opponent_team: option.team.digimon,
              };
            })
          );
        }
        return respond({ offers, pending: context.pending, latest: context.latest });
      }
      if (body.action !== 'start' && body.action !== 'resume')
        return respond({ error: 'Invalid arena action' }, 400);
      if (typeof body.requestId !== 'string')
        return respond({ error: 'Missing battle request ID' }, 400);
      const prepared = await deps.rpc('prepare_arena_battle', {
        p_user_id: userId,
        p_request_id: body.requestId,
        p_offer_id: body.action === 'start' ? body.offerId : null,
        p_team_ids: body.action === 'start' ? body.teamIds : null,
        p_strategies: body.action === 'start' ? body.strategies : null,
      });
      if (prepared.status === 'settled') return respond({ battle: prepared });
      if (prepared.engine_version !== ARENA_ENGINE_VERSION) {
        return respond(
          { error: 'This pending battle needs its original engine version. No ticket was spent.' },
          409
        );
      }
      const snapshot = prepared.snapshot;
      const userTeam = snapshot.user_team.map((d: any) => convertToBattleDigimon(d, true));
      const opponentTeam = snapshot.opponent_team.map((d: any) => convertToBattleDigimon(d, false));
      const replay = simulateArena(
        userTeam,
        opponentTeam,
        snapshot.strategies,
        Number(prepared.seed)
      );
      const battle = await deps.rpc('settle_arena_battle', {
        p_user_id: userId,
        p_request_id: prepared.id,
        p_replay: replay,
      });
      return respond({ battle });
    } catch (error) {
      // No charge occurs until settlement. Retrying uses the same saved request and seed.
      const message =
        error instanceof Error ? error.message : 'Unable to start battle. Please retry.';
      return respond({ error: message }, 400);
    }
  };
}
