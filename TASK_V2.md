# Polyscan V2 — Figma UI Overhaul Task

## Branch
`feat/issue-7-figma-v2-ui-overhaul`

## Figma References
- File: https://www.figma.com/design/8pauNIpxMvNjWWzR3fNIkk/Untitled
- Node 1:1318 = desktop full layout
- Node 1:1762 = component detail

---

## STEP 1: Update tailwind.config.js

Replace color tokens with Figma V2 palette:

```js
export default {
  content: ["./index.html","./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Backgrounds */
        "bg-base":        "#0e0d14",
        "bg-card":        "#22202e",
        "bg-card-inner":  "#1a1826",
        "bg-sidebar":     "#13121e",

        /* Primary */
        "primary":        "#33ff99",
        "primary-hover":  "#00ccc9",
        "on-primary":     "#000000",

        /* Filter active */
        "filter-active":  "#e566ff",
        "on-filter":      "#000000",

        /* Text */
        "text-primary":   "#ffffff",
        "text-secondary": "#c0c0c0",
        "text-muted":     "#6b6882",

        /* Badges */
        "under-bg":       "#0d2218",
        "under-text":     "#00fd87",
        "over-bg":        "#2a1212",
        "over-text":      "#ff5f52",

        /* Borders */
        "border-default": "#2e2c3e",
        "border-subtle":  "#1e1d2b",

        /* Legacy compat */
        "surface":           "#0e0d14",
        "surface-dim":       "#13121e",
        "surface-low":       "#22202e",
        "surface-container": "#1a1826",
        "surface-high":      "#2e2c3e",
        "surface-highest":   "#3a3850",
        "on-surface":        "#ffffff",
        "on-surface-variant":"#c0c0c0",
        "outline":           "#6b6882",
        "outline-variant":   "#2e2c3e",
        "primary-fixed":     "#33ff99",
        "primary-dim":       "#00ccc9",
        "secondary":         "#ff5f52",
        "secondary-container":"#2a1212",
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sg:   ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
        lg: "8px",
        full: "9999px",
        none: "0px",
      },
    },
  },
  plugins: [],
}
```

---

