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

### UX Critique

**Prompt:**
> "คิดว่า UX/UI เป็นยังไงบ้าง"

5 ปัญหาที่เจอ:
1. **Bar chart** — hover ไม่บอกชื่อ market
2. **Mobile table** — Gap, Direction ควรมาก่อน Yes/No
3. **Slider filter** — เลื่อนแล้วต้อง scan ใหม่ ควร real-time
4. **Error state** — ไม่ prominent พอ
5. **FAIR direction** — ไม่ควรแสดงถ้า gap = 0

**Prompt:**
> "ขอ preview เป็น html หน่อย"

```bash
cd stitch && python3 -m http.server 8899
cloudflared tunnel --protocol http2 --url http://localhost:8899
```

**Prompt:**
> "แก้อะไรไปอะ ไม่เห็นมีอะไรเปลี่ยนเลย ลองบอกมา"

link ที่ส่งไปคือ mockup เดิม ยังไม่ได้แก้อะไร

**Prompt:**
> "งั้นแก้ design mockup"

แก้ 4 จุด:
- เพิ่ม tooltip hover บน bar chart
- จัดลำดับ column: Gap → Direction → Market → Yes/No
- Slider filter real-time
- Net Profit column (หลัง fee 2%) บน desktop

### Layout Exploration

**Prompt:**
> "อยากปรับ layout คิดว่าควรปรับยังไงดี ขอ 5 แบบ"

| Layout | แนวคิด | เหมาะกับ |
|--------|--------|---------|
| Signal-First | signal ขึ้นบนสุด, chart พับได้ | trader ที่ต้อง act ไว |
| Dashboard Grid | stats + chart บน, table ล่าง | ต้องการ big picture ก่อน |
| Split Pane | list ซ้าย + detail panel ขวา | วิเคราะห์ละเอียด |
| Live Feed | card feed real-time + sparkline | trading floor feel |
| Minimal Command | terminal สุด, ไม่มี chrome | power user |

**Prompt:**
> "ขอ html ทั้ง 5 แบบ"

สร้าง 5 ไฟล์: `layout-1-signal-first.html` ถึง `layout-5-minimal-command.html`

**Prompt:**
> "ชอบ layout 4 จัดมา"

Implement Layout 4 (Live Feed) ทั้ง mobile + desktop:
- Card feed + sparkline 5 bars
- Ticker tape scroll
- Gap bar gradient
- SCAN NOW → inject card ใหม่ real-time

---

## Phase 4: Design System

**Prompt:**
> "จากดีไซน์ ช่วยสร้าง Design systems.html เอาไว้ใน project ให้หน่อย"

> "ใช้ design systems เดียวกันนะ"

### Uniswap Theme

**Prompt:**
> "ขอเป็น theme color ให้เหมือน https://app.uniswap.org/"

| Token | ก่อน | หลัง |
|-------|------|------|
| Background | `#131313` | `#13111A` |
| Primary | `#00fd87` | `#FC72FF` |
| UNDER | `#00fd87` | `#40B66B` |
| OVER | `#ffb4ab` | `#FF5F52` |
| Radius | `0px` | `12px` |
| Font | Space Grotesk | Inter |

### Figma Integration

**Prompt:**
> "อ่าน mcp figma ได้ไหม"

OpenClaw ไม่รองรับ MCP — ใช้ Figma REST API แทน

**Prompt:**
> "อยากให้ช่วย"

setup ต้องใช้ Personal Access Token จาก Figma → Settings → Account

**Prompt:**
> "figma-sync skill นี้ทำอะไรได้บ้าง"

skill จาก clawhub ทำได้: Pull (Figma → code), Push (code → Figma), Diff, Preview

**Prompt:**
> "Pull อธิบายเพิ่ม ทำอะไรนะ"

Pull = อ่าน Figma → สร้าง `designModel.json` + `tokens.json` + generate React components

**Prompt:**
> "เห็นยัง" (node 1-1762)

