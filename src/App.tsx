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
import { formatTimeUTC } from "./utils/format"

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
  const { history, addScan, clearAll } = useScanHistory(settings.maxSavedScans)
  const onScanComplete = useCallback((results: GapResult[], totalScanned: number) => {
    addScan(results, totalScanned)
  }, [addScan])
  const { results, isScanning, lastScanAt, totalScanned, error, scan, loadMock } = useScan(minGap, onScanComplete)
  const filtered = results.filter(r => direction === "ALL" ? true : r.direction === direction)

  // Expose loadMock for e2e tests only in dev mode
  if (import.meta.env.DEV && typeof window !== "undefined") (window as Record<string, unknown>).__loadMock = loadMock

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
            <div className="text-[9px] font-mono text-text-muted mt-1">v{__APP_VERSION__} &middot; Arbitrage Scanner</div>
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
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
                {active === "terminal" ? "TERMINAL_CORE" : active === "history" ? "HISTORY_LOG" : "SYSTEM_CONFIG"}
              </span>
              <span className="text-[10px] font-mono text-primary border-b border-primary pb-0.5">
                {active === "terminal" ? "Live Arbitrage Feed" : active === "history" ? "Scan Records" : "Preferences"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {active === "terminal" && (
                <>
                  {lastScanAt && (
                    <span className="text-[9px] font-mono text-text-muted">
                      {formatTimeUTC(lastScanAt)}
                    </span>
                  )}
                  <button
                    onClick={scan}
                    disabled={isScanning}
                    className="px-4 py-1.5 text-xs font-mono font-bold uppercase rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-on-primary hover:bg-primary-hover"
                  >
                    {isScanning ? "SCANNING\u2026" : "SCAN NOW"}
                  </button>
                </>
              )}
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
      <MobileLayout
        active={active} setActive={setActive}
        scan={scan} isScanning={isScanning}
        totalScanned={totalScanned} filteredCount={filtered.length}
        lastScanAt={lastScanAt}
        minGap={minGap} direction={direction}
        onMinGapChange={setMinGap} onDirectionChange={setDirection}
        toggleTheme={toggleTheme} currentTheme={currentTheme}
        results={filtered} error={error}
        history={history} clearAll={clearAll}
        settings={settings} updateSettings={updateSettings} resetSettings={resetSettings}
        theme={theme} setTheme={setTheme}
      />
    </div>
  )
}

// ─── Mobile Layout with Burger Menu ──────────────────────────────────────────

function MobileLayout({ active, setActive, scan, isScanning, totalScanned, filteredCount, lastScanAt, minGap, direction, onMinGapChange, onDirectionChange, toggleTheme, currentTheme, results, error, history, clearAll, settings, updateSettings, resetSettings, theme, setTheme }: {
  active: NavItem; setActive: (n: NavItem) => void
  scan: () => void; isScanning: boolean
  totalScanned: number; filteredCount: number; lastScanAt: Date | null
  minGap: number; direction: FilterDirection
  onMinGapChange: (v: number) => void; onDirectionChange: (v: FilterDirection) => void
  toggleTheme: () => void; currentTheme: { accent: string; label: string }
  results: GapResult[]; error: string | null
  history: import("./types").ScanRecord[]; clearAll: () => void
  settings: import("./hooks/useSettings").Settings; updateSettings: (p: Partial<import("./hooks/useSettings").Settings>) => void; resetSettings: () => void
  theme: import("./hooks/useTheme").ThemeId; setTheme: (t: import("./hooks/useTheme").ThemeId) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="lg:hidden flex flex-col flex-1">
      {/* Mobile header with burger */}
      <header className="flex items-center justify-between px-4 h-12 bg-bg-sidebar border-b border-border-default sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-xl">{menuOpen ? "close" : "menu"}</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">terminal</span>
            <span className="font-mono font-bold text-primary tracking-widest text-sm uppercase">POLYSCAN</span>
          </div>
        </div>
        {active === "terminal" && (
          <button
            onClick={scan}
            disabled={isScanning}
            className="px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-sm disabled:opacity-50 bg-primary text-on-primary hover:bg-primary-hover"
          >
            {isScanning ? "\u2026" : "SCAN"}
          </button>
        )}
      </header>

      {/* Slide-over menu */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 top-12 bg-black/50 z-40" onClick={() => setMenuOpen(false)} />
          <nav
            className="fixed top-12 left-0 bottom-0 w-64 bg-bg-sidebar border-r border-border-default z-50 flex flex-col animate-slide-in"
            aria-label="Mobile navigation"
          >
            <div className="py-2">
              {navItems.map(item => (
                <button key={item.id} onClick={() => { setActive(item.id); setMenuOpen(false) }}
                  aria-current={active === item.id ? "page" : undefined}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-xs font-mono uppercase transition-colors ${
                    active === item.id
                      ? "text-primary border-r-2 border-primary bg-bg-card"
                      : "text-text-muted hover:text-text-primary"
                  }`}>
                  <span className="material-symbols-outlined text-base" aria-hidden="true">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            {/* Theme toggle in menu */}
            <div className="px-4 pb-4 border-t border-border-default pt-4">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2.5 px-3 py-2 rounded-sm border border-border-default hover:border-primary transition-colors group w-full"
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: currentTheme.accent }} />
                <span className="text-[9px] font-mono uppercase text-text-primary flex-1 text-left">{currentTheme.label}</span>
                <span className="material-symbols-outlined text-[13px] text-text-muted group-hover:text-primary transition-colors">sync</span>
              </button>
            </div>
          </nav>
        </>
      )}

      {/* Mobile stats + filter (only on terminal) */}
      {active === "terminal" && (
        <>
          <div className="px-4 pt-4 pb-2">
            <StatsBar totalScanned={totalScanned} found={filteredCount} lastScanAt={lastScanAt} isScanning={isScanning} />
          </div>
          <div className="px-4 pb-4">
            <FilterBar minGap={minGap} direction={direction} onMinGapChange={onMinGapChange} onDirectionChange={onDirectionChange} />
          </div>
        </>
      )}

      {/* Mobile content — full height, no bottom padding */}
      <main className="flex-1">
        {active === "terminal" && <ErrorBoundary><ScannerPage results={results} error={error} isScanning={isScanning} /></ErrorBoundary>}
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
  )
}
