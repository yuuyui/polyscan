# POLYSCAN — Core Features

> Arbitrage gap scanner for Polymarket prediction markets

---

## 🎯 Main Features

### 1. Real-time Arbitrage Scanner
- **API Source:** Polymarket CLOB (Central Limit Order Book)
- **Logic:** Fetch all markets → calculate gap between YES/NO prices
- **Filter:** Min gap threshold (%) + direction (UNDER/OVER/ALL)
- **Trigger:** SCAN NOW button → fetch latest + calculate

### 2. Gap Distribution Analysis
- **Chart Type:** Recharts Bar Chart
- **Metrics:** 
  - UNDER (green) = markets where YES < fair value
  - OVER (red) = markets where NO < fair value
- **Interaction:** Hover → tooltip shows market name + exact gap %

### 3. Signal Cards
Each market shown as a card with:
- **Market Question** (text)
- **Current Odds** — YES price, NO price, SUM (YES + NO)
- **Gap %** — color-coded (green for UNDER, red for OVER)
- **Direction Badge** 
  - `UNDER` = arbitrage opportunity on YES side
  - `OVER` = arbitrage opportunity on NO side
- **Net Profit** — calculated post-fees (2% fee assumption)
- **Sparkline Chart** — 5-bar trend visualization

### 4. View Toggle (CARDS ↔ TABLE)
**CARDS View:**
- Grid layout (2-col desktop, 1-col mobile)
- Sparkline + large gap % display
- Visual-first design

**TABLE View:**
- Structured rows
- Columns: Market, YES, NO, SUM, Gap %, Direction
- Compact, data-first layout

### 5. Filter Controls
- **Min Gap Slider** (0-10%)
  - Real-time filtering
  - Update display as slider moves
- **Direction Pills** (ALL / OVER / UNDER)
  - Mutually exclusive toggle
  - Active state = magenta highlight (`#e566ff`)
- **Live Count** — shows filtered results

### 6. Live Stats Bar
- **Scanned** — total markets checked in last scan
- **Signals** — count of markets passing current filters
- **Last Scan** — timestamp (UTC)
- **Latency** — ms + green live indicator dot

### 7. Error Handling
- **Network Error Display** — red banner with ⚠️ icon
- **Empty State** — "No signals found" message
- **Loading State** — SCAN NOW button disabled while scanning

### 8. Responsive Design
**Desktop (≥1024px):**
- Left sidebar (240px) — nav + stats + filters
- Main content area — header + chart + scanner page
- 2-column card grid

**Mobile (<1024px):**
- Bottom tab bar (Terminal/History/Settings icons)
- Full-width content
- 1-column card grid
- Stacked filters

---

## 🎨 Design System

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| bg-base | `#0e0d14` | Page background |
| bg-card | `#22202e` | Card background |
| bg-sidebar | `#13121e` | Sidebar background |
| primary | `#33ff99` | SCAN NOW button, active filters |
| primary-hover | `#00ccc9` | Button hover state |
| filter-active | `#e566ff` | Active filter pill (magenta) |
| under-bg | `#0d2218` | UNDER badge background |
| under-text | `#00fd87` | UNDER badge text (bright green) |
| over-bg | `#2a1212` | OVER badge background |
| over-text | `#ff5152` | OVER badge text (coral red) |
| text-primary | `#ffffff` | Primary text |
| text-secondary | `#c0c0c0` | Secondary text |
| text-muted | `#8686b2` | Muted text (lavender-gray) |

### Typography
- **Headings:** Inter (400, 500, 600 weights)
- **Body:** Inter (400, 500 weights)
- **Mono/Code:** JetBrains Mono (400, 700 weights)
- **Icons:** Material Symbols Outlined

### Spacing & Radius
- **Border Radius:** 12px (default), 8px (sm), 16px (lg), 20px (xl), 24px (2xl)
- **Gaps:** Tailwind standard (4px = 1 unit)

---

## 📊 Data Model

### GapResult
```typescript
interface GapResult {
  id: string              // market ID
  question: string        // market question text
  yesPrice: number       // YES side price (0-1)
  noPrice: number        // NO side price (0-1)
  gap: number            // gap % (decimal, e.g., 0.05 = 5%)
  direction: "UNDER" | "OVER" | "FAIR"
  netProfit: number      // gap - 2% fee
  sparkline?: number[]   // recent price history (5 bars)
}
```

### Filter State
```typescript
type FilterDirection = "ALL" | "UNDER" | "OVER"

interface Filter {
  minGap: number              // e.g., 0.03 = 3%
  direction: FilterDirection
}
```

---

## 🔄 Key Workflows

### Scan Workflow
1. User clicks **SCAN NOW**
2. `useScan()` hook triggers fetch from Polymarket CLOB API
3. Calculate gap for each market
4. Filter by minGap threshold
5. Update results state + lastScanAt timestamp
6. Render cards/table based on view toggle

### Filter Workflow
1. User adjusts **Min Gap slider** or **Direction pill**
2. Filter state updates
3. `filtered` array computed from `results` + `filter`
4. Re-render with filtered signals
5. Live count updates

### View Toggle Workflow
1. User clicks **CARDS** or **TABLE** tab
2. View state toggles
3. Same data, different layout
4. Smooth transition

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| **UI** | React 18 + TypeScript |
| **Styling** | Tailwind CSS 3 |
| **Charts** | Recharts |
| **HTTP** | Fetch API |
| **Testing** | Vitest |
| **Build** | Vite |
| **Deployment** | Cloudflare Tunnel |

---

## 📂 Component Structure

```
src/
├── App.tsx                          # Main layout (sidebar + scanner)
├── components/
│   ├── ScannerPage.tsx             # Chart + cards/table + view toggle
│   ├── SignalCard.tsx              # Individual market card
│   ├── GapBarChart.tsx             # Recharts bar visualization
│   ├── ResultTable.tsx             # Table view layout
│   ├── FilterBar.tsx               # Min gap + direction filters
│   └── StatsBar.tsx                # Live stats (scanned, signals, latency)
├── api/
│   └── polymarket.ts               # CLOB REST API client
├── hooks/
│   └── useScan.ts                  # Fetch + filter logic
├── utils/
│   └── calculator.ts               # Gap + net profit calculations
├── types.ts                        # TypeScript interfaces
└── config.ts                       # API endpoints + constants
```

---

## ✅ Status

- [x] Core scanning logic
- [x] Real-time filtering
- [x] Cards + Table views
- [x] Responsive design (desktop + mobile)
- [x] Error handling
- [x] Unit tests
- [x] Design System (Figma)
- [x] Live deployment

**Ready for production** 🚀
