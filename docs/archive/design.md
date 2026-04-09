# Polyscan — Arbitrage Scanner Design

## Scope (v1)

**เฉพาะ scan เท่านั้น** — ไม่มี order, ไม่มี wallet, ไม่มี trade  
เป้าหมาย: หา markets ที่ `Yes_mid + No_mid ≠ 1.0` เกิน threshold  
Interface: **React web app** แสดงผล real-time

---

## ทฤษฎี

ใน binary prediction market:
- Yes token + No token ของ market เดียวกัน **ต้อง resolve รวมกันได้ $1**
- ดังนั้น midpoint price ของทั้งคู่ควรรวมกันได้ **≈ 1.0**

```
sum = Yes_midpoint + No_midpoint

sum < 1.0  → underpriced  (ซื้อทั้งคู่ได้กำไร)
sum > 1.0  → overpriced   (ขายทั้งคู่ได้กำไร)
gap = |1.0 - sum|
```

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React + TypeScript + Vite         |
| Styling   | Tailwind CSS                      |
| API calls | fetch (browser → Polymarket CLOB) |
| State     | React useState / useEffect        |
| Charts    | recharts (gap bar chart)          |

> **ไม่มี backend** — เรียก Polymarket API โดยตรงจาก browser

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React App                         │
│                                                     │
│  ┌─────────────┐   ┌──────────────┐                 │
│  │ useScanHook │──▶│ GapCalcUtil  │                 │
│  │ (fetching)  │   │ (pure func)  │                 │
│  └──────┬──────┘   └──────┬───────┘                 │
│         │                 │                         │
│         ▼                 ▼                         │
│  ┌──────────────────────────────────────────────┐   │
│  │              ScannerPage                     │   │
│  │  ┌────────────┐  ┌───────────────────────┐   │   │
│  │  │ StatsBar   │  │  ResultTable          │   │   │
│  │  └────────────┘  └───────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────┐ │   │
│  │  │           GapBarChart                   │ │   │
│  │  └─────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## UI Layout

```
┌──────────────────────────────────────────────────────┐
│  🔍 POLYSCAN                              [Scan Now] │
├──────────────────────────────────────────────────────┤
│  Scanned: 1,243   │  Found: 7   │  Last: 06:45 UTC   │
│  Min Gap: [0.03]  │  ☐ OVER only  ☐ UNDER only       │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ██ Gap Distribution Chart (bar chart)               │
│                                                      │
├──────────────────────────────────────────────────────┤
│  Question              Yes    No    Sum    Gap   Dir  │
│  ─────────────────────────────────────────────────── │
│  Will BTC hit $100k?  0.61  0.44  1.05   5¢  OVER   │
│  Fed cut rates May?   0.38  0.55  0.93   7¢  UNDER  │
│  ...                                                 │
└──────────────────────────────────────────────────────┘
```

---

## Components

### `ScannerPage`
- หน้าหลัก
- ถือ state: `results`, `isScanning`, `lastScanAt`, `filters`
- trigger `useScan()` เมื่อกด Scan Now หรือ auto-scan ทุก 60s

### `StatsBar`
- แสดง: จำนวน markets scanned, found, เวลา scan ล่าสุด
- badge สีแดง/เขียวตาม direction

### `FilterBar`
- input: `MIN_GAP` (slider หรือ text)
- toggle: OVER / UNDER / ALL

### `GapBarChart`
- recharts BarChart
- X-axis: market question (truncated)
- Y-axis: gap value (¢)
- สีแดง = OVER, สีเขียว = UNDER

### `ResultTable`
- sort by gap DESC (default)
- click header เพื่อ sort column อื่น
- row highlight: แดง = OVER, เขียว = UNDER
- คลิก row → เปิด polymarket.com ของ market นั้น

---

## Hooks & Utils

