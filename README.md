# Polyscan

Arbitrage gap scanner สำหรับ Polymarket prediction markets

ค้นหา markets ที่ `Yes_price + No_price ≠ 1.0` — สัญญาณ arbitrage opportunity

---

## Quick Start

```bash
npm install
npm run test       # ✅ 33 unit tests (Vitest)
npm run test:e2e   # ✅ 93 e2e tests (Playwright — Chromium, Firefox, WebKit)
npm run dev    # → http://localhost:5173
```

กด **SCAN NOW** รอประมาณ 30 วินาที ระบบจะดึงข้อมูลจาก Polymarket CLOB API

---

## Features

- **Arbitrage Scanner** — fetch ทุก active market + คำนวณ gap แบบ real-time
- **Gap Distribution Chart** — bar chart แยก UNDER / OVER
- **Signal Cards & Table** — ดูผลแบบ card หรือ table ได้
- **Real-time Filter** — slider min gap + direction pill (ALL/UNDER/OVER)
- **Scan History** — บันทึกผล scan ย้อนหลัง, export JSON, โหลด scan เก่า
- **Settings** — ปรับ theme, gap threshold, scan timeout, ดู app version
- **Responsive** — รองรับ desktop sidebar และ mobile bottom nav

---

## Stack

React 19 + TypeScript + Vite + Tailwind CSS + Recharts + Vitest + Playwright

---

## Docs

| ไฟล์ | เนื้อหา |
|------|--------|
| `CORE_FEATURES.md` | Features, architecture, data model, roadmap |
| `TUTORIAL.md` | ประวัติการสร้าง polyscan ทีละ phase |
| `FIGMA_GUIDE.md` | วิธีทำงานกับ Figma — workflow, scripts, layout rules |
| `FIGMA_STYLE.md` | สี, typography, component specs |
| `RULES_DEV.md` | Git workflow rules (Issue → Branch → PR) |
| `RULES_DESIGN.md` | Design workflow rules (Figma) |
| `RULES_OWNER.md` | Owner approval gates |

---

## Repository

[github.com/yuuyui/polyscan](https://github.com/yuuyui/polyscan)
