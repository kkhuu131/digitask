# Digitask UI Redesign — Implementation Plan (v2)

This document converts the UI redesign proposal into concrete engineering tasks.
Each phase is self-contained and safe to merge independently. The app must remain
fully functional between every phase.

---

## Revision Notes (v1 → v2)

Changes made after reviewing v1 against the actual codebase:

| Issue | Fix |
|-------|-----|
| `task.points` used in Phase 4 — field does not exist on `Task` interface | Replaced with `getExpPoints(task)` from `taskStore.ts` |
| FAB in `Layout.tsx` appears on every page | Moved FAB + event listener into `Dashboard.tsx` only; removed global custom event pattern |
| Page transition placed in `App.tsx` | Moved to `Layout.tsx` — `App.tsx` runs auth init and should not be touched |
| `transition-colors duration-200` added to Layout root div | Removed — `index.css` already applies it on `html` and `body` |
| `useReducedMotion` custom hook wrapper | Removed — Framer Motion's built-in `useReducedMotion()` is sufficient |
| `bg-red-500/8` (non-standard Tailwind opacity) | Changed to `bg-red-500/10` |
| Evolution progress bar shows DNA evolutions | Added `!opt.dna_requirement` filter |
| Digivolve button shows `availableEvolutions[0].name` arbitrarily | Changed to generic "DIGIVOLVE" label |
| `.card` CSS class never addressed in Phase 1 | Added task 1.5 to document card token decision |
| Quota strip data fields were vague | Named exact fields: `dailyQuota.completed_today`, `dailyQuota.current_streak`, `DAILY_QUOTA_AMOUNT` |
| XP floater needs `relative` on parent | Added to Phase 7 task 7.1 |

---

## Guiding Principles

- **No big-bang rewrites.** Every phase ships something testable on its own.
- **Additive before destructive.** Add new tokens/classes before removing old ones.
- **Dark mode first.** The existing dark palette is closer to the target than light.
  Test every change in both modes before committing.
- **Read before you write.** For any component over ~150 lines, read the full file
  before modifying it. The plan flags this where it matters most.

---

## Phase 1 — Design Tokens & Typography

**Goal:** Establish the single source of truth for color, spacing, shadow, and type.
Nothing visual changes for users. All subsequent phases pull from these tokens.

### Tasks

#### 1.1 — Audit existing Tailwind config

- **File:** `tailwind.config.js`
- **Action (read-only, already done):** Token names are confirmed as:
  - `primary` = sky blue — links, nav active state
  - `accent` = amber — dark mode CTAs (`accent-500` = `#F59E0B`)
  - `secondary` = purple — XP bars
  - `dark` = custom dark scale — dark mode backgrounds
  - Font: `sans: ["Inter"]` — no heading/body split yet
- **Note:** `amber-600` used directly in some components is identical to `accent-600`.
  No conflict, just inconsistency. Prefer `accent-*` going forward.

#### 1.2 — Add game design tokens to Tailwind config

- **File:** `tailwind.config.js`
- **Action:** Add to `theme.extend` only. Do NOT remove any existing tokens.

```js
// theme.extend.colors — add:
game: {
  void:     '#0A0A0F',
  surface:  '#13131A',
  elevated: '#1C1C26',
  border:   '#2A2A38',
  amber:    '#F59E0B',
  purple:   '#8B5CF6',
  teal:     '#0D9488',
  gold:     '#FFD700',
},

// theme.extend.fontFamily — add:
heading: ['Fredoka', 'sans-serif'],
body:    ['Nunito', 'sans-serif'],

// theme.extend.boxShadow — add:
'amber-glow':  '0 0 20px rgba(245,158,11,0.35)',
'purple-glow': '0 0 12px rgba(139,92,246,0.25)',
'card-game':   '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',

// theme.extend.zIndex — add (named scale to replace ad-hoc z-10/z-40/z-50):
zIndex: {
  'base':     '1',
  'sticky':   '10',
  'dropdown': '20',
  'modal':    '30',
  'toast':    '40',
  'overlay':  '50',
},
```

#### 1.3 — Add Google Fonts

- **File:** `src/index.css`
- **Action:** Add imports after the existing Inter import at line 1. Do NOT remove Inter.

```css
@import url("https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap");
```

#### 1.4 — Add CSS custom properties for sprite glow

- **File:** `src/index.css`
- **Action:** Add after `@tailwind utilities`. These are plain CSS class rules (not
  Tailwind utilities), so they will NOT be purged by Tailwind JIT regardless of
  whether they appear in component code.

```css
/* Sprite attribute ambient glow — used via JS lookup object in Digimon.tsx (Phase 5) */
.sprite-stage-vaccine { --stage-glow: rgba(59, 130, 246, 0.12); }
.sprite-stage-virus   { --stage-glow: rgba(139, 92, 246, 0.12); }
.sprite-stage-data    { --stage-glow: rgba(16, 185, 129, 0.12); }
.sprite-stage-free    { --stage-glow: rgba(245, 158, 11, 0.12); }

/* XP bar shimmer — triggered by class swap in Digimon.tsx (Phase 7) */
@keyframes xp-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
.xp-shimmer {
  background: linear-gradient(90deg, #8B5CF6 25%, #a78bfa 50%, #8B5CF6 75%);
  background-size: 200% auto;
  animation: xp-shimmer 0.8s ease-in-out;
}
```

