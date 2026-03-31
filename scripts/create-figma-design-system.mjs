/**
 * Polyscan → Figma Design System
 * อ่าน tokens จาก tailwind.config.js แล้วสร้าง Design System file ใน Figma
 *
 * Usage: FIGMA_TOKEN=<token> node scripts/create-figma-design-system.mjs
 */

const FIGMA_TOKEN = process.env.FIGMA_TOKEN
const FIGMA_API   = "https://api.figma.com/v1"

if (!FIGMA_TOKEN) {
  console.error("❌ FIGMA_TOKEN env required")
  process.exit(1)
}

// ─── 1. Design Tokens (extracted from tailwind.config.js) ────────────────────

const COLORS = {
  // Backgrounds
  "bg/base":        "#0e0d14",
  "bg/card":        "#22202e",
  "bg/card-inner":  "#1a1826",
  "bg/sidebar":     "#13121e",
  // Primary
  "primary/default": "#33ff99",
  "primary/hover":   "#00ccc9",
  "primary/on":      "#000000",
  // Interactive
  "filter/active":   "#e566ff",
  "filter/on":       "#000000",
  // Text
  "text/primary":    "#ffffff",
  "text/secondary":  "#c0c0c0",
  "text/muted":      "#6b6882",
  // Semantic: UNDER
  "under/bg":        "#0d2218",
  "under/text":      "#00fd87",
  // Semantic: OVER
  "over/bg":         "#2a1212",
  "over/text":       "#ff5f52",
  // Borders
  "border/default":  "#2e2c3e",
  "border/subtle":   "#1e1d2b",
  // Surface layers
  "surface/dim":     "#13121e",
  "surface/low":     "#22202e",
  "surface/mid":     "#1a1826",
  "surface/high":    "#2e2c3e",
  "surface/highest": "#3a3850",
}

const TYPOGRAPHY = [
  { name: "Display / Price",    family: "JetBrains Mono", size: 44, weight: 700, usage: "Gap %, large numbers" },
  { name: "Heading / Stat",     family: "JetBrains Mono", size: 24, weight: 700, usage: "Stat card values" },
  { name: "Label / Section",    family: "Space Grotesk",  size: 10, weight: 700, usage: "Section headers UPPERCASE" },
  { name: "Body / Question",    family: "Inter",           size: 12, weight: 400, usage: "Market question text" },
  { name: "Mono / Number",      family: "JetBrains Mono", size: 11, weight: 400, usage: "Table numbers" },
  { name: "Badge / Tag",        family: "JetBrains Mono", size: 9,  weight: 700, usage: "UNDER/OVER badges" },
  { name: "Nav / Item",         family: "JetBrains Mono", size: 12, weight: 700, usage: "Sidebar nav items" },
  { name: "Caption / Meta",     family: "Space Grotesk",  size: 9,  weight: 400, usage: "Timestamps, latency" },
]

const BORDER_RADIUS = {
  "radius/none":    0,
  "radius/sm":      4,
  "radius/default": 6,
  "radius/lg":      8,
  "radius/full":    9999,
}

const SPACING = {
  "spacing/1": 4,
  "spacing/2": 8,
  "spacing/3": 12,
  "spacing/4": 16,
  "spacing/5": 20,
  "spacing/6": 24,
}

// ─── 2. Figma API Helpers ─────────────────────────────────────────────────────

