# Battle System Rework — Implementation Plan

## Overview

Two changes to the battle system:

1. **Daily AI Battles** — minor rename/cleanup of the existing Arena mode. Remove real-player matching; all opponents are always AI-generated.
2. **Weekly Tournament** — bracket-style tournament unlocked by weekly task completion. 8-team bracket visualization, 3 real rounds (QF → SF → GF). Replaces Campaign mode.

Async PvP is out of scope — "Coming Soon" placeholder card in BattleHub only.

---

## Part 1 — Daily AI Battles (Arena Rename)

### What Changes
- Rename "Arena" → "Daily AI Battles" everywhere it appears
- In `battleStore.getBattleOptions()`: remove the `get_random_users` RPC call and the real-player matching block entirely. All 3 options always generate wild AI teams.
- All other logic unchanged: ticket cost, rewards, daily cache, first-win bonus.

### Files Affected
- `src/pages/BattleHub.tsx` — card title, description, feature list
- `src/store/battleStore.ts` — remove real-player lookup from `getBattleOptions`

---

## Part 2 — Weekly Tournament

### Concept
- Every week (Monday–Sunday) users can participate in **one tournament**
- Entry unlocks after completing **10 tasks** that calendar week (Mon–Sun)
- A notification fires when the user crosses the 10-task threshold
- Tournament = 3 sequential rounds: Quarterfinal → Semifinal → Grand Final
- Lose any round = eliminated for the week; consolation bits awarded immediately
- Win all 3 = Champion; large bits reward
- Each round costs **1 battle ticket** (same as arena)
- In-progress tournament expires at Monday midnight; no partial-completion carry-over
- All battles use the existing `InteractiveBattle` component and `interactiveBattleStore` — no new battle engine

---

## TypeScript Types

Define in `src/types/tournament.ts` (new file):

```typescript
export type TournamentStatus = 'active' | 'completed' | 'expired';
export type TournamentPlacement = 'qf_loss' | 'sf_loss' | 'gf_loss' | 'champion';
export type RoundDifficulty = 'easy' | 'medium' | 'hard';

export interface TournamentOpponentDigimon {
  id: string;           // e.g. "123-0", "123-1" (digimon_id + index)
  digimon_id: number;
  name: string;
  current_level: number;
  sprite_url: string;
  type: string;
  attribute: string;
  // NOTE: No `digimon` property stored here — enriched from DIGIMON_LOOKUP_TABLE at battle time
}

export interface TournamentRound {
  round_name: string;
  difficulty: RoundDifficulty;
  opponent: {
    display_name: string;
    boss_team_id?: string;  // only set for round 3
    team: TournamentOpponentDigimon[];
  };
}

export interface BracketSlot {
  slot: number;
  name: string;
  is_user?: boolean;
  is_real_opponent?: boolean;
  is_boss?: boolean;
  is_silhouette?: boolean;
  round?: number;  // which round this opponent appears in (1, 2, or 3)
}

export interface TournamentBracket {
  rounds: Record<'1' | '2' | '3', TournamentRound>;
  visual_bracket: { slots: BracketSlot[] };
}

export interface RoundResult {
  round: number;
  result: 'win' | 'loss';
  placement_bits: number;
  // turns intentionally omitted — large payload, not needed for display
}

export interface UserTournament {
  id: string;
  user_id: string;
  week_start: string;       // ISO date string: "2026-03-16"
  status: TournamentStatus;
  current_round: number;    // 1 | 2 | 3
  bracket: TournamentBracket;
  round_results: RoundResult[];
  final_placement: TournamentPlacement | null;
  created_at: string;
}
```

---

## Database

### New Table: `user_tournaments`

```sql
CREATE TABLE public.user_tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  status text NOT NULL DEFAULT 'active',
  current_round integer NOT NULL DEFAULT 1,
  bracket jsonb NOT NULL,
  round_results jsonb NOT NULL DEFAULT '[]',
  final_placement text DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE public.user_tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own tournaments"
  ON public.user_tournaments
  FOR ALL
  USING (auth.uid() = user_id);
```

