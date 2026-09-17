# UI conventions

These rules apply to new UI and changes to existing UI. Shared styles live in
`src/index.css`; palette, fonts and layering tokens live in `tailwind.config.js`.
Extend these before copying another set of button or card classes.

## Layout and spacing

- `Layout` owns application gutters: 16px on phones, 24px on tablets, 32px on
  desktop, within a centered 1280px shell. Do not add `container`, `px-4`, or
  `py-8` to a page already inside `Layout`.
- Start application screens with `ui-page`. Use `max-w-3xl` for lists/search,
  `max-w-2xl` for settings, and `max-w-4xl` for profiles/long reading. Collections
  and admin tools may use the full shell. Standalone auth and marketing screens
  supply their own gutters.
- The arena lobby is capped at `max-w-3xl` (768px) to keep difficulty, team and
  opponent columns close together. Team setup and battle playback may use the
  wider shell. Battle summaries use compact result badges and reward icons on
  neutral panels, with amber replay actions.
- Use the 4px spacing scale: 8px between related controls, 12px for compact rows,
  16px between cards, 24px between sections and after page headers. Use 32px only
  when separating major groups. Avoid nested outer padding and stacked margins.
- `ui-page-header` wraps a title/description and optional actions; actions wrap on
  small screens. `ui-page-title` is the shared 24px page heading.
- `card` provides surface, border and responsive padding (16px/24px). `ui-panel`
  provides the same surface without padding for tables, grids and divided panels.
  Use 12px corner radii for panels, 8px for controls, pills for small badges.
- Flex children that contain text, tables or grids need `min-w-0`. Scroll wide
  tables within their panel, never the whole page. Stack editor columns on phones.
- Application navigation switches at 1024px. Keep content clear of the compact
  bottom navigation and device safe area. Floating controls must clear it too.

## Color

| Purpose                | Convention                                     |
| ---------------------- | ---------------------------------------------- |
| Page                   | `bg-gray-50 dark:bg-dark-400`                  |
| Panel                  | `bg-white dark:bg-dark-300`                    |
| Input/elevated surface | White in light mode; `dark-200` in dark mode   |
| Border                 | `border-gray-200 dark:border-dark-100`         |
| Main text              | `text-gray-900 dark:text-gray-100`             |
| Secondary text         | `text-gray-600 dark:text-gray-400`             |
| Action/selection       | Amber `accent`; same meaning in both themes    |
| Success/health         | Teal or green, with an accompanying label/icon |
| Error/destructive      | Red, with an accompanying label/icon           |
| Information            | Blue, only for informational states            |
| Experience             | Purple, consistently across XP displays        |

Use `btn-primary` for the main action, `btn-secondary` for a quiet action and
`btn-outline` for a bordered alternative. Primary buttons use white on dark amber
in light mode and near-black on amber in dark mode; avoid white on amber-500.
`ui-tab` plus `ui-tab-active` is the standard filter/selection treatment.
Use `ui-link` for inline links. Do not give each page its own action palette.

Keep normal surfaces and buttons solid. Avoid decorative multicolor gradients,
rainbow statistics, pulsing card borders and colored glow shadows. Attribute/type,
stage and achievement tier colors identify game data; keep them on compact badges
or labels rather than coloring whole cards. Arena scenery, sprite lighting and
brief XP/evolution effects may use gradients because they depict the game.
Use existing named palette tokens instead of duplicating hex colors.

Task activity uses neutral day cells with subtle amber fills for active days and
an amber outline for today. Show counts and readable weekday labels rather than
relying on color intensity. Reserve purple for experience displays.

## Typography and interaction

- Nunito is the body font; Fredoka is the display font. Use `ui-section-title` for
  section headings, `ui-description` for page descriptions. Normal copy is 14–16px
  with comfortable line height; readable metadata is 12px. Tiny sprite-overlay
  numerals are a game-specific exception, not a pattern for forms or paragraphs.
- Shared buttons, fields, tabs and icon buttons have a minimum 44px target. Use
  `ui-icon-button` and an explicit `aria-label` for icon-only actions.
- Dense Digimon cards use `ui-card-action`: a 32px visible action with a 44px
  target on phones/touch devices, and a 32px target on larger screens with a fine
  pointer. Active/Full are compact neutral status badges, not disabled buttons.
- Give every field a visible associated label or an accessible name. Expose toggle
  state using `aria-pressed` or the native checkbox state. Use native buttons and
  links for keyboard interaction.
- Show visible keyboard focus. Disable submitting controls and show a busy label;
  do not substitute a silent no-op handler. Keep async business logic in its current
  store/server owner.
- Dialogs need a readable title, bounded height with scrolling, phone gutters,
  focus containment/restoration and Escape/backdrop dismissal when safe. Prefer
  the installed Headless UI dialog primitives for new dialogs. Avoid dismissing a
  dialog while its irreversible submission is pending.
- Use `ui-empty` for empty states and explain the next useful action. Loading
  skeletons should resemble the real layout. Do not communicate state by color
  alone. Respect reduced-motion preferences.
- Use the named z-index scale: `sticky` navigation, `dropdown` menus, `modal`
  dialogs, `toast` notifications, `overlay` fullscreen game animations.

## Arena presentation

Arena playback: show attacker-to-target cues at recorded hit time, target markers
during special charging, and damage labels that remain readable as the arena
scales. Use attacker attribute colors for specials, quieter normal impacts and
short camera highlights with cooldowns. Reduced motion uses a fixed wide view
with labels and targeting cues, without zooms, recoil or particle bursts. These
effects must not change recorded combat, rewards or replay format. Keep playback
focused on the arena: no battle log or behavior captions beneath skill bars.

## Loading states

- Use `LoadingIndicator` for operations: amber spinner, shared status text and
  `inline`, `section` or `screen` layout. Its visual reveal waits 150ms to avoid
  flashes; accessible status and reserved space appear immediately.
- Reserve `screen` for app initialization and standalone authentication. Route
  loading belongs inside `Layout`, keeping navigation visible. Avoid sliding or
  exit animations that leave blank space between pages.
- Use neutral skeletons matching the final layout for initial data loads, with
  the shared `ui-skeleton-pulse` animation and a single accessible status label.
  Keep headings, gutters and panel sizes stable.
- Keep existing content during refreshes and saves. Indicate pending work on
  the initiating control and disable duplicate submissions instead of replacing
  a populated page with a loader. Clear old content when its account or query
  identity changes; do not show one user's data for another user.
- Bundled synchronous data does not need a loading state. Do not add artificial
  minimum waits. Respect reduced motion for spinners and skeletons.

## Review checklist

Check light and dark themes at 320/375px, 768px, 1024px and 1440px. Inspect page
gutters, heading alignment, long names, wrapped actions, panel padding, table
scrolling and bottom navigation overlap. Exercise keyboard focus, disabled/busy,
loading, empty, error and populated states. A successful build does not establish
visual correctness. Use local fixtures for account-dependent browser review; do
not mutate production accounts to populate screenshots.

See `UI_REVIEW.md` for the review scope, changes and remaining work.
