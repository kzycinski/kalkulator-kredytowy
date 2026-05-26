# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite dev server on port 5173
npm run build        # TypeScript check + Vite production build
npm run build:gh-pages  # Build for GitHub Pages (sets VITE_BASE_PATH)
npm test             # Vitest (single run)
npm run test:watch   # Vitest watch mode
npm run preview      # Serve production build locally
```

Docker alternatives via Makefile:
```bash
make docker-dev      # Dev container with hot reload (src/ mounted)
make docker-prod     # Production Nginx container
```

## Architecture

Polish mortgage calculator SPA. All UI text and formatting is in Polish.

**Pages (routes):**
- `/` — Calculator: loan params + amortization schedule
- `/compare` — Compare: multi-scenario side-by-side (sweep or saved scenarios)
- `/insights` — Insights: interest share and balance race charts
- `/bonus` — Bonus Analysis: optimal annual bonus allocation
- `/doradca` — Doradca: advisor mode with comfort/max budget ranges
- `/scenarios` — Scenarios: saved scenario management and import/export

**State:** Single Zustand store (`src/store/loanStore.ts`) persisted to localStorage under key `kredyt-loan`. All loan parameters, scenarios, and UI configs live here. `resetToDefaults()` clears the store.

**Calculation engines** (`src/lib/calc/`):
- `mortgageCalculator.ts` — core amortization using `Decimal.js` for precision
- `sweepCalculator.ts` — sweeps overpayment amount across a range to produce `SweepResult`
- `sweetSpotAnalyzer.ts` — finds the diminishing-returns inflection point in a sweep
- `scenarios.ts` — runs multiple `UIScenario` configurations and returns comparison data

All heavy computation happens in custom hooks (`src/hooks/`), not components. Hooks consume the Zustand store and return memoized results.

**Financial precision:** Always use `Decimal.js` for monetary arithmetic. Never use native JS floating point for interest or balance calculations.

**Key types** (`src/types/calc.ts`):
- `ScheduleRequest` → `Schedule` (rows + summary) is the central data flow
- `TimeBand` enables per-period recurring overpayment amounts
- `SweepResult` is the output of the sweep calculator consumed by charts and tables

**Formatting** (`src/lib/format.ts`): PLN currency, Polish percentage display, and Polish pluralization rules (e.g. "rok/lata/lat") are centralized here.

**Routing base path:** Controlled by `VITE_BASE_PATH` env var for GitHub Pages subdirectory deployments.

## TypeScript Config Notes

Strict mode is fully enabled including `noUncheckedIndexedAccess`. Array element access (`arr[i]`) returns `T | undefined` — always guard or use non-null assertion with explicit reasoning.
