import type { FilterDirection } from "../types"

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
          onChange={e => onMinGapChange(Number(e.target.value) / 100)}
          className="w-full h-0.5 bg-border-default appearance-none cursor-pointer accent-[#33ff99]"
        />
      </div>

      {/* Direction toggle */}
      <div className="flex gap-1">
        {(["ALL","OVER","UNDER"] as FilterDirection[]).map(d => (
          <button
            key={d}
            onClick={() => onDirectionChange(d)}
            className={`flex-1 py-1.5 text-[9px] font-mono font-bold uppercase rounded-sm transition-colors ${
              direction === d
                ? "bg-filter-active text-on-filter"
                : "bg-bg-card border border-border-default text-text-muted hover:text-[#c0c0c0]"
            }`}
          >{d}</button>
        ))}
      </div>
    </div>
  )
}