### `useScan(minGap)`
```typescript
// hooks/useScan.ts
export function useScan(minGap: number) {
  const [results, setResults] = useState<GapResult[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [lastScanAt, setLastScanAt] = useState<Date | null>(null)

  async function scan() {
    setIsScanning(true)
    const markets = await fetchAllMarkets()       // paginated
    const prices  = await fetchMidpoints(markets) // batch 500
    const gaps    = calcGaps(markets, prices)
    setResults(gaps.filter(g => g.gap >= minGap))
    setLastScanAt(new Date())
    setIsScanning(false)
  }

  return { results, isScanning, lastScanAt, scan }
}
```

### `calcGaps(markets, prices)` (pure)
```typescript
// utils/calculator.ts
export function calcGaps(markets, prices): GapResult[] {
  return markets.map(market => {
    const yes = prices[market.tokens[0].token_id] ?? 0
    const no  = prices[market.tokens[1].token_id] ?? 0
    const sum = yes + no
    const gap = Math.abs(1.0 - sum)
    return {
      question:  market.question,
      slug:      market.market_slug,
      yes, no, sum, gap,
      direction: sum < 1 ? "UNDER" : sum > 1 ? "OVER" : "FAIR"
    }
  }).filter(r => r.yes > 0 && r.no > 0) // ตัด no-liquidity
}
```

---

## API Calls (Client-side)

### Fetch all markets (paginated)
```typescript
// api/polymarket.ts
const CLOB = "https://clob.polymarket.com"

export async function fetchAllMarkets() {
  let cursor = ""
  let all = []
  do {
    const res  = await fetch(`${CLOB}/markets?active=true&next_cursor=${cursor}`)
    const data = await res.json()
    all.push(...data.data)
    cursor = data.next_cursor
  } while (cursor && cursor !== "LTE=")
  return all
}
```

### Fetch midpoints (batch)
```typescript
export async function fetchMidpoints(markets) {
  const tokenIds = markets.flatMap(m => m.tokens.map(t => t.token_id))
  const batches  = chunk(tokenIds, 500)
  const results  = {}

  for (const batch of batches) {
    const res  = await fetch(`${CLOB}/midpoints`, {
      method: "POST",
      body: JSON.stringify({ params: batch.map(id => ({ token_id: id })) })
    })
    const data = await res.json()
    Object.assign(results, data)
  }
  return results
}
```

---

## Types

```typescript
// types.ts
export interface GapResult {
  question:  string
  slug:      string
  yes:       number
  no:        number
  sum:       number
  gap:       number
  direction: "OVER" | "UNDER" | "FAIR"
}
```

---

## Project Structure

```
polyscan/
├── design.md
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── types.ts
    ├── api/
    │   └── polymarket.ts       ← fetchAllMarkets, fetchMidpoints
    ├── utils/
    │   └── calculator.ts       ← calcGaps (pure)
    ├── hooks/
    │   └── useScan.ts          ← scan state + orchestration
    └── components/
        ├── ScannerPage.tsx     ← หน้าหลัก
        ├── StatsBar.tsx        ← สถิติ summary
        ├── FilterBar.tsx       ← min gap + direction filter
        ├── GapBarChart.tsx     ← recharts bar chart
        └── ResultTable.tsx     ← ตาราง results
```

---

## Config

```typescript
// src/config.ts
export const CLOB_HOST  = "https://clob.polymarket.com"
export const MIN_GAP    = 0.03   // default 3¢
export const BATCH_SIZE = 500
export const FEE_RATE   = 0.02   // แสดงเป็น info เท่านั้น
```

---

## Out of Scope (v1)

- ❌ Order placement / trading
- ❌ Wallet / authentication
- ❌ Neg-risk (multi-outcome) markets
- ❌ Fee-adjusted net profit calculation
- ❌ Backend / database
- ❌ User accounts

---

## Future (v2+)

- Auto-refresh ทุก N วินาที (toggle)
- Net profit after fee column
- Neg-risk market support
- Export CSV
- Telegram/Line alert เมื่อเจอ gap ใหญ่
