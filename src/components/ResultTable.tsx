import { useState } from "react"
import type { GapResult } from "../types"
import { openPolymarketEvent } from "../utils/safe-open"
type SortKey = keyof Pick<GapResult, "gap"|"yes"|"no"|"sum">
export function ResultTable({ results }: { results: GapResult[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("gap")
  const [sortAsc, setSortAsc] = useState(false)
  const sorted = [...results].sort((a, b) => sortAsc ? a[sortKey]-b[sortKey] : b[sortKey]-a[sortKey])
  const toggle = (k: SortKey) => { if (k===sortKey) setSortAsc(!sortAsc); else { setSortKey(k); setSortAsc(false) } }
  const th = "px-4 py-3 font-normal text-[10px] font-mono text-text-muted uppercase tracking-widest cursor-pointer hover:text-text-primary select-none"
  return (
    <div className="border border-border-default rounded-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-border-default flex justify-between items-center bg-bg-sidebar">
        <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">ACTIVE_ARBITRAGE_SIGNALS</span>
        <span className="text-[10px] font-mono text-text-muted">{results.length} signals</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-[11px]">
          <thead>
            <tr className="bg-bg-card-inner border-b border-border-default">
              <th className={th + " text-left"}>Market / Question</th>
              {(["yes","no","sum","gap"] as SortKey[]).map(k => (
                <th key={k} className={th + " text-right"} onClick={() => toggle(k)}>
                  {k.toUpperCase()} {sortKey===k ? (sortAsc?"\u2191":"\u2193") : ""}
                </th>
              ))}
              <th className={th + " text-center"}>DIR</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-text-muted text-xs">No gaps found \u2014 try lowering the threshold or run a scan</td></tr>
            ) : sorted.map((r, i) => (
              <tr key={i}
                className={`border-b border-border-subtle hover:bg-bg-card transition-colors cursor-pointer ${i%2===0?"bg-bg-card":"bg-bg-card-inner"}`}
                onClick={() => openPolymarketEvent(r.slug)}
              >
                <td className="px-4 py-3 text-text-primary max-w-[200px] lg:max-w-xs truncate">{r.question}</td>
                <td className="px-4 py-3 text-right text-text-secondary">{r.yes.toFixed(3)}</td>
                <td className="px-4 py-3 text-right text-text-secondary">{r.no.toFixed(3)}</td>
                <td className="px-4 py-3 text-right text-text-secondary">{r.sum.toFixed(3)}</td>
                <td className={`px-4 py-3 text-right font-bold ${r.direction==="UNDER"?"text-under-text":"text-over-text"}`}>
                  {r.direction==="UNDER"?"-":"+"}{(r.gap*100).toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded-sm ${r.direction==="UNDER"?"bg-under-bg text-under-text":"bg-over-bg text-over-text"}`}>
                    {r.direction}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
