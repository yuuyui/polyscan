import { formatTimeUTC } from "../utils/format"

interface Props {
  totalScanned: number
  found: number
  lastScanAt: Date | null
  isScanning: boolean
}

export function StatsBar({ totalScanned, found, lastScanAt, isScanning }: Props) {
  const timeStr = lastScanAt ? formatTimeUTC(lastScanAt) : "\u2014"

  return (
    <div className="space-y-2">
      {/* Session stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-bg-card border border-border-default rounded-sm p-3">
          <div className="text-[9px] font-mono text-text-muted uppercase mb-1">Scanned</div>
          <div className="text-xl font-mono font-bold text-text-primary">{totalScanned.toLocaleString()}</div>
        </div>
        <div className="bg-bg-card border border-border-default rounded-sm p-3">
          <div className="text-[9px] font-mono text-text-muted uppercase mb-1">Signals</div>
          <div className="text-xl font-mono font-bold text-primary">{String(found).padStart(2, "0")}</div>
        </div>
      </div>

      {/* Live indicator */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${isScanning ? "bg-primary animate-pulse" : "bg-text-muted"}`} />
          <span className="text-[9px] font-mono text-text-muted uppercase">
            {isScanning ? "SCANNING" : lastScanAt ? "LAST: " + timeStr : "IDLE"}
          </span>
        </div>
        <span className="text-[9px] font-mono text-primary">14MS</span>
      </div>
    </div>
  )
}