- **Usage note for Phase 5:** Apply the sprite-stage class via a JS lookup, NOT
  via a template literal. Template literals fool Tailwind but these are plain CSS
  so it does not matter — however the lookup pattern is cleaner:

```ts
const ATTRIBUTE_GLOW_CLASS: Record<string, string> = {
  Vaccine: 'sprite-stage-vaccine',
  Virus:   'sprite-stage-virus',
  Data:    'sprite-stage-data',
  Free:    'sprite-stage-free',
};
// Usage: ATTRIBUTE_GLOW_CLASS[digimonData.attribute] ?? ''
```

#### 1.5 — Document `.card` token decision (deferred update)

- **File:** `src/index.css` lines 79–86
- **Current `.card` dark mode:** `bg-dark-300 shadow-card-dark border border-dark-200`
- **Decision:** Do NOT update `.card` in Phase 1. It is the most-used class in the
  app (~15+ usages). Changing it cascades everywhere.
- **Plan for later:** In Phase 3, when individual card components are touched,
  evaluate adding a `.card-game` variant class rather than mutating `.card` globally.
  This defers risk and allows progressive migration.
- **Action in this task:** Add a comment to `index.css` above `.card`:

```css
/* TODO (ui-redesign Phase 3+): Evaluate migrating dark mode bg to game-surface (#13131A).
   Do not change .card globally — migrate component-by-component. */
```

### Rollout safety

- Additive config and CSS changes only. Nothing renders differently.
- `npm run build` must pass — new tokens add no size to the CSS bundle (tree-shaken).
- **Acceptance:** `npm run lint` passes, `npm run build` passes, app renders
  identically in both light and dark mode.

---

## Phase 2 — Layout Framework

**Goal:** Fix the shell that every page inherits. Fix z-index conflicts.
Add page transition animation.

### Tasks

#### 2.1 — Fix z-index conflicts in Layout.tsx

- **File:** `src/components/Layout.tsx`
- **Changes:**
  - Mobile bottom nav container (line ~342): `z-10` → `z-[10]` or use the named
    `z-sticky` token added in Phase 1
  - Mobile dropdown menus (the `motion.div` in `activeMenu === 'digimon'` and
    `activeMenu === 'more'` blocks, lines ~376, ~441): add `z-dropdown` class
  - Click-outside overlay div (line ~473): `z-0` is correct — keep as-is
- **Why:** The `z-10` bottom nav can overlap dropdowns from components that use
  `z-20` or higher. The named scale from Phase 1 makes conflicts obvious.

#### 2.2 — Add page transition animation in Layout.tsx

- **File:** `src/components/Layout.tsx`
- **NOT `App.tsx`** — `App.tsx` runs the auth initialization state machine
  (`isInitializationInProgress`, debounced auth events). Wrapping routes there
  with `AnimatePresence` risks interfering with auth redirects and loading states.
- **Action:** `Layout.tsx` already imports `motion` and `AnimatePresence` and
  uses `useLocation`. Add the transition wrapper around `{children}`:

```tsx
// Replace the existing:
//   {children}
// with:
<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -4 }}
    transition={{ duration: 0.15 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

- **Risk:** `mode="wait"` holds the new route until the exit animation finishes.
  At 150ms this is imperceptible, but test the Battle page which has a heavy mount.
  If jank occurs, drop `mode="wait"` — the transitions still work, just overlap.

#### 2.3 — Add `cursor-pointer` audit pass

- **Files:** `Digimon.tsx`, `CleanTaskList.tsx`, `MilestoneProgress.tsx`
- **Action:** Any `<div onClick=...>` or `<button>` missing `cursor-pointer` should
  have it added. The `Digimon.tsx` card div (line ~379) is missing it.
- **Quick grep:**
  ```
  grep -n "onClick" src/components/Digimon.tsx src/components/CleanTaskList.tsx
  ```

#### 2.4 — Note: Sidebar.tsx is legacy

- **File:** `src/components/Sidebar.tsx`
- **Status:** Not imported anywhere. `Layout.tsx` handles all navigation.
- **Action:** Verify before removing:
  ```
  grep -r "Sidebar" src/
  ```
  If nothing imports it, delete it. It has 60 lines and no functionality that
  would be lost.

### Rollout safety

- Task 2.1 is a z-index number change — test modals open correctly on mobile.
- Task 2.2 is purely visual. If transitions cause issues on any route, removing
  the `AnimatePresence` wrapper restores original behavior instantly.
- **Acceptance:** All pages load, transitions are smooth, mobile dropdowns layer
  above the bottom nav, `npm run lint` passes.

---

## Phase 3 — Dashboard Redesign

**Goal:** Restructure the dashboard layout. Move the beta banner. Add daily quota
strip. Remove `TaskHeatmap` from the primary view.

### Tasks

#### 3.1 — Remove beta banner from top of dashboard

- **File:** `src/pages/Dashboard.tsx`
- **Lines:** 127–152 (the `lg:col-span-3` beta notice div)
- **Action:** Make it dismissible and demote it below the main grid.

```tsx
// Add to component state:
const [bannerDismissed, setBannerDismissed] = useState(
  () => localStorage.getItem('beta-banner-dismissed') === 'true'
);