## STEP 2: Update src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* { box-sizing: border-box; }
body {
  background-color: #0e0d14;
  color: #ffffff;
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
::-webkit-scrollbar-track { background: #0e0d14; }
::-webkit-scrollbar-thumb { background: #2e2c3e; }
```

---

## STEP 3: Create src/components/SignalCard.tsx (NEW component)

```tsx
import type { GapResult } from "../types"

interface Props {
  result: GapResult
}

export function SignalCard({ result }: Props) {
  const isUnder = result.direction === "UNDER"
  const gapPct = (result.gap * 100).toFixed(2)
  const netProfit = (result.gap - 0.04).toFixed(3) // after ~2% fee each side

  // Sparkline bars — 6 bars with varying heights
  const sparkBars = [0.3, 0.6, 0.45, 0.8, 0.55, 1.0]

  return (
    <div
      className="bg-bg-card border border-border-default rounded-sm p-4 cursor-pointer hover:border-border-subtle transition-colors space-y-3"
      onClick={() => window.open(`https://polymarket.com/event/${result.slug}`, "_blank")}
    >
      {/* Header: question + direction badge */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-text-primary text-xs font-body leading-snug line-clamp-2 flex-1">
          {result.question}
        </p>
        <span className={`shrink-0 inline-block px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-sm ${
          isUnder
            ? "bg-under-bg text-under-text"
            : result.direction === "OVER"
            ? "bg-over-bg text-over-text"
            : "bg-surface-high text-text-muted"
        }`}>
          {result.direction}
        </span>
      </div>

      {/* Sparkline */}
      <div className="flex items-end gap-0.5 h-6">
        {sparkBars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-none"
            style={{
              height: `${h * 100}%`,
              background: isUnder
                ? `rgba(0,253,135,${0.3 + h * 0.6})`
                : `rgba(255,95,82,${0.3 + h * 0.6})`,
            }}
          />
        ))}
      </div>

      {/* YES / NO / SUM boxes */}
      <div className="grid grid-cols-3 gap-1">
        {[
          { label: "YES", value: result.yes.toFixed(3) },
          { label: "NO",  value: result.no.toFixed(3) },
          { label: "SUM", value: result.sum.toFixed(3) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-bg-card-inner border border-border-subtle rounded-sm p-2 text-center">
            <div className="text-[9px] font-mono text-text-muted uppercase mb-0.5">{label}</div>
            <div className="text-xs font-mono text-text-primary">{value}</div>
          </div>
        ))}
      </div>

      {/* Gap % large */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[9px] font-mono text-text-muted uppercase mb-0.5">GAP</div>
          <div
            className="font-mono font-bold leading-none"
            style={{ fontSize: "44px", color: isUnder ? "#00fd87" : "#ff5f52" }}
          >
            {isUnder ? "-" : "+"}{gapPct}%
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] font-mono text-text-muted uppercase mb-0.5">NET PROFIT</div>
          <div className={`text-sm font-mono font-bold ${Number(netProfit) > 0 ? "text-under-text" : "text-over-text"}`}>
            {Number(netProfit) > 0 ? "+" : ""}{netProfit}
          </div>
        </div>
      </div>

      {/* Gap bar gradient */}
      <div className="h-1 w-full bg-border-default rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(result.gap * 1000, 100)}%`,
            background: isUnder
              ? "linear-gradient(90deg, #00fd87, #00ccc9)"
              : "linear-gradient(90deg, #ff5f52, #e566ff)",
          }}
        />
      </div>
    </div>
  )
}
```

---

## STEP 4: Update src/components/StatsBar.tsx

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
    <div className="space-y-2">
      {/* Session stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-bg-card border border-border-default rounded-sm p-3">
          <div className="text-[9px] font-mono text-text-muted uppercase mb-1">Scanned</div>
          <div className="text-xl font-mono font-bold text-text-primary">{totalScanned.toLocaleString()}</div>
        </div>
        <div className="bg-bg-card border border-border-default rounded-sm p-3">
          <div className="text-[9px] font-mono text-text-muted uppercase mb-1">Signals</div>
          <div className="text-xl font-mono font-bold text-primary">{String(found).padStart(2, "0")}</div>
        </div>
      </div>

      {/* Live indicator */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${isScanning ? "bg-primary animate-pulse" : "bg-text-muted"}`} />
          <span className="text-[9px] font-mono text-text-muted uppercase">
            {isScanning ? "SCANNING" : lastScanAt ? "LAST: " + timeStr : "IDLE"}
          </span>
        </div>
        <span className="text-[9px] font-mono text-primary">14MS</span>
      </div>
    </div>
  )
}
```

---

## STEP 5: Update src/components/FilterBar.tsx

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
    <div className="space-y-4">
      <h3 className="text-[9px] font-mono text-text-muted uppercase tracking-widest">Filters</h3>

      {/* Min gap slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-text-muted uppercase">Min Gap</span>
          <span className="text-primary">{(minGap * 100).toFixed(0)}¢</span>
        </div>
        <input
          type="range" min="1" max="20" value={Math.round(minGap * 100)}
          onChange={e => onMinGapChange(Number(e.target.value) / 100)}
          className="w-full h-0.5 bg-border-default appearance-none cursor-pointer accent-[#33ff99]"
        />
      </div>

      {/* Direction toggle */}
      <div className="flex gap-1">
        {(["ALL","OVER","UNDER"] as FilterDirection[]).map(d => (
          <button
            key={d}
            onClick={() => onDirectionChange(d)}
            className={`flex-1 py-1.5 text-[9px] font-mono font-bold uppercase rounded-sm transition-colors ${
              direction === d
                ? "bg-filter-active text-on-filter"
                : "bg-bg-card border border-border-default text-text-muted hover:text-[#c0c0c0]"
            }`}
          >{d}</button>
        ))}
      </div>
    </div>
  )
}
```