**`week_start` calculation:** Always computed server-side using `CURRENT_DATE - ((EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1))` to get the Monday of the current ISO week. Passed as a constant from the client using the same formula in TypeScript to avoid clock drift issues:

```typescript
// Returns "YYYY-MM-DD" for the Monday of the current week (local time)
function getCurrentWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysFromMonday);
  return monday.toISOString().split('T')[0];
}
```

### Weekly Task Count Query

No new table. Computed in `tournamentStore.getWeeklyTaskCount()`:

```typescript
async function getWeeklyTaskCount(userId: string): Promise<number> {
  const weekStart = getCurrentWeekStart();
  const today = new Date().toISOString().split('T')[0];

  // Sum task_history for Mon–yesterday (snapshots written by nightly cron)
  const { data: history } = await supabase
    .from('task_history')
    .select('completed_count')
    .eq('user_id', userId)
    .gte('created_at', weekStart)
    .lt('created_at', today);

  const historicalCount = (history ?? []).reduce(
    (sum, row) => sum + (row.completed_count ?? 0), 0
  );

  // Add today's live count from daily_quotas
  const { data: quota } = await supabase
    .from('daily_quotas')
    .select('completed_today')
    .eq('user_id', userId)
    .single();

  return historicalCount + (quota?.completed_today ?? 0);
}
```

---

## `generateBattleOption` Refactor

The existing `generateBattleOption(powerRating, difficulty)` in `battleStore.ts` internally reads `useDigimonStore.getState().allUserDigimon.length` to determine team size. Extract it so tournament generation can call it cleanly:

```typescript
// New signature — teamSize passed explicitly, no store dependency
export function generateWildTeam(
  userPowerRating: number,
  difficulty: 'easy' | 'medium' | 'hard',
  teamSize: number = 3
): TournamentOpponentDigimon[]
```

The internal `generateBattleOption` wrapper in battleStore keeps calling this with `teamSize = Math.min(3, useDigimonStore.getState().allUserDigimon.length)`. No behaviour change.

The extracted function returns **only the team array** (not the full `BattleOption` wrapper), since that's all the tournament needs. The returned items match `TournamentOpponentDigimon` shape.

---

## New Constant: `src/constants/tournamentBossTeams.ts`

```typescript
import { TournamentOpponentDigimon } from '../types/tournament';

export interface TournamentBossTeam {
  id: string;
  name: string;
  description: string;
  achievement_id: string;
  team: TournamentOpponentDigimon[];
}

export const TOURNAMENT_BOSS_TEAMS: TournamentBossTeam[] = [
  {
    id: 'the_challenger',
    name: 'The Challenger',
    description: 'A powerful team assembled from the strongest Digimon in the Digital World.',
    achievement_id: 'defeat_the_challenger',
    team: [
      // TODO: Developer fills in with real handcrafted Mega/Ultra-tier Digimon
      // Each entry: { id, digimon_id, name, current_level, sprite_url, type, attribute }
    ],
  },
];
```

---

## Reward Structure

**Placement bonuses** — paid on top of the normal per-battle XP/bits from `InteractiveBattle`:

| Placement | Bonus Bits | Notes |
|-----------|-----------|-------|
| QF loss   | 100       | Consolation — paid immediately on loss |
| SF loss   | 300       | |
| GF loss   | 600       | |
| Champion  | 1,500     | + achievement hook (future) |

Placement bonus is awarded via `currencyStore.addCurrency('bits', amount)` inside `recordRoundResult()`.

Per-battle XP and bits: `InteractiveBattle` runs with `showRewards={true}` and `battleOption={{ difficulty }}` — identical to regular arena. This means tournament battles also count toward `battles_won` / `battles_completed` stats and title checks, which is correct.

