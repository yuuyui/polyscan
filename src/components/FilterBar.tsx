import type { FilterDirection } from "../types"
import { GAP_MIN, GAP_MAX } from "../constants"

interface Props {
  minGap: number
  direction: FilterDirection
  onMinGapChange: (v: number) => void
  onDirectionChange: (d: FilterDirection) => void
}

export function FilterBar({ minGap, direction, onMinGapChange, onDirectionChange }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-[9px] font-mono text-text-muted uppercase tracking-widest">Filters</h3>

      {/* Min gap slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-text-muted uppercase">Min Gap</span>
          <span className="text-primary">{(minGap * 100).toFixed(0)}\u00a2</span>
        </div>
        <input
          type="range" min="1" max="20" value={Math.round(minGap * 100)}
          aria-label={`Minimum gap: ${(minGap * 100).toFixed(0)} cents`}
          onChange={e => {
            const val = Number(e.target.value)
            if (Number.isNaN(val)) return
            onMinGapChange(Math.max(GAP_MIN, Math.min(GAP_MAX, val / 100)))
          }}
          className="w-full h-0.5 bg-border-default appearance-none cursor-pointer accent-primary"
        />
      </div>

      {/* Direction toggle */}
      <div className="flex gap-1" role="group" aria-label="Filter direction">
        {(["ALL","OVER","UNDER"] as FilterDirection[]).map(d => (
          <button
            key={d}
            onClick={() => onDirectionChange(d)}
            aria-pressed={direction === d}
            className={`flex-1 py-1.5 text-[9px] font-mono font-bold uppercase rounded-sm transition-colors ${
              direction === d
                ? "bg-filter-active text-on-filter"
                : "bg-bg-card border border-border-default text-text-muted hover:text-text-secondary"
            }`}
          >{d}</button>
        ))}
      </div>
    </div>
  )
}
