import { ScanHistoryPanel } from "./ScanHistoryPanel"
import type { GapResult } from "../types"

const mockSignals: GapResult[] = [
  {
    question: "Bitcoin above $100k by March?",
    slug: "bitcoin-100k-march",
    yes: 0.542,
    no: 0.398,
    sum: 0.940,
    gap: 0.060,
    direction: "UNDER",
  },
  {
    question: "ETH flips BTC market cap?",
    slug: "eth-flips-btc",
    yes: 0.120,
    no: 0.845,
    sum: 0.965,
    gap: 0.035,
    direction: "UNDER",
  },
  {
    question: "Fed cuts rates in January?",
    slug: "fed-cuts-jan",
    yes: 0.680,
    no: 0.390,
    sum: 1.070,
    gap: 0.070,
    direction: "OVER",
  },
  {
    question: "Trump wins 2028 election?",
    slug: "trump-2028",
    yes: 0.310,
    no: 0.745,
    sum: 1.055,
    gap: 0.055,
    direction: "OVER",
  },
]

function SignalHistoryCard({ result }: { result: GapResult }) {
  const isUnder = result.direction === "UNDER"
  const gapPct = (result.gap * 100).toFixed(2)
  const netProfit = (result.gap - 0.04).toFixed(3)

  return (
    <div
      className="bg-bg-card border border-border-default rounded-sm p-4 cursor-pointer hover:border-primary transition-colors space-y-3"
      onClick={() => window.open(`https://polymarket.com/event/${result.slug}`, "_blank")}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-text-primary text-xs font-body leading-snug line-clamp-2 flex-1">
          {result.question}
        </p>
        <span className={`shrink-0 inline-block px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-sm ${
          isUnder
            ? "bg-under-bg text-under-text"
            : "bg-over-bg text-over-text"
        }`}>
          {result.direction}
        </span>
      </div>

      {/* YES / NO / SUM */}
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

      {/* Gap + Net Profit */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[9px] font-mono text-text-muted uppercase mb-0.5">GAP</div>
          <div
            className="font-mono font-bold text-2xl leading-none"
            style={{ color: isUnder ? "#00fd87" : "#ff5f52" }}
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

      {/* Gap bar */}
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

export function HistoryPage() {
  return (
    <div className="flex flex-1 min-h-0">
      {/* History panel — 600px */}
      <ScanHistoryPanel />

      {/* Main content — signal cards */}
      <div className="flex-1 overflow-y-auto">
        {/* Sub-header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <div>
            <h3 className="font-mono text-sm text-text-primary uppercase tracking-widest">Scan Details</h3>
            <p className="text-[9px] font-mono text-text-muted mt-0.5">2025-01-15 14:32:01 UTC &middot; {mockSignals.length} signals</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-text-muted uppercase">Sort by:</span>
            <button className="text-[9px] font-mono text-primary uppercase">Gap %</button>
          </div>
        </div>

        {/* Signal cards grid */}
        <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
          {mockSignals.map((signal) => (
            <SignalHistoryCard key={signal.slug} result={signal} />
          ))}
        </div>
      </div>
    </div>
  )
}
