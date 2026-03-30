# TUTORIAL — How We Built Polyscan

Step-by-step guide ตั้งแต่ไอเดียจนถึง production-ready app พร้อม GitHub workflow

---

## Phase 1: Research & Idea

### 1.1 ศึกษา Polymarket API

เริ่มจากอ่าน docs ที่ https://docs.polymarket.com

API หลักที่ใช้:
```
GET  https://clob.polymarket.com/markets?active=true&next_cursor=<cursor>
POST https://clob.polymarket.com/midpoints
     body: { params: [{ token_id: "..." }] }
```

ไม่ต้องมี auth — เรียกได้เลยจาก browser

### 1.2 เลือก Feature: Arbitrage Scanner

**ทฤษฎี:**
ใน binary prediction market — Yes token + No token ของ market เดียวกันต้อง resolve รวมกันได้ $1
```
sum = Yes_midpoint + No_midpoint

sum < 1.0 → UNDER (ซื้อทั้งคู่ได้กำไร)
sum > 1.0 → OVER  (ขายทั้งคู่ได้กำไร)
gap = |1.0 - sum|
```

---

## Phase 2: Design Document

### 2.1 สร้าง design.md

ออกแบบ architecture ก่อน implement:

```
polyscan/
├── src/
│   ├── api/polymarket.ts     ← fetchAllMarkets, fetchMidpoints
│   ├── utils/calculator.ts   ← calcGaps (pure function)
│   ├── hooks/useScan.ts      ← scan state + orchestration
│   └── components/
│       ├── ScannerPage.tsx
│       ├── StatsBar.tsx
│       ├── FilterBar.tsx
│       ├── GapBarChart.tsx
│       └── ResultTable.tsx
```

**Tech Stack:**
| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| API | fetch (browser → Polymarket CLOB via proxy) |
| Charts | recharts |
| Tests | Vitest |

---

## Phase 3: UI Design ด้วย Google Stitch

### 3.1 สมัคร Stitch API Key
ขอ API key ที่ https://stitch.withgoogle.com

### 3.2 สร้าง Project
```bash
STITCH_API_KEY=<key> node stitch.mjs create-project "Polyscan - Arbitrage Scanner"
# → { projectId: "...", url: "..." }
```

### 3.3 Generate Mobile Screen
```bash
STITCH_API_KEY=<key> node stitch.mjs generate <projectId> \
  "Dark-themed prediction market arbitrage scanner. Background #0f0f0f,
   accent green #00fd87. Bottom nav with Terminal/Scanners/History/Settings.
   Stats row: Markets Scanned, Gaps Found, Last Scan.
   Bar chart + results table with OVER/UNDER badges." \
  "scanner-main"
```

### 3.4 Generate Desktop Screen
```bash
STITCH_API_KEY=<key> node stitch.mjs generate <projectId> \
  "Desktop layout with left sidebar 240px. Bloomberg terminal aesthetic.
   Full table with action column. Filter controls panel." \
  "scanner-desktop"
```

### 3.5 Download HTML
```bash
STITCH_API_KEY=<key> node stitch.mjs download-html "<htmlUrl>" stitch/scanner-main.html
STITCH_API_KEY=<key> node stitch.mjs download-html "<htmlUrl>" stitch/scanner-desktop.html
```

---

## Phase 4: Design System

### 4.1 Extract Design Tokens

จาก Stitch output สร้าง `stitch/design-system.html` รวม:
- **Color tokens** — primary green, secondary red, surface layers
- **Typography** — JetBrains Mono (numbers), Space Grotesk (labels), Inter (body)
- **Components** — buttons, badges, stat cards, table, nav
- **Responsive breakpoints** — mobile / tablet / desktop
- **State patterns** — scanning, idle, error

### 4.2 Color Palette (V2 Final)