// Remove the banner from the top of the grid.
// Re-render it AFTER the closing </div> of the main grid, only if not dismissed:
{!bannerDismissed && (
  <div className="mt-4 bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500
                  dark:border-indigo-600 p-3 rounded-r-md flex items-center justify-between">
    <p className="text-sm text-indigo-800 dark:text-indigo-200">
      Check out the latest updates in Help &gt; Patch Notes.
    </p>
    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
      <a href="https://forms.gle/4geGdXkywwAQcZDt6" target="_blank" rel="noopener noreferrer"
         className="text-xs bg-indigo-100 dark:bg-indigo-800/50 text-indigo-800 dark:text-indigo-200
                    px-2 py-1 rounded-full">
        Feedback
      </a>
      <button
        onClick={() => {
          setBannerDismissed(true);
          localStorage.setItem('beta-banner-dismissed', 'true');
        }}
        className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  </div>
)}
```

#### 3.2 — Change dashboard grid layout

- **File:** `src/pages/Dashboard.tsx`
- **Current:** `grid-cols-1 lg:grid-cols-3`
- **New:** `grid-cols-1 lg:grid-cols-[380px_1fr]`
- **Also update:** The right column span from `lg:col-span-2` to nothing (it fills
  the remaining `1fr` automatically in the new two-column grid).

#### 3.3 — Remove TaskHeatmap from dashboard

- **File:** `src/pages/Dashboard.tsx`
- **Action:** Comment out the `<TaskHeatmap />` render block and its surrounding
  `<div className="mb-4">`. Keep the import. Add `// TODO: move to ProfilePage (Phase 7)`.
- **Do NOT delete `TaskHeatmap.tsx`** — it moves to ProfilePage in Phase 7.

#### 3.4 — Add daily quota strip above task list

- **File:** `src/pages/Dashboard.tsx`
- **Data fields** (confirmed from `src/store/taskStore.ts`):
  - `useTaskStore().dailyQuota?.completed_today` — tasks completed today
  - `useTaskStore().dailyQuota?.current_streak` — consecutive day streak
  - `DAILY_QUOTA_AMOUNT` = `3` (constant exported from `taskStore.ts`) — daily target
- **Action:** Add between the task list header and `<TaskList />`:

```tsx
import { useTaskStore, DAILY_QUOTA_AMOUNT } from '../store/taskStore';

// In component:
const { dailyQuota } = useTaskStore();
const completedToday = dailyQuota?.completed_today ?? 0;
const streak = dailyQuota?.current_streak ?? 0;

// Render above <TaskList />:
<div className="flex items-center gap-3 px-4 mb-3">
  <div className="flex-1 bg-gray-200 dark:bg-dark-200 rounded-full h-2 overflow-hidden">
    <div
      className="h-full bg-accent-500 transition-all duration-500 rounded-full"
      style={{ width: `${Math.min(100, (completedToday / DAILY_QUOTA_AMOUNT) * 100)}%` }}
    />
  </div>
  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
    {completedToday}/{DAILY_QUOTA_AMOUNT} today
  </span>
  {streak > 0 && (
    <span className="text-xs font-medium text-accent-600 dark:text-accent-400 whitespace-nowrap">
      {streak}d streak
    </span>
  )}
</div>
```

- **Note:** `DAILY_QUOTA_AMOUNT` may not currently be exported. If not, export it
  from `taskStore.ts`: add `export` to the existing `const DAILY_QUOTA_AMOUNT = 3`.

#### 3.5 — Add mobile FAB directly in Dashboard.tsx

- **File:** `src/pages/Dashboard.tsx`
- **NOT `Layout.tsx`** — the FAB is dashboard-specific. Adding it globally to
  `Layout.tsx` would show "Add Task" on the Battle page, DigiDex, Profile, etc.
- **Action:** Add inside the Dashboard JSX, outside the main grid:

```tsx
{/* Mobile FAB — visible only on mobile, always above bottom nav */}
<button
  className="sm:hidden fixed bottom-20 right-4 z-sticky w-12 h-12 rounded-full
             bg-accent-500 hover:bg-accent-400 text-white shadow-amber-glow
             flex items-center justify-center transition-colors duration-150 cursor-pointer"
  aria-label="Add task"
  onClick={() => setShowTaskForm(true)}
>
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
</button>
```

- `bottom-20` (80px) clears the mobile bottom nav (which is ~56–64px tall given
  the `py-1` / `py-2` classes and `pb-16` on `<main>`).

#### 3.6 — Move PartyMembersGrid to right column

- **File:** `src/pages/Dashboard.tsx`
- **Current:** Inside the left `lg:col-span-1` column, below `<Digimon>`
- **New:** Inside the right column, below `<TaskList>`
- **Why:** Frees the left column to be exclusively the Digimon panel. The party
  grid is secondary info — users don't need it at the same visual weight as their
  active Digimon.

### Rollout safety

- `DAILY_QUOTA_AMOUNT` export: if not currently exported, the build fails.
  Add `export` to the constant before merging.
