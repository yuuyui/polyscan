# notedsonnet — Session History
> Don Norman × Chubby Duck | 2026-03-30 → 2026-04-02

---

## 2026-03-30 — Polyscan Design Sprint

### เริ่มต้น
- แนะนำตัว: Don Norman (AI ด้าน UX/UI design)
- ตรวจสอบ project ใน workspace — พบ **polyscan** ที่ `/home/dev/projects/polyscan`
- Stack: React + TypeScript + Vite + Tailwind + Recharts + Vitest

### UX Critique
**Prompt:** `"คิดว่า UX/UI เป็นยังไงบ้าง"`

5 ปัญหาที่พบ:
1. Bar chart — hover ไม่บอกชื่อ market
2. Mobile table — column ควรเรียง Gap → Direction → Market
3. Slider filter — ต้อง scan ใหม่ถึงจะ filter ควรเป็น real-time
4. Error state — ไม่ prominent พอ
5. FAIR direction — ไม่ควรแสดงถ้า gap = 0

### HTML Preview
**Prompt:** `"ขอ preview เป็น html หน่อย"`

```bash
cd stitch && python3 -m http.server 8899
cloudflared tunnel --protocol http2 --url http://localhost:8899
```

**Prompt:** `"แก้อะไรไปอะ ไม่เห็นมีอะไรเปลี่ยนเลย ลองบอกมา"`
→ ที่ส่งไปคือ mockup เดิม ยังไม่ได้แก้

**Prompt:** `"งั้นแก้ design mockup"`

แก้ 4 จุด:
- Tooltip hover บน bar chart
- Column order: Gap → Direction → Market → Yes/No
- Slider filter real-time
- Net Profit column (หลัง fee 2%) บน desktop

### Layout Exploration
**Prompt:** `"อยากปรับ layout คิดว่าควรปรับยังไงดี ขอ 5 แบบ"`

| # | Layout | แนวคิด |
|---|--------|--------|
| 1 | Signal-First | signal ขึ้นบนสุด, chart พับได้ |
| 2 | Dashboard Grid | stats + chart บน, table ล่าง |
| 3 | Split Pane | list ซ้าย + detail panel ขวา |
| 4 | Live Feed | card feed real-time + sparkline |
| 5 | Minimal Command | terminal สุด, ไม่มี chrome |

**Prompt:** `"ขอ html ทั้ง 5 แบบ"`
→ สร้าง `layout-1-signal-first.html` ถึง `layout-5-minimal-command.html`

**Prompt:** `"ชอบ layout 4 จัดมา"`
→ Implement Layout 4 (Live Feed) ทั้ง mobile + desktop:
- Card feed + sparkline 5 bars
- Ticker tape scroll animation
- Gap bar gradient
- SCAN NOW → inject card ใหม่ real-time

### Uniswap Theme
**Prompt:** `"ขอเป็น theme color ให้เหมือน https://app.uniswap.org/"`

| Token | ก่อน | หลัง |
|-------|------|------|
| Background | `#131313` | `#13111A` |
| Card | `#201f1f` | `#1B1A23` |
| Primary | `#00fd87` | `#FC72FF` |
| UNDER | `#00fd87` | `#40B66B` |
| OVER | `#ffb4ab` | `#FF5F52` |
| Radius | `0px` | `12px` |
| Font | Space Grotesk | Inter |

### Figma Integration
**Prompt:** `"อ่าน mcp figma ได้ไหม"` → OpenClaw ไม่รองรับ MCP  
**Prompt:** `"อยากให้ช่วย"` → setup ต้องใช้ Personal Access Token  
**Prompt:** `"figma-sync skill นี้ทำอะไรได้บ้าง"` → Pull/Push/Diff/Preview  
**Prompt:** `"Pull อธิบายเพิ่ม ทำอะไรนะ"` → อ่าน Figma → generate designModel.json + tokens.json + React components  

