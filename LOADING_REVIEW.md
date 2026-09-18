# Loading consistency review — September 18, 2026

Source scan covers every file in `src/pages/` and `src/components/`, the route
map/initialization in `src/App.tsx`, `src/hooks/useDigimonData.ts`, and relevant
store callers. Searches include loading flags/text, indicators, effects, fetches,
conditional empty states and asynchronous sections. This is a source audit, not
a claim that every account, network failure or route has been exercised live.

## Page coverage

| Pages | Finding and resulting behavior |
| --- | --- |
| Dashboard | Weekly activity reserved with day-cell skeletons; partner progress reveals complete rows instead of text and late bars. |
| AchievementsPage | Initial earned lookup uses card/pin placeholders instead of briefly showing locked cards and a checking caption. Existing earned data remains visible during rechecks. |
| DigimonPlayground | Party/storage cards and unknown counts use placeholders. Empty slots/storage appear after the initial reads. Transfers keep cards visible and use busy controls. |
| DigimonStorePage | Inventory, active-pet and currency reads finish before item cards reveal. Wallet value is masked during this initial load. Bundled greeting initializes synchronously. |
| Battle | Initial opponents use card placeholders; populated options remain visible during refresh. Start/settlement controls retain operation feedback. |
| Tournament | Bracket/status use placeholders during the initial lookup. Entry is hidden until a successful lookup confirms no current tournament. Existing tournament remains visible during operations. |
| ProfilePage | Existing skeleton retained for first load/new profile identity. Roster updates retain populated content; obsolete requests cannot commit profile state. |
| LeaderboardPage | Already fetches related data together and displays neutral row skeletons initially. Tab ranking is synchronous. |
| UserSearchPage | Already uses result-row skeletons for each submitted query. Replacing results is appropriate when query identity changes; search control shows pending status. |
| AdminReportsPage | Report-table placeholders replace text loading. Changing the filter is a new query, so previous-filter rows are not retained during its request. |
| AdminTitlesPage | Table placeholders for initial data; populated table remains visible during a sync/refresh. |
| AdminDigimonManager | Species, evolution and form reads complete together before the editor/list content reveals. Subsequent mutations retain content. |
| AdminUserDigimonPage | Owned-pet placeholder grid replaces provisional “No Digimon found.” Species browser uses bundled data immediately. |
| AdminTournamentTeamsPage | Definitions are initialized synchronously from bundled templates; no data loader needed. |
| Settings | Existing profile username initializes synchronously. Saving retains fields and uses the submit control. |
| LandingPage | Bundled sprite showcase initializes synchronously, removing the initially empty grid. |
| DigimonDexPage, RosterPage | Catalog is bundled and synchronous; filters/views need no artificial loader. |
| Login, Register, ForgotPassword, ResetPassword | Pending authentication/form actions keep explicit busy controls. These are operations, not content skeletons. |
| AuthCallback, CreatePet, OnboardingPage | Auth/navigation/creation operations keep shared indicators or existing busy controls. CreatePet begins its startup check pending, avoiding the starter-form flash. |
| Tutorial, PatchNotes | Static content; no asynchronous data load. |
| Debug | Development diagnostic output represents connection operations, not a user content section. |

## Component coverage

| Components | Finding and resulting behavior |
| --- | --- |
| DigimonEvolutionHistory, NextPartnerReward | Custom sprite/progress skeletons reserve their initial sections; progress refreshes keep existing values. |
| DigimonDetailModal | Owner-only controls derive from existing auth state rather than appearing after another auth request. Saved-stat allocation still reads and verifies real available points. |
| AvatarSelectionModal | Neutral avatar grid during inventory lookup; first render starts pending. |
| DigimonEvolutionModal | Item-dependent options wait behind card placeholders instead of temporarily showing items as missing. Eligibility/actions still require the actual inventory result. |
| TaskHeatmap | Existing initial skeleton kept; loaded activity stays visible during refresh. Placeholder blocks are visible against both themes. |
| ResourceBalance | Optional initial-value placeholder; label, resource icon and help remain in place. Shop uses it while loading. |
| ContentSkeleton, LoadingIndicator | Shared card/list/table placeholder and delayed amber operation indicator. Both use existing reduced-motion conventions. |
| TaskList, CleanTaskList | Existing task-shaped initial skeleton and populated-content retention are already consistent. |
| Digimon, DigimonDex, DigimonEvolutionGraph | Defensive data-loading fallbacks now use content skeletons. Catalog loaders normally do not run because `useDigimonData` initializes synchronously. |
| DigimonShowcase | Bundled random selection computed in the initial state initializer. |
| PartyMembersGrid | Receives store data; evolution eligibility affects animation, not a fetched section. No extra data spinner needed. |
| DigimonDetails, DigimonDetailsDrawer, EvolutionRequirements, DigimonDNASelectionModal, DigimonFormTransformationModal, DigimonSelection, BattleTeamSelector, TournamentBracket | Content is supplied through props/bundled definitions. Selection, evolution and confirmation actions use their existing pending behavior. |
| ArenaBattle, BattleDigimonSprite, BattleAttackEffects, EvolutionAnimation, DigimonSprite | Playback/sprite animation states describe game presentation, not asynchronous content loading. |
| Layout, Onboarding | Header resource values use initial placeholders until both ticket/currency reads settle. Updates retain balances. Lazy-route fallback remains inside the shell. Auth/profile setup and onboarding submission are operations; shared feedback retained. |
| DigiEggSelectionModal, TaskForm, EditTaskModal, ReportButton | User-initiated mutations retain content and explicit busy/disabled controls. |
| PageTutorial, DigimonDialogue, ErrorBoundary, NotificationCenter, UpdateNotification, ThemeToggle, ThemeProvider, TypeAttributeIcon | Conditional help/notifications/theme/error presentation; no fetched content section needing a skeleton. |

## Validation and limits

Application lint, formatting, tests and build are checked for this batch. Browser
fixtures use dummy configuration, intercepted responses and deliberate pending
requests. Eleven views (achievements, farm, store, tournament, reports, titles,
species editor, user-pet editor, avatar picker, profile and navigation shell) passed
44 initial/loaded viewport/theme cases at 320px and 1440px. They verify first-load placeholders, transition to loaded content,
empty-state timing and horizontal overflow in light/dark themes at phone and
desktop widths. History/progress checks also exercise background refreshes; the
profile fixtures verify retaining populated content during a roster refresh, and
shell fixtures verify that background currency refreshes keep balances visible.

Placeholders reserve representative rows/cards; unknown collection lengths and
wrapped text can still change the final section height. There are no artificial
minimum waits. Network errors keep their existing errors/notifications instead
of being interpreted as valid zero progress. Production startup/authentication,
real-account edge cases and all mutation error flows require separate smoke tests.

These are frontend changes; they require no SQL migration and are not deployed
by local checks. Review tooling/screenshots stay in ignored `.ui-review.local/`.
