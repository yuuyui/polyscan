import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { GapResult } from "../types"
interface Props { results: GapResult[] }
export function GapBarChart({ results }: Props) {
  const data = results.slice(0, 20).map(r => ({
    name: r.question.slice(0, 20) + "\u2026",
    gap: parseFloat((r.gap * 100).toFixed(2)),
    direction: r.direction,
  }))
  if (data.length === 0) return (
    <div className="bg-surface-low border border-surface-high p-6 flex items-center justify-center h-40">
      <span className="text-outline font-mono text-xs">NO DATA \u2014 RUN SCAN</span>
    </div>
  )
  return (
    <div className="bg-surface-low border border-surface-high p-4 lg:p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[10px] font-mono text-outline uppercase tracking-widest">Real-Time Gap Distribution</h3>
        <div className="flex gap-4 text-[8px] font-mono">
          <span className="flex items-center gap-1"><span className="w-2 h-2 inline-block bg-primary-fixed"></span>UNDER</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 inline-block bg-secondary"></span>OVER</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data}>
          <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill:"#849585", fontSize:9, fontFamily:"JetBrains Mono" }} axisLine={false} tickLine={false} unit="\u00a2" />
          <Tooltip
            contentStyle={{ background:"#201f1f", border:"1px solid #353534", borderRadius:0, fontSize:10, fontFamily:"JetBrains Mono" }}
            labelStyle={{ color:"#b9cbb9" }}
            formatter={(v) => [`${v}¢`, "Gap"]}
          />
          <Bar dataKey="gap">
            {data.map((entry, i) => <Cell key={i} fill={entry.direction === "UNDER" ? "#00fd87" : "#ffb4ab"} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
