# Polyscan Design System
_Extracted from tailwind.config.js_

## Color Tokens

> **Naming convention:** Token ใช้ slash (`bg/card`) ใน Figma Variables — ใน Tailwind/code ใช้ hyphen (`bg-card`) แทน slash เสมอ

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
| `text/muted` | `#9999CC` | ![](https://via.placeholder.com/16/9999CC/9999CC) |
| `under/bg` | `#0d2218` | ![](https://via.placeholder.com/16/0d2218/0d2218) |
| `under/text` | `#00fd87` | ![](https://via.placeholder.com/16/00fd87/00fd87) |
| `over/bg` | `#2a1212` | ![](https://via.placeholder.com/16/2a1212/2a1212) |
| `over/text` | `#ff5f52` | ![](https://via.placeholder.com/16/ff5f52/ff5f52) |
| `border/default` | `#2e2c3e` | ![](https://via.placeholder.com/16/2e2c3e/2e2c3e) |
| `border/subtle` | `#3D3B50` | ![](https://via.placeholder.com/16/3D3B50/3D3B50) |
| `surface/high` | `#2E2C3E` | ![](https://via.placeholder.com/16/2E2C3E/2E2C3E) |

## Typography

| Name | Font | Size | Weight | Tailwind Class | Usage |
|------|------|------|--------|---------------|-------|
| H1 | JetBrains Mono | 28px | 600 | `text-3xl` | Page headings |
| H2 | JetBrains Mono | 20px | 600 | `text-2xl` | Section headings |
| H3 | JetBrains Mono | 16px | 500 | `text-xl` | Sub-headings |
| Meta | JetBrains Mono | 14px | 500 | `text-lg` | Stat values, meta |
| Body | Inter | 13px | 400 | `text-base` | Market question text |
| Label | JetBrains Mono | 11px | 500 | `text-sm` | Labels, nav items |
| Caption | JetBrains Mono | 9px | 400 | `text-xs` | Timestamps, badges |

> **Note:** Space Grotesk (`font-sg`) ถูกลบออกจาก tailwind.config แล้ว (PR #61) — ปัจจุบันใช้ Inter + JetBrains Mono เท่านั้น

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
- **Badge FAIR** — bg `#2e2c3e`, text `#9999CC`
- **Stat Card** — bg `#22202e`, border `#2e2c3e`, radius 6px
- **Signal Card** — bg `#22202e`, sparkline bars, gap 44px, net profit
- **Filter Toggle** — active bg `#e566ff`, inactive bg `#0e0d14`

## Figma File
- Access: contact team lead for link
- Tokens created via Variables API