Tournament battles do **not** trigger the arena first-win daily bonus (`check_and_set_first_win_self`) — skip that call in `Tournament.tsx`'s `handleBattleComplete`.

---

## New Store: `src/store/tournamentStore.ts`

```typescript
interface TournamentStore {
  currentTournament: UserTournament | null;
  weeklyTaskCount: number;
  loading: boolean;
  error: string | null;

  fetchTournament(): Promise<void>;
  enterTournament(): Promise<void>;
  recordRoundResult(round: number, result: 'win' | 'loss'): Promise<void>;
  refreshWeeklyTaskCount(): Promise<void>;
  isUnlocked(): boolean;
  isActive(): boolean;
  isCompleted(): boolean;
  getCurrentRoundOpponent(): TournamentRound['opponent'] | null;
}
```

### `fetchTournament()`
1. Compute `weekStart = getCurrentWeekStart()`
2. Query `user_tournaments WHERE user_id = me AND week_start = weekStart`
3. If row exists and `status = 'active'`: set as `currentTournament`
4. If row exists and `status = 'completed'` or `'expired'`: set as `currentTournament` (page handles display)
5. If no row: set `currentTournament = null`
6. Also calls `refreshWeeklyTaskCount()` in the same fetch to avoid double loading
7. **Stale expiry**: also query for any `status = 'active'` rows from previous weeks; update them to `status = 'expired'` client-side via `supabase.update()`. This is safe since `week_start < currentWeekStart` and RLS ensures users only see their own rows.

### `enterTournament()`
Guards:
- `weeklyTaskCount >= 10` — else throw "Complete 10 tasks this week to enter"
- `currentTournament === null` — else throw "Already entered this week"
- User has at least 1 Digimon on their team — else throw "Add Digimon to your team first"

Bracket generation:
```typescript
const userPower = calculateUserPowerRating(useDigimonStore.getState().allUserDigimon);
const teamSize = Math.min(3, useDigimonStore.getState().allUserDigimon.filter(d => d.is_on_team).length);

const round1Team = generateWildTeam(userPower, 'easy', teamSize);
const round2Team = generateWildTeam(userPower, 'medium', teamSize);
const bossTeam = TOURNAMENT_BOSS_TEAMS[Math.floor(Math.random() * TOURNAMENT_BOSS_TEAMS.length)];

const bracket: TournamentBracket = {
  rounds: {
    '1': { round_name: 'Quarterfinal', difficulty: 'easy',   opponent: { display_name: 'Shadow Team Alpha', team: round1Team } },
    '2': { round_name: 'Semifinal',    difficulty: 'medium', opponent: { display_name: 'Shadow Team Beta',  team: round2Team } },
    '3': { round_name: 'Grand Final',  difficulty: 'hard',   opponent: { display_name: bossTeam.name, boss_team_id: bossTeam.id, team: bossTeam.team } },
  },
  visual_bracket: {
    slots: [
      { slot: 1, name: 'You',                    is_user: true },
      { slot: 2, name: 'Shadow Team Alpha',       is_real_opponent: true, round: 1 },
      { slot: 3, name: '???',                     is_silhouette: true },
      { slot: 4, name: '???',                     is_silhouette: true },
      { slot: 5, name: bossTeam.name,             is_boss: true, round: 3 },
      { slot: 6, name: '???',                     is_silhouette: true },
      { slot: 7, name: 'Shadow Team Beta',        is_real_opponent: true, round: 2 },
      { slot: 8, name: '???',                     is_silhouette: true },
    ],
  },
};
```

Insert into `user_tournaments`; on success update local `currentTournament`.

### `recordRoundResult(round, result)`
- On **win** and `round < 3`: `UPDATE user_tournaments SET current_round = round + 1 WHERE id = ...`; update local state
- On **win** and `round === 3` (Champion): `UPDATE SET status = 'completed', final_placement = 'champion'`; award 1500 bits
- On **loss**: `UPDATE SET status = 'completed', final_placement = '{round}_loss'`; award consolation bits
- Append to `round_results` via `UPDATE SET round_results = round_results || '[{...}]'::jsonb`

