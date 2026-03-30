import type { GapResult } from "../types"

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
      className="bg-bg-card border border-border-default rounded-sm p-4 cursor-pointer hover:border-border-subtle transition-colors space-y-3"
      onClick={() => window.open(`https://polymarket.com/event/${result.slug}`, "_blank")}
    >
      {/* Header: question + direction badge */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-text-primary text-xs font-body leading-snug line-clamp-2 flex-1">
          {result.question}
        </p>
        <span className={`shrink-0 inline-block px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-sm ${
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
            className="flex-1 rounded-none"
            style={{
              height: `${h * 100}%`,
              background: isUnder
                ? `rgba(0,253,135,${0.3 + h * 0.6})`
                : `rgba(255,95,82,${0.3 + h * 0.6})`,
            }}
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
          <div
            className="font-mono font-bold leading-none"
            style={{ fontSize: "44px", color: isUnder ? "#00fd87" : "#ff5f52" }}
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

      {/* Gap bar gradient */}
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
