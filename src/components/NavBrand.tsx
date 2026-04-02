export function NavBrand() {
  return (
    <div className="px-5 py-5 border-b border-border-default">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-lg">terminal</span>
        <span className="font-mono font-bold text-primary tracking-widest text-sm uppercase">POLYSCAN</span>
      </div>
      <div className="text-[9px] font-mono text-text-muted mt-1">v1.0.0 &middot; Arbitrage Scanner</div>
    </div>
  )
}
