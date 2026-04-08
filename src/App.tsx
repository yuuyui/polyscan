import { useState, useCallback } from "react"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { ScannerPage } from "./components/ScannerPage"
import { HistoryPage } from "./components/HistoryPage"
import { SettingsPage } from "./components/SettingsPage"
import { StatsBar } from "./components/StatsBar"
import { FilterBar } from "./components/FilterBar"
import { useScan } from "./hooks/useScan"
import { useScanHistory } from "./hooks/useScanHistory"
import { useTheme } from "./hooks/useTheme"
import { useSettings } from "./hooks/useSettings"
import type { FilterDirection, GapResult } from "./types"

type NavItem = "terminal" | "history" | "settings"

const navItems = [
  { id: "terminal" as NavItem, icon: "terminal", label: "TERMINAL" },
  { id: "history" as NavItem, icon: "history", label: "HISTORY" },
  { id: "settings" as NavItem, icon: "settings", label: "SETTINGS" },
]

export default function App() {
  const [active, setActive] = useState<NavItem>("terminal")
  const { settings, update: updateSettings, reset: resetSettings } = useSettings()
  const [minGap, setMinGap] = useState(settings.minGap)
  const [direction, setDirection] = useState<FilterDirection>(settings.defaultDirection)
  const { theme, setTheme, toggleTheme, currentTheme } = useTheme()
  const { history, addScan, clearAll } = useScanHistory()
  const onScanComplete = useCallback((results: GapResult[], totalScanned: number) => {
    addScan(results, totalScanned)
  }, [addScan])
  const { results, isScanning, lastScanAt, totalScanned, error, scan, loadMock } = useScan(minGap, onScanComplete)
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
          <nav className="py-2" aria-label="Main navigation">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActive(item.id)}
                aria-current={active === item.id ? "page" : undefined}
                className={`w-full flex items-center gap-3 px-5 py-2.5 text-xs font-mono uppercase transition-colors ${
                  active === item.id
                    ? "text-primary border-r-2 border-primary bg-bg-card"
                    : "text-text-muted hover:text-text-primary"
                }`}>
                <span className="material-symbols-outlined text-base" aria-hidden="true">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Stats + Filter in sidebar */}
          <div className="px-4 pb-4 space-y-5 border-t border-border-default pt-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm border border-border-default hover:border-primary transition-colors group"
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0 transition-colors" style={{ background: currentTheme.accent }} />
              <span className="text-[9px] font-mono uppercase text-text-primary flex-1 text-left">{currentTheme.label}</span>
              <span className="material-symbols-outlined text-[13px] text-text-muted group-hover:text-primary transition-colors">sync</span>
            </button>
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
                onClick={loadMock}
                disabled={isScanning}
                className="px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-sm transition-colors border border-border-default text-text-muted hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                MOCK
              </button>
              <button
                onClick={scan}
                disabled={isScanning}
                className="px-4 py-1.5 text-xs font-mono font-bold uppercase rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-on-primary hover:bg-primary-hover"
              >
                {isScanning ? "SCANNING\u2026" : "SCAN NOW"}
              </button>
            </div>
          </header>

          {/* Page */}
          {active === "terminal" && <ErrorBoundary><ScannerPage results={filtered} error={error} isScanning={isScanning} /></ErrorBoundary>}
          {active === "history" && <ErrorBoundary><HistoryPage history={history} onClearAll={clearAll} /></ErrorBoundary>}
          {active === "settings" && (
            <ErrorBoundary><SettingsPage
              settings={settings} update={updateSettings} onReset={resetSettings}
              theme={theme} setTheme={setTheme}
              history={history} onClearHistory={clearAll}
            /></ErrorBoundary>
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
          <div className="flex items-center gap-2">
            <button
              onClick={loadMock}
              disabled={isScanning}
              className="px-2 py-1.5 text-xs font-mono font-bold uppercase rounded-sm border border-border-default text-text-muted disabled:opacity-50"
            >
              MOCK
            </button>
            <button
              onClick={scan}
              disabled={isScanning}
              className="px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-sm disabled:opacity-50 bg-primary text-on-primary hover:bg-primary-hover"
            >
              {isScanning ? "\u2026" : "SCAN"}
            </button>
          </div>
        </header>

        {/* Mobile stats */}
        <div className="px-4 pt-4 pb-2">
          <StatsBar totalScanned={totalScanned} found={filtered.length} lastScanAt={lastScanAt} isScanning={isScanning} />
        </div>
        <div className="px-4 pb-2">
          <FilterBar minGap={minGap} direction={direction} onMinGapChange={setMinGap} onDirectionChange={setDirection} />
        </div>
        {/* Mobile theme toggle */}
        <div className="px-4 pb-4">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2.5 px-3 py-2 rounded-sm border border-border-default hover:border-primary transition-colors group w-full"
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: currentTheme.accent }} />
            <span className="text-[9px] font-mono uppercase text-text-primary flex-1 text-left">{currentTheme.label}</span>
            <span className="material-symbols-outlined text-[13px] text-text-muted group-hover:text-primary transition-colors">sync</span>
          </button>
        </div>

        {/* Mobile content */}
        <main className="flex-1 pb-16">
          {active === "terminal" && <ErrorBoundary><ScannerPage results={filtered} error={error} isScanning={isScanning} /></ErrorBoundary>}
          {active === "history" && <ErrorBoundary><HistoryPage history={history} onClearAll={clearAll} /></ErrorBoundary>}
          {active === "settings" && (
            <ErrorBoundary><SettingsPage
              settings={settings} update={updateSettings} onReset={resetSettings}
              theme={theme} setTheme={setTheme}
              history={history} onClearHistory={clearAll}
            /></ErrorBoundary>
          )}
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 flex bg-bg-sidebar border-t border-border-default z-40" aria-label="Mobile navigation">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              aria-current={active === item.id ? "page" : undefined}
              className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
                active === item.id ? "text-primary" : "text-text-muted hover:text-text-primary"
              }`}>
              <span className="material-symbols-outlined text-xl" aria-hidden="true">{item.icon}</span>
              <span className="font-mono text-[8px] uppercase mt-0.5">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
