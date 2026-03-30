# TUTORIAL — How We Built Polyscan

Step-by-step guide ตั้งแต่ไอเดียจนถึง production-ready app พร้อม GitHub workflow

---

## Phase 1: Research & Idea

**Prompt ที่ใช้:**
> "จาก docs https://docs.polymarket.com ช่วยคิดโปรเจค POC ง่าย ๆ มาให้สัก 20 อย่าง"

> "ของง่ายกว่านี้ simple สัก 10 อัน"

> "Arbitrage Scanner — หา market ที่ Yes+No price ไม่รวมเป็น 1.0 อธิบายอย่างละเอียดหน่อย"

### ทฤษฎี
ใน binary prediction market — Yes + No ต้อง resolve รวมกันได้ $1
```
sum = Yes_midpoint + No_midpoint

sum < 1.0 → UNDER (ซื้อทั้งคู่ได้กำไร)
sum > 1.0 → OVER  (ขายทั้งคู่ได้กำไร)
gap = |1.0 - sum|
```

API ที่ใช้ (ไม่ต้อง auth):
```
GET  https://clob.polymarket.com/markets?active=true&next_cursor=<cursor>
POST https://clob.polymarket.com/midpoints
     body: { params: [{ token_id: "..." }] }
```

---

## Phase 2: Design Document

**Prompt ที่ใช้:**
> "ช่วยออกแบบ design.md เอาไว้ใน project ใน polyscan"

> "ใช้ react และมีหน้า interface ให้ดูด้วย"

สร้าง `design.md` ระบุ architecture:

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
| API | fetch (browser → Polymarket CLOB via Vite proxy) |
| Charts | recharts |
| Tests | Vitest |

---

## Phase 3: UI Design ด้วย Google Stitch

**Prompt ที่ใช้:**
> "รู้จัก skill task design stitch ไหม"
> _(ลิงก์ skill จาก GitHub)_

> "จากดีไซน์ ช่วยสร้าง Design systems.html เอาไว้ใน project ให้หน่อย"

> "เป็น responsive ทุก devices ไหม → เลือก ทาง A generate desktop ใน Stitch ก่อน"

### Generate Mobile Screen
```bash
STITCH_API_KEY=<key> node stitch.mjs create-project "Polyscan - Arbitrage Scanner"

STITCH_API_KEY=<key> node stitch.mjs generate <projectId> \
  "Dark-themed prediction market arbitrage scanner. Background #0f0f0f,
   accent green #00fd87. Bottom nav: Terminal/Scanners/History/Settings.
   Stats row: Markets Scanned, Gaps Found, Last Scan.
   Bar chart + results table with OVER/UNDER badges." \
  "scanner-main"
```

### Generate Desktop Screen
```bash
STITCH_API_KEY=<key> node stitch.mjs generate <projectId> \
  "Desktop 1440px with left sidebar nav 240px. Bloomberg terminal aesthetic.
   Full table with Yes/No/Sum/Gap columns + action column.
   Stats cards row. Filter controls panel." \
  "scanner-desktop"
```

### Download HTML
```bash
STITCH_API_KEY=<key> node stitch.mjs download-html "<htmlUrl>" stitch/scanner-main.html
STITCH_API_KEY=<key> node stitch.mjs download-html "<htmlUrl>" stitch/scanner-desktop.html
```

---

## Phase 4: Design System

**Prompt ที่ใช้:**
> "จากดีไซน์ ช่วยสร้าง Design systems.html เอาไว้ใน project ให้หน่อย"

> "ใช้ design systems เดียวกันนะ" _(หลัง generate desktop แล้ว)_

สร้าง `stitch/design-system.html` รวม unified tokens จากทั้ง 2 screens:

### Color Palette (V2 Final)
```js
colors: {
  "bg-base":       "#0e0d14",   // page background
  "bg-card":       "#22202e",   // card background
  "bg-sidebar":    "#13121e",   // sidebar
  "primary":       "#33ff99",   // CTA, active state
  "primary-hover": "#00ccc9",   // button hover
  "filter-active": "#e566ff",   // direction filter active
  "under-bg":      "#0d2218",   // UNDER badge background
  "under-text":    "#00fd87",   // UNDER badge text
  "over-bg":       "#2a1212",   // OVER badge background
  "over-text":     "#ff5f52",   // OVER badge text
  "text-muted":    "#6b6882",   // secondary text
  "border-default":"#2e2c3e",   // border
}
```

