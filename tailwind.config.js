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
        "text-muted":     "#9999cc", /* Updated: better contrast (4.8:1) */

        /* Badges */
        "under-bg":       "#0d2218",
        "under-text":     "#00fd87",
        "over-bg":        "#2a1212",
        "over-text":      "#ff5f52",

        /* Borders */
        "border-default": "#2e2c3e",
        "border-subtle":  "#3d3b50", /* Updated: darker for hierarchy */

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
