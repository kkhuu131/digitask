import { supabase } from './supabase';
import type { ArenaReplay } from '../engine/arenaReplay';
import type { Strategy } from '../engine/arenaTypes';

export interface ArenaBattleIntent {
  requestId: string;
  offerId: string;
  teamIds: string[];
  strategies: Strategy[];
}
export interface SavedArenaBattle {
  id: string;
  status: 'prepared' | 'settled';
  snapshot: {
    difficulty: string;
    opponent_name: string;
    user_team: any[];
    opponent_team: any[];
    strategies: Strategy[];
  };
  replay: ArenaReplay | null;
  bits_reward: number | null;
  settled_at: string | null;
}
export interface ArenaContext {
  offers: {
    id: string;
    difficulty: 'easy' | 'medium' | 'hard';
    opponent_name: string;
    opponent_team: any[];
  }[];
  pending: SavedArenaBattle | null;
  latest: SavedArenaBattle | null;
}

async function invoke<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('arena-battle', { body });
  if (error) {
    let message = error.message;
    if (error.context instanceof Response) {
      try {
        message = (await error.context.clone().json()).error ?? message;
      } catch {
        /* Network error */
      }
    }
    throw new Error(message);
  }
  if (!data || data.error)
    throw new Error(data?.error ?? 'Arena response could not be confirmed. Retry the same battle.');
  return data;
}
export const fetchArenaContext = (forceRefresh = false) =>
  invoke<ArenaContext>({ action: 'options', forceRefresh });
export const startSavedArenaBattle = (intent: ArenaBattleIntent) =>
  invoke<{ battle: SavedArenaBattle }>({ action: 'start', ...intent });
export const resumeSavedArenaBattle = (requestId: string) =>
  invoke<{ battle: SavedArenaBattle }>({ action: 'resume', requestId });

const key = (userId: string) => `arena-start:${userId}`;
export function rememberArenaIntent(userId: string, intent: ArenaBattleIntent) {
  // Server state remains the source of truth if browser storage is unavailable.
  try {
    localStorage.setItem(key(userId), JSON.stringify(intent));
  } catch {
    /* Private browsing / quota */
  }
}
export function readArenaIntent(userId: string): ArenaBattleIntent | null {
  try {
    const intent = JSON.parse(localStorage.getItem(key(userId)) ?? 'null');
    return intent &&
      typeof intent.requestId === 'string' &&
      typeof intent.offerId === 'string' &&
      Array.isArray(intent.teamIds) &&
      Array.isArray(intent.strategies)
      ? intent
      : null;
  } catch {
    return null;
  }
}
export function forgetArenaIntent(userId: string) {
  try {
    localStorage.removeItem(key(userId));
  } catch {
    /* Optional cache */
  }
}
