---
name: Polyscan project overview
description: Polyscan is a Polymarket arbitrage scanner — React+TS+Vite+Tailwind app with Figma design system, no backend
type: project
---

Polyscan is a **Polymarket Arbitrage Scanner** — finds markets where Yes+No midpoint prices don't sum to 1.0.

**Why:** Educational POC to detect arbitrage opportunities in prediction markets.

**How to apply:** All work should stay within scope (scan only, no trading/wallet features).

## Tech Stack
- React + TypeScript + Vite
- Tailwind CSS (custom dark theme via `tailwind.config.js`)
- recharts (GapBarChart)
- No backend — calls Polymarket CLOB API directly via Vite proxy

## Key Files
- `src/api/polymarket.ts` — fetchAllMarkets, fetchMidpoints
- `src/utils/calculator.ts` — calcGaps (pure function)
- `src/hooks/useScan.ts` — scan state + orchestration
- `src/components/` — SignalCard, GapBarChart, FilterBar, StatsBar, ScannerPage, ResultTable
- `src/App.tsx` — Desktop (sidebar) + Mobile (bottom nav) layouts

## Figma
- File: "Polyscan Design System" (fileKey: `dIFXfUTocyKaS6khWnu7Ir`)
- Pages: Design Tokens, Desktop (1440px), Mobile (375px), Components, _archive
- Variable collection: "Polyscan Tokens" — 29 variables (18 colors + 6 surfaces + 5 radii)
- All nodes bound to variables (589 bindings across all pages)
- Components page organized into 6 Sections (Buttons, Badges, Cards, Charts, Navigation, Inputs)