อ่าน Figma ด้วย REST API โดยตรง:
```bash
curl -H "X-Figma-Token: <token>" \
  "https://api.figma.com/v1/images/<fileId>?ids=1:1762&format=png"
```

ได้ V2 design spec ครบ: fills, bounds, text styles

### Color Palette (V2 Final จาก Figma)
```js
colors: {
  "bg-base":       "#0e0d14",
  "bg-card":       "#22202e",
  "primary":       "#33ff99",   // จาก Figma component
  "primary-hover": "#00ccc9",   // จาก Figma hover variant
  "filter-active": "#e566ff",
  "under-bg":      "#0d2218",
  "under-text":    "#00fd87",
  "over-bg":       "#2a1212",
  "over-text":     "#ff5f52",
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

**Prompt:**
> "ปรับ html ตาม figma Version 2 (16:19) ที่แก้ไปได้ไหม"

ดึง component spec จาก Figma JSON → fills, bounds, text styles → implement

**Prompt:**
> "รู้ไหม แก้อะไรไปบ้าง version 2 อะ"

implement layout ใหม่ทั้งหมด ทั้งที่ V2 เปลี่ยนแค่สีปุ่มกับ hover

**Prompt:**
> "ฉันแก้แค่สีปุ่มและ hover ของ version 2 นะ"

**Lesson learned:** ก่อน implement ต้องถามให้ชัดว่าเปลี่ยนอะไร อย่าสรุปเองจาก diff

**Prompt:**
> "ปรับแค่สีปุ่มกับ hover ใช้แค่ version 2 เท่านั้น"

สิ่งที่เปลี่ยนจริง:

| Element | V1 | V2 |
|---------|----|----|
| SCAN NOW default | `#00fd87` | `#33ff99` |
| SCAN NOW hover | ไม่มี | `#00ccc9` |
| Filter active | `#00fd87` | `#e566ff` |
| Filter inactive hover | ไม่มี | `#c0c0c0` |

```html
<button
  style="background:#33ff99"
  onmouseenter="this.style.background='#00ccc9'"
  onmouseleave="this.style.background='#33ff99'">
  SCAN NOW
</button>
```

### สิ่งที่เปลี่ยนใน V2 (ภาพรวม)
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
npm run test    # ✅ 33 unit tests (Vitest) + 93 e2e tests (Playwright)

# Dev
npm run dev
# → http://localhost:5173
# กด SCAN NOW รอ ~30s
```

---

## Phase 11: Figma Design System Integration

### 11.1 พยายามใช้ REST API → ล้มเหลว

**Prompt:**
> "สร้าง file ใหม่ใน Figma"

ผล: Figma REST API ไม่มี create file / create node endpoint เลย ทำผ่าน REST ไม่ได้

---

### 11.2 สร้าง Local Plugin Bridge

**Prompt:**
> "ต้องการใช้แบบ Claude.ai"

สร้าง WebSocket bridge: `figma-bridge-server/` + `figma-plugin/` (PR #19, #20)

```
OpenClaw → POST /execute → Bridge Server :3333 → WebSocket → Figma Plugin → nodes
```

ปัญหา: plugin ต้องอยู่บนเครื่อง user → ต้อง clone repo + import manifest เอง

---

### 11.3 สร้าง Figma OAuth Plugin

**Prompt:**
> "งั้นทำยังไงให้ทำได้แบบ claude.ai"
> "งั้นทำ Figma OAuth skill"

สร้าง OpenClaw plugin `figma-oauth` (PR #21, #22):
- OAuth flow ผ่าน cloudflare tunnel
- Tools: `figma_auth_login`, `figma_read_file`, `figma_build_design_system`

ปัญหา: OAuth token ใช้ได้แค่ GET — write nodes ต้องใช้ Figma Plugin API เท่านั้น

---

### 11.4 วิธีที่ใช้ได้จริง: Claude Code + Figma MCP

**Prompt:**
> "เปิด project polyscan เปิด claude code ใช้ figma mcp connect ไปที่ <figma-file-url>"

```bash
# เช็ค Figma MCP
claude --permission-mode bypassPermissions --print 'Call Figma:whoami'
# → Kanokwan Panyakool, Crown Labs Pro ✅