อ่าน Figma ด้วย REST API:
```bash
curl -H "X-Figma-Token: <token>" \
  "https://api.figma.com/v1/files/<fileId>"
curl -H "X-Figma-Token: <token>" \
  "https://api.figma.com/v1/images/<fileId>?ids=1:1762&format=png"
```

File: `8pauNIpxMvNjWWzR3fNIkk` — พบ 2 versions:
- V1 (16:03) — terminal list layout
- V2 (16:19) — sidebar + 2-column card grid

### V2 UI Implementation
**Prompt:** `"ปรับ html ตาม figma Version 2 (16:19) ที่แก้ไปได้ไหม"`

**Prompt:** `"รู้ไหม แก้อะไรไปบ้าง version 2 อะ"`
→ implement ใหม่ทั้งหมด ทั้งที่ V2 เปลี่ยนแค่ 2 อย่าง

**Lesson learned:** ก่อน implement ต้องถามให้ชัดว่าเปลี่ยนอะไร

**Prompt:** `"ฉันแก้แค่สีปุ่มและ hover ของ version 2 นะ"`  
**Prompt:** `"ปรับแค่สีปุ่มกับ hover ใช้แค่ version 2 เท่านั้น"`

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

**Prompt:** `"เริ่ด"` ✅

---

## 2026-03-30 — Git Workflow & Docs

### WORKFLOW.md
สร้าง Git workflow บังคับ:
1. สร้าง Issue → `gh issue create`
2. รอ owner approve
3. สร้าง branch → `git checkout -b feat/issue-<n>-<desc>`
4. Implement + tests
5. PR → `gh pr create --base main`
6. รอ owner merge

เพิ่ม Tester Flow:
- ดู Issues ทั้งหมด → group เป็น epic → analyze AC → test → report

### TUTORIAL.md
สร้าง tutorial ครอบคลุม 9 phases:

| Phase | หัวข้อ |
|-------|--------|
| 1 | Research & Idea — arbitrage theory |
| 2 | Design Document — architecture spec |
| 3 | UI Design — Stitch + layout exploration |
| 4 | Design System — Uniswap theme + Figma API |
| 5 | Implementation — scaffold + core logic |
| 6 | Unit Tests — Vitest |
| 7 | GitHub Workflow |
| 8 | Dev Server + Tunnel |
| 9 | V2 UI Overhaul |

### PRs & Issues (ทั้งหมด merged)

| # | Type | Title |
|---|------|-------|
| 1 | CLOSED | docs: add Git workflow rules |
| 2 | MERGED | docs: add Git workflow rules |
| 3 | CLOSED | docs: add Tester workflow |
| 4 | MERGED | docs: add Tester workflow |
| 5 | CLOSED | fix: restore Tester Flow section |
| 6 | MERGED | fix: restore Tester Flow section |
| 7 | CLOSED | feat: implement Figma V2 UI |
| 8 | MERGED | feat: implement Figma V2 UI |
| 9 | CLOSED | docs: add TUTORIAL.md |
| 10 | MERGED | docs: add TUTORIAL.md |
| 11 | CLOSED | docs: add actual prompts to phases |
| 12 | MERGED | docs: add actual prompts to phases |
| 13 | CLOSED | (เนื้อหาครบใน main แล้ว) |
| 14 | CLOSED | docs: add missing design prompts |
| 15 | MERGED | docs: add missing design prompts |

---

## 2026-04-01 — Figma 101 Project

### Claude Code + Figma MCP Plugin
```bash
mkdir /home/dev/projects/figma-101
```

ติดตั้ง Figma plugin v2.0.7 ใน Claude Code:
```json
// ~/.claude/settings.json
{
  "enabledPlugins": { "figma@claude-plugins-official": true }
}
```

**Prompt:** `"เปิด claude ใน terminal สร้าง file html จาก https://www.figma.com/design/dIFXfUTocyKaS6khWnu7Ir"`