**Race condition protection:** Use a single `UPDATE ... WHERE id = $id AND current_round = $round AND status = 'active'` guard. If 0 rows updated, the state is stale — re-fetch and surface an error. This prevents double-submits.

### `getCurrentRoundOpponent()`
Returns `currentTournament?.bracket.rounds[String(currentTournament.current_round) as '1'|'2'|'3']?.opponent ?? null`

### `isUnlocked()` / `isActive()` / `isCompleted()`
Simple derived booleans for use in the page and BattleHub card.

---

## New Component: `src/components/TournamentBracket.tsx`

Visual-only. Purely driven by props — no store dependency. Easy to test and reuse.

```typescript
interface TournamentBracketProps {
  bracket: TournamentBracket | null;       // null = not entered yet
  roundResults: RoundResult[];
  currentRound: number;                    // 1 | 2 | 3
  finalPlacement: TournamentPlacement | null;
  weeklyTaskCount: number;
  isCompleted: boolean;
  userActiveDigimonName?: string;          // for user's avatar sprite
}
```

### Visual Layout

Standard single-elimination tree. On desktop (md+), two halves side by side. On mobile, a vertical linear view showing only the user's 3-match path (bracket collapses to a simpler card list — no room for the full tree).

```
Desktop (md+):
┌─────────────────────────────────────────────────────────────┐
│  [You]          ─┐                                          │
│                   ├─ [QF result] ─┐                         │
│  [QF Opponent]  ─┘                ├─ [SF result] ─┐         │
│  [??? silhouette]─┐               │               │         │
│                   ├─ [???]        ┘               ├─ [GF]   │
│  [??? silhouette]─┘                               │         │
│  [Boss Team]    ─┐                ┌─ [???]        │         │
│                   ├─ [???] ───────┘               │         │
│  [??? silhouette]─┘               ┌─ [???] ───────┘         │
│  [SF Opponent]  ─┐                │                         │
│                   ├─ [???] ───────┘                         │
│  [??? silhouette]─┘                                         │
└─────────────────────────────────────────────────────────────┘

Mobile (< md): vertical card list
  Round 1 — Quarterfinal   [Opponent card]  [Win/Loss badge or "Up next"]
  Round 2 — Semifinal      [Opponent card]  [Win/Loss badge or "Locked"]
  Round 3 — Grand Final    [Boss card]      [Win/Loss badge or "Locked"]
```

### Slot Rendering Rules

| Slot type | Appearance |
|-----------|-----------|
| `is_user` | User's active Digimon sprite (via `DigimonSprite`), username |
| `is_real_opponent` | Silhouetted Digimon sprite (CSS `brightness(0)` or dark overlay), team display name |
| `is_boss` | Boss name in accent/gold color, distinctive icon (e.g. crown or star), slightly larger card |
| `is_silhouette` | "???" text, blurred placeholder Digimon sprite |

### Path Highlighting

- User's won matches: connector lines animate in with a gold/green color
- Pending next match: connector pulses subtly (Tailwind `animate-pulse`)
- Eliminated path: grayed out, ✗ icon on the losing match

### Pre-entry state (bracket is null)
- All opponent slots show as silhouettes
- Boss slot: name is revealed ("tantalizing") but team hidden
- Lock overlay on user's path with progress bar: `X / 10 tasks`

---

## New Page: `src/pages/Tournament.tsx`

### Page States

**State 1 — Locked** (`weeklyTaskCount < 10`, no tournament)
- Bracket rendered with pre-entry state (silhouettes + lock)
- Progress bar prominently shown: "{X} / 10 tasks this week"
- Motivational message: "Complete your daily tasks to unlock this week's tournament"

