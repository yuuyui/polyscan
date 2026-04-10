import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { downloadBlob } from "../utils/download"

describe("downloadBlob", () => {
  const mockUrl = "blob:http://localhost/mock-uuid"

  beforeEach(() => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue(mockUrl)
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {})
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})
    vi.spyOn(document.body, "appendChild").mockImplementation(node => node)
    vi.spyOn(document.body, "removeChild").mockImplementation(node => node)
  })

  afterEach(() => vi.restoreAllMocks())

  it("creates an object URL from the blob", () => {
    const blob = new Blob(["data"], { type: "text/plain" })
    downloadBlob(blob, "file.txt")
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob)
  })

  it("sets correct href and download attributes on the anchor", () => {
    let anchor: HTMLAnchorElement | null = null
    vi.spyOn(document.body, "appendChild").mockImplementation(node => {
      anchor = node as HTMLAnchorElement
      return node
    })
    downloadBlob(new Blob(["x"]), "export.json")
    expect(anchor!.href).toBe(mockUrl)
    expect(anchor!.download).toBe("export.json")
  })

  it("appends anchor to document.body before click", () => {
    const order: string[] = []
    vi.spyOn(document.body, "appendChild").mockImplementation(node => { order.push("append"); return node })
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => { order.push("click") })
    downloadBlob(new Blob([""]), "test.txt")
    expect(order.indexOf("append")).toBeLessThan(order.indexOf("click"))
  })

  it("removes anchor from document.body after click", () => {
    const order: string[] = []
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => { order.push("click") })
    vi.spyOn(document.body, "removeChild").mockImplementation(node => { order.push("remove"); return node })
    downloadBlob(new Blob([""]), "test.txt")
    expect(order.indexOf("click")).toBeLessThan(order.indexOf("remove"))
  })

  it("revokes the object URL after download", () => {
    downloadBlob(new Blob(["cleanup"]), "file.csv")
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl)
  })
})