---

## Phase 5: Implementation

**Prompt ที่ใช้:**
> "ใช้ skill task-dev เปิด tmux session polyscan-dev แตก subagent implement ตาม Role ที่เหมาะสม คิด unit test ตามเอกสาร design พร้อม test ให้เรียบร้อยและ forward port tunnel ถ้าข้อมูลยังขึ้นไม่ถูกต้องแก้จนกว่าจะได้ รายงานสถานะเรื่อยๆด้วย"

### 5.1 Scaffold
```bash
npm create vite@latest . -- --template react-ts --force
npm install
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react jsdom
npm install recharts
npx tailwindcss init -p
```

### 5.2 Fix CORS — Vite Proxy
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

### 5.3 calcGaps — Pure Function
```ts
export function calcGaps(markets, prices): GapResult[] {
  return markets
    .map(market => {
      const yes = prices[market.tokens[0].token_id] ?? 0
      const no  = prices[market.tokens[1].token_id] ?? 0
      if (yes === 0 || no === 0) return null  // ตัด no-liquidity
      const sum = yes + no
      const gap = Math.abs(1.0 - sum)
      const direction = sum < 1 ? "UNDER" : sum > 1 ? "OVER" : "FAIR"
      return { question, slug, yes, no, sum, gap, direction }
    })
    .filter(Boolean)
}
```

### 5.4 fetchAllMarkets — Paginated
```ts
export async function fetchAllMarkets(): Promise<Market[]> {
  let cursor = ""
  const all: Market[] = []
  do {
    const url = `/api/markets?active=true${cursor ? `&next_cursor=${cursor}` : ""}`
    const data = await fetch(url).then(r => r.json())
    all.push(...data.data.filter(m => m.tokens?.length >= 2))
    cursor = data.next_cursor ?? ""
  } while (cursor && cursor !== "LTE=")
  return all
}
```

### 5.5 fetchMidpoints — Batch 500
```ts
export async function fetchMidpoints(markets): Promise<Record<string, number>> {
  const tokenIds = markets.flatMap(m => m.tokens.map(t => t.token_id))
  const batches  = chunk(tokenIds, 500)
  const result   = {}
  for (const batch of batches) {
    const data = await fetch("/api/midpoints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ params: batch.map(id => ({ token_id: id })) }),
    }).then(r => r.json())
    Object.assign(result, data)
  }
  return result
}
```

---

## Phase 6: Unit Tests

**Prompt ที่ใช้:**
> _(รวมอยู่ใน task-dev prompt — "คิด unit test ตามเอกสาร design พร้อม test ให้เรียบร้อย")_

### Tests ที่เขียน

**calculator.test.ts** (7 tests):
```ts
it("UNDER when sum < 1")       // yes=0.45, no=0.52 → sum=0.97
it("OVER when sum > 1")        // yes=0.58, no=0.47 → sum=1.05
it("FAIR when sum == 1")       // yes=0.50, no=0.50 → sum=1.00
it("filters yes=0")            // no-liquidity ออก
it("filters no=0")             // no-liquidity ออก
it("filters missing prices")   // {} → ออกทั้งหมด
it("multiple markets")         // หลาย market พร้อมกัน
```

**polymarket.test.ts** (5 tests):
```ts
it("stops pagination at LTE=")
it("paginates multiple pages")
it("stops on empty cursor")
it("single call for < 500 tokens")
it("2 batches for 300 markets (600 tokens)")
```

```bash
npm run test   # ✅ 12/12 pass
```

---

## Phase 7: Dev Server + Tunnel

**Prompt ที่ใช้:**
> _(อยู่ใน task-dev — "forward port tunnel")_

```bash
# Window 1: dev server
npm run dev   # → http://localhost:5173

# Window 2: tunnel (ใช้ --protocol http2 เพราะ QUIC อาจ timeout)
cloudflared tunnel --protocol http2 --url http://localhost:5173
# → https://<random>.trycloudflare.com
```