**State 2 — Unlocked, Not Entered** (`weeklyTaskCount >= 10`, `currentTournament === null`)
- Full bracket rendered with silhouettes (boss name visible)
- Prize table shown (QF/SF/GF/Champion bits)
- "Enter Tournament" button — accent colour, prominent
- Rules summary: 3 rounds, 1 ticket each, lose = eliminated
- Entry checks: if user has 0 team Digimon, button is disabled with tooltip "Add Digimon to your team"
- If 0 battle tickets, button is still enabled — ticket check happens at fight time, not entry

**State 3 — Active Tournament** (`currentTournament.status === 'active'`)
- Bracket with progress highlighted
- Current round card: round name, opponent team preview (Digimon sprites + level)
- Ticket check: if `battleTickets === 0`, "Fight" button is disabled with message "Complete tasks to earn more tickets"
- "Fight (1 🎫)" button
- On click: spend ticket → `startInteractiveBattle(enrichedUserTeam, enrichedOpponentTeam)` → `isBattleActive = true`
- `InteractiveBattle` renders inline (replaces the round card, same as Campaign pattern)
- On `onBattleComplete`: calls `handleBattleComplete(result)` → shows inter-round result screen

**Inter-round result screen** (between rounds, ~3 seconds then auto-advance or button to continue):
- Large win/loss indicator with Digimon sprite animation
- If win: "Victory! Advancing to {next round name}" + continue button
- If loss: "Defeated. You reached the {placement}" + bits earned summary

**State 4 — Completed / Expired** (`status === 'completed'` or `'expired'`)
- Final placement badge (styled: QF = bronze, SF = silver, GF = gold, Champion = rainbow/special)
- Total bits earned this tournament
- Bracket showing how far user got (rest grayed out)
- "Next tournament opens Monday" with countdown timer or date

### `handleBattleComplete` in Tournament.tsx

This mirrors the logic in `Battle.tsx`'s `handleInteractiveBattleComplete` with two differences:
1. No `check_and_set_first_win_self()` call
2. After the normal per-battle rewards, calls `tournamentStore.recordRoundResult(round, result)`

```typescript
const handleBattleComplete = async (result: { winner: 'user' | 'opponent'; turns: any[] }) => {
  const currentRound = currentTournament!.current_round;
  const roundData = tournamentStore.getCurrentRoundOpponent()!;

  // 1. Calculate and award per-battle XP (same formula as Battle.tsx)
  // 2. Calculate and award per-battle bits (same formula as Battle.tsx)
  // 3. Insert into team_battles (for history + trigger-based stats)
  // 4. Check battle titles via useTitleStore.checkBattleTitles()
  // 5. endInteractiveBattle() — MUST be called before recordRoundResult to reset state
  // 6. tournamentStore.recordRoundResult(currentRound, result.winner === 'user' ? 'win' : 'loss')
  //    → This awards placement bits and advances current_round or completes the tournament
  // 7. Set local showRoundResult = true to render the inter-round screen
};
```

**Critical:** `endInteractiveBattle()` must be called before showing the inter-round screen, so that when the user clicks "Continue to next round" and presses "Fight" again, `isBattleActive` is false and a fresh `startInteractiveBattle` can be called.

### Opponent Team Enrichment

Stored bracket data has minimal Digimon shape (`digimon_id`, `name`, `level`, etc. but **no `digimon` property**). Enrich at battle time, identical to `Battle.tsx` lines 117–121:

```typescript
const opponentTeamData = roundOpponent.team.map(d => ({
  ...d,
  digimon_id: d.digimon_id,
  digimon: DIGIMON_LOOKUP_TABLE[d.digimon_id as keyof typeof DIGIMON_LOOKUP_TABLE],
}));
```

---

## Updated `src/pages/BattleHub.tsx`

Four cards:

| # | Title | Status |
|---|-------|--------|
| 1 | Daily AI Battles | Active |
| 2 | Weekly Tournament | Active (new) |
| 3 | Neemon's Store | Active |
| 4 | PvP Arena | Disabled — "Coming Soon" badge |

On mount, call `tournamentStore.fetchTournament()` to populate the tournament card status.

