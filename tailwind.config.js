export default {
  content: ["./index.html","./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Backgrounds */
        "bg-base":        "rgb(var(--color-bg-base) / <alpha-value>)",
        "bg-card":        "rgb(var(--color-bg-card) / <alpha-value>)",
        "bg-card-inner":  "rgb(var(--color-bg-card-inner) / <alpha-value>)",
        "bg-sidebar":     "rgb(var(--color-bg-sidebar) / <alpha-value>)",

        /* Primary */
        "primary":        "rgb(var(--color-primary) / <alpha-value>)",
        "primary-hover":  "rgb(var(--color-primary-hover) / <alpha-value>)",
        "on-primary":     "rgb(var(--color-on-primary) / <alpha-value>)",

        /* Filter active */
        "filter-active":  "rgb(var(--color-filter-active) / <alpha-value>)",
        "on-filter":      "rgb(var(--color-on-filter) / <alpha-value>)",

        /* Text */
        "text-primary":   "rgb(var(--color-text-primary) / <alpha-value>)",
        "text-secondary": "rgb(var(--color-text-secondary) / <alpha-value>)",
        "text-muted":     "rgb(var(--color-text-muted) / <alpha-value>)",

        /* Badges */
        "under-bg":       "rgb(var(--color-under-bg) / <alpha-value>)",
        "under-text":     "rgb(var(--color-under-text) / <alpha-value>)",
        "over-bg":        "rgb(var(--color-over-bg) / <alpha-value>)",
        "over-text":      "rgb(var(--color-over-text) / <alpha-value>)",

        /* Borders */
        "border-default": "rgb(var(--color-border-default) / <alpha-value>)",
        "border-subtle":  "rgb(var(--color-border-subtle) / <alpha-value>)",

        /* Legacy compat */
        "surface":           "rgb(var(--color-bg-base) / <alpha-value>)",
        "surface-dim":       "rgb(var(--color-bg-sidebar) / <alpha-value>)",
        "surface-low":       "rgb(var(--color-bg-card) / <alpha-value>)",
        "surface-container": "rgb(var(--color-bg-card-inner) / <alpha-value>)",
        "surface-high":      "rgb(var(--color-border-default) / <alpha-value>)",
        "surface-highest":   "rgb(var(--color-border-subtle) / <alpha-value>)",
        "on-surface":        "rgb(var(--color-text-primary) / <alpha-value>)",
        "on-surface-variant":"rgb(var(--color-text-secondary) / <alpha-value>)",
        "outline":           "rgb(var(--color-text-muted) / <alpha-value>)",
        "outline-variant":   "rgb(var(--color-border-default) / <alpha-value>)",
        "primary-fixed":     "rgb(var(--color-primary) / <alpha-value>)",
        "primary-dim":       "rgb(var(--color-primary-hover) / <alpha-value>)",
        "secondary":         "rgb(var(--color-over-text) / <alpha-value>)",
        "secondary-container":"rgb(var(--color-over-bg) / <alpha-value>)",
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sg:   ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
        md: "6px",
        lg: "8px",
        full: "9999px",
        none: "0px",
      },
      spacing: {
        /* 4px baseline grid */
        "0.5": "2px",
        "1": "4px",
        "1.5": "6px",
        "2": "8px",
        "2.5": "10px",
        "3": "12px",
        "3.5": "14px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "8": "32px",
        "10": "40px",
        "12": "48px",
      },
      gap: {
        "xs": "4px",
        "sm": "8px",
        "md": "12px",
        "lg": "16px",
        "xl": "24px",
      },
      boxShadow: {
        /* Elevation shadows */
        "elevation-1": "0 1px 3px rgba(0, 0, 0, 0.4)",
        "elevation-2": "0 4px 12px rgba(0, 0, 0, 0.5)",
        "elevation-3": "0 8px 24px rgba(0, 0, 0, 0.6)",
        /* Additional shadows */
        "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        "lg": "0 10px 15px -3px rgb(0 0 0 / 0.2)",
      },
      fontSize: {
        /* Pro typography scale */
        "xs": ["9px", { lineHeight: "1.2", fontWeight: "400" }],  /* Caption */
        "sm": ["11px", { lineHeight: "1.3", fontWeight: "500" }],  /* Label */
        "base": ["13px", { lineHeight: "1.4", fontWeight: "400" }], /* Body */
        "lg": ["14px", { lineHeight: "1.5", fontWeight: "500" }],  /* Meta */
        "xl": ["16px", { lineHeight: "1.5", fontWeight: "500" }],  /* H3 */
        "2xl": ["20px", { lineHeight: "1.6", fontWeight: "600" }], /* H2 */
        "3xl": ["28px", { lineHeight: "1.2", fontWeight: "600" }], /* H1 */
      },
    },
  },
  plugins: [],
}
