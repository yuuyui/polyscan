import { useState } from "react"
import { useScan } from "../hooks/useScan"
import { StatsBar } from "./StatsBar"
import { FilterBar } from "./FilterBar"
import { GapBarChart } from "./GapBarChart"
import { ResultTable } from "./ResultTable"
import type { FilterDirection } from "../types"

export function ScannerPage() {
  const [minGap, setMinGap] = useState(0.03)
  const [direction, setDirection] = useState<FilterDirection>("ALL")
  const { results, isScanning, lastScanAt, totalScanned, error } = useScan(minGap)
  const filtered = results.filter(r => direction === "ALL" ? true : r.direction === direction)
  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      {error && (
        <div className="bg-secondary-container border border-secondary p-3 text-secondary font-mono text-xs">{"\u26A0"} {error}</div>
      )}
      <StatsBar totalScanned={totalScanned} found={filtered.length} lastScanAt={lastScanAt} isScanning={isScanning} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        <div className="lg:col-span-4"><FilterBar minGap={minGap} direction={direction} onMinGapChange={setMinGap} onDirectionChange={setDirection} /></div>
        <div className="lg:col-span-8"><GapBarChart results={filtered} /></div>
      </div>
      <ResultTable results={filtered} />
    </div>
  )
}
