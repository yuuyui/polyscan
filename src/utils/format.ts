/** Format a Date to "HH:MM:SS UTC" string */
export function formatTimeUTC(date: Date): string {
  return date.toUTCString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1") + " UTC"
}

/** Format a Date to "YYYY-MM-DD" string */
export function formatDateISO(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** Format a Date to "YYYY-MM-DD HH:MM:SS UTC" string */
export function formatDateTimeUTC(date: Date): string {
  return date.toISOString().replace("T", " ").slice(0, 19) + " UTC"
}

/** Format a Date to "HH:MM:SS UTC" in 24h format, using en-GB locale with UTC timezone for consistent output */
export function formatTime24h(date: Date): string {
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "UTC" }) + " UTC"
}

/** Truncate text to maxLen and append ellipsis */
export function truncateText(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen) + "\u2026" : text
}
