export interface GapResult {
  question:  string
  slug:      string
  yes:       number
  no:        number
  sum:       number
  gap:       number
  direction: "OVER" | "UNDER" | "FAIR"
}

export interface MarketToken {
  token_id: string
  outcome:  string
}

export interface Market {
  condition_id?: string
  question_id?:  string
  market_slug:   string
  question:      string
  tokens:        MarketToken[]
  active:        boolean
}

export interface ScanRecord {
  id: string
  timestamp: Date
  totalScanned: number
  results: GapResult[]
}

export type FilterDirection = "ALL" | "OVER" | "UNDER"

export type Direction = FilterDirection

export interface ScanFilters {
  minGap:    number
  direction: Direction
}
