import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { GapResult } from "../types"

interface Props { results: GapResult[] }

export function GapBarChart({ results }: Props) {
  const data = results.slice(0, 20).map(r => ({
    name: r.question.slice(0, 18) + "\u2026",
    gap: parseFloat((r.gap * 100).toFixed(2)),
    direction: r.direction,
  }))

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
          <span className="flex items-center gap-1"><span className="w-2 h-2 inline-block rounded-none" style={{background:"#33ff99"}}></span>UNDER</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 inline-block rounded-none" style={{background:"#ff5f52"}}></span>OVER</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} barCategoryGap="20%">
          <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill:"#6b6882", fontSize:9, fontFamily:"JetBrains Mono" }}
            axisLine={false} tickLine={false} unit="\u00a2"
          />
          <Tooltip
            contentStyle={{ background:"#22202e", border:"1px solid #2e2c3e", borderRadius:"6px", fontSize:10, fontFamily:"JetBrains Mono" }}
            labelStyle={{ color:"#c0c0c0" }}
            formatter={(v) => [`${v}\u00a2`, "Gap"]}
          />
          <Bar dataKey="gap" radius={[2,2,0,0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.direction === "UNDER" ? "#33ff99" : "#ff5f52"} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
