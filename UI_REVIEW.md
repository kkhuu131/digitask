# UI review — September 2026

## Scope

Reviewed the route map in `App.tsx`, all page sources, shared CSS/Tailwind tokens,
navigation, task UI, collection UI, reward dialogs and modal layering. This is a
consistency pass on the existing application, preserving game and data behavior.
The conventions are in `UI_GUIDELINES.md`.

## Findings and changes

| Area                      | Finding                                                                                             | Change                                                                                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application shell         | Desktop navigation crowded tablet widths; nested page gutters caused different alignments           | Compact navigation below 1024px, single shell gutters, safe-area clearance and skip-to-content link                                                     |
| Shared controls           | Primary actions changed from blue to amber between themes; secondary actions changed purple to blue | Shared amber primary, neutral secondary, consistent focus and disabled states; 44px targets                                                             |
| Panels/type               | Different shadows, borders, padding and page title fonts                                            | Quiet bordered panels, responsive 16/24px padding, shared page/section title styles                                                                     |
| Achievements              | Gradient actions, animated tier borders, tiny/low-contrast metadata and three squeezed pinned slots | Solid amber actions, neutral cards, tier badges/labels, readable metadata, stacked phone slots, busy/disabled claim controls                            |
| Dashboard/tasks           | Blue add-task action and gradient submit actions; search icon could overlap text                    | Shared actions, accessible fields/icon controls, readable mobile task rows with a separate action row, and amber achievement callout                    |
| DigiFarm/DigiDex          | Extra gutters and gradient graph toggle with contradictory display classes                          | Shell-aligned pages, readable named farm cards and transfer controls, and solid outline graph toggle with inline icon/text                              |
| Social/profile            | Purple action theme, extra page padding and overly bright stat text in light mode                   | Amber links/actions, standard gutters, neutral panels and theme-aware stat labels                                                                       |
| Arena/tournament          | Extra outer spacing; oversized centered tournament header and separate button colors                | Shared headings, gutters and primary actions; solid result panel surfaces                                                                               |
| Store                     | Double header spacing, gradient balance badge and excessive phone grid padding                      | Compact consistent header, quiet amber balance badge and responsive panel padding                                                                       |
| Admin tools               | Extra gutters; tournament editor forced columns on phones; edit fields forced two columns           | Shared titles/gutters, stacked phone editor, responsive fields                                                                                          |
| Authentication            | Recovery screens did not match other auth screens and lacked dark surfaces                          | Shared fields/actions, bounded centered recovery panel, dark mode support and named surface tokens                                                      |
| Reward/report dialogs     | Gradient reward header, clipped tall contents, weak dark-mode support                               | Solid reward header/selection, responsive choices, bounded scrolling, Headless UI reward dialog focus/dismissal, shared report fields and dark surfaces |
| Marketing/onboarding/help | Multicolor hero text, gradient onboarding background, blue manual navigation                        | Solid hero accent and onboarding surface; neutral manual headers and amber selection                                                                    |
| Layering/accessibility    | Arbitrary 9999 stacking, missing icon labels, navigation menus left open after routing              | Named layers, labeled achievement controls, Escape/route menu dismissal and reduced-motion CSS                                                          |

## Further improvements

These require deliberate interaction changes beyond spacing/color consistency:

- Adopt Headless UI dialog primitives across remaining legacy dialogs to unify
  focus trapping, initial focus, Escape handling and screen-reader semantics.
- Convert clickable Digimon card containers into keyboard-operable controls without
  nesting their transfer/action buttons inside another button.
- Continue improving tiny 8–10px metadata in specialized sprite overlays and admin
  species pickers. Farm transfer controls and card names now use readable 12px text
  with larger cards; other dense game displays need individual layout review.
- Audit the manual and patch-note content against current gameplay. Historical
  patch entries remain historical; visual cleanup does not update their claims.
- Continue migrating specialized custom form/filter classes to shared controls
  when changing those features. Semantic game colors and battle effects remain.
- Inspect live data edge cases and all modal interaction states in a staging
  session before release; fixture review cannot establish every account state.

## Validation

Loading follow-up: added shared amber indicators with a delayed visual reveal and
reduced-motion support, plus one gentle skeleton animation. Lazy route fallbacks
now stay inside the navigation shell, without sliding page transitions. Populated
task lists and battle options remain visible during updates. Task completion stays
disabled until its request settles. The bundled Digimon catalog initializes
synchronously, removing its initial loading flash. Dashboard/profile skeletons
keep the normal heading or gutters. Local slow-load checks at 320/1440px in both
themes verified shell retention, task filter/content retention, duplicate
completion prevention, initial skeletons and reduced-motion behavior.

- Reviewed 168 distinct viewport/theme fixture states in headless Chrome at 320,
  375, 768, 1024 and 1440px. The fixtures cover application, admin, authentication
  and marketing screens, daily team setup, grouped/ungrouped tasks, the reward
  picker and the evolution graph. No page-level overflow or browser runtime
  errors remained in those checked states.
- The scan found an overflowing patch-note URL; its wrapping was corrected and
  rechecked in both themes. Visual inspection found the mobile floating add button
  could cover task actions. Creation now sits in the task header on all sizes,
  keeping row actions clear. The task panel uses the shared padding convention.
- Verified reward-picker keyboard focus containment/restoration, Escape dismissal,
  blocked dismissal while submitting, disabled submission controls, compact menu
  dismissal, desktop dropdown Escape/focus restoration, task search/grouping and
  opening/closing the task editor, and task creation at phone, tablet and desktop
  sizes in both themes.
- Application validation: lint, formatting, 52 existing tests and production build.
  The build retains existing bundle-size, Browserslist and mixed-import warnings.
- Browser checks used dummy test configuration and local in-memory fixtures with
  intercepted backend responses. They did not exercise protected-route startup,
  production authentication, every data state or all dialogs. Onboarding,
  CreatePet, AuthCallback and Debug received source review, rather than complete
  browser flow coverage. A live staging smoke test remains useful before release.

Temporary fixture tooling and screenshots are in ignored `.ui-review.local/`;
they are review artifacts, not application routes or new project dependencies.
