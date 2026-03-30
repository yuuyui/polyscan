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

### 3.6 UX Critique & Iteration

**Prompt:**
> "คิดว่า UX/UI เป็นยังไงบ้าง"

ผลลัพธ์ — 5 ปัญหาที่เจอ:
1. **Bar chart ขาด context** — hover ไม่บอกชื่อ market
2. **Mobile table** — column สำคัญ (Gap, Direction) ควรมาก่อน Yes/No
3. **Slider filter** — เลื่อนแล้วต้อง scan ใหม่ถึงจะเห็นผล ควร real-time
4. **Error state** — ไม่ prominent พอ
5. **FAIR direction** — ไม่ควรแสดงเลยถ้า gap = 0

**Prompt:**
> "ขอ preview เป็น html หน่อย"

เปิด static file server + Cloudflare tunnel ให้ดูได้ทันที:
```bash
cd stitch && python3 -m http.server 8899
cloudflared tunnel --protocol http2 --url http://localhost:8899
```

**Prompt:**
> "งั้นแก้ design mockup"

แก้ 4 จุดในไฟล์ HTML เดิม:
- เพิ่ม tooltip hover บน bar chart แต่ละ bar
- จัดลำดับ column ใหม่: Gap → Direction → Market → Yes/No (hidden บน mobile)
- Slider filter real-time ผ่าน JavaScript
- เพิ่ม Net Profit column (หลัง fee 2%) บน desktop

### 3.7 Layout Exploration — 5 แบบ

**Prompt:**
> "อยากปรับ layout คิดว่าควรปรับยังไงดี ขอ 5 แบบ"

ตอบด้วย 5 ทิศทาง พร้อมอธิบาย use case แต่ละแบบ:

| Layout | แนวคิด | เหมาะกับ |
|--------|--------|---------|
| Signal-First | signal ขึ้นบนสุด, filter compact, chart พับได้ | trader ที่ต้อง act ไว |
| Dashboard Grid | stats + chart บน, table ล่าง | ต้องการ big picture ก่อน |
| Split Pane | list ซ้าย + detail panel ขวา | มี data ลึก, วิเคราะห์ละเอียด |
| Live Feed | card feed real-time stream + sparkline | trading floor feel |
| Minimal Command | terminal สุด, ไม่มี chrome | power user |

**Prompt:**
> "ขอ html ทั้ง 5 แบบ"

สร้าง 5 ไฟล์: `layout-1-signal-first.html` ถึง `layout-5-minimal-command.html`  
แต่ละแบบ interactive — filter + SCAN NOW inject card ได้จริง

**Prompt:**
> "ชอบ layout 4 จัดมา"

Implement Layout 4 (Live Feed) เป็น `scanner-main.html` และ `scanner-desktop.html` ใหม่ทั้งหมด:
- Card feed พร้อม sparkline 5 bars
- Ticker tape scroll animation
- Gap bar gradient ใต้แต่ละ card
- SCAN NOW → inject card ใหม่เข้า feed แบบ real-time

---

## Phase 4: Design System

### 4.1 Theme — Uniswap Inspired

**Prompt:**
> "ขอเป็น theme color ให้เหมือน https://app.uniswap.org/"

เปลี่ยน palette ครั้งใหญ่ — จาก terminal green เป็น Uniswap dark:

| Token | ก่อน (Terminal) | หลัง (Uniswap) |
|-------|----------------|----------------|
| Background | `#131313` | `#13111A` (navy tint) |
| Card | `#201f1f` | `#1B1A23` |
| Primary | `#00fd87` | `#FC72FF` (signature pink) |
| UNDER | `#00fd87` | `#40B66B` |
| OVER | `#ffb4ab` | `#FF5F52` |
| Corner radius | `0px` (sharp) | `12px` (rounded) |
| Font | Space Grotesk | Inter |

Uniswap ที่โดดเด่น:
- Background มี purple tint `#13111A`
- Button ใช้ pink gradient `linear-gradient(135deg, #FC72FF, #9B51E0)`
- Badge style เป็น pill (rounded-full)
- Backdrop blur บน header

