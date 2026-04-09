# Polyscan Design System
_Extracted from tailwind.config.js_

## Color Tokens

| Token | Hex | Preview |
|-------|-----|---------|
| `bg/base` | `#0e0d14` | ![](https://via.placeholder.com/16/0e0d14/0e0d14) |
| `bg/card` | `#22202e` | ![](https://via.placeholder.com/16/22202e/22202e) |
| `bg/card-inner` | `#1a1826` | ![](https://via.placeholder.com/16/1a1826/1a1826) |
| `bg/sidebar` | `#13121e` | ![](https://via.placeholder.com/16/13121e/13121e) |
| `primary/default` | `#33ff99` | ![](https://via.placeholder.com/16/33ff99/33ff99) |
| `primary/hover` | `#00ccc9` | ![](https://via.placeholder.com/16/00ccc9/00ccc9) |
| `primary/on` | `#000000` | ![](https://via.placeholder.com/16/000000/000000) |
| `filter/active` | `#e566ff` | ![](https://via.placeholder.com/16/e566ff/e566ff) |
| `filter/on` | `#000000` | ![](https://via.placeholder.com/16/000000/000000) |
| `text/primary` | `#ffffff` | ![](https://via.placeholder.com/16/ffffff/ffffff) |
| `text/secondary` | `#c0c0c0` | ![](https://via.placeholder.com/16/c0c0c0/c0c0c0) |
| `text/muted` | `#6b6882` | ![](https://via.placeholder.com/16/6b6882/6b6882) |
| `under/bg` | `#0d2218` | ![](https://via.placeholder.com/16/0d2218/0d2218) |
| `under/text` | `#00fd87` | ![](https://via.placeholder.com/16/00fd87/00fd87) |
| `over/bg` | `#2a1212` | ![](https://via.placeholder.com/16/2a1212/2a1212) |
| `over/text` | `#ff5f52` | ![](https://via.placeholder.com/16/ff5f52/ff5f52) |
| `border/default` | `#2e2c3e` | ![](https://via.placeholder.com/16/2e2c3e/2e2c3e) |
| `border/subtle` | `#1e1d2b` | ![](https://via.placeholder.com/16/1e1d2b/1e1d2b) |
| `surface/dim` | `#13121e` | ![](https://via.placeholder.com/16/13121e/13121e) |
| `surface/low` | `#22202e` | ![](https://via.placeholder.com/16/22202e/22202e) |
| `surface/mid` | `#1a1826` | ![](https://via.placeholder.com/16/1a1826/1a1826) |
| `surface/high` | `#2e2c3e` | ![](https://via.placeholder.com/16/2e2c3e/2e2c3e) |
| `surface/highest` | `#3a3850` | ![](https://via.placeholder.com/16/3a3850/3a3850) |

## Typography

| Name | Font | Size | Weight | Usage |
|------|------|------|--------|-------|
| Display / Price | JetBrains Mono | 44px | 700 | Gap %, large numbers |
| Heading / Stat | JetBrains Mono | 24px | 700 | Stat card values |
| Label / Section | Space Grotesk | 10px | 700 | Section headers UPPERCASE |
| Body / Question | Inter | 12px | 400 | Market question text |
| Mono / Number | JetBrains Mono | 11px | 400 | Table numbers |
| Badge / Tag | JetBrains Mono | 9px | 700 | UNDER/OVER badges |
| Nav / Item | JetBrains Mono | 12px | 700 | Sidebar nav items |
| Caption / Meta | Space Grotesk | 9px | 400 | Timestamps, latency |

## Border Radius

- `radius/none`: 0px
- `radius/sm`: 4px
- `radius/default`: 6px
- `radius/lg`: 8px
- `radius/full`: full circle

## Components

- **Button Primary** — bg `#33ff99`, color `#000`, hover `#00ccc9`
- **Badge UNDER** — bg `#0d2218`, text `#00fd87`
- **Badge OVER** — bg `#2a1212`, text `#ff5f52`
- **Badge FAIR** — bg `#2e2c3e`, text `#6b6882`
- **Stat Card** — bg `#22202e`, border `#2e2c3e`, radius 6px
- **Signal Card** — bg `#22202e`, sparkline bars, gap 44px, net profit
- **Filter Toggle** — active bg `#e566ff`, inactive bg `#0e0d14`

## Figma File
- URL: https://www.figma.com/design/8pauNIpxMvNjWWzR3fNIkk
- Tokens created via Variables API