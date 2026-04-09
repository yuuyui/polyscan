import type { ScanRecord } from "../types"
import type { ThemeId } from "../hooks/useTheme"
import type { Settings } from "../hooks/useSettings"
import { GAP_MIN, GAP_MAX } from "../constants"
import { downloadBlob } from "../utils/download"

// ─── Internal helpers ────────────────────────────────────────────────────────

function SectionCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="text-[9px] font-mono font-bold text-text-muted uppercase tracking-widest px-1">{label}</h2>
      <div className="bg-bg-card rounded overflow-hidden divide-y divide-border-subtle">{children}</div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-4">
      <span className="text-sm font-body text-text-secondary shrink-0">{label}</span>
      <div className="flex items-center">{children}</div>
    </div>
  )
}

function SegGroup({ options, value, onChange }: {
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex gap-1">
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)}
          className={`px-2 py-1 text-[9px] font-mono font-bold uppercase rounded-sm transition-colors ${
            value === opt
              ? "bg-filter-active text-on-filter"
              : "bg-bg-card-inner border border-border-default text-text-muted hover:text-text-primary"
          }`}
        >{opt}</button>
      ))}
    </div>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] font-mono text-text-muted uppercase">{checked ? "ON" : "OFF"}</span>
      <button onClick={() => onChange(!checked)} aria-pressed={checked} aria-label={label ?? (checked ? "Disable" : "Enable")}
        className={`relative w-9 h-5 rounded-full overflow-hidden transition-colors ${checked ? "bg-primary" : "bg-bg-card-inner border border-border-default"}`}
      >
        <span className={`absolute top-[3px] left-0 w-3.5 h-3.5 rounded-full bg-text-primary transition-transform ${
          checked ? "translate-x-[19px]" : "translate-x-[3px]"
        }`} />
      </button>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  settings: Settings
  update: (patch: Partial<Settings>) => void
  onReset: () => void
  theme: ThemeId
  setTheme: (t: ThemeId) => void
  history: ScanRecord[]
  onClearHistory: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SettingsPage({ settings, update, onReset, theme, setTheme, history, onClearHistory }: Props) {

  const exportHistory = () => {
    let content: string
    let mime: string
    let ext: string
    if (settings.exportFormat === "CSV") {
      const header = "id,timestamp,totalScanned,question,direction,gap\n"
      const rows = history.flatMap(scan =>
        scan.results.map(r =>
          `${scan.id},${scan.timestamp.toISOString()},${scan.totalScanned},${JSON.stringify(r.question)},${r.direction},${r.gap}`
        )
      ).join("\n")
      content = header + rows
      mime = "text/csv"
      ext = "csv"
    } else {
      content = JSON.stringify(history, null, 2)
      mime = "application/json"
      ext = "json"
    }
    downloadBlob(new Blob([content], { type: mime }), `polyscan_history.${ext}`)
  }

  const appearance = (
    <SectionCard label="APPEARANCE">
      <Row label="Theme">
        <div className="flex gap-1">
          {(["default", "binance"] as ThemeId[]).map(t => (
            <button key={t} onClick={() => setTheme(t)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-mono uppercase rounded-sm transition-colors border ${
                theme === t
                  ? "border-primary text-text-primary"
                  : "border-border-default text-text-muted hover:text-text-primary"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </Row>
      <Row label="Default View">
        <SegGroup
          options={["CARDS", "TABLE"]}
          value={settings.defaultView}
          onChange={v => update({ defaultView: v as Settings["defaultView"] })}
        />
      </Row>
    </SectionCard>
  )

  const scanDefaults = (
    <SectionCard label="SCAN DEFAULTS">
      <Row label="Min Gap">
        <div className="flex items-center gap-3">
          <input
            type="range" min="1" max="20" value={Math.round(settings.minGap * 100)}
            onChange={e => {
              const val = Number(e.target.value)
              if (Number.isNaN(val)) return
              update({ minGap: Math.max(GAP_MIN, Math.min(GAP_MAX, val / 100)) })
            }}
            className="w-28 h-0.5 bg-border-default appearance-none cursor-pointer accent-primary"
          />
          <span className="text-[9px] font-mono text-primary w-6 text-right">
            {Math.round(settings.minGap * 100)}¢
          </span>
        </div>
      </Row>
      <Row label="Default Direction">
        <SegGroup
          options={["ALL", "OVER", "UNDER"]}
          value={settings.defaultDirection}
          onChange={v => update({ defaultDirection: v as Settings["defaultDirection"] })}
        />
      </Row>
      <Row label="Market Limit">
        <SegGroup
          options={["50", "100", "200"]}
          value={String(settings.marketLimit)}
          onChange={v => update({ marketLimit: Number(v) as Settings["marketLimit"] })}
        />
      </Row>
      <Row label="Fee Rate">
        <span className="text-sm font-mono text-text-primary">
          {(settings.feeRate * 100).toFixed(1)}<span className="text-text-muted ml-0.5">%</span>
        </span>
      </Row>
    </SectionCard>
  )

  const autoScan = (
    <SectionCard label="AUTO-SCAN">
      <Row label="Auto-Scan">
        <Toggle checked={settings.autoScan} onChange={v => update({ autoScan: v })} label="Toggle auto-scan" />
      </Row>
      <Row label="Interval">
        <SegGroup
          options={["30S", "1M", "5M", "10M"]}
          value={settings.scanInterval.toUpperCase()}
          onChange={v => update({ scanInterval: v.toLowerCase() as Settings["scanInterval"] })}
        />
      </Row>
      <Row label="Notify on Signals">
        <Toggle checked={settings.notifyOnSignals} onChange={v => update({ notifyOnSignals: v })} label="Toggle signal notifications" />
      </Row>
      <Row label="Min Signals to Notify">
        <SegGroup
          options={["1", "3", "5"]}
          value={String(settings.minSignalsToNotify)}
          onChange={v => update({ minSignalsToNotify: Number(v) as Settings["minSignalsToNotify"] })}
        />
      </Row>
    </SectionCard>
  )

  const dataHistory = (
    <SectionCard label="DATA & HISTORY">
      <Row label="Max Saved Scans">
        <SegGroup
          options={["25", "50", "100"]}
          value={String(settings.maxSavedScans)}
          onChange={v => update({ maxSavedScans: Number(v) as Settings["maxSavedScans"] })}
        />
      </Row>
      <Row label="Export Format">
        <SegGroup
          options={["JSON", "CSV"]}
          value={settings.exportFormat}
          onChange={v => update({ exportFormat: v as Settings["exportFormat"] })}
        />
      </Row>
      <div className="flex gap-3 px-4 py-3">
        <button onClick={exportHistory}
          className="px-3 py-1.5 text-[9px] font-mono font-bold uppercase rounded-sm border border-border-default text-text-muted hover:text-text-primary hover:border-text-primary transition-colors"
        >
          Export All History
        </button>
        <button onClick={onClearHistory}
          className="px-3 py-1.5 text-[9px] font-mono font-bold uppercase rounded-sm border border-over-text text-over-text hover:bg-over-bg transition-colors"
        >
          Clear All History
        </button>
      </div>
    </SectionCard>
  )

  const about = (
    <SectionCard label="ABOUT">
      <Row label="Version"><span className="text-sm font-mono text-text-muted">v1.0.0</span></Row>
      <Row label="Data Source"><span className="text-sm font-body text-text-secondary">Gamma API</span></Row>
      <div className="px-4 py-3">
        <button onClick={onReset}
          className="px-3 py-1.5 text-[9px] font-mono font-bold uppercase rounded-sm border border-over-text text-over-text hover:bg-over-bg transition-colors"
        >
          Reset All Settings
        </button>
      </div>
    </SectionCard>
  )

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Desktop: 2-column */}
      <div className="hidden lg:grid grid-cols-2 gap-6">
        <div className="space-y-6">
          {appearance}
          {scanDefaults}
        </div>
        <div className="space-y-6">
          {autoScan}
          {dataHistory}
          {about}
        </div>
      </div>

      {/* Mobile: single column */}
      <div className="lg:hidden space-y-6">
        {appearance}
        {scanDefaults}
        {autoScan}
        {dataHistory}
        {about}
      </div>
    </div>
  )
}
