# Achievement development

Read this before adding, changing or retiring achievements. Follow
[AGENTS.md](AGENTS.md) and [the database workflow](supabase/README.md) for checks,
migrations and deployment. This describes the current implementation; inspect
callers before changing behavior. Historical deployment status belongs in
[DATABASE_AUDIT.md](DATABASE_AUDIT.md).

## Implementation map

| Concern | Owner |
| --- | --- |
| IDs, names, categories, tiers, requirements and client reward pools | `src/constants/titles.ts` |
| Earned records, eligibility checks, claims and profile pins | `src/store/titleStore.ts` |
| Cards, filters, requirement text and DigiEgg selection entry point | `src/pages/AchievementsPage.tsx` |
| Combined dashboard Achievements panel | `AchievementsCallout` in `src/pages/Dashboard.tsx` |
| Partner progress display and counter reads | `src/components/NextPartnerReward.tsx` |
| Next reward selection, including per-route filtering | `src/utils/nextPartnerReward.ts` |
| Historical tournament eligibility | `src/utils/achievementProgress.ts` |
| Seeded partner choices | `src/components/DigiEggSelectionModal.tsx` |
| Server reward catalog for fresh databases | `supabase/seeds/achievement-catalog.sql` |
| Atomic server claim | `supabase/schemas/functions/claim_achievement.sql` |
| Catalog parity and SQL fixture runner | `scripts/test-database.cjs` |

`titles` defines achievements; `user_titles` records individual earned
achievements. A `user_titles` row with `claimed_at = null` is earned but unclaimed.
No row means locked. The claim RPC takes the earned row ID, not the catalog title
ID. Catalog IDs are persistent identities: do not reuse retired IDs.

## Adding or changing an achievement

1. Update `Title` and `TITLES` in `src/constants/titles.ts`. Use an unused ID and
   define its category, requirement type/value, tier and rewards. Only a nonempty
   `rewards.digiEggPool` grants a partner. Bits-only titles are not partner paths.
   Validate every pool ID against the species catalog; avoid duplicate IDs.
2. Update `supabase/seeds/achievement-catalog.sql` and add a new explicit data
   migration for the existing database's `public.titles` row, including
   `reward_bits` and `reward_digimon_ids`. A client-only catalog edit cannot change
   server rewards. Schema generation does not capture reference-data changes.
   The seed's conflict clause updates rewards only: name, description or
   requirement changes on existing rows need explicit SQL too. Never edit an
   applied migration.
3. Extend the appropriate eligibility check in `titleStore`. New requirement
   types need actual earning logic, not just a catalog entry. Wire it into the
   action that changes that progress, and review page initialization/rechecks.
   General `checkForNewTitles` currently rechecks tournaments, collection,
   battles and tasks; evolution and streaks have separate action-driven checks.
4. Review existing-user eligibility. If historical progress should qualify,
   implement a tested, idempotent backfill using authoritative stored data.
   Preserve existing earned records, claims and pins. Do not reset claims or
   regrant rewards when updating catalog definitions.
5. Update `AchievementsPage` category labels/filters and `formatRequirement`
   for new categories or requirement types. Review profile title consumers too.
6. For a DigiEgg achievement, review both partner-progress surfaces below.
   Existing supported numeric routes pick up new milestones automatically;
   a new route requires counter mapping and a display row. Do not silently
   interpret a new requirement as evolution.
7. Add meaningful eligibility/progress tests and SQL fixtures when persistent
   behavior changes. Update patch notes for the user-facing batch. Run the
   checks below and coordinate SQL before the compatible frontend release.

Earning currently remains client-driven; server authorization of eligibility is
a documented follow-up. Atomic claims do not make arbitrary browser-earned rows
authoritatively eligible. Do not broaden client permissions as a shortcut.

## Current progress sources

| Requirement | Progress | Earning integration |
| --- | --- | --- |
| `tasks_completed` | `user_milestones.tasks_completed_count` (lifetime tasks) | `taskStore` completion and general title recheck |
| `longest_streak` | `daily_quotas.longest_streak` (best streak, not current streak) | `taskStore` streak update |
| `battle_wins` | `profiles.battles_won` | General title recheck; battle callers |
| `digimon_stage` | Earned stage achievement; exact stage match | `petStore` evolution/form actions |
| `digimon_count` | Discovery records in `user_discovered_digimon` | General title recheck |
| `tournament_round` | `user_tournaments.round_results` and completed final placement | `tournamentStore` round completion and general title recheck |

Lifetime task progress has one database writer: `update_completed_today`, invoked
by the task completion trigger on an incomplete-to-complete transition. It upserts
`user_milestones.tasks_completed_count` in the reward transaction, independently
of the three-task daily quota. Do not add a browser increment. Repeated completion
is rejected; resets/edits/deletion do not reduce the lifetime count, and a later
recurring-task completion adds one. The browser reads the committed count for
achievement checks and refreshes displayed progress on `task-completed`.

Migration `20260918072450_restore_lifetime_task_progress.sql` repairs
for the historical missing writer. Its backfill takes the maximum of the existing
count, retained task completion evidence, today's quota and earned task milestone
thresholds. These sources overlap; never sum them or call this an exact historical
total. Deleted tasks and past recurring cycles cannot be completely reconstructed.
The migration was deployed on 2026-09-18; consult migration history/audit for
current deployment status.