- Test `dailyQuota` null case — render the strip even when `dailyQuota` is null
  (shows `0/3`), it should not error.
- Test banner dismissal persists across page reload.
- **Acceptance:** Dashboard loads with Digimon at top-left, task list top-right,
  quota strip visible, no beta banner on repeat visits, `npm run lint` passes.

---

## Phase 4 — Tasks UI

**Goal:** Make task rows faster to scan, more rewarding to complete, and visually
differentiated by urgency.

### Tasks

#### 4.1 — Surface overdue tasks with visual emphasis

- **File:** `src/components/CleanTaskList.tsx`
- **Current state:** Lines 22–60 already group tasks into `overdue`, `today`,
  `tomorrow`, `thisWeek`, `later`, `noDate`, `completed` groups. The data is correct.
  The visual treatment is the gap.
- **Action:** Find the render section for `overdue` group items (search for
  `groups.overdue` in the file's render output). Add to overdue task row divs:

```
border-l-2 border-red-500 bg-red-500/10 dark:bg-red-500/10
```

- Verify the overdue group renders before `today` in the render order. If not,
  reorder the render sections so overdue always appears first.

#### 4.2 — Add XP badge to each task row

- **File:** `src/components/CleanTaskList.tsx` (confirm where individual rows render)
- **IMPORTANT — field name:** The `Task` interface has NO `points` field. XP is
  calculated via the exported function `getExpPoints(task: Task)` from `taskStore.ts`.
  Import and use it:

```tsx
import { getExpPoints } from '../store/taskStore';

// In task row render:
<span className="text-xs font-medium px-1.5 py-0.5 rounded-full flex-shrink-0
                 bg-accent-100 dark:bg-accent-900/40
                 text-accent-700 dark:text-accent-300">
  +{getExpPoints(task)} XP
</span>
```

- Position: between the task title and the complete button.
- `getExpPoints` returns 75 for daily/recurring tasks, 100 for one-time tasks.

#### 4.3 — Add category color dot to task rows

- **File:** `src/components/CleanTaskList.tsx`
- **Action:** `categoryIcons` is already imported from `categoryDetection.ts`.
  Define a color map and add a small dot before the task title:

```ts
// Define in the file (or in categoryDetection.ts if preferred):
const CATEGORY_COLORS: Record<string, string> = {
  HP:  'bg-red-500',
  SP:  'bg-blue-400',
  ATK: 'bg-orange-500',
  DEF: 'bg-yellow-600',
  INT: 'bg-indigo-500',
  SPD: 'bg-green-500',
};

// In task row render, before the task title:
{task.category && CATEGORY_COLORS[task.category] && (
  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${CATEGORY_COLORS[task.category]}`} />
)}
```

#### 4.4 — Add exit animation to completed task rows

- **File:** `src/components/CleanTaskList.tsx`
- **Action:** Wrap task list items in `AnimatePresence`. Use `exit` without `layout`
  to avoid the performance cost of measuring all siblings on each removal.
  The tradeoff: remaining tasks snap up instantly rather than sliding up. For a
  productivity app this is acceptable and significantly cheaper.

```tsx
import { AnimatePresence, motion } from 'framer-motion';

// Wrap the task list render:
<AnimatePresence initial={false}>
  {tasksToRender.map(task => (
    <motion.div
      key={task.id}
      exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
      transition={{ duration: 0.2 }}
    >
      {/* existing task row */}
    </motion.div>
  ))}
</AnimatePresence>
```

- `initial={false}` prevents the animation from firing on first mount (i.e., page
  load doesn't animate all tasks in).
- If the `height: 0` exit causes layout jank, fall back to `opacity: 0` only.

#### 4.5 — Improve auto-allocate toggle visual

- **File:** `src/components/TaskList.tsx`
- **Current:** Lines 67–77 — raw `<input type="checkbox">` with a label.
- **Action:** Replace with a pill-style toggle switch. Keep the exact same state
  logic (`autoAllocateStats`, `setAutoAllocateStats`, `localStorage` save). Only
  the presentation changes:

```tsx
<button
  role="switch"
  aria-checked={autoAllocateStats}
  onClick={() => setAutoAllocateStats(!autoAllocateStats)}
  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 cursor-pointer
    ${autoAllocateStats ? 'bg-accent-500' : 'bg-gray-300 dark:bg-dark-100'}`}
>
  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200
    ${autoAllocateStats ? 'translate-x-4' : 'translate-x-1'}`} />
