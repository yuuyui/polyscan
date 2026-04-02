interface ScanHistoryItem {
  id: string
  timestamp: string
  signalCount: number
}

const mockHistory: ScanHistoryItem[] = [
  { id: "scan-001", timestamp: "2025-01-15 14:32:01 UTC", signalCount: 12 },
  { id: "scan-002", timestamp: "2025-01-15 14:28:45 UTC", signalCount: 8 },
  { id: "scan-003", timestamp: "2025-01-15 14:25:12 UTC", signalCount: 15 },
]

export function ScanHistoryPanel() {
  return (
    <div className="w-[600px] flex-shrink-0 bg-bg-sidebar border-r border-border-default flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
        <div>
          <h2 className="font-mono text-sm text-text-primary uppercase tracking-widest">Scan History</h2>
          <p className="text-[9px] font-mono text-text-muted mt-0.5">{mockHistory.length} recent scans</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-[9px] font-mono font-bold uppercase rounded-sm border border-border-default text-text-muted hover:text-over-text hover:border-over-text transition-colors">
            Clear All
          </button>
          <button className="px-3 py-1.5 text-[9px] font-mono font-bold uppercase rounded-sm border border-primary text-primary hover:bg-primary hover:text-on-primary transition-colors">
            Export
          </button>
        </div>
      </div>

      {/* Scan list */}
      <div className="flex-1 overflow-y-auto">
        {mockHistory.map((scan, i) => (
          <div
            key={scan.id}
            className={`flex items-center justify-between px-5 py-3 border-b border-border-default cursor-pointer transition-colors hover:bg-bg-card ${
              i === 0 ? "bg-bg-card" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-base text-text-muted">schedule</span>
              <div>
                <div className="text-[11px] font-mono text-text-primary">{scan.timestamp}</div>
                <div className="text-[9px] font-mono text-text-muted mt-0.5">ID: {scan.id}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-primary font-bold">{scan.signalCount}</span>
              <span className="text-[9px] font-mono text-text-muted">signals</span>
              <span className="material-symbols-outlined text-base text-text-muted">chevron_right</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
