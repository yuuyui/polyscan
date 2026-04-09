# POLYSCAN — Core Features & Architecture

> Arbitrage gap scanner for Polymarket prediction markets

---

## ทฤษฎี

ใน binary prediction market: Yes + No ของ market เดียวกันต้อง resolve รวมกันได้ $1

```
sum = Yes_midpoint + No_midpoint

sum < 1.0 → UNDER (ซื้อทั้งคู่ได้กำไร)
sum > 1.0 → OVER  (ขายทั้งคู่ได้กำไร)
gap = |1.0 - sum|
```

> ไม่มี backend — เรียก Polymarket CLOB API โดยตรงจาก browser ผ่าน Vite proxy

---

## Main Features

### 1. Real-time Arbitrage Scanner
- **API:** Polymarket CLOB — fetch all markets → calculate gap
- **Filter:** min gap threshold (%) + direction (UNDER/OVER/ALL)
- **Trigger:** SCAN NOW button → fetch latest + calculate

### 2. Gap Distribution Chart
- **Type:** Recharts Bar Chart — UNDER (green) / OVER (red)
- **Interaction:** Hover → tooltip แสดงชื่อ market + exact gap %

### 3. Signal Cards
- Market question, YES price, NO price, SUM, Gap % (color-coded)
- Direction badge: `UNDER` / `OVER`
- Net profit หลัง fee 2%, Sparkline 5-bar trend

### 4. View Toggle (CARDS ↔ TABLE)
- **CARDS:** 2-col grid desktop / 1-col mobile — visual-first
- **TABLE:** columns Market, YES, NO, SUM, Gap%, Direction — sort by header click

### 5. Filter Controls
- **Min Gap slider** (0–10%) — real-time ไม่ต้อง scan ใหม่
- **Direction pills** (ALL / OVER / UNDER) — active = magenta `#e566ff`
- **Live count** — แสดง filtered results

### 6. Live Stats Bar
- Scanned (total markets), Signals (passed filter), Last Scan (UTC), Latency (ms + green dot)

### 7. Error & States
- Network error → red banner ⚠️
- Empty state → "No signals found"
- Loading → SCAN NOW button disabled

### 8. Responsive Design
- **Desktop ≥1024px:** left sidebar 240px + main content area, 2-col card grid
- **Mobile <1024px:** bottom tab bar (Terminal/History/Settings), full-width, 1-col card grid

### 9. Scan History
- บันทึกผล scan ทุกครั้งลง localStorage (สูงสุด 10 scans, purge oldest)
- History panel แสดงรายการ scan ย้อนหลัง — timestamp, signal count, UNDER/OVER count
- คลิก scan → main content โหลดผล scan นั้น
- Sort by gap %, Export JSON, Delete scan, Clear all

**Layout — History Panel Integration:**
```
Default (History closed):
┌──────────┬────────────────────────────────┐
│ Sidebar  │ Main Content (full width)       │
│ (240px)  │ Chart + Cards/Table             │
└──────────┴────────────────────────────────┘

History open:
┌──────────┬─────────────────┬──────────────┐
│ Sidebar  │ History Panel   │ Main (50%)   │
│ (240px)  │ (600px)         │ Cards/Table  │
│          │ Timeline List   │              │
│          │ Export/Delete   │              │
└──────────┴─────────────────┴──────────────┘
```

**Interaction Flow:**
1. User clicks HISTORY in sidebar → panel slides in from left (300ms)
2. Main content shrinks to 50% width
3. User clicks scan in list → main cards update to that scan's results
4. User clicks TERMINAL → panel slides out, layout returns

**States:**
- **Closed (default):** TERMINAL active, History panel hidden, main full width
- **Open:** HISTORY active, panel visible, main 50%
- **Item Selected:** clicked scan highlighted, main shows that scan's results

**Z-index layering:**

| Layer | z-index | Element |
|-------|---------|---------|
| Base | 0 | Main layout |
| Sidebar | 10 | Left sidebar |
| History panel | 30 | History overlay |
| Modal | 40 | Future detail modal |
| Toast | 50 | Notifications |

### 10. Settings
- **Theme** — สลับ dark/light mode
- **Gap Threshold** — ตั้งค่า default min gap %
- **Scan Timeout** — กำหนด timeout สำหรับ API calls
- **App Version** — แสดง version จาก package.json (dynamic)

---

## Architecture

```
┌──────────────────────────────────────────┐
│                React App                 │
│  ┌───────────────┐  ┌─────────────────┐  │
│  │  useScanHook  │→ │  GapCalcUtil    │  │
│  └──────┬────────┘  └────────┬────────┘  │
│         └──────────┬─────────┘           │
│                    ▼                     │
│         ScannerPage                      │
│         ├── StatsBar                     │
│         ├── GapBarChart                  │
│         └── SignalCard[] / ResultTable   │
└──────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Tech |
|-------|------|
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| HTTP | Fetch API (via Vite proxy → Polymarket CLOB) |
| Testing | Vitest + Playwright (Chromium, Firefox, WebKit) |
| Build | Vite |
| Deploy | Cloudflare Tunnel |

---

## Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-base` | `#0e0d14` | Page background |
| `bg-card` | `#22202e` | Card background |
| `bg-sidebar` | `#13121e` | Sidebar background |
| `primary` | `#33ff99` | SCAN NOW button, active filters |
| `primary-hover` | `#00ccc9` | Button hover state |
| `filter-active` | `#e566ff` | Active filter pill (magenta) |
| `under-bg` | `#0d2218` | UNDER badge background |
| `under-text` | `#00fd87` | UNDER badge text |
| `over-bg` | `#2a1212` | OVER badge background |
| `over-text` | `#ff5f52` | OVER badge text |
| `text-primary` | `#ffffff` | Primary text |
| `text-secondary` | `#c0c0c0` | Secondary text |
| `text-muted` | `#6b6882` | Muted text (lavender-gray) |
| `border-default` | `#2e2c3e` | Default border |
| `border-subtle` | `#1e1d2b` | Subtle border |

