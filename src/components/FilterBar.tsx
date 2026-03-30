import type { FilterDirection } from "../types"
interface Props {
  minGap: number
  direction: FilterDirection
  onMinGapChange: (v: number) => void
  onDirectionChange: (d: FilterDirection) => void
}
export function FilterBar({ minGap, direction, onMinGapChange, onDirectionChange }: Props) {
  return (
    <div className="bg-surface-low border border-surface-high p-4 lg:p-6 space-y-4">
      <h3 className="text-[10px] font-mono text-outline uppercase tracking-widest">Control_Parameters</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-mono">
          <span className="text-outline uppercase">Min Gap Threshold</span>
          <span className="text-primary-fixed">{(minGap * 100).toFixed(0)}\u00a2 minimum</span>
        </div>
        <input
          type="range" min="1" max="20" value={Math.round(minGap * 100)}
          onChange={e => onMinGapChange(Number(e.target.value) / 100)}
          className="w-full h-1 bg-surface-highest appearance-none cursor-pointer accent-[#00fd87]"
        />
      </div>
      <div className="flex bg-surface-lowest border border-surface-high">
        {(["ALL","OVER","UNDER"] as FilterDirection[]).map(d => (
          <button key={d} onClick={() => onDirectionChange(d)}
            className={`flex-1 py-2 text-[10px] font-mono font-bold uppercase transition-colors ${
              direction === d ? "bg-primary-fixed text-black" : "bg-surface-dim text-outline hover:text-on-surface"
            }`}>{d}</button>
        ))}
      </div>
    </div>
  )
}
