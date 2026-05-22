# Proposal: Architectural Refactor — Critical Bug Fix + Incremental Extraction

## Intent

Every outbound WhatsApp message says "restaurante" regardless of business type — a critical bug that undermines the core product value. Beyond that, the app's architecture (God Object context, monolithic components, zero tests, uncontrolled API calls, exposed keys) blocks feature velocity and risks production failures. This change fixes the bug first, builds a test safety net, then refactors in verified steps.

## Scope

### In Scope
- **P0**: Fix `generateWhatsAppMessage()` to use `detectBusinessType()` for all 20+ business types
- **P0**: Fix `detectBusinessType()` to use `toLocaleLowerCase('es')` instead of `toLowerCase()`
- **P1**: Add vitest + RTL infrastructure and initial test coverage
- **P1**: Extract `trackedCounts` memoization in `AppContext.jsx` (line 125-130)
- **P1**: Fix `Toast.jsx` — replace `setToasts` exposure with `dismissToast()` callback
- **P2**: Split `SearchBar.jsx` (399 lines) → search logic hook + presentation component
- **P2**: Split `BusinessCard.jsx` (381 lines) → card presentation + action handlers hook
- **P2**: Add rate limiter to `autoAnalyze` (currently 180+ sequential calls at 300ms)
- **P3**: Refactor `AppContext.jsx` God Object (30+ states) → domain contexts (search, UI, contact)
- **P3**: Add TTL + cleanup to localStorage usage (6 keys, no expiry)
- **P3**: Client-side API key exposure mitigation (PageSpeed key in `lighthouseApi.js` line 113)

### Out of Scope
- Server-side backend or API proxy (separate future change)
- UI/UX redesign or new features
- Migration away from localStorage to IndexedDB
- Google Maps API replacement or mocking
- Dark mode or theming changes
- i18n/l10n framework (beyond the `toLocaleLowerCase('es')` fix)

## Capabilities

### New Capabilities
- `whatsapp-messages`: Correct per-business-type message generation with fallback
- `test-infrastructure`: Vitest + React Testing Library setup with initial coverage
- `rate-limiting`: Controlled sequential API call execution with configurable concurrency

### Modified Capabilities
- `context-state`: Extracted domain contexts, memoized derived values, encapsulated toast API
- `search-flow`: Extracted search hook with debouncing and pagination logic separated from UI
- `lighthouse-analysis`: Unified analysis path (eliminate SearchBar/LighthousePanel duplication)

## Approach

Incremental extraction — each phase is independently deployable:

1. **Bug fix first** — zero-risk change, no architecture changes required
2. **Test harness** — validates bug fix, sets foundation for all future refactors
3. **Quick wins** — memoization, toast encapsulation (high impact, low risk)
4. **Component decomposition** — extract hooks from monoliths, keep rendering in components
5. **Context split** — break God Object into domain contexts once tests protect us
6. **Infrastructure** — rate limiting, localStorage TTL, API key proxy

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/utils/promptTemplates.js` | Modified | Fix `generateWhatsAppMessage()` (line 154) and `detectBusinessType()` (line 133) |
| `src/context/AppContext.jsx` | Modified | Memoize `trackedCounts`, fix toast API exposure |
| `src/components/Toast.jsx` | Modified | Remove `setToasts` direct usage (line 33) |
| `src/components/SearchBar.jsx` | Modified | Extract `useSearch` hook, add rate limiter |
| `src/components/BusinessCard.jsx` | Modified | Extract `useBusinessActions` hook |
| `src/components/LighthousePanel.jsx` | Modified | Unify analysis logic with SearchBar |
| `src/utils/lighthouseApi.js` | Modified | API key handling, rate limiter integration |
| `vitest.config.js` | New | Test infrastructure setup |
| `src/__tests__/` | New | Test coverage for bug fix and utilities |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Context split breaks consumer components | Medium | Phase 4 tests validate all consumers before Phase 5 |
| Rate limiting slows UX (user waits longer) | Medium | Make concurrency configurable, add progress indicator |
| localStorage cleanup removes valid data | Low | Add TTL only (no data format change), run cleanup on new sessions |
| `toLocaleLowerCase('es')` on non-Spanish browsers | Low | Feature-detect or use `'es-ES'` with catch-all fallback |

## Rollback Plan

Each phase is a separate commit/PR:
- **P0**: Revert single function change — no side effects
- **P1**: Remove `vitest` devDependency and `__tests__` dir
- **P2-P3**: Each extraction has the original monolith in git history; revert by restoring original file
- At any point: `git revert` the specific phase commit

## Dependencies

- vitest + @testing-library/react + jsdom (devDependencies)
- No new runtime dependencies

## Success Criteria

- [ ] `generateWhatsAppMessage()` returns type-specific messages for all 20 BUSINESS_TYPES, not hardcoded "restaurante"
- [ ] `detectBusinessType(' dentist', 'dentist')` matches with accented chars (e.g., "Cafetería", "Repostería")
- [ ] vitest runs pass with >0 test coverage on `promptTemplates.js`
- [ ] `trackedCounts` recalculates only when `trackedBusinesses` or `contactStatuses` change (not every render)
- [ ] `Toast.jsx` no longer imports or calls `setToasts` directly
- [ ] `autoAnalyze` respects configurable concurrency limit (default: 5 concurrent)
- [ ] `SearchBar.jsx` < 150 lines after hook extraction
- [ ] `AppContext.jsx` split into ≤3 domain contexts with no cross-state cascading renders
- [ ] No localStorage key stores data older than 30 days without TTL metadata
- [ ] PageSpeed API key removed from client bundle (proxied or backend-only)