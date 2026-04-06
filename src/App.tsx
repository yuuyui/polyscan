import { useState } from "react"
import { ScannerPage } from "./components/ScannerPage"
import { HistoryPage } from "./components/HistoryPage"
import { StatsBar } from "./components/StatsBar"
import { FilterBar } from "./components/FilterBar"
import { useScan } from "./hooks/useScan"
import type { FilterDirection } from "./types"

type NavItem = "terminal" | "history" | "settings"

const navItems = [
  { id: "terminal" as NavItem, icon: "terminal", label: "TERMINAL" },
  { id: "history" as NavItem, icon: "history", label: "HISTORY" },
  { id: "settings" as NavItem, icon: "settings", label: "SETTINGS" },
]

export default function App() {
  const [active, setActive] = useState<NavItem>("terminal")
  const [minGap, setMinGap] = useState(0.03)
  const [direction, setDirection] = useState<FilterDirection>("ALL")
  const { results, isScanning, lastScanAt, totalScanned, error, scan } = useScan(minGap)
  const filtered = results.filter(r => direction === "ALL" ? true : r.direction === direction)

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col">

      {/* Desktop layout */}
      <div className="hidden lg:flex flex-1">

        {/* Sidebar 240px */}
        <aside className="w-60 flex-shrink-0 bg-bg-sidebar border-r border-border-default flex flex-col fixed top-0 left-0 h-full z-40">
          {/* Brand */}
          <div className="px-5 py-5 border-b border-border-default">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">terminal</span>
              <span className="font-mono font-bold text-primary tracking-widest text-sm uppercase">POLYSCAN</span>
            </div>
            <div className="text-[9px] font-mono text-text-muted mt-1">v1.0.0 &middot; Arbitrage Scanner</div>
          </div>

          {/* Nav */}
          <nav className="py-2">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActive(item.id)}
                className={`w-full flex items-center gap-3 px-5 py-2.5 text-xs font-mono uppercase transition-colors ${
                  active === item.id
                    ? "text-primary border-r-2 border-primary bg-bg-card"
                    : "text-text-muted hover:text-text-primary"
                }`}>
                <span className="material-symbols-outlined text-base">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Stats + Filter in sidebar */}
          <div className="px-4 pb-4 space-y-5 border-t border-border-default pt-4">
            <StatsBar
              totalScanned={totalScanned}
              found={filtered.length}
              lastScanAt={lastScanAt}
              isScanning={isScanning}
            />
            <FilterBar
              minGap={minGap}
              direction={direction}
              onMinGapChange={setMinGap}
              onDirectionChange={setDirection}
            />
          </div>
        </aside>

        {/* Main content */}
        <main className="ml-60 flex-1 flex flex-col min-h-screen">
          {/* Top bar */}
          <header className="flex items-center justify-between px-6 h-12 bg-bg-sidebar border-b border-border-default sticky top-0 z-30">
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">TERMINAL_CORE</span>
              <button className="text-[10px] font-mono text-primary border-b border-primary pb-0.5">Live Arbitrage Feed</button>
            </div>
            <div className="flex items-center gap-3">
              {lastScanAt && (
                <span className="text-[9px] font-mono text-text-muted">
                  {lastScanAt.toUTCString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1")} UTC
                </span>
              )}
              <button
                onClick={scan}
                disabled={isScanning}
                className="px-4 py-1.5 text-xs font-mono font-bold uppercase rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "#33ff99",
                  color: "#000",
                }}
                onMouseEnter={e => { if (!isScanning) (e.target as HTMLElement).style.background = "#00ccc9" }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = "#33ff99" }}
              >
                {isScanning ? "SCANNING\u2026" : "SCAN NOW"}
              </button>
            </div>
          </header>

          {/* Page */}
          {active === "terminal" && <ScannerPage results={filtered} error={error} />}
          {active === "history" && <HistoryPage />}
          {active !== "terminal" && active !== "history" && (
            <div className="flex-1 flex items-center justify-center">
              <span className="font-mono text-text-muted text-sm uppercase">Coming Soon \u2014 {active}</span>
            </div>
          )}
        </main>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden flex flex-col flex-1">
        {/* Mobile header */}
        <header className="flex items-center justify-between px-4 h-12 bg-bg-sidebar border-b border-border-default sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">terminal</span>
            <span className="font-mono font-bold text-primary tracking-widest text-sm uppercase">POLYSCAN</span>
          </div>
          <button
            onClick={scan}
            disabled={isScanning}
            className="px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-sm disabled:opacity-50"
            style={{ background: "#33ff99", color: "#000" }}
          >
            {isScanning ? "\u2026" : "SCAN"}
          </button>
        </header>

        {/* Mobile stats */}
        <div className="px-4 pt-4 pb-2">
          <StatsBar totalScanned={totalScanned} found={filtered.length} lastScanAt={lastScanAt} isScanning={isScanning} />
        </div>
        <div className="px-4 pb-4">
          <FilterBar minGap={minGap} direction={direction} onMinGapChange={setMinGap} onDirectionChange={setDirection} />
        </div>

        {/* Mobile content */}
        <main className="flex-1 pb-16">
          {active === "terminal" && <ScannerPage results={filtered} error={error} />}
          {active === "history" && <HistoryPage />}
          {active !== "terminal" && active !== "history" && (
            <div className="flex-1 flex items-center justify-center">
              <span className="font-mono text-text-muted text-sm uppercase">Coming Soon \u2014 {active}</span>
            </div>
          )}
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 flex bg-bg-sidebar border-t border-border-default z-40">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
                active === item.id ? "text-primary" : "text-text-muted hover:text-text-primary"
              }`}>
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="font-mono text-[8px] uppercase mt-0.5">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
