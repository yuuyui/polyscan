import type { GapResult } from "../types"
import { openPolymarketEvent } from "../utils/safe-open"

interface Props {
  result: GapResult
}

export function SignalCard({ result }: Props) {
  const isUnder = result.direction === "UNDER"
  const gapPct = (result.gap * 100).toFixed(2)
  const netProfit = (result.gap - 0.04).toFixed(3) // after ~2% fee each side

  // Sparkline bars — 6 bars with varying heights
  const sparkBars = [0.3, 0.6, 0.45, 0.8, 0.55, 1.0]

  return (
    <div
      className="bg-bg-card border border-border-default rounded-md p-4 cursor-pointer hover:border-primary transition-colors shadow-elevation-1 space-y-3 focus:outline-none focus:ring-2 focus:ring-primary"
      role="button" tabIndex={0} aria-label={`View ${result.question}`}
      onClick={() => openPolymarketEvent(result.slug)}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPolymarketEvent(result.slug) } }}
    >
      {/* Header: question + direction badge */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-text-primary text-sm font-body leading-snug line-clamp-2 flex-1">
          {result.question}
        </p>
        <span className={`shrink-0 inline-block px-2.5 py-0.5 text-xs font-mono font-semibold uppercase rounded-full ${
          isUnder
            ? "bg-under-bg text-under-text"
            : result.direction === "OVER"
            ? "bg-over-bg text-over-text"
            : "bg-surface-high text-text-muted"
        }`}>
          {result.direction}
        </span>
      </div>

      {/* Sparkline */}
      <div className="flex items-end gap-0.5 h-6">
        {sparkBars.map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-none ${isUnder ? "bg-under-text" : "bg-over-text"}`}
            style={{ height: `${h * 100}%` }}
          />
        ))}
      </div>

      {/* YES / NO / SUM boxes */}
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

      {/* Gap % large */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[9px] font-mono text-text-muted uppercase mb-0.5">GAP</div>
          <div className={`font-mono font-bold leading-none ${isUnder ? "text-under-text" : "text-over-text"}`}>
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
          className={`h-full rounded-full ${isUnder ? "bg-under-text" : "bg-over-text"}`}
          style={{ width: `${Math.min(result.gap * 1000, 100)}%` }}
        />
      </div>
    </div>
  )
}
