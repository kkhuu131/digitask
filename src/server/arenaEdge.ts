import { createArenaBattleHandler } from './arenaBattleHandler';

// Supabase injects these into Edge Functions. This file is bundled for Deno.
declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Promise<Response>): void;
};
const url = Deno.env.get('SUPABASE_URL')!;
const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
if (!url || !anonKey || !serviceKey) throw new Error('Missing server Supabase configuration');

async function rest(path: string, body: unknown, prefer?: string) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message ?? 'Database operation failed');
  return result;
}
Deno.serve(
  createArenaBattleHandler({
    authenticate: async (token) => {
      const response = await fetch(`${url}/auth/v1/user`, {
        headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return null;
      return (await response.json()).id ?? null;
    },
    rpc: (name, args) => rest(`rpc/${name}`, args),
    insertOffers: (offers) => rest('arena_battle_offers', offers, 'return=representation'),
  })
);
