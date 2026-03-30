# 🔍 Polyscan — Build Tutorial

> How we built an arbitrage scanner for Polymarket from scratch.  
> Step-by-step: idea → design → code → deploy.

---

## Table of Contents

1. [What is Polyscan?](#1-what-is-polyscan)
2. [Project Setup](#2-project-setup)
3. [Architecture Overview](#3-architecture-overview)
4. [Core Logic — Gap Calculation](#4-core-logic--gap-calculation)
5. [API Layer — Polymarket CLOB](#5-api-layer--polymarket-clob)
6. [React Hooks — useScan](#6-react-hooks--usescan)
7. [Design System](#7-design-system)
8. [UI Components](#8-ui-components)
9. [Git Workflow](#9-git-workflow)
10. [Testing](#10-testing)
11. [Build & Deploy](#11-build--deploy)

---

## 1. What is Polyscan?

Polyscan scans **Polymarket prediction markets** and finds **price gaps** —  
markets where `YES price + NO price ≠ 1.00`.

### The Math

In any binary prediction market, one of these must resolve to $1:
- If you hold YES **and** NO, you're guaranteed $1 at resolution.
- So their prices should sum to exactly `1.00`.

When they don't — that's an **arbitrage opportunity**.

```
sum = YES_midpoint + NO_midpoint

sum < 1.0  →  UNDER  →  buy both sides, guaranteed profit
sum > 1.0  →  OVER   →  sell both sides, guaranteed profit
gap = |1.0 - sum|
net = gap - (2 × fee_rate)
```

**Example:**
```
YES = 0.45,  NO = 0.52
sum = 0.97   →  UNDER  →  gap = 3¢
net = 3¢ - 2¢ fee = +1¢ profit per $1 traded
```

---

## 2. Project Setup

### Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v3 |
| Charts | Recharts |
| Testing | Vitest + Testing Library |
| API | Polymarket CLOB (browser fetch, no backend) |

### Install

```bash
git clone https://github.com/yuuyui/polyscan.git
cd polyscan
npm install
npm run dev        # → http://localhost:5173
npm run test       # run unit tests
npm run build      # production build
```

### Vite Proxy

We proxy `/api` → `https://clob.polymarket.com` to avoid CORS:

```ts
// vite.config.ts
server: {
  proxy: {
    "/api": {
      target: "https://clob.polymarket.com",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ""),
    },
  },
}
```

---

## 3. Architecture Overview

```
src/
├── api/
│   └── polymarket.ts      ← fetchAllMarkets, fetchMidpoints
├── utils/
│   └── calculator.ts      ← calcGaps (pure function)
├── hooks/
│   └── useScan.ts         ← scan state + orchestration
├── components/
│   ├── ScannerPage.tsx    ← main page
│   ├── StatsBar.tsx       ← summary stats
│   ├── FilterBar.tsx      ← gap slider + direction toggle
│   ├── GapBarChart.tsx    ← recharts bar chart
│   └── ResultTable.tsx    ← sortable results table
├── types.ts               ← GapResult, FilterDirection
└── config.ts              ← CLOB_HOST, MIN_GAP, FEE_RATE
```

**Data flow:**
```
[useScan]
    → fetchAllMarkets()   ← paginated CLOB /markets
    → fetchMidpoints()    ← batched CLOB /midpoints
    → calcGaps()          ← pure: Market[] + prices → GapResult[]
    → filter by minGap
    → setState → re-render
```

---

## 4. Core Logic — Gap Calculation

The heart of Polyscan is a **pure function** — easy to test, no side effects.

```ts
// src/utils/calculator.ts

export function calcGaps(
  markets: Market[],
  prices: Record<string, number>
): GapResult[] {
  return markets
    .map(market => {
      const yes = prices[market.tokens[0]?.token_id] ?? 0
      const no  = prices[market.tokens[1]?.token_id] ?? 0

      // skip no-liquidity markets
      if (yes === 0 || no === 0) return null

      const sum = yes + no
      const gap = Math.abs(1.0 - sum)
      const direction = sum < 1 ? "UNDER" : sum > 1 ? "OVER" : "FAIR"

      return { question: market.question, slug: market.market_slug,
               yes, no, sum, gap, direction }
    })
    .filter((r): r is GapResult => r !== null)
}
```

**Why pure?**  
No API calls, no state, no side effects — just math.  
This makes it trivially testable and reusable.

---

## 5. API Layer — Polymarket CLOB

### fetchAllMarkets — Paginated

Polymarket returns markets in pages of ~100. We loop until cursor = `"LTE="`.

```ts
// src/api/polymarket.ts

export async function fetchAllMarkets(): Promise<Market[]> {
  let cursor = ""
  const all: Market[] = []

  do {
    const url = `${CLOB_HOST}/markets?active=true${cursor ? `&next_cursor=${cursor}` : ""}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Markets fetch failed: ${res.status}`)

    const data = await res.json()
    const items = (data.data ?? []).filter((m: Market) => m.tokens?.length >= 2)
    all.push(...items)
    cursor = data.next_cursor ?? ""
  } while (cursor && cursor !== "LTE=")

  return all
}
```

### fetchMidpoints — Batched

CLOB has a rate limit. We batch token IDs in groups of 500.

```ts
export async function fetchMidpoints(
  markets: Market[]
): Promise<Record<string, number>> {
  const tokenIds = markets.flatMap(m => m.tokens.map(t => t.token_id))
  const batches = chunk(tokenIds, BATCH_SIZE)   // 500 per batch
  const result: Record<string, number> = {}

  for (const batch of batches) {
    const res = await fetch(`${CLOB_HOST}/midpoints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ params: batch.map(id => ({ token_id: id })) }),
    })
    if (!res.ok) throw new Error(`Midpoints fetch failed: ${res.status}`)
    const data = await res.json()
    Object.assign(result, data)
  }

  return result
}
```

**Why batch?**  
A full scan can have 1,000+ markets = 2,000+ tokens.  
Sending them all at once would hit rate limits and timeout.  
Batching at 500 keeps each request fast and within limits.

---

## 6. React Hooks — useScan

All scan state lives in one custom hook.

```ts
// src/hooks/useScan.ts

export function useScan(minGap: number) {
  const [results, setResults] = useState<GapResult[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [lastScanAt, setLastScanAt] = useState<Date | null>(null)
  const [totalScanned, setTotalScanned] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const scan = useCallback(async () => {
    setIsScanning(true)
    setError(null)
    try {
      const markets = await fetchAllMarkets()
      setTotalScanned(markets.length)
      const prices = await fetchMidpoints(markets)
      const gaps = calcGaps(markets, prices)
      setResults(gaps.filter(g => g.gap >= minGap))
      setLastScanAt(new Date())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed")
    } finally {
      setIsScanning(false)
    }
  }, [minGap])

  return { results, isScanning, lastScanAt, totalScanned, error, scan }
}
```

**Why a custom hook?**  
- Keeps components clean — `ScannerPage` just calls `scan()`
- Logic is reusable — multiple components can share the same scan state
- `useCallback` prevents unnecessary re-renders

---

## 7. Design System

All design tokens live in `tailwind.config.js`.  
Colors match the Figma V2 spec exactly.

```js
// tailwind.config.js
colors: {
  /* Backgrounds */
  "bg-base":       "#0e0d14",   // page background
  "bg-card":       "#22202e",   // card surface
  "bg-card-inner": "#1a1826",   // YES/NO/SUM boxes
  "bg-sidebar":    "#13121e",   // sidebar

  /* Primary Action */
  "primary":       "#33ff99",   // SCAN NOW button (default)
  "primary-hover": "#00ccc9",   // SCAN NOW button (hover)
  "on-primary":    "#000000",   // text on primary

  /* Direction Filter */
  "filter-active": "#e566ff",   // ALL/OVER/UNDER active state

  /* Signal Direction */
  "under-bg":      "#0d2218",   // UNDER badge background
  "under-text":    "#00fd87",   // UNDER badge text + values
  "over-bg":       "#2a1212",   // OVER badge background
  "over-text":     "#ff5f52",   // OVER badge text + values

  /* Typography */
  "text-primary":  "#ffffff",
  "text-secondary":"#c0c0c0",
  "text-muted":    "#6b6882",

  /* Borders */
  "border-default":"#2e2c3e",
}
```

### Typography

| Usage | Font | Weight |
|-------|------|--------|
| Brand, labels, data | JetBrains Mono | 400–900 |
| Card titles | Inter | 600–700 |

### Button States

| Button | Default | Hover |
|--------|---------|-------|
| SCAN NOW | `#33ff99` bg, black text | `#00ccc9` bg |
| Filter (active) | `#e566ff` bg, black text | — |
| Filter (inactive) | transparent, `#1a1a2e` text | `#c0c0c0` text |

---

## 8. UI Components

### App.tsx — Layout

```
┌─────────────────────────────────────────────────────┐
│ HEADER (56px) — brand + tabs + timestamp + SCAN NOW │
├─────────────────────────────────────────────────────┤
│ TICKER (28px) — scrolling signal feed               │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│  SIDEBAR     │  CARD GRID (2-column)                │
│  240px       │                                      │
│  · nav       │  ┌──────────┐  ┌──────────┐         │
│  · stats     │  │  Card 1  │  │  Card 2  │         │
│  · filters   │  └──────────┘  └──────────┘         │
│              │  ┌──────────┐  ┌──────────┐         │
│              │  │  Card 3  │  │  Card 4  │         │
│              │  └──────────┘  └──────────┘         │
├──────────────┴──────────────────────────────────────┤
│ FOOTER (32px) — API info + connection status        │
└─────────────────────────────────────────────────────┘
```

### SignalCard — Anatomy

```
┌─────────────────────────────────────────────────────┐
│ [UNDER]  Scanned 06:45 UTC          ↑ gap widening  │
│                                                     │
│ ▐▐▐▐▐▐  Fed Rate Hike Sept 2024              7.0%  │
│  spark                                         raw  │
│  line   ┌───────┐  ┌───────┐  ┌───────┐      +5.0% │
│         │  YES  │  │  NO   │  │  SUM  │       net  │
│         │ 0.890 │  │ 0.040 │  │ 0.930 │            │
│         └───────┘  └───────┘  └───────┘            │
├─────────────────────────────────────────────────────┤
│ ██████████████████████░░░░░░░  (70% gap bar)        │
│ gap: 7.0¢ below fair value · buy YES + NO           │
└─────────────────────────────────────────────────────┘
```

Key design decisions:
- **SUM box** has colored border matching direction (green/red)
- **Gap %** is 44px — the most important number on the card
- **Net profit** shows after 2% fee — tells you if it's actually worth it
- **Opacity 0.6** on low-priority cards — visual hierarchy without hiding

---

## 9. Git Workflow

Every change goes through this flow — no exceptions.

```
1. Create Issue       gh issue create ...
        ↓
2. Owner approves     wait for "ได้เลย" / "ทำได้"
        ↓
3. Create Branch      git checkout -b feat/issue-<n>-<desc>
        ↓
4. Implement          write code + tests
        ↓
5. Push + PR          git push && gh pr create ...
        ↓
6. Tester reviews     runs tests, checks acceptance criteria
        ↓
7. Owner merges       gh pr merge (owner only)
```

### Branch Naming

```bash
feat/issue-7-figma-v2-ui-overhaul
fix/issue-5-restore-tester-flow
docs/issue-3-tester-workflow
```

### Commit Format

```
feat: add SignalCard component with sparkline

Closes #7
```

---

## 10. Testing

We use **Vitest** + **Testing Library**. Tests live next to the code they test.

### Run Tests

```bash
npm run test          # run once
npm run test -- --watch   # watch mode
```

### What We Test

#### `calcGaps` — Core Logic

```ts
// src/test/calculator.test.ts

it("UNDER when sum < 1", () => {
  const r = calcGaps([market("y1","n1")], { y1:0.45, n1:0.52 })
  expect(r[0].direction).toBe("UNDER")
  expect(r[0].gap).toBeCloseTo(0.03)
})

it("filters yes=0 (no liquidity)", () => {
  expect(calcGaps([market("y","n")], { y:0, n:0.5 })).toHaveLength(0)
})
```

#### `fetchAllMarkets` — Pagination

```ts
it("stops at LTE= cursor", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: [market("1")], next_cursor: "LTE=" })
  } as Response)

  const r = await fetchAllMarkets()
  expect(r).toHaveLength(1)
  expect(fetch).toHaveBeenCalledTimes(1)
})
```

### Test Philosophy

- **Pure functions first** — `calcGaps` has no deps, test everything
- **Mock at the boundary** — mock `fetch`, not internal logic  
- **Test behavior, not implementation** — does it return the right result?

---

## 11. Build & Deploy

### Production Build

```bash
npm run build
# → dist/ directory
```

TypeScript strict mode — zero type errors allowed before deploy.

### Local Preview with Cloudflare Tunnel

```bash
npm run dev &
cloudflared tunnel --url http://localhost:5173
# → https://<random>.trycloudflare.com
```

Use this to share a working preview without deploying.

### Design Mockups

Static HTML mockups live in `stitch/`:

```
stitch/
├── scanner-main.html      ← mobile live feed
├── scanner-desktop.html   ← desktop with sidebar
├── design-system.html     ← color tokens + typography
└── layout-*.html          ← 5 layout explorations
```

Open locally or serve with:
```bash
cd stitch && python3 -m http.server 8899
```

---

## What's Next

- [ ] Auto-refresh every N seconds (toggle in sidebar)
- [ ] Net profit after fee column in table
- [ ] Telegram / LINE alert when gap > threshold
- [ ] Export to CSV
- [ ] Neg-risk (multi-outcome) market support
- [ ] Historical gap tracking

---

> Built with ❤️ — Polymarket CLOB API + React + TypeScript + Vite