---

## Phase 8: GitHub Workflow

**Prompt ที่ใช้:**
> "ฉันต้องการเพิ่ม rule ของการ push ขึ้น github ก่อนจะทำอะไรก็ตาม
> 1. สร้าง issues
> 2. ก่อน implement ต้องผ่านการ review จากฉันก่อน
> 3. ทุกครั้งต้อง pull request เสมอ
> 4. ทำทุกขั้นตอนอย่างเคร่งครัด"

### 4 Rules บังคับ
```
1. สร้าง Issue → gh issue create --title "..." --body "..."
2. รอ Owner approve ก่อนเสมอ
3. สร้าง Branch → git checkout -b feat/issue-<n>-<desc>
4. Pull Request ทุกครั้ง → gh pr create ... --base main
```

### Flow ทุก task
```bash
# 1. สร้าง Issue + รอ approve
gh issue create --title "feat: xxx" --body "scope + AC"

# 2. สร้าง Branch
git checkout main && git pull
git checkout -b feat/issue-<n>-<desc>

# 3. Implement → commit
git add -A && git commit -m "feat: xxx\n\nCloses #<n>"
git push -u origin feat/issue-<n>-<desc>

# 4. PR
gh pr create --title "feat: xxx" --base main

# 5. รอ Owner merge
```

---

## Phase 9: Tester Flow

**Prompt ที่ใช้:**
> "อยากเพิ่มอีก Flow เป็นของ tester
> 1. ไปดู issues ทั้งหมดทั้ง open และ close
> 2. group ให้เป็น epic พร้อมตั้งชื่อ
> 3. analysis acceptance criteria ของแต่ละ epic
> 4. test"

### Epic Groups
| Epic | Domain | Issues |
|------|--------|--------|
| `epic/core-scan` | gap logic, API, pagination | #7, #... |
| `epic/ui-ux` | design, components, responsive | #7 |
| `epic/dx` | workflow, docs, tooling | #1, #3, #5, #9, #11 |

### Test Per Epic
```bash
# 1. ดู Issues
gh issue list --state all

# 2. Group → analyze AC ต่อ issue ในแต่ละ epic

# 3. Test
npm run test      # unit tests
npm run build     # TypeScript check
npm run dev       # manual test ตาม AC

# 4. Report
## Epic: core-scan | Result: 5/5 Pass ✅
```

---

## Phase 10: V2 UI Overhaul (Figma)

**Prompt ที่ใช้:**
> _(Issue #7 จาก owner — ระบุ Figma URL + node IDs + color palette + component spec + AC ครบ)_

### สิ่งที่เปลี่ยนใน V2
| | V1 | V2 |
|--|----|----|
| Background | `#131313` | `#0e0d14` |
| Primary | `#00fd87` | `#33ff99` |
| Hover | ไม่มี | `#00ccc9` |
| Filter active | ไม่มี | `#e566ff` |
| Border radius | `0px` | `6px` |
| Results view | Table เท่านั้น | Cards + Table toggle |
| Filters location | แยก section | อยู่ใน Sidebar |
| Card detail | — | Sparkline + 44px gap % + net profit |

---

## Quick Start

```bash
# Clone
git clone https://github.com/yuuyui/polyscan.git
cd polyscan

# Install
npm install

# Test
npm run test    # ✅ 12/12

# Dev
npm run dev
# → http://localhost:5173
# กด SCAN NOW รอ ~30s
```

---

## Files Reference

| File | หน้าที่ |
|------|--------|
| `design.md` | Architecture spec |
| `WORKFLOW.md` | Git workflow rules |
| `TUTORIAL.md` | คู่มือนี้ |
| `stitch/design-system.html` | Design tokens + components |
| `stitch/scanner-main.html` | Mobile mockup |
| `stitch/scanner-desktop.html` | Desktop mockup |
| `src/api/polymarket.ts` | Polymarket API |
| `src/utils/calculator.ts` | Gap logic |
| `src/hooks/useScan.ts` | Scan state |
| `src/components/SignalCard.tsx` | V2 card component |
