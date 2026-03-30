import { useState } from "react"
import type { GapResult } from "../types"
type SortKey = keyof Pick<GapResult, "gap"|"yes"|"no"|"sum">
export function ResultTable({ results }: { results: GapResult[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("gap")
  const [sortAsc, setSortAsc] = useState(false)
  const sorted = [...results].sort((a, b) => sortAsc ? a[sortKey]-b[sortKey] : b[sortKey]-a[sortKey])
  const toggle = (k: SortKey) => { if (k===sortKey) setSortAsc(!sortAsc); else { setSortKey(k); setSortAsc(false) } }
  const th = "px-4 py-3 font-normal text-[10px] font-mono text-outline uppercase tracking-widest cursor-pointer hover:text-on-surface select-none"
  return (
    <div className="border border-surface-high overflow-hidden">
      <div className="px-5 py-3 border-b border-surface-high flex justify-between items-center bg-surface-dim">
        <span className="text-[10px] font-mono text-outline uppercase tracking-widest">ACTIVE_ARBITRAGE_SIGNALS</span>
        <span className="text-[10px] font-mono text-outline">{results.length} signals</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-[11px]">
          <thead>
            <tr className="bg-surface-container border-b border-surface-highest">
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
              <tr><td colSpan={6} className="px-5 py-8 text-center text-outline text-xs">No gaps found \u2014 try lowering the threshold or run a scan</td></tr>
            ) : sorted.map((r, i) => (
              <tr key={i}
                className={`border-b border-surface-dim hover:bg-surface-high transition-colors cursor-pointer ${i%2===0?"bg-surface-low":"bg-surface-container"}`}
                onClick={() => window.open(`https://polymarket.com/event/${r.slug}`,"_blank")}
              >
                <td className="px-4 py-3 text-on-surface max-w-[200px] lg:max-w-xs truncate">{r.question}</td>
                <td className="px-4 py-3 text-right text-on-surface-variant">{r.yes.toFixed(3)}</td>
                <td className="px-4 py-3 text-right text-on-surface-variant">{r.no.toFixed(3)}</td>
                <td className="px-4 py-3 text-right text-on-surface-variant">{r.sum.toFixed(3)}</td>
                <td className={`px-4 py-3 text-right font-bold ${r.direction==="UNDER"?"text-primary-fixed":"text-secondary"}`}>
                  {r.direction==="UNDER"?"-":"+"}{(r.gap*100).toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase ${r.direction==="UNDER"?"bg-primary-fixed text-black":"bg-secondary text-black"}`}>
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
