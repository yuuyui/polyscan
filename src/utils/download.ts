/** Trigger a browser file download safely with proper cleanup */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  // Schedule cleanup on next microtask to ensure click is processed
  queueMicrotask(() => URL.revokeObjectURL(url))
}
