import type { ScanRecord } from "../types"

interface Props {
  history: ScanRecord[]
  selectedId: string | null
  onSelect: (id: string) => void
  onClearAll: () => void
  onExport?: () => void
}

export function ScanHistoryPanel({ history, selectedId, onSelect, onClearAll, onExport }: Props) {
  return (
    <div className="w-[600px] flex-shrink-0 bg-bg-sidebar border-r border-border-default flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
        <div>
          <h2 className="font-mono text-sm text-text-primary uppercase tracking-widest">Scan History</h2>
          <p className="text-[9px] font-mono text-text-muted mt-0.5">{history.length} recent scans</p>
        </div>
        <div className="flex items-center gap-2">
          {onExport && (
            <button
              onClick={onExport}
              className="px-3 py-1.5 text-[9px] font-mono font-bold uppercase rounded-sm border border-primary text-primary transition-colors"
            >
              Export
            </button>
          )}
          <button
            onClick={onClearAll}
            className="px-3 py-1.5 text-[9px] font-mono font-bold uppercase rounded-sm border border-border-default text-text-muted hover:text-over-text hover:border-over-text transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Scan list */}
      <div className="flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <span className="text-[11px] font-mono text-text-muted uppercase">No scans yet — run a scan first</span>
          </div>
        ) : (
          history.map((scan) => {
            const timeStr = scan.timestamp.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
            const dateStr = scan.timestamp.toISOString().slice(0, 10)
            return (
              <div
                key={scan.id}
                onClick={() => onSelect(scan.id)}
                className={`flex items-center justify-between px-5 py-3 border-b border-border-default cursor-pointer transition-colors hover:bg-bg-card ${
                  scan.id === selectedId ? "bg-bg-card" : ""
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
                  <span className="material-symbols-outlined text-base text-text-muted">chevron_right</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
