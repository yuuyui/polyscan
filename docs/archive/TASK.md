# Polyscan Implementation Task

## DESIGN REFERENCES
- `design.md` — full architecture spec
- `stitch/design-system.html` — color tokens, typography, components
- `stitch/scanner-main.html` — mobile design
- `stitch/scanner-desktop.html` — desktop design

---

## STEP 1: Scaffold

```bash
cd /home/dev/projects/polyscan
npm create vite@latest . -- --template react-ts --force
npm install
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
npm install recharts
npx tailwindcss init -p
```

---

## STEP 2: tailwind.config.js

```js
export default {
  content: ["./index.html","./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary-fixed":     "#00fd87",
        "primary-dim":       "#00ed7e",
        "primary":           "#a4ffb9",
        "on-primary":        "#003919",
        "on-primary-container": "#005b2c",
        "secondary":         "#ffb4ab",
        "secondary-dim":     "#ff7169",
        "secondary-container":"#8d1d1e",
        "surface-lowest":    "#000000",
        "surface-dim":       "#0e0e0e",
        "surface":           "#131313",
        "surface-low":       "#1c1b1b",
        "surface-container": "#201f1f",
        "surface-high":      "#2a2a2a",
        "surface-highest":   "#353534",
        "on-surface":        "#e5e2e1",
        "on-surface-variant":"#b9cbb9",
        "outline":           "#849585",
        "outline-variant":   "#3b4b3d",
      },
      fontFamily: {
        mono: ['"JetBrains Mono"','monospace'],
        sg:   ['"Space Grotesk"','sans-serif'],
        body: ['Inter','sans-serif'],
      },
      borderRadius: { DEFAULT:"0px", lg:"0px", xl:"0px", full:"9999px" },
    },
  },
  plugins: [],
}
```

---

## STEP 3: Add to index.html <head>

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
```

---

## STEP 4: vite.config.ts

```ts
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://clob.polymarket.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
})
```

---

## STEP 5: src/test/setup.ts

```ts
import "@testing-library/jest-dom"
```

---

## STEP 6: src/types.ts

```ts
export interface GapResult {
  question: string
  slug: string
  yes: number
  no: number
  sum: number
  gap: number
  direction: "OVER" | "UNDER" | "FAIR"
}
export type FilterDirection = "ALL" | "OVER" | "UNDER"
```

---

## STEP 7: src/config.ts

```ts
export const CLOB_HOST = "/api"
export const MIN_GAP = 0.03
export const BATCH_SIZE = 500
export const FEE_RATE = 0.02
```

---

## STEP 8: src/api/polymarket.ts

```ts
import { CLOB_HOST, BATCH_SIZE } from "../config"

export interface Market {
  question: string
  market_slug: string
  tokens: { token_id: string; outcome: string }[]
  active: boolean
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size))
  return chunks
}

export async function fetchAllMarkets(): Promise<Market[]> {
  let cursor = ""
  const all: Market[] = []
  do {
    const url = `${CLOB_HOST}/markets?active=true${cursor ? `&next_cursor=${cursor}` : ""}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Markets fetch failed: ${res.status}`)
    const data = await res.json()
    const items: Market[] = (data.data ?? []).filter((m: Market) => m.tokens?.length >= 2)
    all.push(...items)
    cursor = data.next_cursor ?? ""
  } while (cursor && cursor !== "LTE=")
  return all
}