Claude Code อ่าน Figma MCP → generate `index.html`:
- Login page: email/password inputs, Sign in button, Google SSO, Sign up link
- Tailwind CSS via CDN + Inter font

**Prompt:** `"แก้สีปุ่ม Sign in เป็นสีดำ"`
→ เปลี่ยน `#3d4ff2` → `#000000` (hover `#1a1a1a`)

Preview: `https://scheme-winners-findlaw-stages.trycloudflare.com`

### Jasmine Status Check
**Prompt:** `"นายไปเช็ค jasmine หน่อยว่าทำอะไรอยู่"`

Jasmine กำลังทำ task เดียวกัน — สร้าง Design System ใน Figma ผ่าน `Figma:use_figma` MCP  
Timeline: setup OAuth ตั้งแต่ 02:17, connected 04:44, build เริ่ม 07:14, ยังรันอยู่

---

## 2026-04-02 — Polyscan Design System

### อ่าน Figma Design System
Token: [REDACTED]  
File: `dIFXfUTocyKaS6khWnu7Ir` — **Polyscan Design System**  
Last modified: 2026-04-02T02:30:56Z

**5 Pages:**

| Page | Content |
|------|---------|
| 🎨 Design Tokens | Color swatches (bg, primary, text, badges, borders, filter) |
| 🖥️ Desktop (1440px) | Sidebar + header + chart + 2-col cards |
| 📱 Mobile (375px) | Bottom nav + single col cards |
| 🧩 Components | SignalCard (UNDER/OVER), StatsBar, FilterBar, Buttons, Badges, Table row |
| _archive | — |

**Color Palette จาก Design System:**
```js
"bg-base":       "#0e0d14"
"bg-card":       "#22202e"  (dark navy ~#222e3e)
"bg-sidebar":    "#13121e"
"primary":       "#33ff99"
"primary-hover": "#00ccc9"
"filter-active": "#e566ff"  (magenta)
"under-bg":      "#0d2218"
"under-text":    "#00fd87"
"over-bg":       "#2a1212"
"over-text":     "#ff5152"  (coral-red)
"border-default":"#2e2c3e"
"text-primary":  "#ffffff"
"text-secondary":"#c0c0c0"
"text-muted":    "#8686b2"  (lavender-gray)
```

**Desktop Layout:**
- Sidebar: brand + nav + stats (Scanned: 1,247, Signals: 06) + filters
- Header: TERMINAL_CORE | Live Arbitrage Feed + SCAN NOW
- Gap Distribution bar chart
- 2-column SignalCard grid
- View toggle: CARDS | TABLE

**Mobile:**
- Bottom tab bar (Terminal/History/Settings)
- Stats row + filters stacked
- Single column cards — แสดงแค่ gap % + direction badge

---

## Files สำคัญ

| File | Location |
|------|---------|
| Design mockup (mobile) | `/home/dev/projects/polyscan/stitch/scanner-main.html` |
| Design mockup (desktop) | `/home/dev/projects/polyscan/stitch/scanner-desktop.html` |
| Layout explorations | `/home/dev/projects/polyscan/stitch/layout-1~5.html` |
| Design system | `/home/dev/projects/polyscan/stitch/design-system.html` |
| Git workflow rules | `/home/dev/projects/polyscan/WORKFLOW.md` |
| Tutorial | `/home/dev/projects/polyscan/TUTORIAL.md` |
| Figma 101 project | `/home/dev/projects/figma-101/index.html` |
| This file | `/home/dev/projects/polyscan/notedsonnet.md` |

---

## Figma Files

| File | Key | Notes |
|------|-----|-------|
| Untitled (stitch import) | `8pauNIpxMvNjWWzR3fNIkk` | V1 + V2 layouts |
| Polyscan Design System | `dIFXfUTocyKaS6khWnu7Ir` | Official design system |
| figma-101 login | `dIFXfUTocyKaS6khWnu7Ir` | node 9:2 login screen |