**Tournament card status display:**
- `weeklyTaskCount < 10`: lock icon + "{X}/10 tasks"
- Unlocked, not entered: pulsing "Open!" badge
- Active (round 1): "Round 1 — Quarterfinal"
- Active (round 2): "Round 2 — Semifinal"
- Active (round 3): "Round 3 — Grand Final"
- Completed (champion): "🏆 Champion!"
- Completed (other): "Completed — {placement}"
- Expired: "Come back Monday"

---

## Notification in `src/store/taskStore.ts`

After granting the battle ticket, check if the weekly tournament threshold was just crossed. To avoid an extra DB call on every task completion, use the already-loaded tournament store state:

```typescript
// After grant_energy_self(1) + dispatch('energy-updated'):

// Check weekly tournament unlock (non-blocking, don't await)
const tournamentStore = useTournamentStore.getState();
const prevCount = tournamentStore.weeklyTaskCount;
// Optimistically increment the cached count — avoids a DB roundtrip
tournamentStore.setWeeklyTaskCount(prevCount + 1);
if (prevCount < 10 && prevCount + 1 >= 10) {
  useNotificationStore.getState().addNotification({
    type: 'success',
    message: '🏆 Weekly Tournament is now open! Head to the Battle Hub to enter.',
    duration: 8000,
  });
}
```

Add `setWeeklyTaskCount(count: number): void` to the tournament store — a simple setter that updates `weeklyTaskCount` in state.

The tournament store will re-fetch the real count on next `fetchTournament()` call (e.g., navigating to BattleHub or Tournament), so the optimistic value is only ever shown briefly.

---

## Routing: `src/App.tsx`

```tsx
// Add:
<Route path="/tournament" element={<ProtectedRoute><Tournament /></ProtectedRoute>} />

// Remove:
<Route path="/campaign" element={...} />
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/migrations/add_user_tournaments.sql` | DB table + RLS |
| `src/types/tournament.ts` | Shared TypeScript types |
| `src/constants/tournamentBossTeams.ts` | Curated boss teams (placeholder) |
| `src/store/tournamentStore.ts` | Tournament state + logic |
| `src/components/TournamentBracket.tsx` | Bracket visualization |
| `src/pages/Tournament.tsx` | Main tournament page |

## Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/tournament` route, remove `/campaign` route |
| `src/pages/BattleHub.tsx` | Swap Campaign → Tournament card + PvP placeholder; rename Arena |
| `src/store/battleStore.ts` | Extract `generateWildTeam()` export, remove real-player lookup |
| `src/store/taskStore.ts` | Weekly unlock notification + optimistic count increment |

## Files to Delete

| File | Reason |
|------|--------|
| `src/pages/Campaign.tsx` | Replaced by Tournament |
| `src/constants/campaignOpponents.ts` | Unused; verify no imports remain before deleting |

---

## Implementation Order

1. `src/types/tournament.ts` — types first, everything else depends on them
2. `supabase/migrations/add_user_tournaments.sql` — DB migration
3. `battleStore.ts` — extract `generateWildTeam()` as standalone export
4. `tournamentBossTeams.ts` — placeholder constant
5. `tournamentStore.ts` — full store
6. `TournamentBracket.tsx` — visual component (props-only, no store dependency)
7. `Tournament.tsx` — main page
8. `BattleHub.tsx` — swap cards
9. `taskStore.ts` — notification + optimistic count
10. `App.tsx` — routing swap
11. Delete `Campaign.tsx` and `campaignOpponents.ts`

---

## Out of Scope

- **Async PvP** — placeholder card only, no implementation
- **Curated boss teams** — developer fills in `tournamentBossTeams.ts` after launch
- **Boss defeat achievements** — `achievement_id` field is wired in; unlock logic is future work
- **Tournament history** — only the current week's tournament is surfaced in the UI; past rows stay in DB but no history page
- **Admin tooling** — boss teams managed via the constant file only