# สั่งงาน Figma
claude --permission-mode bypassPermissions --print 'Use Figma:use_figma to...'
```

Figma MCP tools ที่ใช้ได้: `Figma:whoami`, `Figma:use_figma`, `Figma:get_screenshot`, `Figma:create_new_file`

---

### 11.5 สร้าง Design System

**Prompt:**
> "สร้าง Design System จาก codebase นี้"

ผล: 4 pages ใน Figma file "Polyscan Design System":
- **🎨 Design Tokens** — Variables reference sheet
- **🖥️ Desktop (1440px)** — Full layout
- **📱 Mobile (375px)** — Full layout
- **🧩 Components** — SignalCard, StatsBar, FilterBar, Buttons, Badges

---

### 11.6 Fix Desktop Frame

**Prompt:**
> "interface ทำไมไม่เหมือนใน interface ใน tunnel"
> "1440 ทำไมแปลกก เช็คดีๆ"

Claude Code analyze + get_screenshot เทียบกับ code แล้วพบ 8 issues:

| # | Issue | ก่อน | หลัง |
|---|-------|------|------|
| 1 | Frame width | ~340px | **1440x900px** |
| 2 | Active nav | border ทุกด้าน | `border-r-2` only |
| 3 | Signal count | `SIGNALS` | `signals` lowercase |
| 4 | Stats font | 26px | 20px |
| 5 | Letter spacing | 2px | 1px (tracking-widest) |
| 6 | SCAN NOW radius | 2px | 4px |
| 7 | Values box padding | py-8px | p-2 all sides |
| 8 | GAP line-height | 44px | leading-none |

---

### 11.7 ผูก Figma Variables

**Prompt:**
> "variables ต้องมีการผูกกัน"

สร้าง Variable Collection "Polyscan Tokens" — 17 tokens จาก `tailwind.config.js`:

| Group | Tokens |
|-------|--------|
| Backgrounds | bg-base, bg-card, bg-card-inner, bg-sidebar |
| Primary | primary, primary-hover, on-primary |
| Filter | filter-active |
| Text | text-primary, text-secondary, text-muted |
| Semantic | under-bg, under-text, over-bg, over-text |
| Border | border-default, border-subtle |

ทุก node บน Desktop page → fills/strokes reference variable แทน hardcoded hex

---

### 11.8 Workflow Rules (สำคัญ)

**Prompt:**
> "ฉันบอกเธอให้อ่าน Figma แล้วเธอต้องแก้ไข code ตาม Figma ให้เหมือน 100%"
> "ตอน code ต้องทำตาม rule ที่มีไว้"

**Figma → Code flow:**
```
1. แก้ใน Figma (manual หรือสั่ง Claude Code)
2. claude --print 'Read Figma, compare with src/, list diffs'
3. claude --print 'Fix code to match Figma, follow rules below'
4. git add → commit (report ก่อน) → PR → รอ approve → merge
```

**Rules ที่ต้องยึดทุกครั้ง:**
- ใช้ Tailwind tokens เสมอ — ห้าม hardcode hex ใน className
- ตัวเลขทุกตัว → `font-mono`
- สี UNDER/OVER → `under-*` / `over-*` tokens
- Border radius → `rounded-sm` (4px) หรือ `rounded` (6px)
- ห้าม redesign — clone design ที่มีอยู่เท่านั้น
- ถ้าแก้ Figma → อัปเดต TUTORIAL.md ด้วยทุกครั้ง

**Lesson learned:**
- Figma REST API: อ่านได้เท่านั้น — เขียน nodes ไม่ได้
- Figma Plugin API: เขียนได้ แต่ต้องรันใน Figma app
- วิธีที่ใช้ได้จริงสำหรับ OpenClaw: `claude --print` + Figma MCP
- `figma.root.name` เป็น read-only — rename file ต้องทำใน Figma UI เท่านั้น