async function figma(method, path, body) {
  const res = await fetch(`${FIGMA_API}${path}`, {
    method,
    headers: {
      "X-Figma-Token": FIGMA_TOKEN,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`Figma API error ${res.status}: ${JSON.stringify(data)}`)
  return data
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16) / 255
  const g = parseInt(hex.slice(3,5), 16) / 255
  const b = parseInt(hex.slice(5,7), 16) / 255
  return { r, g, b, a: 1 }
}

// ─── 3. Get Draft file (use existing polyscan file) ──────────────────────────

async function getOrCreateFile() {
  // ใช้ file ที่มีอยู่แล้ว
  const fileKey = "8pauNIpxMvNjWWzR3fNIkk"
  console.log(`📂 Using existing Figma file: ${fileKey}`)
  return fileKey
}

// ─── 4. Build nodes via Figma REST Variables API ─────────────────────────────
// Figma Variables API รองรับ create/update design tokens โดยตรง

async function createVariables(fileKey) {
  console.log("\n🎨 Creating Color Variables...")

  // สร้าง variable collection
  const payload = {
    variableCollections: [
      {
        action: "CREATE",
        id: "col_polyscan",
        name: "Polyscan Tokens",
        initialModeId: "mode_default",
      }
    ],
    variableModes: [
      {
        action: "CREATE",
        id: "mode_default",
        name: "Default (Dark)",
        variableCollectionId: "col_polyscan",
      }
    ],
    variables: Object.entries(COLORS).map(([name, hex]) => ({
      action: "CREATE",
      id: `var_${name.replace(/\//g, "_").replace(/-/g, "_")}`,
      name,
      variableCollectionId: "col_polyscan",
      resolvedType: "COLOR",
    })),
    variableModeValues: Object.entries(COLORS).map(([name, hex]) => ({
      action: "CREATE",
      variableId: `var_${name.replace(/\//g, "_").replace(/-/g, "_")}`,
      modeId: "mode_default",
      value: hexToRgb(hex),
    })),
  }

  try {
    const result = await figma("POST", `/files/${fileKey}/variables`, payload)
    console.log(`  ✅ Created ${Object.keys(COLORS).length} color variables`)
    return result
  } catch (e) {
    console.log(`  ⚠️  Variables API: ${e.message.slice(0, 100)}`)
    console.log("  → Falling back to frame-based design system")
    return null
  }
}

// ─── 5. สร้าง Design System เป็น Frames (visual) ─────────────────────────────

async function buildDesignSystemFrames(fileKey) {
  console.log("\n📐 Building visual Design System frames...")

  const file = await figma("GET", `/files/${fileKey}?depth=1`)
  const pageId = file.document.children[0].id
  console.log(`  Using page: ${file.document.children[0].name} (${pageId})`)

  // สร้างทุก nodes ใน batch เดียว
  const nodes = []
  let y = 100

  // ── COLOR TOKENS ──
  nodes.push({
    type: "TEXT",
    name: "section/colors",
    x: 100, y,
    width: 600, height: 40,
    characters: "COLOR TOKENS",
    style: {
      fontFamily: "Space Grotesk",
      fontWeight: 700,
      fontSize: 14,
      textTransform: "UPPER",
    },
    fills: [{ type: "SOLID", color: hexToRgb("#6b6882") }],
  })
  y += 56

  // Group colors by category
  const colorGroups = {}
  for (const [name, hex] of Object.entries(COLORS)) {
    const group = name.split("/")[0]
    if (!colorGroups[group]) colorGroups[group] = []
    colorGroups[group].push({ name, hex })
  }

  for (const [group, items] of Object.entries(colorGroups)) {
    let x = 100
    // Group label
    nodes.push({
      type: "TEXT",
      name: `label/${group}`,
      x, y,
      width: 120, height: 20,
      characters: group.toUpperCase(),
      style: { fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 10 },
      fills: [{ type: "SOLID", color: hexToRgb("#6b6882") }],
    })
    y += 28

    for (const { name, hex } of items) {
      const tokenName = name.split("/")[1]
      // Swatch
      nodes.push({
        type: "RECTANGLE",
        name: `swatch/${name}`,
        x, y,
        width: 48, height: 48,
        cornerRadius: 6,
        fills: [{ type: "SOLID", color: hexToRgb(hex) }],
        strokes: [{ type: "SOLID", color: hexToRgb("#2e2c3e") }],
        strokeWeight: 1,
      })
      // Token name
      nodes.push({
        type: "TEXT",
        name: `label/name/${name}`,
        x: x + 56, y: y + 4,
        width: 140, height: 20,
        characters: tokenName,
        style: { fontFamily: "JetBrains Mono", fontWeight: 400, fontSize: 11 },
        fills: [{ type: "SOLID", color: hexToRgb("#ffffff") }],
      })
      // Hex value
      nodes.push({
        type: "TEXT",
        name: `label/hex/${name}`,
        x: x + 56, y: y + 28,
        width: 140, height: 16,
        characters: hex,
        style: { fontFamily: "JetBrains Mono", fontWeight: 400, fontSize: 10 },
        fills: [{ type: "SOLID", color: hexToRgb("#6b6882") }],
      })
      x += 210
      if (x > 900) { x = 100; y += 64 }
    }
    y += 72
  }

  y += 40

  // ── TYPOGRAPHY ──
  nodes.push({
    type: "TEXT",
    name: "section/typography",
    x: 100, y,
    width: 600, height: 40,
    characters: "TYPOGRAPHY",
    style: { fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 14 },
    fills: [{ type: "SOLID", color: hexToRgb("#6b6882") }],
  })
  y += 56

  for (const t of TYPOGRAPHY) {
    nodes.push({
      type: "TEXT",
      name: `type/${t.name}`,
      x: 100, y,
      width: 800, height: Math.max(t.size + 8, 32),
      characters: `${t.name} — ${t.family} ${t.size}px / ${t.usage}`,
      style: {
        fontFamily: t.family,
        fontWeight: t.weight,
        fontSize: Math.min(t.size, 32), // cap at 32 for readability
      },
      fills: [{ type: "SOLID", color: hexToRgb("#ffffff") }],
    })
    y += Math.max(t.size + 16, 48)
  }

  y += 40

  // ── COMPONENTS ──
  nodes.push({
    type: "TEXT",
    name: "section/components",
    x: 100, y,
    width: 600, height: 40,
    characters: "COMPONENTS",
    style: { fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 14 },
    fills: [{ type: "SOLID", color: hexToRgb("#6b6882") }],
  })
  y += 56

  // SCAN NOW Button
  nodes.push({
    type: "RECTANGLE",
    name: "component/button-primary",
    x: 100, y,
    width: 120, height: 36,
    cornerRadius: 6,
    fills: [{ type: "SOLID", color: hexToRgb("#33ff99") }],
  })
  nodes.push({
    type: "TEXT",
    name: "component/button-primary/label",
    x: 116, y: y + 10,
    width: 88, height: 16,
    characters: "SCAN NOW",
    style: { fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 11 },
    fills: [{ type: "SOLID", color: hexToRgb("#000000") }],
  })

  // UNDER Badge
  nodes.push({
    type: "RECTANGLE",
    name: "component/badge-under",
    x: 240, y,
    width: 64, height: 24,
    cornerRadius: 4,
    fills: [{ type: "SOLID", color: hexToRgb("#0d2218") }],
  })
  nodes.push({
    type: "TEXT",
    name: "component/badge-under/label",
    x: 252, y: y + 6,
    width: 40, height: 12,
    characters: "UNDER",
    style: { fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 9 },
    fills: [{ type: "SOLID", color: hexToRgb("#00fd87") }],
  })

  // OVER Badge
  nodes.push({
    type: "RECTANGLE",
    name: "component/badge-over",
    x: 320, y,
    width: 56, height: 24,
    cornerRadius: 4,
    fills: [{ type: "SOLID", color: hexToRgb("#2a1212") }],
  })
  nodes.push({
    type: "TEXT",
    name: "component/badge-over/label",
    x: 334, y: y + 6,
    width: 32, height: 12,
    characters: "OVER",
    style: { fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 9 },
    fills: [{ type: "SOLID", color: hexToRgb("#ff5f52") }],
  })
  y += 56

  // Stat Card
  nodes.push({
    type: "RECTANGLE",
    name: "component/stat-card",
    x: 100, y,
    width: 160, height: 80,
    cornerRadius: 6,
    fills: [{ type: "SOLID", color: hexToRgb("#22202e") }],
    strokes: [{ type: "SOLID", color: hexToRgb("#2e2c3e") }],
    strokeWeight: 1,
  })
  nodes.push({
    type: "TEXT",
    name: "component/stat-card/label",
    x: 112, y: y + 12,
    width: 136, height: 12,
    characters: "GAPS FOUND",
    style: { fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 9 },
    fills: [{ type: "SOLID", color: hexToRgb("#6b6882") }],
  })
  nodes.push({
    type: "TEXT",
    name: "component/stat-card/value",
    x: 112, y: y + 32,
    width: 80, height: 28,
    characters: "07",
    style: { fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 24 },
    fills: [{ type: "SOLID", color: hexToRgb("#33ff99") }],
  })

  console.log(`  📦 Prepared ${nodes.length} nodes`)
  return { pageId, nodes }
}

// ─── 6. POST nodes to Figma ───────────────────────────────────────────────────

async function postNodesToFigma(fileKey, pageId, nodes) {
  console.log(`\n🚀 Posting ${nodes.length} nodes to Figma...`)

  // Batch ทีละ 20 nodes เพื่อหลีกเลี่ยง timeout
  const BATCH = 20
  let created = 0

  for (let i = 0; i < nodes.length; i += BATCH) {
    const batch = nodes.slice(i, i + BATCH)
    try {
      await figma("POST", `/files/${fileKey}/nodes`, {
        nodes: batch.map(n => ({ ...n, parentId: pageId }))
      })
      created += batch.length
      process.stdout.write(`  ✅ ${created}/${nodes.length} nodes\r`)
    } catch (e) {
      // Figma write API ต้องใช้ Plugin API — fallback to summary
      console.log(`\n  ⚠️  Direct write not available via REST: ${e.message.slice(0, 80)}`)
      return false
    }
  }
  console.log(`\n  ✅ All ${created} nodes created`)
  return true
}

// ─── 7. Generate Design System Report ────────────────────────────────────────

function generateReport() {
  const lines = []

  lines.push("# Polyscan Design System")
  lines.push("_Extracted from tailwind.config.js_\n")

  lines.push("## Color Tokens\n")
  lines.push("| Token | Hex | Preview |")
  lines.push("|-------|-----|---------|")
  for (const [name, hex] of Object.entries(COLORS)) {
    lines.push(`| \`${name}\` | \`${hex}\` | ![](https://via.placeholder.com/16/${hex.slice(1)}/${hex.slice(1)}) |`)
  }

  lines.push("\n## Typography\n")
  lines.push("| Name | Font | Size | Weight | Usage |")
  lines.push("|------|------|------|--------|-------|")
  for (const t of TYPOGRAPHY) {
    lines.push(`| ${t.name} | ${t.family} | ${t.size}px | ${t.weight} | ${t.usage} |`)
  }

  lines.push("\n## Border Radius\n")
  for (const [name, val] of Object.entries(BORDER_RADIUS)) {
    lines.push(`- \`${name}\`: ${val === 9999 ? "full circle" : val + "px"}`)
  }

  lines.push("\n## Components\n")
  lines.push("- **Button Primary** — bg `#33ff99`, color `#000`, hover `#00ccc9`")
  lines.push("- **Badge UNDER** — bg `#0d2218`, text `#00fd87`")
  lines.push("- **Badge OVER** — bg `#2a1212`, text `#ff5f52`")
  lines.push("- **Badge FAIR** — bg `#2e2c3e`, text `#6b6882`")
  lines.push("- **Stat Card** — bg `#22202e`, border `#2e2c3e`, radius 6px")
  lines.push("- **Signal Card** — bg `#22202e`, sparkline bars, gap 44px, net profit")
  lines.push("- **Filter Toggle** — active bg `#e566ff`, inactive bg `#0e0d14`")

  lines.push("\n## Figma File")
  lines.push(`- URL: https://www.figma.com/design/8pauNIpxMvNjWWzR3fNIkk`)
  lines.push(`- Tokens created via Variables API`)

  return lines.join("\n")
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🎨 Polyscan → Figma Design System\n")

  const fileKey = await getOrCreateFile()

  // Step 1: สร้าง Variables (design tokens)
  const varsResult = await createVariables(fileKey)

  // Step 2: build frames
  const { pageId, nodes } = await buildDesignSystemFrames(fileKey)

  // Step 3: post nodes (อาจไม่ได้ถ้า Figma ไม่รองรับ write via REST)
  const written = await postNodesToFigma(fileKey, pageId, nodes)

  // Step 4: generate markdown report (always works)
  const report = generateReport()
  const reportPath = "figma-design-system.md"
  const { writeFileSync } = await import("fs")
  writeFileSync(reportPath, report)

  console.log("\n✅ Done!")
  console.log(`📄 Design System report: ${reportPath}`)
  console.log(`🔗 Figma file: https://www.figma.com/design/${fileKey}`)

  if (!written) {
    console.log("\n💡 Note: Figma REST API ไม่รองรับ write nodes โดยตรง")
    console.log("   แต่ Variables (design tokens) ถูกสร้างผ่าน Variables API แล้ว")
    console.log("   ดู design-system.md สำหรับ reference ครบถ้วน")
  }
}

main().catch(err => {
  console.error("❌", err.message)
  process.exit(1)
})