export async function fetchMidpoints(markets: Market[]): Promise<Record<string, number>> {
  const tokenIds = markets.flatMap(m => m.tokens.map(t => t.token_id))
  const batches = chunk(tokenIds, BATCH_SIZE)
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

---

## STEP 9: src/utils/calculator.ts

```ts
import type { Market } from "../api/polymarket"
import type { GapResult } from "../types"

export function calcGaps(markets: Market[], prices: Record<string, number>): GapResult[] {
  return markets
    .map(market => {
      const yes = prices[market.tokens[0]?.token_id] ?? 0
      const no  = prices[market.tokens[1]?.token_id] ?? 0
      if (yes === 0 || no === 0) return null
      const sum = yes + no
      const gap = Math.abs(1.0 - sum)
      const direction: GapResult["direction"] = sum < 1 ? "UNDER" : sum > 1 ? "OVER" : "FAIR"
      return { question: market.question, slug: market.market_slug, yes, no, sum, gap, direction }
    })
    .filter((r): r is GapResult => r !== null)
}
```

---

## STEP 10: src/hooks/useScan.ts

```ts
import { useState, useCallback } from "react"
import { fetchAllMarkets, fetchMidpoints } from "../api/polymarket"
import { calcGaps } from "../utils/calculator"
import type { GapResult } from "../types"

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

---

## STEP 11: src/components/StatsBar.tsx

```tsx
interface Props {
  totalScanned: number
  found: number
  lastScanAt: Date | null
  isScanning: boolean
}
export function StatsBar({ totalScanned, found, lastScanAt, isScanning }: Props) {
  const timeStr = lastScanAt
    ? lastScanAt.toUTCString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1") + " UTC"
    : "—"
  return (
    <div className="grid grid-cols-3 gap-1">
      <div className="bg-surface-low border border-surface-high p-3 lg:p-5 flex flex-col justify-between">
        <div className="text-[10px] font-mono text-outline uppercase">Markets Scanned</div>
        <div className="text-2xl lg:text-4xl font-mono font-bold text-on-surface mt-2">{totalScanned.toLocaleString()}</div>
      </div>
      <div className="bg-surface-low border border-surface-high p-3 lg:p-5 flex flex-col justify-between">
        <div className="text-[10px] font-mono text-outline uppercase">Gaps Found</div>
        <div className="text-2xl lg:text-4xl font-mono font-bold text-primary-fixed mt-2">{String(found).padStart(2, "0")}</div>
      </div>
      <div className="bg-surface-low border border-surface-high p-3 lg:p-5 flex flex-col justify-between">
        <div className="text-[10px] font-mono text-outline uppercase">Last Scan</div>
        <div className="text-lg lg:text-2xl font-mono font-bold text-on-surface mt-2">
          {isScanning ? <span className="text-primary-fixed animate-pulse">SCANNING…</span> : timeStr}
        </div>
      </div>
    </div>
  )
}
```

---

## STEP 12: src/components/FilterBar.tsx

```tsx
import type { FilterDirection } from "../types"
interface Props {
  minGap: number
  direction: FilterDirection
  onMinGapChange: (v: number) => void
  onDirectionChange: (d: FilterDirection) => void
}
export function FilterBar({ minGap, direction, onMinGapChange, onDirectionChange }: Props) {
  return (
    <div className="bg-surface-low border border-surface-high p-4 lg:p-6 space-y-4">
      <h3 className="text-[10px] font-mono text-outline uppercase tracking-widest">Control_Parameters</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-mono">
          <span className="text-outline uppercase">Min Gap Threshold</span>
          <span className="text-primary-fixed">{(minGap * 100).toFixed(0)}¢ minimum</span>
        </div>
        <input
          type="range" min="1" max="20" value={Math.round(minGap * 100)}
          onChange={e => onMinGapChange(Number(e.target.value) / 100)}
          className="w-full h-1 bg-surface-highest appearance-none cursor-pointer accent-[#00fd87]"
        />
      </div>
      <div className="flex bg-surface-lowest border border-surface-high">
        {(["ALL","OVER","UNDER"] as FilterDirection[]).map(d => (
          <button key={d} onClick={() => onDirectionChange(d)}
            className={`flex-1 py-2 text-[10px] font-mono font-bold uppercase transition-colors ${
              direction === d ? "bg-primary-fixed text-black" : "bg-surface-dim text-outline hover:text-on-surface"
            }`}>{d}</button>
        ))}
      </div>
    </div>
  )
}
```

---

## STEP 13: src/components/GapBarChart.tsx

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { GapResult } from "../types"
interface Props { results: GapResult[] }
export function GapBarChart({ results }: Props) {
  const data = results.slice(0, 20).map(r => ({
    name: r.question.slice(0, 20) + "…",
    gap: parseFloat((r.gap * 100).toFixed(2)),
    direction: r.direction,
  }))
  if (data.length === 0) return (
    <div className="bg-surface-low border border-surface-high p-6 flex items-center justify-center h-40">
      <span className="text-outline font-mono text-xs">NO DATA — RUN SCAN</span>
    </div>
  )
  return (
    <div className="bg-surface-low border border-surface-high p-4 lg:p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[10px] font-mono text-outline uppercase tracking-widest">Real-Time Gap Distribution</h3>
        <div className="flex gap-4 text-[8px] font-mono">
          <span className="flex items-center gap-1"><span className="w-2 h-2 inline-block bg-primary-fixed"></span>UNDER</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 inline-block bg-secondary"></span>OVER</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data}>
          <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill:"#849585", fontSize:9, fontFamily:"JetBrains Mono" }} axisLine={false} tickLine={false} unit="¢" />
          <Tooltip
            contentStyle={{ background:"#201f1f", border:"1px solid #353534", borderRadius:0, fontSize:10, fontFamily:"JetBrains Mono" }}
            labelStyle={{ color:"#b9cbb9" }}
            formatter={(v: number) => [`${v}¢`,"Gap"]}
          />
          <Bar dataKey="gap">
            {data.map((entry, i) => <Cell key={i} fill={entry.direction === "UNDER" ? "#00fd87" : "#ffb4ab"} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

---

## STEP 14: src/components/ResultTable.tsx

```tsx
import { useState } from "react"
import type { GapResult } from "../types"
type SortKey = keyof Pick<GapResult, "gap"|"yes"|"no"|"sum">
export function ResultTable({ results }: { results: GapResult[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("gap")
  const [sortAsc, setSortAsc] = useState(false)
  const sorted = [...results].sort((a, b) => sortAsc ? a[sortKey]-b[sortKey] : b[sortKey]-a[sortKey])
  const toggle = (k: SortKey) => { if (k===sortKey) setSortAsc(!sortAsc); else { setSortKey(k); setSortAsc(false) } }
  const th = "px-4 py-3 font-normal text-[10px] font-mono text-outline uppercase tracking-widest cursor-pointer hover:text-on-surface select-none"
  return (
    <div className="border border-surface-high overflow-hidden">
      <div className="px-5 py-3 border-b border-surface-high flex justify-between items-center bg-surface-dim">
        <span className="text-[10px] font-mono text-outline uppercase tracking-widest">ACTIVE_ARBITRAGE_SIGNALS</span>
        <span className="text-[10px] font-mono text-outline">{results.length} signals</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-[11px]">
          <thead>
            <tr className="bg-surface-container border-b border-surface-highest">
              <th className={th + " text-left"}>Market / Question</th>
              {(["yes","no","sum","gap"] as SortKey[]).map(k => (
                <th key={k} className={th + " text-right"} onClick={() => toggle(k)}>
                  {k.toUpperCase()} {sortKey===k ? (sortAsc?"↑":"↓") : ""}
                </th>
              ))}
              <th className={th + " text-center"}>DIR</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-outline text-xs">No gaps found — try lowering the threshold or run a scan</td></tr>
            ) : sorted.map((r, i) => (
              <tr key={i}
                className={`border-b border-surface-dim hover:bg-surface-high transition-colors cursor-pointer ${i%2===0?"bg-surface-low":"bg-surface-container"}`}
                onClick={() => window.open(`https://polymarket.com/event/${r.slug}`,"_blank")}
              >
                <td className="px-4 py-3 text-on-surface max-w-[200px] lg:max-w-xs truncate">{r.question}</td>
                <td className="px-4 py-3 text-right text-on-surface-variant">{r.yes.toFixed(3)}</td>
                <td className="px-4 py-3 text-right text-on-surface-variant">{r.no.toFixed(3)}</td>
                <td className="px-4 py-3 text-right text-on-surface-variant">{r.sum.toFixed(3)}</td>
                <td className={`px-4 py-3 text-right font-bold ${r.direction==="UNDER"?"text-primary-fixed":"text-secondary"}`}>
                  {r.direction==="UNDER"?"-":"+"}{(r.gap*100).toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase ${r.direction==="UNDER"?"bg-primary-fixed text-black":"bg-secondary text-black"}`}>
                    {r.direction}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

---

## STEP 15: src/components/ScannerPage.tsx

```tsx
import { useState } from "react"
import { useScan } from "../hooks/useScan"
import { StatsBar } from "./StatsBar"
import { FilterBar } from "./FilterBar"
import { GapBarChart } from "./GapBarChart"
import { ResultTable } from "./ResultTable"
import type { FilterDirection } from "../types"

export function ScannerPage() {
  const [minGap, setMinGap] = useState(0.03)
  const [direction, setDirection] = useState<FilterDirection>("ALL")
  const { results, isScanning, lastScanAt, totalScanned, error, scan } = useScan(minGap)
  const filtered = results.filter(r => direction === "ALL" ? true : r.direction === direction)
  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      {error && (
        <div className="bg-secondary-container border border-secondary p-3 text-secondary font-mono text-xs">⚠ {error}</div>
      )}
      <StatsBar totalScanned={totalScanned} found={filtered.length} lastScanAt={lastScanAt} isScanning={isScanning} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        <div className="lg:col-span-4"><FilterBar minGap={minGap} direction={direction} onMinGapChange={setMinGap} onDirectionChange={setDirection} /></div>
        <div className="lg:col-span-8"><GapBarChart results={filtered} /></div>
      </div>
      <ResultTable results={filtered} />
    </div>
  )
}
```

---

## STEP 16: src/App.tsx

```tsx
import { useState } from "react"
import { ScannerPage } from "./components/ScannerPage"
import { useScan } from "./hooks/useScan"

type NavItem = "terminal" | "scanners" | "history" | "settings"
const navItems = [
  { id: "terminal" as NavItem, icon: "terminal", label: "TERMINAL" },
  { id: "scanners" as NavItem, icon: "troubleshoot", label: "SCANNERS" },
  { id: "history" as NavItem, icon: "history", label: "HISTORY" },
  { id: "settings" as NavItem, icon: "settings", label: "SETTINGS" },
]

export default function App() {
  const [active, setActive] = useState<NavItem>("terminal")
  const { isScanning, scan } = useScan(0.03)
  return (
    <div className="min-h-screen bg-surface text-on-surface flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-surface-dim border-r border-surface-high z-40">
        <div className="p-6 border-b border-surface-container">
          <div className="font-sg text-xl font-black tracking-tighter text-primary-fixed uppercase">POLYSCAN</div>
          <div className="font-mono text-[9px] text-outline tracking-widest mt-1">v1.0.0-ALPHA</div>
        </div>
        <nav className="flex-1 mt-2">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 font-mono text-sm font-bold uppercase tracking-tight transition-colors ${
                active===item.id ? "bg-surface-container text-primary-fixed border-r-2 border-primary-fixed" : "text-outline hover:text-on-surface"
              }`}
              style={active===item.id ? { boxShadow:"0 0 10px rgba(0,253,135,0.2)" } : {}}>
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-surface-container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isScanning ? "bg-primary-fixed animate-pulse" : "bg-outline"}`}></div>
              <span className="text-[10px] font-mono text-on-surface-variant">LIVE FEED</span>
            </div>
            <span className="text-[10px] font-mono text-primary-fixed">14MS</span>
          </div>
        </div>
      </aside>

      {/* Tablet Sidebar */}
      <aside className="hidden md:flex lg:hidden flex-col fixed left-0 top-0 h-full w-16 bg-surface-dim border-r border-surface-high z-40">
        <div className="p-4 border-b border-surface-container flex justify-center">
          <span className="material-symbols-outlined text-primary-fixed">terminal</span>
        </div>
        <nav className="flex-1 mt-2">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={`w-full flex justify-center py-3 transition-colors ${active===item.id?"text-primary-fixed":"text-outline hover:text-on-surface"}`}>
              <span className="material-symbols-outlined">{item.icon}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-64 md:ml-16 flex flex-col min-h-screen pb-16 md:pb-0">
        <header className="flex items-center justify-between px-4 lg:px-6 h-14 bg-surface-dim border-b border-surface-high sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary-fixed">terminal</span>
            <h1 className="font-sg font-black tracking-tighter text-primary-fixed uppercase text-lg lg:hidden">POLYSCAN</h1>
            <span className="hidden lg:block text-[10px] font-mono text-outline uppercase tracking-widest">TERMINAL_CORE</span>
          </div>
          <button onClick={scan} disabled={isScanning}
            className="bg-primary-fixed text-black text-xs font-mono font-bold px-4 py-2 uppercase hover:bg-primary-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isScanning ? "SCANNING…" : "SCAN NOW"}
          </button>
        </header>
        {active==="terminal" && <ScannerPage />}
        {active!=="terminal" && (
          <div className="flex-1 flex items-center justify-center">
            <span className="font-mono text-outline text-sm uppercase">Coming Soon — {active}</span>
          </div>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex bg-surface-dim border-t border-surface-high z-40">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${active===item.id?"text-primary-fixed bg-surface-low":"text-outline hover:text-on-surface"}`}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-sg text-[9px] uppercase mt-1">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
```

---

## STEP 17: src/index.css — replace ALL

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* { box-sizing: border-box; }
body {
  background-color: #131313;
  color: #e5e2e1;
  font-family: "Inter", sans-serif;
  -webkit-font-smoothing: antialiased;
  margin: 0;
}
.material-symbols-outlined {
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
  display: inline-block;
  line-height: 1;
}
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: #131313; }
::-webkit-scrollbar-thumb { background: #353534; }
```

---

## STEP 18: src/test/calculator.test.ts

```ts
import { describe, it, expect } from "vitest"
import { calcGaps } from "../utils/calculator"
import type { Market } from "../api/polymarket"

const mk = (q: string, id1: string, id2: string): Market => ({
  question: q, market_slug: q.toLowerCase().replace(/ /g,"-"), active: true,
  tokens: [{ token_id: id1, outcome:"Yes" }, { token_id: id2, outcome:"No" }],
})

describe("calcGaps", () => {
  it("UNDER when sum < 1", () => {
    const r = calcGaps([mk("T","y1","n1")], { y1:0.45, n1:0.52 })
    expect(r[0].direction).toBe("UNDER")
    expect(r[0].sum).toBeCloseTo(0.97)
    expect(r[0].gap).toBeCloseTo(0.03)
  })
  it("OVER when sum > 1", () => {
    const r = calcGaps([mk("T","y2","n2")], { y2:0.58, n2:0.47 })
    expect(r[0].direction).toBe("OVER")
    expect(r[0].sum).toBeCloseTo(1.05)
    expect(r[0].gap).toBeCloseTo(0.05)
  })
  it("FAIR when sum == 1", () => {
    const r = calcGaps([mk("T","y3","n3")], { y3:0.50, n3:0.50 })
    expect(r[0].direction).toBe("FAIR")
    expect(r[0].gap).toBeCloseTo(0)
  })
  it("filters yes=0", () => {
    expect(calcGaps([mk("T","y4","n4")], { y4:0, n4:0.5 })).toHaveLength(0)
  })
  it("filters no=0", () => {
    expect(calcGaps([mk("T","y5","n5")], { y5:0.5, n5:0 })).toHaveLength(0)
  })
  it("filters missing prices", () => {
    expect(calcGaps([mk("T","y6","n6")], {})).toHaveLength(0)
  })
  it("multiple markets", () => {
    const r = calcGaps([mk("M1","a","b"), mk("M2","c","d")], { a:0.6, b:0.45, c:0.5, d:0.5 })
    expect(r).toHaveLength(2)
    expect(r[0].direction).toBe("OVER")
    expect(r[1].direction).toBe("FAIR")
  })
})
```

---

## STEP 19: src/test/polymarket.test.ts

```ts
import { describe, it, expect, vi, beforeEach } from "vitest"
import { fetchAllMarkets, fetchMidpoints } from "../api/polymarket"
import type { Market } from "../api/polymarket"

const mkMkt = (id: string): Market => ({
  question: `Q${id}`, market_slug: `slug-${id}`, active: true,
  tokens: [{ token_id: `yes-${id}`, outcome:"Yes" }, { token_id: `no-${id}`, outcome:"No" }],
})

describe("fetchAllMarkets", () => {
  beforeEach(() => vi.restoreAllMocks())
  it("single page stops at LTE=", async () => {
    vi.spyOn(globalThis,"fetch").mockResolvedValueOnce({ ok:true, json:async()=>({ data:[mkMkt("1")], next_cursor:"LTE=" }) } as Response)
    const r = await fetchAllMarkets()
    expect(r).toHaveLength(1)
    expect(fetch).toHaveBeenCalledTimes(1)
  })
  it("paginates multiple pages", async () => {
    vi.spyOn(globalThis,"fetch")
      .mockResolvedValueOnce({ ok:true, json:async()=>({ data:[mkMkt("1")], next_cursor:"abc" }) } as Response)
      .mockResolvedValueOnce({ ok:true, json:async()=>({ data:[mkMkt("2")], next_cursor:"LTE=" }) } as Response)
    const r = await fetchAllMarkets()
    expect(r).toHaveLength(2)
    expect(fetch).toHaveBeenCalledTimes(2)
  })
  it("stops on empty cursor", async () => {
    vi.spyOn(globalThis,"fetch").mockResolvedValueOnce({ ok:true, json:async()=>({ data:[mkMkt("3")], next_cursor:"" }) } as Response)
    expect(await fetchAllMarkets()).toHaveLength(1)
  })
})

describe("fetchMidpoints", () => {
  beforeEach(() => vi.restoreAllMocks())
  it("single call for < 500 tokens", async () => {
    vi.spyOn(globalThis,"fetch").mockResolvedValueOnce({ ok:true, json:async()=>({ "yes-1":0.5,"no-1":0.5 }) } as Response)
    const r = await fetchMidpoints([mkMkt("1")])
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(r["yes-1"]).toBe(0.5)
  })
  it("2 batches for 300 markets (600 tokens)", async () => {
    vi.spyOn(globalThis,"fetch").mockResolvedValue({ ok:true, json:async()=>({}) } as Response)
    await fetchMidpoints(Array.from({length:300}, (_,i) => mkMkt(`${i}`)))
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
```

---

## STEP 20: Add test script to package.json

Add `"test": "vitest run"` to scripts section.

---

## STEP 21: Run tests
```bash
npm run test
```
All must pass. Fix any failures before continuing.

---

## STEP 22: Build
```bash
npm run build
```
Fix any TypeScript errors. Zero "Type error" allowed.

---

## STEP 23: Dev server
```bash
tmux new-window -t polyscan-dev -n dev
tmux send-keys -t polyscan-dev:dev "cd /home/dev/projects/polyscan && npm run dev" C-m
```
Wait 5s, verify "Local: http://localhost:5173" in output.

---

## STEP 24: Cloudflared tunnel
```bash
tmux new-window -t polyscan-dev -n tunnel
tmux send-keys -t polyscan-dev:tunnel "cloudflared tunnel --url http://localhost:5173" C-m
```
Wait 15s, capture the `https://*.trycloudflare.com` URL.

---

## STEP 25: Verify
Use web_fetch to GET the tunnel URL. Confirm HTML contains "POLYSCAN".
If broken → fix and retry until confirmed working.

---

## STEP 26: Final Report
Report:
- ✅/❌ Tests (pass/fail count)
- ✅/❌ Build status
- 🌐 Tunnel URL
- Any issues found and fixed
