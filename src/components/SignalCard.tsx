import type { GapResult } from "../types"

interface Props {
  result: GapResult
}

function getCssVar(name: string) {
  return `rgb(${getComputedStyle(document.documentElement).getPropertyValue(name).trim()})`
}

export function SignalCard({ result }: Props) {
  const isUnder = result.direction === "UNDER"
  const gapPct = (result.gap * 100).toFixed(2)
  const netProfit = (result.gap - 0.04).toFixed(3) // after ~2% fee each side

  const underText  = getCssVar("--color-under-text")
  const overText   = getCssVar("--color-over-text")
  const primaryHover = getCssVar("--color-primary-hover")
  const filterActive = getCssVar("--color-filter-active")

  // Sparkline bars — 6 bars with varying heights
  const sparkBars = [0.3, 0.6, 0.45, 0.8, 0.55, 1.0]

  return (
    <div
      className="bg-bg-card border border-border-default rounded-md p-4 cursor-pointer hover:border-primary transition-colors shadow-elevation-1 space-y-3"
      onClick={() => window.open(`https://polymarket.com/event/${result.slug}`, "_blank")}
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
            className="flex-1 rounded-none"
            style={{
              height: `${h * 100}%`,
              background: isUnder
                ? underText.replace("rgb(", "rgba(").replace(")", `,${0.3 + h * 0.6})`)
                : overText.replace("rgb(", "rgba(").replace(")", `,${0.3 + h * 0.6})`),
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
            style={{ fontSize: "44px", color: result.direction === "UNDER" ? "#00fd87" : result.direction === "OVER" ? "#ff5f52" : "rgb(var(--color-text-muted))" }}
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
              ? `linear-gradient(90deg, ${underText}, ${primaryHover})`
              : `linear-gradient(90deg, ${overText}, ${filterActive})`,
          }}
        />
      </div>
    </div>
  )
}
