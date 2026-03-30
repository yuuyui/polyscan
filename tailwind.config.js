export default {
  content: ["./index.html","./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Backgrounds */
        "bg-base":        "#0e0d14",
        "bg-card":        "#22202e",
        "bg-card-inner":  "#1a1826",
        "bg-sidebar":     "#13121e",

        /* Primary */
        "primary":        "#33ff99",
        "primary-hover":  "#00ccc9",
        "on-primary":     "#000000",

        /* Filter active */
        "filter-active":  "#e566ff",
        "on-filter":      "#000000",

        /* Text */
        "text-primary":   "#ffffff",
        "text-secondary": "#c0c0c0",
        "text-muted":     "#6b6882",

        /* Badges */
        "under-bg":       "#0d2218",
        "under-text":     "#00fd87",
        "over-bg":        "#2a1212",
        "over-text":      "#ff5f52",

        /* Borders */
        "border-default": "#2e2c3e",
        "border-subtle":  "#1e1d2b",

        /* Legacy compat */
        "surface":           "#0e0d14",
        "surface-dim":       "#13121e",
        "surface-low":       "#22202e",
        "surface-container": "#1a1826",
        "surface-high":      "#2e2c3e",
        "surface-highest":   "#3a3850",
        "on-surface":        "#ffffff",
        "on-surface-variant":"#c0c0c0",
        "outline":           "#6b6882",
        "outline-variant":   "#2e2c3e",
        "primary-fixed":     "#33ff99",
        "primary-dim":       "#00ccc9",
        "secondary":         "#ff5f52",
        "secondary-container":"#2a1212",
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sg:   ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
        lg: "8px",
        full: "9999px",
        none: "0px",
      },
    },
  },
  plugins: [],
}
