import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { GapResult } from "../types"
import { truncateText } from "../utils/format"
import { CHART_DISPLAY_LIMIT, CHART_LABEL_MAX_LEN } from "../constants"

interface Props { results: GapResult[]; isScanning?: boolean }

const CSS_VAR_NAMES = [
  "--color-under-text",
  "--color-over-text",
  "--color-text-muted",
  "--color-bg-card",
  "--color-border-default",
  "--color-text-secondary",
] as const

function readThemeColors() {
  const style = getComputedStyle(document.documentElement)
  const [under, over, muted, card, border, secondary] = CSS_VAR_NAMES.map(
    name => `rgb(${style.getPropertyValue(name).trim()})`
  )
  return { under, over, muted, card, border, secondary }
}

export function GapBarChart({ results, isScanning = false }: Props) {
  const [colors, setColors] = useState(readThemeColors)

  useEffect(() => {
    const observer = new MutationObserver(() => setColors(readThemeColors()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  const data = results.slice(0, CHART_DISPLAY_LIMIT).map(r => ({
    name: truncateText(r.question, CHART_LABEL_MAX_LEN),
    slug: r.slug,
    gap: parseFloat((r.gap * 100).toFixed(2)),
    direction: r.direction,
  }))

  if (isScanning) return (
    <div className="bg-bg-card border border-border-default rounded-sm p-4 animate-pulse">
      <div className="h-3 bg-border-default rounded w-24 mb-4" />
      <div className="flex items-end gap-2 h-[140px]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={`chart-skel-${i}`} className="flex-1 bg-border-default rounded-t-sm" style={{ height: `${20 + ((i * 37 + 13) % 60)}%` }} />
        ))}
      </div>
    </div>
  )

  if (data.length === 0) return (
    <div className="bg-bg-card border border-border-default rounded-sm p-6 flex items-center justify-center h-40">
      <span className="text-text-muted font-mono text-xs uppercase">No signals \u2014 run scan</span>
    </div>
  )

  return (
    <div className="bg-bg-card border border-border-default rounded-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[9px] font-mono text-text-muted uppercase tracking-widest">Gap Distribution</h3>
        <div className="flex gap-3 text-[8px] font-mono">
          <span className="flex items-center gap-1"><span className="w-2 h-2 inline-block rounded-none bg-under-text"></span>UNDER</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 inline-block rounded-none bg-over-text"></span>OVER</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} barCategoryGap="20%">
          <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill:colors.muted, fontSize:9, fontFamily:"JetBrains Mono" }}
            axisLine={false} tickLine={false} unit="\u00a2"
          />
          <Tooltip
            contentStyle={{ background:colors.card, border:`1px solid ${colors.border}`, borderRadius:"6px", fontSize:10, fontFamily:"JetBrains Mono" }}
            labelStyle={{ color:colors.secondary }}
            formatter={(v) => [`${v}\u00a2`, "Gap"]}
          />
          <Bar dataKey="gap" radius={[2,2,0,0]}>
            {data.map((entry) => (
              <Cell key={entry.slug} fill={entry.direction === "UNDER" ? colors.under : colors.over} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
