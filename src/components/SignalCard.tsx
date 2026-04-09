import type { GapResult } from "../types"
import { openPolymarketEvent } from "../utils/safe-open"
import { directionBadgeClass } from "../utils/direction-badge"
import { FEE_RATE } from "../config"
import { SPARKLINE_BARS } from "../constants"

interface Props {
  result: GapResult
  variant?: "card" | "history"
}

export function SignalCard({ result, variant = "card" }: Props) {
  const isUnder = result.direction === "UNDER"
  const gapPct = (result.gap * 100).toFixed(2)
  const netProfit = (result.gap - FEE_RATE * 2).toFixed(3)

  const isCard = variant === "card"

  return (
    <div
      className={`bg-bg-card border border-border-default p-4 cursor-pointer hover:border-primary transition-colors space-y-3 ${
        isCard ? "rounded-md shadow-elevation-1 focus:outline-none focus:ring-2 focus:ring-primary" : "rounded-sm"
      }`}
      role="button" tabIndex={0} aria-label={`View ${result.question}`}
      onClick={() => openPolymarketEvent(result.slug)}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPolymarketEvent(result.slug) } }}
    >
      {/* Header: question + direction badge */}
      <div className="flex items-start justify-between gap-2">
        <p className={`text-text-primary font-body leading-snug line-clamp-2 flex-1 ${isCard ? "text-sm" : "text-xs"}`}>
          {result.question}
        </p>
        <span className={`shrink-0 inline-block px-2.5 py-0.5 font-mono font-semibold uppercase ${
          isCard ? "text-xs rounded-full" : "text-[9px] font-bold rounded-sm"
        } ${directionBadgeClass(result.direction)}`}>
          {result.direction}
        </span>
      </div>

      {/* Sparkline (card variant only) */}
      {isCard && (
        <div className="flex items-end gap-0.5 h-6">
          {SPARKLINE_BARS.map((h, barIdx) => (
            <div
              key={`spark-${barIdx}`}
              className={`flex-1 rounded-none ${isUnder ? "bg-under-text" : "bg-over-text"}`}
              style={{ height: `${h * 100}%` }}
            />
          ))}
        </div>
      )}

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
          <div className={`font-mono font-bold ${isCard ? "leading-none" : "text-2xl leading-none"} ${isUnder ? "text-under-text" : "text-over-text"}`}>
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
