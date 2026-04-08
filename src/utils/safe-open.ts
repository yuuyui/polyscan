/** Validate slug and open Polymarket event page safely */
export function openPolymarketEvent(slug: string): void {
  // Only allow alphanumeric, hyphens, and underscores
  if (!/^[\w-]+$/.test(slug)) return

  const url = new URL(`/event/${slug}`, "https://polymarket.com")

  // Double-check origin hasn't been tampered with
  if (url.origin !== "https://polymarket.com") return

  window.open(url.href, "_blank", "noopener,noreferrer")
}