</button>
```

#### 4.6 — Replace task form modal with slide-up drawer on mobile

- **File:** `src/pages/Dashboard.tsx` (lines 210–235)
- **Action:** This is the highest-risk change in Phase 4. Keep the existing modal
  for desktop. On mobile, slide up from the bottom. Only the wrapper changes —
  `<TaskForm>` is reused as-is.

```tsx
// Outer wrapper — desktop modal, mobile full-height sheet:
<div className="fixed inset-0 z-modal flex items-end sm:items-center justify-center">
  {/* Backdrop */}
  <div className="absolute inset-0 bg-black/50" onClick={() => setShowTaskForm(false)} />

  {/* Sheet — slides up on mobile, centered on desktop */}
  <motion.div
    initial={{ y: '100%' }}
    animate={{ y: 0 }}
    exit={{ y: '100%' }}
    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    className="relative z-modal w-full sm:max-w-lg bg-white dark:bg-dark-300
               rounded-t-2xl sm:rounded-xl p-6 max-h-[90vh] overflow-y-auto"
  >
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Add New Task</h3>
      <button onClick={() => setShowTaskForm(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <TaskForm onTaskCreated={() => setShowTaskForm(false)} />
  </motion.div>
</div>
```

- `max-h-[90vh] overflow-y-auto` prevents the sheet from going taller than the
  viewport on mobile.
- Wrap the conditional render in `AnimatePresence` (added in Phase 7.4) for the
  exit animation.

### Rollout safety

- Tasks 4.1–4.3 are CSS-only. Zero functional risk.
- Task 4.4: `initial={false}` is critical — without it, page load flickers.
  Test with 10+ tasks in the list.
- Task 4.6 is highest risk. Ship 4.1–4.5 first. If 4.6 has issues on any device,
  revert just that change — the existing modal path is still in the file.
- **Acceptance:** Tasks complete, overdue shows red border, XP badge shows correct
  values (75 or 100), completed tasks fade out, `npm run lint` passes.

---

## Phase 5 — Digimon UI

**Goal:** Make the Digimon panel feel alive and purposeful. Add the evolution
progress bar. Replace the "Can Digivolve" text with a real CTA button.

### Tasks

#### 5.1 — Increase sprite display size

- **File:** `src/components/Digimon.tsx`
- **Current:** `className="w-40 h-40 flex items-center justify-center"` (line ~418)
- **New:** `className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center"`
- **Verify:** The `transform: scale(${lookDirection}, 2.5)` inline style applies to
  the `<img>` inside the container. The container just needs to be large enough to
  show the rendered sprite without clipping. The scale value (2.5) does not change.

#### 5.2 — Add sprite stage ambient glow

- **File:** `src/components/Digimon.tsx`
- **Action:** Use the lookup object pattern (not template literals) to apply the
  glow class. The CSS classes were defined in `src/index.css` in Phase 1.

```tsx
// Define lookup near top of component or in a constants file:
const ATTRIBUTE_GLOW_CLASS: Record<string, string> = {
  Vaccine: 'sprite-stage-vaccine',
  Virus:   'sprite-stage-virus',
  Data:    'sprite-stage-data',
  Free:    'sprite-stage-free',
};

// Wrap the existing sprite motion.div with:
const glowClass = digimonData.attribute
  ? (ATTRIBUTE_GLOW_CLASS[digimonData.attribute] ?? '')
  : '';

<div
  className={`relative ${glowClass}`}
  style={{
    background: glowClass
      ? 'radial-gradient(circle, var(--stage-glow) 0%, transparent 70%)'
      : undefined,
    borderRadius: '50%',
  }}
>
  {/* existing motion.div sprite */}
</div>
```

#### 5.3 — Upgrade status bar heights

- **File:** `src/components/Digimon.tsx`
- **Current bar height:** `h-1.5` (happiness bar ~line 493, XP bar ~line 526)
- **New:** `h-2.5` for both bars
- **No other changes** to bar logic. The existing color transitions and level-up
  glow effects are correct — keep them.

#### 5.4 — Add evolution progress bar

- **File:** `src/components/Digimon.tsx`
- **Position:** Below the XP bar section, above the Digivolve button.
- **What it shows:** Progress toward the next available evolution by level.
  Excludes DNA evolutions (which require a partner) and evolutions the user already
  qualifies for (those appear in `availableEvolutions` and get the button instead).

```tsx
// Add this derived value in the component body (near existing availableEvolutions):
const nextEvoTarget = evolutionOptions
  .filter(opt =>
    opt.level_required > userDigimon.current_level &&  // not yet met
    !opt.dna_requirement                               // exclude DNA evolutions
  )
  .sort((a, b) => (a.level_required ?? 99) - (b.level_required ?? 99))[0];

const evoProgressPct = nextEvoTarget
  ? Math.min(100, (userDigimon.current_level / (nextEvoTarget.level_required ?? 1)) * 100)
  : null;

// Render below the XP bar:
{evoProgressPct !== null && nextEvoTarget && (
  <div>
    <div className="flex items-center gap-2 mb-1">
      <div className="flex items-center justify-center w-8 h-4 flex-shrink-0">
        <span className="text-xs font-bold" style={{ color: 'var(--color-evo-gold, #FFD700)' }}>
          Evo
        </span>
      </div>
      <div className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-500"
          style={{ width: `${evoProgressPct}%` }}
        />
      </div>
    </div>
    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
      <span>Lv {userDigimon.current_level} / {nextEvoTarget.level_required}</span>
      <span className="font-medium" style={{ color: 'var(--color-evo-gold, #FFD700)' }}>
        {nextEvoTarget.name}
      </span>
    </div>
  </div>
)}
```

- When `evolutionOptions` is empty (e.g., Mega-stage Digimon at end of evolution
  tree), nothing renders — which is correct.

#### 5.5 — Replace "Can Digivolve" text with glowing CTA button

- **File:** `src/components/Digimon.tsx`
- **Current code (lines ~553–558):**
  ```tsx
  {availableEvolutions.length > 0 && (
    <div className="text-sm text-purple-500 font-bold mt-2">
      Can Digivolve
    </div>
  )}
  ```
- **Replace with:**
  ```tsx
  {availableEvolutions.length > 0 && (
    <motion.button
      animate={{
        boxShadow: [
          '0 0 8px rgba(245,158,11,0.3)',
          '0 0 20px rgba(245,158,11,0.65)',
          '0 0 8px rgba(245,158,11,0.3)',
        ],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      onClick={(e) => {
        e.stopPropagation();  // prevents card's onClick from also firing
        setShowDetailModal(true);
      }}
      className="w-full mt-3 py-2.5 px-4 rounded-xl
                 bg-accent-500 hover:bg-accent-400
                 text-black font-heading font-semibold text-sm
                 cursor-pointer transition-colors duration-150"
    >
      DIGIVOLVE{availableEvolutions.length > 1 ? ` (${availableEvolutions.length})` : ''}
    </motion.button>
  )}
  ```
- **Why not show the evolution name:** `availableEvolutions` can contain multiple
  valid options. Showing one arbitrarily is misleading. The button opens the detail
  modal where the user chooses.
- **Also remove:** The hint text div below it (`"Click for details or evolution
  options"`, line ~561–563). The glowing button makes it self-evident.

#### 5.6 — Replace emoji mood indicator with SVG icons

- **File:** `src/components/Digimon.tsx`
- **Current:** Lines ~469–481 use emoji spans
- **Action:** Only do this if `lucide-react` is already in `package.json`. If not,
  this is a dependency addition that needs a separate decision. Check first:
  ```
  grep "lucide-react" package.json
  ```
  If present, use `SmilePlus`, `Smile`, `Minus`, `Frown`, `ZzzIcon` or equivalents.
  If absent, defer to Phase 7 cleanup.

#### 5.7 — Restructure DigimonDetailModal into tabs

- **File:** `src/components/DigimonDetailModal.tsx`
- **Prerequisites:** Read the full file first. This is listed as a task but it is
  likely 400+ lines. Do not estimate effort before reading.
- **Minimum viable approach:** Add a tab state and a tab bar. Move the evolution
  graph behind an `activeTab === 'evolution'` conditional. Stats remain on the
  default `stats` tab. Do not restructure into sub-components in the first pass —
  that is a follow-up.
- **Risk:** Highest-effort task in Phase 5. Isolate in its own branch/PR.
  The existing modal continues to work until the tabbed version is ready to swap in.

### Rollout safety

- Tasks 5.1–5.3 are CSS changes — safe.
- Task 5.4 is purely additive. New state derived from existing props.
- **Task 5.5 is the single most important change in the entire plan.** Low risk,
  high impact. The only gotcha is `e.stopPropagation()` — verify the card
  `onClick` does not double-fire after the change.
- Task 5.7 is the highest-risk change — separate PR.
- **Acceptance:** Three status bars visible, evolution CTA glows and opens modal,
  evo progress bar shows toward next non-DNA evolution, `npm run lint` passes.

---

## Phase 6 — Battles

**Goal:** Make battles feel like a game event, not a data screen.

### Tasks

#### 6.1 — Read battle components before writing anything

- **Files to read in full before any other Phase 6 work:**
  - `src/pages/BattleHub.tsx`
  - `src/pages/Battle.tsx`
  - `src/components/TeamBattleAnimation.tsx`
  - `src/components/InteractiveBattle.tsx`
- **Action:** Document the answers to:
  1. Where does the matchup pre-confirmation happen (if at all)?
  2. Where is the turn log rendered?
  3. Does the battle end state already have a result overlay?
  4. Which component owns the "battle complete" event?
- Do not proceed to 6.2–6.5 without this research.

#### 6.2 — Add matchup preview (skip if already exists)

- **File:** `src/pages/BattleHub.tsx` or new `src/components/BattleMatchupPreview.tsx`
- **Only build this if 6.1 confirms it doesn't exist.**
- **What to build:** Before confirming a battle, show:
  - Your team vs. opponent team sprites side by side
  - Power rating comparison
  - "FIGHT" CTA (amber) and "Back" link
- **Data:** `battleStore` has opponent data after `get_opponents_with_digimon`.
  Surface it before the user commits to the battle.

#### 6.3 — Add screen-shake on hit

- **File:** `src/components/TeamBattleAnimation.tsx` (verify in 6.1)
- **Action:** Apply shake to the receiving Digimon's sprite container:

```tsx
const shakeVariants = {
  shake: {
    x: [0, -6, 6, -4, 4, -2, 2, 0],
    transition: { duration: 0.3 },
  },
  idle: { x: 0 },
};

<motion.div animate={isBeingHit ? 'shake' : 'idle'} variants={shakeVariants}>
  {/* sprite */}
</motion.div>
```

- Only apply to the Digimon that is currently being hit, not the whole scene.

#### 6.4 — Upgrade turn log visual treatment

- **File:** confirm location in 6.1
- **Action:** Classify each turn log entry and apply color + weight:

```ts
const LOG_STYLES: Record<string, string> = {
  attack:  'text-red-400',
  miss:    'text-gray-400 italic',
  crit:    'text-yellow-300 font-semibold',
  buff:    'text-blue-400',
  heal:    'text-green-400',
  default: 'text-gray-300',
};
```

- The classification logic depends on the turn log data structure — confirm in 6.1
  before writing the matching logic.

#### 6.5 — Add victory/defeat overlay

- **File:** confirm owner in 6.1
- **Win:** Scale-in overlay with `font-heading "VICTORY"` text, gold background.
- **Lose:** The battle scene fades to grayscale over 1.5s, "DEFEATED" text appears.
  Apply grayscale to the battle scene container, not the overlay (which stays readable):

```tsx
// On the battle field container when battle is lost:
<motion.div
  animate={battleLost ? { filter: 'grayscale(1)' } : { filter: 'grayscale(0)' }}
  transition={{ duration: 1.5 }}
>
  {/* sprites, health bars */}
</motion.div>
```

### Rollout safety

- No Phase 6 task should change battle logic, rewards, or limits.
  All changes are visual overlays on top of existing battle state.
- 6.3 and 6.4 are additive — cannot break game logic.
- **Acceptance:** Full battle completes, rewards apply correctly, hit shake
  fires, turn log is readable, win/lose state is visually clear.

---

## Phase 7 — Polish & Animations

**Goal:** The layer that makes this feel like a game rather than a to-do list.
All tasks are purely additive visual enhancements.

### Tasks

#### 7.1 — Add XP float animation on task completion

- **File:** `src/components/CleanTaskList.tsx`
- **Prerequisites:** The task row container needs `position: relative` for the
  absolute-positioned floater to be scoped correctly. Add `relative` to the
  outermost div of each task row.
- **Action:**

```tsx
const [floaters, setFloaters] = useState<Array<{ key: string; xp: number }>>([]);

// When completeTask() is called:
const handleComplete = (task: Task) => {
  completeTask(task.id, autoAllocateStats);
  const key = `${task.id}-${Date.now()}`;
  setFloaters(prev => [...prev, { key, xp: getExpPoints(task) }]);
  setTimeout(() => setFloaters(prev => prev.filter(f => f.key !== key)), 800);
};

// In the task row render (inside the `relative` container):
{floaters.filter(f => f.key.startsWith(task.id)).map(f => (
  <motion.span
    key={f.key}
    initial={{ opacity: 1, y: 0 }}
    animate={{ opacity: 0, y: -28 }}
    transition={{ duration: 0.7 }}
    className="absolute right-10 top-0 pointer-events-none
               text-accent-500 font-semibold text-xs z-base select-none"
  >
    +{f.xp} XP
  </motion.span>
))}
```

- Use `getExpPoints(task)` (not `task.points`) — same as Phase 4.2.

#### 7.2 — Add XP bar shimmer on gain

- **File:** `src/components/Digimon.tsx`
- **Prerequisite:** The `.xp-shimmer` CSS class was added to `index.css` in Phase 1.
- **Action:** Add a `xpGained` state boolean that fires when `experience_points`
  increases but does NOT trigger `isLevelingUp`. Reset after 900ms.

```tsx
const [xpGained, setXpGained] = useState(false);

// In the existing useEffect that watches userDigimon:
else if (userDigimon.experience_points > prevXPRef.current) {
  triggerStatIncreaseAnimation();
  setXpGained(true);
  setTimeout(() => setXpGained(false), 900);
}

// On the XP bar fill div, replace bg-purple-500 with dynamic class:
className={`h-full transition-all duration-300 ${
  isLevelingUp
    ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 animate-pulse'
    : xpGained
      ? 'xp-shimmer'
      : 'bg-purple-500'
}`}
```

#### 7.3 — Add skeleton loading states

- **Files:** `src/pages/Dashboard.tsx` (loading block at lines 114–121),
  `src/components/MilestoneProgress.tsx` (loading block at line 60)
- **Action:** Replace plain text loading states with pulse skeletons that match
  the component's shape. The skeleton grid must match the Phase 3 grid layout
  (`lg:grid-cols-[380px_1fr]`):

```tsx
// Dashboard loading skeleton — replace the existing plain text div:
<div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 animate-pulse">
  <div className="card space-y-4">
    <div className="mx-auto w-48 h-48 rounded-full bg-gray-200 dark:bg-dark-200" />
    <div className="h-4 bg-gray-200 dark:bg-dark-200 rounded w-2/3 mx-auto" />
    <div className="h-2.5 bg-gray-200 dark:bg-dark-200 rounded-full w-full" />
    <div className="h-2.5 bg-gray-200 dark:bg-dark-200 rounded-full w-full" />
    <div className="h-2.5 bg-gray-200 dark:bg-dark-200 rounded-full w-full" />
  </div>
  <div className="card space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-12 bg-gray-200 dark:bg-dark-200 rounded-lg" />
    ))}
  </div>
</div>
```

#### 7.4 — Add modal open/close animations

- **Files affected:** `Dashboard.tsx` (task form, already has a slide-up from 4.6),
  `DigimonDetailModal.tsx`, `DigimonEvolutionModal.tsx`, `DigimonSelectionModal.tsx`
- **Pattern:** Wrap each conditional modal render in `AnimatePresence`. The scale
  animation must be on the inner content div, not the backdrop (the backdrop fades):

```tsx
<AnimatePresence>
  {isOpen && (
    <>
      {/* Backdrop — fade only */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-black/50 z-modal"
        onClick={onClose}
      />
      {/* Content — scale + fade */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="fixed ... z-modal"
      >
        {/* modal content */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

#### 7.5 — Move TaskHeatmap to ProfilePage

- **Files:** `src/pages/ProfilePage.tsx`, `src/pages/Dashboard.tsx`
- **Action:** Read `ProfilePage.tsx` first to understand existing content.
  Import `TaskHeatmap` and add it below existing content under an "Activity" heading.
  Remove the commented-out block from `Dashboard.tsx`.

#### 7.6 — Apply Fredoka/Nunito to key elements

- **Action:** Add `font-heading` class selectively — NOT globally on `body`.
  Priority targets:
  - Digimon display name `<h2>` in `Digimon.tsx` (line ~394)
  - Task section header `<h2>` in `Dashboard.tsx`
  - The Digivolve CTA button (already included in Phase 5.5)
- **Do NOT apply `font-body` globally yet.** Nunito on every UI element including
  admin tables, form labels, and patch notes needs a full visual audit first.

#### 7.7 — `prefers-reduced-motion` audit pass

- **Dependency:** Framer Motion exports `useReducedMotion` directly —
  `import { useReducedMotion } from 'framer-motion'`. No custom hook needed.
- **Pattern at call sites:**
  ```tsx
  const prefersReducedMotion = useReducedMotion();
  // Then:
  transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
  // Or gate the animate prop:
  animate={prefersReducedMotion ? {} : { boxShadow: [...] }}
  ```
- **Priority order:**
  1. `Digimon.tsx` — Digivolve pulse (5.5), sprite hop, heart float
  2. `CleanTaskList.tsx` — task exit animation (4.4), XP floater (7.1)
  3. `TeamBattleAnimation.tsx` — screen shake (6.3), defeat overlay (6.5)
  4. All modals (7.4)

### Rollout safety

- All Phase 7 tasks are additive.
- If any animation causes jank, remove the `animate` prop — behavior is unchanged.
- **Acceptance:** All animations play at 60fps on a mid-range Android device.
  `prefers-reduced-motion` disables all custom motion. `npm run lint` passes.

---

## Cross-Cutting Concerns

### Gate checks before every phase merges

- [ ] `npm run lint` — zero warnings (enforced by config)
- [ ] `npm run build` — no TypeScript errors
- [ ] Dashboard loads and Digimon displays
- [ ] Task completion works end-to-end (completes task, Digimon reacts)
- [ ] Dark mode and light mode both render correctly
- [ ] Mobile 375px layout is not broken
- [ ] Evolution flow still works (if `Digimon.tsx` was touched)

### High-risk files — handle with care

| File | Risk | Why |
|------|------|-----|
| `src/components/Digimon.tsx` | High | Core game component, touched in Phases 5 and 7 |
| `src/components/Layout.tsx` | High | Every page inherits this shell |
| `src/pages/Dashboard.tsx` | High | Main user flow, touched in Phases 3, 4, 7 |
| `src/index.css` | Medium | `.card`, `.btn` etc. used app-wide |
| `tailwind.config.js` | Medium | Additive changes only — never remove existing tokens |
| `src/store/petStore.ts` | Critical | Do not touch in this plan |
| `src/store/taskStore.ts` | High | Only export `DAILY_QUOTA_AMOUNT` if needed (Phase 3) |

### Files safe to delete after verification

- `src/components/Sidebar.tsx` — verify with `grep -r "Sidebar" src/` first
- The `TaskLayout.tsx` component — check `grep -r "TaskLayout" src/` before touching

---

## Phase Execution Order & Dependencies

```
Phase 1 (Tokens + CSS)
    |
    +---> Phase 2 (Layout shell fixes)
    |         |
    |         +---> Phase 3 (Dashboard structure)
    |                   |
    |                   +---> ![1772916076225](image/ui-redesign-plan/1772916076225.png) (Tasks UI)    <-- parallel with Phase 5
    |                   |
    |                   +---> Phase 5 (Digimon UI)  <-- parallel with Phase 4
    |
    +---> Phase 6 (Battles)  <-- only needs Phase 1, independent of 2–5
    |
    +---> Phase 7 (Polish)   <-- needs all prior phases merged and stable
```

Phases 4 and 5 can be developed in parallel branches and merged in either order.
Phase 6 only needs Phase 1 tokens and can start early.
Phase 7 should wait until 3, 4, and 5 are stable in production.

---

## Quick Win — Ship This First

One change, before any phase formally starts, in under 15 minutes:

**Phase 5, Task 5.5 — Replace the "Can Digivolve" text with the glowing button.**

It is ~25 lines in `src/components/Digimon.tsx`. It changes nothing about game logic.
It transforms the most important moment in the product from a plain text string into
an unmissable amber call-to-action. The only thing to verify afterward: that
`e.stopPropagation()` prevents the card's `onClick` from also firing.