### 4.2 Figma Integration

**Prompt:**
> "https://www.figma.com/design/8pauNIpxMvNjWWzR3fNIkk ลองอ่านอีกที"

ใช้ Figma REST API อ่าน file โดยตรง (ไม่ต้อง MCP):
```bash
curl -H "X-Figma-Token: <token>" \
  "https://api.figma.com/v1/files/<fileId>"
```

ได้ข้อมูล:
- 4 sections: V1 (16:03) + V2 (16:19) แต่ละ version มี components + full desktop
- Export image ผ่าน `/v1/images/<fileId>?ids=<nodeId>&format=png`
- อ่าน exact fills, bounds, text styles จาก JSON tree

### 4.3 Color Palette (V2 Final จาก Figma)

```js
// tailwind.config.js
colors: {
  "bg-base":       "#0e0d14",   // page background
  "bg-card":       "#22202e",   // card background  ← จาก Figma fill
  "bg-sidebar":    "#13121e",   // sidebar
  "primary":       "#33ff99",   // CTA button default ← จาก Figma component
  "primary-hover": "#00ccc9",   // button hover      ← จาก Figma hover variant
  "filter-active": "#e566ff",   // direction filter active
  "under-bg":      "#0d2218",   // UNDER badge background
  "under-text":    "#00fd87",   // UNDER badge text
  "over-bg":       "#2a1212",   // OVER badge background
  "over-text":     "#ff5f52",   // OVER badge text
  "border-default":"#2e2c3e",   // card border
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

### 9.1 อ่าน Figma ด้วย REST API

**Prompt:**
> "เห็น project polyscan ไหม"  
> "คิดว่า UX/UI เป็นยังไงบ้าง"  
> "ฉันไม่เห็นภาพ ขอ preview เป็น html หน่อย"

ดึง node จาก Figma โดยตรง:
```bash
# Export node เป็นรูป
curl -H "X-Figma-Token: <token>" \
  "https://api.figma.com/v1/images/<fileId>?ids=1:1318&format=png&scale=1"
```

**Prompt:**
> "ปรับ html ตาม figma Version 2 (16:19) ที่แก้ไปได้ไหม"

ดึง component spec จาก Figma JSON:
- fills → exact hex colors (`#22202e`, `#3d3b50`)
- bounds → ขนาด component (895×166px per card)
- text styles → font size, weight, letter-spacing
- children hierarchy → layout structure

### 9.2 ความเข้าใจผิดที่เกิดขึ้น (และแก้ไข)

**Prompt (ที่เปิดเผยปัญหา):**
> "ฉันแก้แค่สีปุ่มและ hover ของ version 2 นะ"

สิ่งที่เกิด: implement layout ใหม่ทั้งหมด ทั้งที่ Figma V2 เปลี่ยนแค่ 2 อย่าง

**Lesson learned:**  
ก่อน implement ต้องถามให้ชัด — *"เปลี่ยนอะไรบ้าง?"*  
อย่าสรุปเองจาก diff ระหว่าง 2 versions

### 9.3 แก้ตาม Figma อย่างถูกต้อง

**Prompt:**
> "ปรับแค่สีปุ่มกับ hover ใช้แค่ version 2 เท่านั้น"

สิ่งที่เปลี่ยนจริงๆ ใน V2:

| Element | V1 | V2 |
|---------|----|----|
| SCAN NOW default | `#00fd87` | `#33ff99` |
| SCAN NOW hover | ไม่มี | `#00ccc9` |
| Filter active | `#00fd87` | `#e566ff` |
| Filter inactive text | `#5e5e6e` | `#1a1a2e` |
| Filter inactive hover | ไม่มี | `#c0c0c0` |

Implementation:
```html
<!-- SCAN NOW button -->
<button
  style="background:#33ff99;color:#000"
  onmouseenter="this.style.background='#00ccc9'"
  onmouseleave="this.style.background='#33ff99'">
  SCAN NOW
</button>

<!-- Direction filter active -->
btn.style.background = '#e566ff'
btn.style.color = '#000000'
```

### 9.4 Build + Test ก่อน PR ทุกครั้ง
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
