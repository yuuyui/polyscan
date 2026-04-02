interface Props {
  icon: string
  label: string
  active: boolean
  onClick: () => void
}

export function NavItem({ icon, label, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-2.5 text-xs font-mono uppercase transition-colors ${
        active
          ? "text-primary border-r-2 border-primary bg-bg-card"
          : "text-text-muted hover:text-text-primary"
      }`}
    >
      <span className="material-symbols-outlined text-base">{icon}</span>
      {label}
    </button>
  )
}
