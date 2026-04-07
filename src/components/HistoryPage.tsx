import { useState, useEffect } from "react"
import { ScanHistoryPanel } from "./ScanHistoryPanel"
import type { GapResult, ScanRecord } from "../types"

interface Props {
  history: ScanRecord[]
  onClearAll: () => void
}

function getCssVar(name: string) {
  return `rgb(${getComputedStyle(document.documentElement).getPropertyValue(name).trim()})`
}

function SignalHistoryCard({ result }: { result: GapResult }) {
  const isUnder = result.direction === "UNDER"
  const gapPct = (result.gap * 100).toFixed(2)
  const netProfit = (result.gap - 0.04).toFixed(3)

  const underText    = getCssVar("--color-under-text")
  const overText     = getCssVar("--color-over-text")
  const primaryHover = getCssVar("--color-primary-hover")
  const filterActive = getCssVar("--color-filter-active")

  return (
    <div
      className="bg-bg-card border border-border-default rounded-sm p-4 cursor-pointer hover:border-primary transition-colors space-y-3"
      onClick={() => window.open(`https://polymarket.com/event/${result.slug}`, "_blank")}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-text-primary text-xs font-body leading-snug line-clamp-2 flex-1">
          {result.question}
        </p>
        <span className={`shrink-0 inline-block px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-sm ${
          isUnder ? "bg-under-bg text-under-text" : "bg-over-bg text-over-text"
        }`}>
          {result.direction}
        </span>
      </div>

      {/* YES / NO / SUM */}
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

      {/* Gap + Net Profit */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[9px] font-mono text-text-muted uppercase mb-0.5">GAP</div>
          <div
            className="font-mono font-bold text-2xl leading-none"
            style={{ color: isUnder ? underText : overText }}
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

      {/* Gap bar */}
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

function DetailContent({
  selected,
  sortAsc,
  onToggleSort,
}: {
  selected: ScanRecord | null
  sortAsc: boolean
  onToggleSort: () => void
}) {
  if (!selected) return null

  const sortedResults = [...selected.results].sort((a, b) =>
    sortAsc ? a.gap - b.gap : b.gap - a.gap
  )

  return (
    <>
      {/* Sub-header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
        <div>
          <h3 className="font-mono text-sm text-text-primary uppercase tracking-widest">Scan Details</h3>
          <p className="text-[9px] font-mono text-text-muted mt-0.5">
            {selected.timestamp.toISOString().replace("T", " ").slice(0, 19)} UTC &middot; {selected.results.length} signals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-text-muted uppercase">Sort by:</span>
          <button
            onClick={onToggleSort}
            className="text-[9px] font-mono text-primary uppercase"
          >
            Gap % {sortAsc ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {/* Signal cards */}
      {sortedResults.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <span className="font-mono text-text-muted text-sm uppercase">No signals in this scan</span>
        </div>
      ) : (
        <div className="p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-2 gap-3 lg:gap-4">
          {sortedResults.map((signal) => (
            <SignalHistoryCard key={signal.slug} result={signal} />
          ))}
        </div>
      )}
    </>
  )
}

export function HistoryPage({ history, onClearAll }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(history[0]?.id ?? null)
  const [sortAsc, setSortAsc] = useState(false)

  useEffect(() => {
    setSelectedId(prev => prev ?? history[0]?.id ?? null)
  }, [history])

  const selected = history.find(s => s.id === selectedId) ?? null

  const handleExport = () => {
    if (!selected) return
    const blob = new Blob([JSON.stringify(selected, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `polyscan-${selected.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {/* ── Desktop layout ── */}
      <div className="hidden lg:flex flex-1 min-h-0">
        <ScanHistoryPanel
          history={history}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onClearAll={onClearAll}
          onExport={selected ? handleExport : undefined}
        />
        <div className="flex-1 overflow-y-auto">
          {!selected ? (
            <div className="flex items-center justify-center h-full">
              <span className="font-mono text-text-muted text-sm uppercase">
                {history.length === 0 ? "No history yet — run a scan first" : "Select a scan to view signals"}
              </span>
            </div>
          ) : (
            <DetailContent selected={selected} sortAsc={sortAsc} onToggleSort={() => setSortAsc(p => !p)} />
          )}
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="lg:hidden flex flex-col flex-1 overflow-y-auto">
        {/* Scan list */}
        <div className="border-b border-border-default">
          {/* List header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
            <div>
              <h2 className="font-mono text-sm text-text-primary uppercase tracking-widest">Scan History</h2>
              <p className="text-[9px] font-mono text-text-muted mt-0.5">{history.length} recent scans</p>
            </div>
            <div className="flex items-center gap-2">
              {selected && (
                <button
                  onClick={handleExport}
                  className="px-3 py-1.5 text-[9px] font-mono font-bold uppercase rounded-sm border border-primary text-primary transition-colors"
                >
                  Export
                </button>
              )}
              <button
                onClick={onClearAll}
                className="px-3 py-1.5 text-[9px] font-mono font-bold uppercase rounded-sm border border-border-default text-text-muted hover:text-over-text hover:border-over-text transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* List items */}
          {history.length === 0 ? (
            <div className="flex items-center justify-center h-24">
              <span className="text-[11px] font-mono text-text-muted uppercase">No scans yet — run a scan first</span>
            </div>
          ) : (
            history.map((scan) => {
              const timeStr = scan.timestamp.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
              const dateStr = scan.timestamp.toISOString().slice(0, 10)
              return (
                <div
                  key={scan.id}
                  onClick={() => setSelectedId(scan.id)}
                  className={`flex items-center justify-between px-5 py-3 border-b border-border-default cursor-pointer transition-colors ${
                    scan.id === selectedId ? "bg-bg-card" : "hover:bg-bg-card"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-base text-text-muted">schedule</span>
                    <div>
                      <div className="text-[11px] font-mono text-text-primary">{dateStr} {timeStr} UTC</div>
                      <div className="text-[9px] font-mono text-text-muted mt-0.5">ID: {scan.id}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-primary font-bold">{scan.results.length}</span>
                    <span className="text-[9px] font-mono text-text-muted">signals</span>
                    <span className={`material-symbols-outlined text-base transition-colors ${scan.id === selectedId ? "text-primary" : "text-text-muted"}`}>chevron_right</span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Selected scan detail */}
        {selected ? (
          <DetailContent selected={selected} sortAsc={sortAsc} onToggleSort={() => setSortAsc(p => !p)} />
        ) : history.length > 0 ? (
          <div className="flex items-center justify-center h-32">
            <span className="font-mono text-text-muted text-sm uppercase">Select a scan above</span>
          </div>
        ) : null}
      </div>
    </>
  )
}
