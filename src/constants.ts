/** Sparkline bar heights used in signal cards and skeleton loaders */
export const SPARKLINE_BARS = [0.3, 0.6, 0.45, 0.8, 0.55, 1.0] as const

/** Gap slider input bounds (cents) */
export const GAP_MIN = 0.01
export const GAP_MAX = 0.20

/** Maximum number of results shown in the bar chart */
export const CHART_DISPLAY_LIMIT = 20

/** Maximum character length for chart bar labels */
export const CHART_LABEL_MAX_LEN = 18

/** localStorage keys — single source of truth */
export const STORAGE_KEYS = {
  settings: "polyscan_settings",
  history: "polyscan_history",
  theme: "polyscan_theme",
} as const

/** Simulated price generation ranges for Gamma API */
export const SEED_RANGES = {
  yesMin: 0.12,
  yesSpan: 0.76,
  gapMin: 0.025,
  gapSpan: 0.11,
  directionThreshold: 0.5,
  noMin: 0.01,
  noMax: 0.99,
} as const
