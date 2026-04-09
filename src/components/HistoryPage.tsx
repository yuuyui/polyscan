import { useState, useEffect } from "react"
import { ScanHistoryPanel } from "./ScanHistoryPanel"
import { SignalCard } from "./SignalCard"
import type { ScanRecord } from "../types"
import { formatDateTimeUTC, formatDateISO, formatTime24h } from "../utils/format"
import { downloadBlob } from "../utils/download"

interface Props {
  history: ScanRecord[]
  onClearAll: () => void
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
            {formatDateTimeUTC(selected.timestamp)} &middot; {selected.results.length} signals
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
            <SignalCard key={signal.slug} result={signal} variant="history" />
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
    setSelectedId(prev => {
      if (prev && history.some(s => s.id === prev)) return prev
      return history[0]?.id ?? null
    })
  }, [history])

  const selected = history.find(s => s.id === selectedId) ?? null

  const handleExport = () => {
    if (!selected) return
    const blob = new Blob([JSON.stringify(selected, null, 2)], { type: "application/json" })
    downloadBlob(blob, `polyscan-${selected.id}.json`)
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
              <div className="text-center space-y-2">
                <span className="material-symbols-outlined text-3xl text-text-muted">{history.length === 0 ? "history_toggle_off" : "touch_app"}</span>
                <p className="font-mono text-text-muted text-sm uppercase">
                  {history.length === 0 ? "No history yet" : "Select a scan to view signals"}
                </p>
                {history.length === 0 && <p className="font-mono text-text-muted text-[10px]">Run a scan to start tracking history</p>}
              </div>
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
            <div className="flex flex-col items-center justify-center h-24 space-y-1">
              <span className="material-symbols-outlined text-2xl text-text-muted">history_toggle_off</span>
              <span className="text-[11px] font-mono text-text-muted uppercase">No scans yet</span>
            </div>
          ) : (
            history.map((scan) => {
              const timeStr = formatTime24h(scan.timestamp)
              const dateStr = formatDateISO(scan.timestamp)
              return (
                <div
                  key={scan.id}
                  role="button" tabIndex={0} aria-selected={scan.id === selectedId}
                  onClick={() => setSelectedId(scan.id)}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedId(scan.id) } }}
                  className={`flex items-center justify-between px-5 py-3 border-b border-border-default cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                    scan.id === selectedId ? "bg-bg-card" : "hover:bg-bg-card"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-base text-text-muted" aria-hidden="true">schedule</span>
                    <div>
                      <div className="text-[11px] font-mono text-text-primary">{dateStr} {timeStr}</div>
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