```js
// tailwind.config.js
colors: {
  "bg-base":       "#0e0d14",   // page background
  "bg-card":       "#22202e",   // card background
  "bg-sidebar":    "#13121e",   // sidebar
  "primary":       "#33ff99",   // CTA button, active state
  "primary-hover": "#00ccc9",   // button hover
  "filter-active": "#e566ff",   // direction filter active
  "under-bg":      "#0d2218",   // UNDER badge background
  "under-text":    "#00fd87",   // UNDER badge text
  "over-bg":       "#2a1212",   // OVER badge background
  "over-text":     "#ff5f52",   // OVER badge text
}
```

---

## Phase 5: Implementation

### 5.1 Scaffold Project
```bash
cd ~/projects/polyscan
npm create vite@latest . -- --template react-ts --force
npm install
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react jsdom
npm install recharts
npx tailwindcss init -p
```

### 5.2 Configure Vite Proxy (แก้ CORS)
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
},
```
จากนั้นใช้ `/api/markets` แทน full URL ใน browser code

### 5.3 Core Logic — calcGaps
```ts
// src/utils/calculator.ts
export function calcGaps(markets, prices): GapResult[] {
  return markets
    .map(market => {
      const yes = prices[market.tokens[0].token_id] ?? 0
      const no  = prices[market.tokens[1].token_id] ?? 0
      if (yes === 0 || no === 0) return null   // ตัด no-liquidity
      const sum = yes + no
      const gap = Math.abs(1.0 - sum)
      const direction = sum < 1 ? "UNDER" : sum > 1 ? "OVER" : "FAIR"
      return { question, slug, yes, no, sum, gap, direction }
    })
    .filter(Boolean)
}
```

### 5.4 API Layer — fetchAllMarkets (paginated)
```ts
// src/api/polymarket.ts
export async function fetchAllMarkets(): Promise<Market[]> {
  let cursor = ""
  const all: Market[] = []
  do {
    const url = `/api/markets?active=true${cursor ? `&next_cursor=${cursor}` : ""}`
    const res  = await fetch(url)
    const data = await res.json()
    all.push(...data.data.filter(m => m.tokens?.length >= 2))
    cursor = data.next_cursor ?? ""
  } while (cursor && cursor !== "LTE=")
  return all
}
```

### 5.5 API Layer — fetchMidpoints (batch 500)
```ts
export async function fetchMidpoints(markets): Promise<Record<string, number>> {
  const tokenIds = markets.flatMap(m => m.tokens.map(t => t.token_id))
  const batches  = chunk(tokenIds, 500)   // max 500 ต่อ request
  const result   = {}
  for (const batch of batches) {
    const res  = await fetch("/api/midpoints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ params: batch.map(id => ({ token_id: id })) }),
    })
    Object.assign(result, await res.json())
  }
  return result
}
```

### 5.6 New Component — SignalCard (V2)
```tsx
// src/components/SignalCard.tsx
export function SignalCard({ result }: { result: GapResult }) {
  return (
    <div className="bg-bg-card border border-border-default rounded-sm p-4">
      {/* Header: question + UNDER/OVER badge */}
      {/* Sparkline: 6 bars gradient opacity */}
      {/* YES / NO / SUM — 3 boxes แยก */}
      {/* Gap 44px + Net Profit */}
      {/* Progress bar gradient */}
    </div>
  )
}
```

---

## Phase 6: Unit Tests

### 6.1 calcGaps tests
```ts
// src/test/calculator.test.ts
describe("calcGaps", () => {
  it("UNDER when sum < 1")      // yes=0.45, no=0.52 → sum=0.97
  it("OVER when sum > 1")       // yes=0.58, no=0.47 → sum=1.05
  it("FAIR when sum == 1")      // yes=0.50, no=0.50 → sum=1.00
  it("filters yes=0")           // no-liquidity ออก
  it("filters no=0")            // no-liquidity ออก
  it("filters missing prices")  // empty prices dict
  it("multiple markets")        // หลาย market พร้อมกัน
})
```

### 6.2 API tests
```ts
// src/test/polymarket.test.ts
describe("fetchAllMarkets", () => {
  it("stops pagination at LTE=")
  it("paginates multiple pages")
  it("stops on empty cursor")
})
describe("fetchMidpoints", () => {
  it("single call for < 500 tokens")
  it("2 batches for 300 markets (600 tokens)")
})
```

### 6.3 Run tests
```bash
npm run test
# ✅ 12 tests passed
```

---

## Phase 7: GitHub Workflow

### 7.1 ตั้ง Workflow Rules (WORKFLOW.md)

**4 rules บังคับ:**
1. 📋 สร้าง Issue ก่อนเสมอ
2. 👀 รอ Owner approve ก่อน implement
3. 🌿 ทำงานบน Branch เสมอ — `feat/issue-<n>-<desc>`
4. 🔁 Pull Request ทุกครั้ง — ห้าม merge เอง

### 7.2 Flow ทุก task
```bash
# 1. สร้าง Issue
gh issue create --title "feat: xxx" --body "..."

