import { useState } from "react"
import { GapBarChart } from "./GapBarChart"
import { ResultTable } from "./ResultTable"
import { SignalCard } from "./SignalCard"
import type { GapResult } from "../types"

interface Props {
  results: GapResult[]
  error: string | null
}

export function ScannerPage({ results, error }: Props) {
  const [view, setView] = useState<"cards" | "table">("cards")

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {error && (
        <div className="bg-over-bg border border-over-text/30 p-3 text-over-text font-mono text-xs rounded-sm">
          {"\u26A0"} {error}
        </div>
      )}

      {/* Chart */}
      <GapBarChart results={results} />

      {/* View toggle + count */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-text-muted uppercase">
          {results.length} signals
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setView("cards")}
            className={`px-3 py-1 text-[9px] font-mono uppercase rounded-sm transition-colors ${
              view === "cards" ? "bg-primary text-on-primary" : "bg-bg-card border border-border-default text-text-muted hover:text-text-primary"
            }`}
          >Cards</button>
          <button
            onClick={() => setView("table")}
            className={`px-3 py-1 text-[9px] font-mono uppercase rounded-sm transition-colors ${
              view === "table" ? "bg-primary text-on-primary" : "bg-bg-card border border-border-default text-text-muted hover:text-text-primary"
            }`}
          >Table</button>
        </div>
      </div>

      {/* Content */}
      {view === "cards" ? (
        results.length === 0 ? (
          <div className="bg-bg-card border border-border-default rounded-sm p-8 text-center">
            <p className="text-text-muted font-mono text-xs uppercase">No signals found {"\u2014"} try lowering threshold or run a scan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {results.map((r, i) => <SignalCard key={i} result={r} />)}
          </div>
        )
      ) : (
        <ResultTable results={results} />
      )}
    </div>
  )
}
