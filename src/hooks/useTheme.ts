import { useState, useEffect } from "react"
import { STORAGE_KEYS } from "../constants"

export type ThemeId = "default" | "binance"

export const THEMES: { id: ThemeId; label: string; className: string; accent: string }[] = [
  { id: "default", label: "Default", className: "",             accent: "#33ff99" },
  { id: "binance", label: "Binance", className: "theme-binance", accent: "#f0b90b" },
]

const STORAGE_KEY = STORAGE_KEYS.theme

export function useTheme() {
  const [theme, setTheme] = useState<ThemeId>(() => {
    return (localStorage.getItem(STORAGE_KEY) as ThemeId) ?? "default"
  })

  useEffect(() => {
    const root = document.documentElement
    THEMES.forEach(t => { if (t.className) root.classList.remove(t.className) })
    const current = THEMES.find(t => t.id === theme)
    if (current?.className) root.classList.add(current.className)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const idx = THEMES.findIndex(t => t.id === theme)
  const currentTheme = THEMES[idx >= 0 ? idx : 0]

  const toggleTheme = () => {
    const currentIdx = THEMES.findIndex(t => t.id === theme)
    setTheme(THEMES[(currentIdx + 1) % THEMES.length].id)
  }

  return { theme, setTheme, toggleTheme, currentTheme, themes: THEMES }
}
