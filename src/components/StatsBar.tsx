interface Props {
  totalScanned: number
  found: number
  lastScanAt: Date | null
  isScanning: boolean
}
export function StatsBar({ totalScanned, found, lastScanAt, isScanning }: Props) {
  const timeStr = lastScanAt
    ? lastScanAt.toUTCString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1") + " UTC"
    : "\u2014"
  return (
    <div className="grid grid-cols-3 gap-1">
      <div className="bg-surface-low border border-surface-high p-3 lg:p-5 flex flex-col justify-between">
        <div className="text-[10px] font-mono text-outline uppercase">Markets Scanned</div>
        <div className="text-2xl lg:text-4xl font-mono font-bold text-on-surface mt-2">{totalScanned.toLocaleString()}</div>
      </div>
      <div className="bg-surface-low border border-surface-high p-3 lg:p-5 flex flex-col justify-between">
        <div className="text-[10px] font-mono text-outline uppercase">Gaps Found</div>
        <div className="text-2xl lg:text-4xl font-mono font-bold text-primary-fixed mt-2">{String(found).padStart(2, "0")}</div>
      </div>
      <div className="bg-surface-low border border-surface-high p-3 lg:p-5 flex flex-col justify-between">
        <div className="text-[10px] font-mono text-outline uppercase">Last Scan</div>
        <div className="text-lg lg:text-2xl font-mono font-bold text-on-surface mt-2">
          {isScanning ? <span className="text-primary-fixed animate-pulse">SCANNING\u2026</span> : timeStr}
        </div>
      </div>
    </div>
  )
}
