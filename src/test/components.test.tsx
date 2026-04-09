import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { SignalCard } from "../components/SignalCard"
import { ResultTable } from "../components/ResultTable"
import { StatsBar } from "../components/StatsBar"
import { FilterBar } from "../components/FilterBar"
import type { GapResult } from "../types"

const mockResult: GapResult = {
  question: "Will BTC hit $100k?",
  slug: "btc-100k",
  yes: 0.650,
  no: 0.380,
  sum: 1.030,
  gap: 0.0300,
  direction: "OVER",
}

const mockResultUnder: GapResult = {
  question: "Will ETH flip BTC?",
  slug: "eth-flip-btc",
  yes: 0.450,
  no: 0.520,
  sum: 0.970,
  gap: 0.0300,
  direction: "UNDER",
}

describe("SignalCard", () => {
  it("renders question text and direction badge", () => {
    render(<SignalCard result={mockResult} />)
    expect(screen.getByText("Will BTC hit $100k?")).toBeInTheDocument()
    expect(screen.getByText("OVER")).toBeInTheDocument()
  })

  it("displays correct gap percentage", () => {
    render(<SignalCard result={mockResult} />)
    expect(screen.getByText(/\+3\.00%/)).toBeInTheDocument()
  })

  it("shows UNDER direction with minus sign", () => {
    render(<SignalCard result={mockResultUnder} />)
    expect(screen.getByText(/-3\.00%/)).toBeInTheDocument()
    expect(screen.getByText("UNDER")).toBeInTheDocument()
  })

  it("renders YES/NO/SUM values", () => {
    render(<SignalCard result={mockResult} />)
    expect(screen.getByText("0.650")).toBeInTheDocument()
    expect(screen.getByText("0.380")).toBeInTheDocument()
    expect(screen.getByText("1.030")).toBeInTheDocument()
  })

  it("has accessible role and label", () => {
    render(<SignalCard result={mockResult} />)
    const card = screen.getByRole("button", { name: /View Will BTC hit \$100k\?/ })
    expect(card).toBeInTheDocument()
    expect(card).toHaveAttribute("tabindex", "0")
  })

  it("renders sparkline in card variant", () => {
    render(<SignalCard result={mockResult} variant="card" />)
    // Card variant has more visual elements (sparkline + gap bar) than history
    const card = screen.getByRole("button", { name: /View Will BTC hit \$100k\?/ })
    // Card variant should have shadow class
    expect(card.className).toContain("shadow-elevation-1")
  })

  it("history variant has no shadow", () => {
    render(<SignalCard result={mockResult} variant="history" />)
    const card = screen.getByRole("button", { name: /View Will BTC hit \$100k\?/ })
    expect(card.className).not.toContain("shadow-elevation-1")
  })
})

describe("ResultTable", () => {
  it("renders table with results", () => {
    render(<ResultTable results={[mockResult, mockResultUnder]} />)
    expect(screen.getByText("Will BTC hit $100k?")).toBeInTheDocument()
    expect(screen.getByText("Will ETH flip BTC?")).toBeInTheDocument()
    expect(screen.getByText("2 signals")).toBeInTheDocument()
  })

  it("shows empty state when no results", () => {
    render(<ResultTable results={[]} />)
    expect(screen.getByText(/No gaps found/)).toBeInTheDocument()
  })

  it("sorts by column on click", () => {
    render(<ResultTable results={[mockResult, mockResultUnder]} />)
    const yesHeader = screen.getByRole("columnheader", { name: /Sort by YES/ })
    fireEvent.click(yesHeader)
    expect(yesHeader).toHaveAttribute("aria-sort", "descending")
  })

  it("toggles sort direction on same column click", () => {
    render(<ResultTable results={[mockResult]} />)
    const gapHeader = screen.getByRole("columnheader", { name: /Sort by GAP/ })
    // GAP is default sort key (descending), first click toggles to ascending
    fireEvent.click(gapHeader)
    expect(gapHeader).toHaveAttribute("aria-sort", "ascending")
  })
})

describe("StatsBar", () => {
  it("renders scanned count and signals", () => {
    render(<StatsBar totalScanned={150} found={5} lastScanAt={null} isScanning={false} />)
    expect(screen.getByText("150")).toBeInTheDocument()
    expect(screen.getByText("05")).toBeInTheDocument()
  })

  it("shows scanning indicator", () => {
    render(<StatsBar totalScanned={0} found={0} lastScanAt={null} isScanning={true} />)
    expect(screen.getByText("SCANNING")).toBeInTheDocument()
  })

  it("shows last scan time", () => {
    const date = new Date("2026-01-15T10:30:45Z")
    render(<StatsBar totalScanned={100} found={3} lastScanAt={date} isScanning={false} />)
    expect(screen.getByText(/10:30:45 UTC/)).toBeInTheDocument()
  })
})

describe("FilterBar", () => {
  it("renders direction buttons", () => {
    const onChange = vi.fn()
    render(<FilterBar minGap={0.03} direction="ALL" onMinGapChange={vi.fn()} onDirectionChange={onChange} />)
    expect(screen.getByText("ALL")).toBeInTheDocument()
    expect(screen.getByText("OVER")).toBeInTheDocument()
    expect(screen.getByText("UNDER")).toBeInTheDocument()
  })

  it("calls onDirectionChange on click", () => {
    const onChange = vi.fn()
    render(<FilterBar minGap={0.03} direction="ALL" onMinGapChange={vi.fn()} onDirectionChange={onChange} />)
    fireEvent.click(screen.getByText("OVER"))
    expect(onChange).toHaveBeenCalledWith("OVER")
  })

  it("shows min gap value via aria-label", () => {
    render(<FilterBar minGap={0.05} direction="ALL" onMinGapChange={vi.fn()} onDirectionChange={vi.fn()} />)
    expect(screen.getByLabelText(/Minimum gap: 5 cents/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Minimum gap: 5 cents/)).toHaveAttribute("value", "5")
  })
})
