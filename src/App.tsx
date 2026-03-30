import { useState } from "react"
import { ScannerPage } from "./components/ScannerPage"
import { useScan } from "./hooks/useScan"

type NavItem = "terminal" | "scanners" | "history" | "settings"
const navItems = [
  { id: "terminal" as NavItem, icon: "terminal", label: "TERMINAL" },
  { id: "scanners" as NavItem, icon: "troubleshoot", label: "SCANNERS" },
  { id: "history" as NavItem, icon: "history", label: "HISTORY" },
  { id: "settings" as NavItem, icon: "settings", label: "SETTINGS" },
]

export default function App() {
  const [active, setActive] = useState<NavItem>("terminal")
  const { isScanning, scan } = useScan(0.03)
  return (
    <div className="min-h-screen bg-surface text-on-surface flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-surface-dim border-r border-surface-high z-40">
        <div className="p-6 border-b border-surface-container">
          <div className="font-sg text-xl font-black tracking-tighter text-primary-fixed uppercase">POLYSCAN</div>
          <div className="font-mono text-[9px] text-outline tracking-widest mt-1">v1.0.0-ALPHA</div>
        </div>
        <nav className="flex-1 mt-2">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 font-mono text-sm font-bold uppercase tracking-tight transition-colors ${
                active===item.id ? "bg-surface-container text-primary-fixed border-r-2 border-primary-fixed" : "text-outline hover:text-on-surface"
              }`}
              style={active===item.id ? { boxShadow:"0 0 10px rgba(0,253,135,0.2)" } : {}}>
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-surface-container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isScanning ? "bg-primary-fixed animate-pulse" : "bg-outline"}`}></div>
              <span className="text-[10px] font-mono text-on-surface-variant">LIVE FEED</span>
            </div>
            <span className="text-[10px] font-mono text-primary-fixed">14MS</span>
          </div>
        </div>
      </aside>

      {/* Tablet Sidebar */}
      <aside className="hidden md:flex lg:hidden flex-col fixed left-0 top-0 h-full w-16 bg-surface-dim border-r border-surface-high z-40">
        <div className="p-4 border-b border-surface-container flex justify-center">
          <span className="material-symbols-outlined text-primary-fixed">terminal</span>
        </div>
        <nav className="flex-1 mt-2">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={`w-full flex justify-center py-3 transition-colors ${active===item.id?"text-primary-fixed":"text-outline hover:text-on-surface"}`}>
              <span className="material-symbols-outlined">{item.icon}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-64 md:ml-16 flex flex-col min-h-screen pb-16 md:pb-0">
        <header className="flex items-center justify-between px-4 lg:px-6 h-14 bg-surface-dim border-b border-surface-high sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary-fixed">terminal</span>
            <h1 className="font-sg font-black tracking-tighter text-primary-fixed uppercase text-lg lg:hidden">POLYSCAN</h1>
            <span className="hidden lg:block text-[10px] font-mono text-outline uppercase tracking-widest">TERMINAL_CORE</span>
          </div>
          <button onClick={scan} disabled={isScanning}
            className="bg-primary-fixed text-black text-xs font-mono font-bold px-4 py-2 uppercase hover:bg-primary-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isScanning ? "SCANNING\u2026" : "SCAN NOW"}
          </button>
        </header>
        {active==="terminal" && <ScannerPage />}
        {active!=="terminal" && (
          <div className="flex-1 flex items-center justify-center">
            <span className="font-mono text-outline text-sm uppercase">Coming Soon \u2014 {active}</span>
          </div>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex bg-surface-dim border-t border-surface-high z-40">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${active===item.id?"text-primary-fixed bg-surface-low":"text-outline hover:text-on-surface"}`}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-sg text-[9px] uppercase mt-1">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