> รายการ token ครบถ้วน (23 tokens รวม surface, primary/on, filter/on) ดูได้ที่ `FIGMA_STYLE.md`

### Typography
- **JetBrains Mono** (`font-mono`) — ใช้เกือบทุกที่: labels, badges, numbers, nav, filters, section headers
- **Inter** (`font-body`) — ใช้เฉพาะ market question text
- **Icons:** Material Symbols Outlined

### Border Radius
- default: 6px — sm: 4px — lg: 8px — full: circle

---

## Data Model

```typescript
interface GapResult {
  id: string
  question: string
  yesPrice: number        // YES side price (0–1)
  noPrice: number         // NO side price (0–1)
  gap: number             // gap % decimal (e.g. 0.05 = 5%)
  direction: "UNDER" | "OVER" | "FAIR"
  netProfit: number       // gap − 2% fee
  sparkline?: number[]    // 5-bar price history
}

interface Filter {
  minGap: number              // e.g. 0.03 = 3%
  direction: "ALL" | "UNDER" | "OVER"
}

interface ScanHistory {
  id: string                  // unique scan ID
  timestamp: Date             // when scan ran
  totalScanned: number        // markets checked
  signalsFound: number        // passed minGap filter
  underCount: number          // UNDER opportunities
  overCount: number           // OVER opportunities
  minGap: number              // threshold used
  direction: FilterDirection  // ALL/UNDER/OVER
  results: GapResult[]        // snapshot of results
}
```

---

## Component Structure

```
src/
├── App.tsx                    # Main layout (sidebar + scanner)
├── main.tsx                   # React entry point
├── config.ts                  # MIN_GAP, BATCH_SIZE, FEE_RATE
├── constants.ts               # App-wide constants
├── types.ts                   # TypeScript interfaces
├── globals.d.ts               # Global type declarations (__APP_VERSION__)
├── mockData.ts                # Mock data for development
├── components/
│   ├── ScannerPage.tsx        # Chart + cards/table + view toggle
│   ├── SignalCard.tsx         # Individual market card
│   ├── GapBarChart.tsx        # Recharts bar visualization
│   ├── ResultTable.tsx        # Table view (sortable)
│   ├── FilterBar.tsx          # Min gap + direction filters
│   ├── StatsBar.tsx           # Live stats (scanned, signals, latency)
│   ├── HistoryPage.tsx        # Scan history list + detail view
│   ├── ScanHistoryPanel.tsx   # History panel sub-component
│   ├── SettingsPage.tsx       # App settings (theme, threshold, timeout)
│   └── ErrorBoundary.tsx      # Error boundary wrapper
├── api/
│   └── polymarket.ts          # fetchAllMarkets (paginated), fetchMidpoints (batch 500)
├── hooks/
│   ├── useScan.ts             # Scan state + orchestration
│   ├── useScanHistory.ts      # Scan history persistence (localStorage)
│   ├── useSettings.ts         # User settings management
│   └── useTheme.ts            # Theme switching (dark/light)
└── utils/
    ├── direction-badge.ts     # Direction badge styling helper
    ├── download.ts            # JSON export utility
    ├── format.ts              # Number/date formatting
    └── safe-open.ts           # Safe window.open wrapper
```

---

## Key Workflows

### Scan
1. User clicks SCAN NOW → `useScan()` triggers fetch
2. `fetchAllMarkets()` (paginated) → `fetchMidpoints()` (batch 500)
3. `calcGaps()` → filter by minGap → update results + timestamp

### Filter
1. User adjusts slider or direction pill → filter state updates
2. `filtered` array recomputed from `results` + `filter`
3. Re-render + live count updates (no re-scan needed)

### View Toggle
1. User clicks CARDS / TABLE → view state toggles
2. Same data, different layout

---

## Out of Scope (v1)

- ❌ Order placement / trading
- ❌ Wallet / authentication
- ❌ Neg-risk (multi-outcome) markets
- ❌ Backend / database
- ❌ User accounts

---

## Status

- [x] Core scanning logic
- [x] Real-time filtering
- [x] Cards + Table views
- [x] Responsive design (desktop + mobile)
- [x] Error handling
- [x] Unit tests (33 pass) + E2E tests (93 pass)
- [x] Design System (Figma)
- [x] Live deployment
- [x] Scan History (localStorage, export, delete)
- [x] Settings page

---

## Roadmap (v2+)

- Auto-refresh ทุก N วินาที (toggle)
- Export CSV
- Telegram/Line alert เมื่อเจอ gap ใหญ่
- Neg-risk market support
- Net profit after fee column
