import { supabase } from './supabase';
import type { Database } from '../types/database.types';

export type DigimonHistoryEntry = Database['public']['Tables']['user_digimon_history']['Row'];

// Supabase caps each response: fetch every page without imposing a history limit.
export async function fetchDigimonHistory(petId: string): Promise<DigimonHistoryEntry[]> {
  const entries: DigimonHistoryEntry[] = [];
  const pageSize = 500;
  let hasMore = true;
  while (hasMore) {
    const { data, error } = await supabase
      .from('user_digimon_history')
      .select('*')
      .eq('user_digimon_id', petId)
      .order('id', { ascending: true })
      .range(entries.length, entries.length + pageSize - 1);
    if (error) throw error;
    const page = (data ?? []) as DigimonHistoryEntry[];
    entries.push(...page);
    hasMore = page.length === pageSize;
  }
  return entries;
}