# 2. รอ approve จาก Owner

# 3. สร้าง Branch
git checkout main && git pull
git checkout -b feat/issue-<n>-<desc>

# 4. Implement + commit
git add -A
git commit -m "feat: xxx\n\nCloses #<n>"
git push -u origin feat/issue-<n>-<desc>

# 5. สร้าง PR
gh pr create --title "feat: xxx" --body "Closes #<n>" --base main

# 6. รอ Owner merge
```

### 7.3 Tester Flow
```bash
# ดู Issues ทั้งหมด
gh issue list --state all

# Group เป็น Epic ตาม domain
# epic/core-scan | epic/ui-ux | epic/dx | epic/performance

# Analyze Acceptance Criteria ต่อ Epic
# Test: unit → build → manual → report
npm run test && npm run build
```

---

## Phase 8: Dev Server + Tunnel

### 8.1 Start dev server
```bash
# tmux window "dev"
cd ~/projects/polyscan && npm run dev
# → http://localhost:5173
```

### 8.2 Expose ด้วย Cloudflare Tunnel
```bash
# tmux window "tunnel"
# ใช้ --protocol http2 เพราะ QUIC อาจ block บาง server
cloudflared tunnel --protocol http2 --url http://localhost:5173
# → https://<random>.trycloudflare.com
```

---

## Phase 9: V2 UI Overhaul (Figma)

### 9.1 สร้าง Issue พร้อม Figma reference
```
gh issue create --title "feat: implement Figma V2 design"
```
ระบุใน body:
- Figma file URL + node ID
- Color palette ที่เปลี่ยน
- Components ใหม่
- Acceptance criteria ทุกข้อ

### 9.2 สิ่งที่เปลี่ยนใน V2
| ก่อน (V1) | หลัง (V2) |
|-----------|----------|
| bg `#131313` | bg `#0e0d14` |
| primary `#00fd87` | primary `#33ff99` |
| radius `0px` (sharp) | radius `6px` (rounded) |
| ResultTable เท่านั้น | SignalCard + Table toggle |
| Filter bar แยก | Filter ใน Sidebar |
| ไม่มี sparkline | Sparkline + 44px gap % |

### 9.3 Build + Test ก่อน PR ทุกครั้ง
```bash
npm run test    # ต้องผ่าน 100%
npm run build   # ต้องไม่มี TypeScript error
```

---

## สรุป Files ที่สำคัญ

| File | หน้าที่ |
|------|--------|
| `design.md` | Architecture spec |
| `WORKFLOW.md` | Git workflow rules |
| `TUTORIAL.md` | คู่มือนี้ |
| `stitch/design-system.html` | Design tokens + components |
| `stitch/scanner-main.html` | Mobile mockup (Stitch) |
| `stitch/scanner-desktop.html` | Desktop mockup (Stitch) |
| `src/api/polymarket.ts` | Polymarket API calls |
| `src/utils/calculator.ts` | Gap calculation logic |
| `src/hooks/useScan.ts` | Scan state management |
| `src/components/SignalCard.tsx` | V2 card component |

---

## Quick Start (ทำตาม Tutorial นี้)

```bash
# 1. Clone
git clone https://github.com/yuuyui/polyscan.git
cd polyscan

# 2. Install
npm install

# 3. Run tests
npm run test

# 4. Start dev
npm run dev

# 5. Open browser
open http://localhost:5173
# กด SCAN NOW แล้วรอ ~30s
```
