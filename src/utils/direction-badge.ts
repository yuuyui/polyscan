import type { GapResult } from "../types"

/** Get CSS classes for a direction badge */
export function directionBadgeClass(direction: GapResult["direction"]): string {
  switch (direction) {
    case "UNDER": return "bg-under-bg text-under-text"
    case "OVER":  return "bg-over-bg text-over-text"
    case "FAIR":  return "bg-surface-high text-text-muted"
  }
}