---

## STEP 6: Update src/components/GapBarChart.tsx

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { GapResult } from "../types"

interface Props { results: GapResult[] }

export function GapBarChart({ results }: Props) {
  const data = results.slice(0, 20).map(r => ({
    name: r.question.slice(0, 18) + "…",
    gap: parseFloat((r.gap * 100).toFixed(2)),
    direction: r.direction,
  }))

  if (data.length === 0) return (
    <div className="bg-bg-card border border-border-default rounded-sm p-6 flex items-center justify-center h-40">
      <span className="text-text-muted font-mono text-xs uppercase">No signals — run scan</span>
    </div>
  )

  return (
    <div className="bg-bg-card border border-border-default rounded-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[9px] font-mono text-text-muted uppercase tracking-widest">Gap Distribution</h3>
        <div className="flex gap-3 text-[8px] font-mono">
          <span className="flex items-center gap-1"><span className="w-2 h-2 inline-block rounded-none" style={{background:"#33ff99"}}></span>UNDER</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 inline-block rounded-none" style={{background:"#ff5f52"}}></span>OVER</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} barCategoryGap="20%">
          <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill:"#6b6882", fontSize:9, fontFamily:"JetBrains Mono" }}
            axisLine={false} tickLine={false} unit="¢"
          />
          <Tooltip
            contentStyle={{ background:"#22202e", border:"1px solid #2e2c3e", borderRadius:"6px", fontSize:10, fontFamily:"JetBrains Mono" }}
            labelStyle={{ color:"#c0c0c0" }}
            formatter={(v: number) => [`${v}¢`, "Gap"]}
          />
          <Bar dataKey="gap" radius={[2,2,0,0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.direction === "UNDER" ? "#33ff99" : "#ff5f52"} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

---

## STEP 7: Update src/components/ResultTable.tsx

Keep existing logic but update colors to V2 tokens:
- Table bg: `bg-bg-card`
- Row alt: `bg-bg-card` / `bg-bg-card-inner`
- Header: `bg-bg-card-inner`
- Border: `border-border-default`
- UNDER badge: `bg-under-bg text-under-text`
- OVER badge: `bg-over-bg text-over-text`
- Gap UNDER: `text-under-text`
- Gap OVER: `text-over-text`
- Hover: `hover:bg-surface-high`

Rewrite the full component with these tokens applied.

---

## STEP 8: Update src/components/ScannerPage.tsx

Change layout to card grid:

```tsx
import { useState } from "react"
import { useScan } from "../hooks/useScan"
import { StatsBar } from "./StatsBar"
import { FilterBar } from "./FilterBar"
import { GapBarChart } from "./GapBarChart"
import { ResultTable } from "./ResultTable"
import { SignalCard } from "./SignalCard"
import type { FilterDirection } from "../types"

export function ScannerPage() {
  const [minGap, setMinGap] = useState(0.03)
  const [direction, setDirection] = useState<FilterDirection>("ALL")
  const [view, setView] = useState<"cards" | "table">("cards")
  const { results, isScanning, lastScanAt, totalScanned, error, scan } = useScan(minGap)
  const filtered = results.filter(r => direction === "ALL" ? true : r.direction === direction)

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {error && (
        <div className="bg-over-bg border border-over-text/30 p-3 text-over-text font-mono text-xs rounded-sm">
          ⚠ {error}
        </div>
      )}

      {/* Chart */}
      <GapBarChart results={filtered} />

      {/* View toggle + count */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-text-muted uppercase">
          {filtered.length} signals
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setView("cards")}
            className={`px-3 py-1 text-[9px] font-mono uppercase rounded-sm transition-colors ${
              view === "cards" ? "bg-primary text-on-primary" : "bg-bg-card border border-border-default text-text-muted hover:text-text-primary"
            }`}
          >Cards</button>
          <button
            onClick={() => setView("table")}
            className={`px-3 py-1 text-[9px] font-mono uppercase rounded-sm transition-colors ${
              view === "table" ? "bg-primary text-on-primary" : "bg-bg-card border border-border-default text-text-muted hover:text-text-primary"
            }`}
          >Table</button>
        </div>
      </div>

      {/* Content */}
      {view === "cards" ? (
        filtered.length === 0 ? (
          <div className="bg-bg-card border border-border-default rounded-sm p-8 text-center">
            <p className="text-text-muted font-mono text-xs uppercase">No signals found — try lowering threshold or run a scan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((r, i) => <SignalCard key={i} result={r} />)}
          </div>
        )
      ) : (
        <ResultTable results={filtered} />
      )}
    </div>
  )
}
```

---

## STEP 9: Update src/App.tsx

Full rewrite with V2 sidebar layout:

```tsx
import { useState } from "react"
import { ScannerPage } from "./components/ScannerPage"
import { StatsBar } from "./components/StatsBar"
import { FilterBar } from "./components/FilterBar"
import { useScan } from "./hooks/useScan"
import type { FilterDirection } from "./types"

type NavItem = "terminal" | "history" | "settings"

const navItems = [
  { id: "terminal" as NavItem, icon: "terminal", label: "TERMINAL" },
  { id: "history" as NavItem, icon: "history", label: "HISTORY" },
  { id: "settings" as NavItem, icon: "settings", label: "SETTINGS" },
]

export default function App() {
  const [active, setActive] = useState<NavItem>("terminal")
  const [minGap, setMinGap] = useState(0.03)
  const [direction, setDirection] = useState<FilterDirection>("ALL")
  const { results, isScanning, lastScanAt, totalScanned, error, scan } = useScan(minGap)
  const filtered = results.filter(r => direction === "ALL" ? true : r.direction === direction)

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col">

      {/* Desktop layout */}
      <div className="hidden lg:flex flex-1">

        {/* Sidebar 240px */}
        <aside className="w-60 flex-shrink-0 bg-bg-sidebar border-r border-border-default flex flex-col fixed top-0 left-0 h-full z-40">
          {/* Brand */}
          <div className="px-5 py-5 border-b border-border-default">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">terminal</span>
              <span className="font-mono font-bold text-primary tracking-widest text-sm uppercase">POLYSCAN</span>
            </div>
            <div className="text-[9px] font-mono text-text-muted mt-1">v1.0.0 · Arbitrage Scanner</div>
          </div>

          {/* Nav */}
          <nav className="py-2">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActive(item.id)}
                className={`w-full flex items-center gap-3 px-5 py-2.5 text-xs font-mono uppercase transition-colors ${
                  active === item.id
                    ? "text-primary border-r-2 border-primary bg-bg-card"
                    : "text-text-muted hover:text-text-primary"
                }`}>
                <span className="material-symbols-outlined text-base">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Stats + Filter in sidebar */}
          <div className="px-4 pb-4 space-y-5 border-t border-border-default pt-4">
            <StatsBar
              totalScanned={totalScanned}
              found={filtered.length}
              lastScanAt={lastScanAt}
              isScanning={isScanning}
            />
            <FilterBar
              minGap={minGap}
              direction={direction}
              onMinGapChange={setMinGap}
              onDirectionChange={setDirection}
            />
          </div>
        </aside>

        {/* Main content */}
        <main className="ml-60 flex-1 flex flex-col min-h-screen">
          {/* Top bar */}
          <header className="flex items-center justify-between px-6 h-12 bg-bg-sidebar border-b border-border-default sticky top-0 z-30">
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">TERMINAL_CORE</span>
              <button className="text-[10px] font-mono text-primary border-b border-primary pb-0.5">Live Arbitrage Feed</button>
            </div>
            <div className="flex items-center gap-3">
              {lastScanAt && (
                <span className="text-[9px] font-mono text-text-muted">
                  {lastScanAt.toUTCString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1")} UTC
                </span>
              )}
              <button
                onClick={scan}
                disabled={isScanning}
                className="px-4 py-1.5 text-xs font-mono font-bold uppercase rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "#33ff99",
                  color: "#000",
                }}
                onMouseEnter={e => { if (!isScanning) (e.target as HTMLElement).style.background = "#00ccc9" }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = "#33ff99" }}
              >
                {isScanning ? "SCANNING…" : "SCAN NOW"}
              </button>
            </div>
          </header>

          {/* Page */}
          {active === "terminal" && <ScannerPage />}
          {active !== "terminal" && (
            <div className="flex-1 flex items-center justify-center">
              <span className="font-mono text-text-muted text-sm uppercase">Coming Soon — {active}</span>
            </div>
          )}
        </main>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden flex flex-col flex-1">
        {/* Mobile header */}
        <header className="flex items-center justify-between px-4 h-12 bg-bg-sidebar border-b border-border-default sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">terminal</span>
            <span className="font-mono font-bold text-primary tracking-widest text-sm uppercase">POLYSCAN</span>
          </div>
          <button
            onClick={scan}
            disabled={isScanning}
            className="px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-sm disabled:opacity-50"
            style={{ background: "#33ff99", color: "#000" }}
          >
            {isScanning ? "…" : "SCAN"}
          </button>
        </header>

        {/* Mobile stats */}
        <div className="px-4 pt-4 pb-2">
          <StatsBar totalScanned={totalScanned} found={filtered.length} lastScanAt={lastScanAt} isScanning={isScanning} />
        </div>
        <div className="px-4 pb-4">
          <FilterBar minGap={minGap} direction={direction} onMinGapChange={setMinGap} onDirectionChange={setDirection} />
        </div>

        {/* Mobile content */}
        <main className="flex-1 pb-16">
          {active === "terminal" && <ScannerPage />}
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 flex bg-bg-sidebar border-t border-border-default z-40">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
                active === item.id ? "text-primary" : "text-text-muted hover:text-text-primary"
              }`}>
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="font-mono text-[8px] uppercase mt-0.5">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
```

---

## STEP 10: Update ResultTable.tsx colors to V2 tokens

In ResultTable.tsx, replace all old color classes:
- `bg-surface-low` → `bg-bg-card`
- `bg-surface-container` → `bg-bg-card-inner`
- `bg-surface-container-high` / `bg-surface-high` → `bg-surface-high`
- `border-surface-high` → `border-border-default`
- `bg-surface-dim` → `bg-bg-sidebar`
- `text-outline` → `text-text-muted`
- `text-on-surface-variant` → `text-text-secondary`
- `text-on-surface` → `text-text-primary`
- `text-primary-fixed` → `text-under-text`
- `text-secondary` → `text-over-text`
- UNDER badge: `bg-under-bg text-under-text`
- OVER badge: `bg-over-bg text-over-text`
- hover: `hover:bg-surface-high`

---

## STEP 11: Run tests
```bash
npm run test
```
All 12 must pass. Fix any failures.

---

## STEP 12: Build
```bash
npm run build
```
Zero TypeScript errors.

---

## STEP 13: Start dev server (tmux window "dev")
Kill existing if running, then:
```bash
tmux send-keys -t polyscan-dev:dev C-c '' C-m
sleep 2
tmux send-keys -t polyscan-dev:dev "cd /home/dev/projects/polyscan && npm run dev" C-m
```

---

## STEP 14: Restart tunnel (tmux window "tunnel")
```bash
tmux send-keys -t polyscan-dev:tunnel C-c '' C-m
sleep 2
tmux send-keys -t polyscan-dev:tunnel "cloudflared tunnel --protocol http2 --url http://localhost:5173" C-m
```
Wait 15s, capture the `https://*.trycloudflare.com` URL.

---

## STEP 15: Verify with web_fetch
Fetch the tunnel URL. Confirm HTML contains "POLYSCAN".
If broken → fix and retry.

---

## STEP 16: Report
- ✅/❌ Tests
- ✅/❌ Build
- 🌐 Tunnel URL
- Visual summary