Tournament progress is the highest contiguous round-win count or historical
completed placement: semifinals = 1, Grand Final = 2, champion = 3. Contender,
Finalist and Champion currently grant Bits, not DigiEggs. Do not confuse tournament
placement payouts with separate achievement rewards. No current checker handles
`digimon_level` merely because it exists in the type union.

## Partner rewards and presentation

- The dashboard combines achievement navigation/unclaimed count with compact
  DigiEgg rows for tasks, best streak, battle wins and evolution. Keep these in
  one panel rather than adding another full-sized partner card.
- Each route targets its next egg-bearing achievement, prioritizing earned,
  unclaimed rewards. Claimed milestones advance only their own route. Hide a
  route once every DigiEgg reward in it has been claimed. An unclaimed final
  reward stays visible; earning alone must not hide it.
- Numeric progress uses lifetime tasks, best streak and battle wins. Evolution
  is a one-time milestone: 0/1 before earning, 1/1 while ready to claim. After
  claiming Mega, target Ultra; after all evolution egg rewards are claimed,
  hide the row. Do not count currently owned Mega pets or lose earned progress
  after devolution, DNA consumption or other roster changes.
- The Achievements page uses the same component in its full presentation for
  one next reward. Across routes, earned unclaimed rewards take priority;
  otherwise the selector chooses the highest numeric completion fraction.
  This is progress toward a milestone, not a predicted time to earn it.
- The selector excludes unearned campaign rewards. Outstanding earned legacy
  rewards remain claimable. Exhausted routes return `null`.
- Progress reads are display-only; they never award achievements or currency.
  The component refreshes counters on mount, `task-completed` and window focus.
  Missing task/streak counter rows mean zero; query failures must not fabricate
  zero progress. New progress sources need refresh integration as appropriate.
- Cards show the concise **DigiEgg** badge whenever their pool is nonempty,
  including locked cards with concealed names. Keep tier color on the name,
  bookmark on the name row, and avoid redundant tier/completion badges.
- Ready partner actions reuse the Achievements page's claim/selection flow.
  The dashboard does not need another "View partner rewards" navigation link.
- A DigiEgg achievement grants one chosen owned Digimon. The dialog offers up
  to three seeded options from its pool; it does not grant the entire pool.
  Shop armor DigiEggs are evolution items, and Random Digimon Data unlocks a
  discovery rather than adding an owned partner. Keep those concepts distinct
  in reward copy. Onboarding's three starters are a separate acquisition flow.

## Claims, smooth updates and legacy data

`claim_achievement` owns reward validation, Bits/pet grants and `claimed_at` in
one transaction. Repeats confirm the existing claim without granting again.
Never restore browser timestamps, direct Bits grants or browser pet inserts as
claim fallbacks. Preserve pool validation, ownership checks, rollback and
party-full storage behavior.

`titleStore.claimAchievement` applies the RPC-confirmed timestamp to the existing
local row. Bits-only claims need no title-list or roster reload. Newly granted
pets refresh party, storage and discoveries; a refresh failure after a confirmed
commit does not mean the claim failed. Currency refresh events fire only for a
new Bits grant. Keep populated routes mounted during background roster fetches
(`RequireAuth` in `src/App.tsx`), and do not reorder cards based on claimed state.
Disable duplicate claims on the initiating controls instead of replacing the page.

Retired campaign achievements remain in the catalog for historical identity and
claims. Only earned ones appear in Legacy; they are excluded from active totals,
normal progression and new earning checks. Preserve earned rewards and profile
pins. A future retirement needs an explicit legacy policy and data-preservation
review, not deletion of titles or `user_titles` rows.

## Verification

Run `npm run lint`, `npm run format:check`, `npm test` and `npm run build` for
application changes. Relevant tests include `nextPartnerReward.test.ts`,
`titleStore.test.ts` and `tournamentAchievements.test.ts` under `src/__tests__/`.
Use `npm.cmd` on Windows when needed.

For catalog/schema/claim changes, follow all local database checks in
[supabase/README.md](supabase/README.md). `npm run db:test` compares actual server
Bits/pool definitions against every client title and checks pool species exist.
It does not prove eligibility logic, labels or all requirement metadata match.
Claims/ownership/repeat/rollback/discovery fixtures live in
`supabase/tests/achievement-claims.sql`; tournament/legacy backfill fixtures live
in `supabase/tests/tournament-achievements.sql`.
Lifetime increments, repeats, resets and reward rollback are covered in
`supabase/tests/authorization.sql`; historical recovery and preservation are covered
in `supabase/tests/task-progress.sql`. The local authorization runner executes both.

Review both themes and mobile/desktop layouts with local fixtures: locked egg
badges, independent routes, next milestone after claiming, 0/1 evolution,
earned-unclaimed final rewards, fully claimed hidden routes, pending/error
states, storage overflow and Bits claims without page flicker/card movement.
Do not mutate production users for screenshots. A build or local reset does not
deploy anything; report actual deployment separately.
