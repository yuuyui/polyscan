import { useState } from "react"
import { GapBarChart } from "./GapBarChart"
import { ResultTable } from "./ResultTable"
import { SignalCard } from "./SignalCard"
import type { GapResult } from "../types"
import { SPARKLINE_BARS } from "../constants"

interface Props {
  results: GapResult[]
  error: string | null
  isScanning?: boolean
}

export function ScannerPage({ results, error, isScanning = false }: Props) {
  const [view, setView] = useState<"cards" | "table">("cards")

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {error && (
        <div className="bg-over-bg border border-over-text/30 p-3 text-over-text font-mono text-xs rounded-sm">
          {"\u26A0"} {error}
        </div>
      )}

      {/* Chart */}
      <GapBarChart results={results} isScanning={isScanning} />

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
      {isScanning ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="bg-bg-card border border-border-default rounded-md p-4 space-y-3 animate-pulse">
              <div className="h-4 bg-border-default rounded w-3/4" />
              <div className="flex items-end gap-0.5 h-6">
                {SPARKLINE_BARS.map((h, j) => (
                  <div key={`skel-bar-${j}`} className="flex-1 bg-border-default rounded-none" style={{ height: `${h * 100}%` }} />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-1">
                {(["yes", "no", "sum"] as const).map(label => (
                  <div key={label} className="bg-bg-card-inner border border-border-subtle rounded-sm p-2 h-10" />
                ))}
              </div>
              <div className="h-6 bg-border-default rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : view === "cards" ? (
        results.length === 0 ? (
          <div className="bg-bg-card border border-border-default rounded-sm p-8 text-center space-y-2">
            <span className="material-symbols-outlined text-3xl text-text-muted">search_off</span>
            <p className="text-text-muted font-mono text-xs uppercase">No signals found</p>
            <p className="text-text-muted font-mono text-[10px]">Try lowering the threshold or run a new scan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {results.map((r) => <SignalCard key={r.slug} result={r} />)}
          </div>
        )
      ) : (
        <ResultTable results={results} />
      )}
    </div>
  )
}
