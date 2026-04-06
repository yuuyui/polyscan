// Polyscan Bridge — Figma Plugin Code (sandbox)
// รับ commands จาก ui.html แล้ว execute ผ่าน Figma Plugin API

figma.showUI(__html__, { width: 280, height: 300 })

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1,3), 16) / 255,
    g: parseInt(hex.slice(3,5), 16) / 255,
    b: parseInt(hex.slice(5,7), 16) / 255,
  }
}

async function loadFont(family, style) {
  try { await figma.loadFontAsync({ family, style }) } catch(e) {}
}

// ─── Command Handlers ─────────────────────────────────────────────────────────

const handlers = {

  // สร้าง page ใหม่
  async create_page({ name }) {
    const page = figma.createPage()
    page.name = name
    return { pageId: page.id, name: page.name }
  },

  // สร้าง frame
  async create_frame({ name, x = 0, y = 0, width = 400, height = 300, bg = '#0e0d14', pageId }) {
    const page = pageId
      ? figma.root.children.find(function(p){return p.id===pageId})||figma.currentPage
      : figma.currentPage

    figma.currentPage = page
    const frame = figma.createFrame()
    frame.name = name
    frame.x = x
    frame.y = y
    frame.resize(width, height)
    frame.fills = [{ type: 'SOLID', color: hexToRgb(bg) }]
    return { frameId: frame.id, name: frame.name }
  },

  // สร้าง text node
  async create_text({ content, x = 0, y = 0, fontSize = 12, fontFamily = 'Inter', fontWeight = 'Regular', color = '#ffffff', parentId }) {
    const style = fontWeight >= 700 ? 'Bold' : 'Regular'
    await loadFont(fontFamily, style)

    const text = figma.createText()
    text.characters = content
    text.fontSize = fontSize
    text.x = x
    text.y = y
    text.fills = [{ type: 'SOLID', color: hexToRgb(color) }]

    try {
      await figma.loadFontAsync({ family: fontFamily, style })
      text.fontName = { family: fontFamily, style }
    } catch(e) {
      await loadFont('Inter', 'Regular')
    }

    if (parentId) {
      const parent = figma.getNodeById(parentId)
      if (parent && 'appendChild' in parent) parent.appendChild(text)
    }

    return { nodeId: text.id }
  },

  // สร้าง rectangle (color swatch)
  async create_rect({ name, x = 0, y = 0, width = 48, height = 48, fill = '#ffffff', cornerRadius = 6, parentId }) {
    const rect = figma.createRectangle()
    rect.name = name
    rect.x = x
    rect.y = y
    rect.resize(width, height)
    rect.fills = [{ type: 'SOLID', color: hexToRgb(fill) }]
    rect.cornerRadius = cornerRadius

    if (parentId) {
      const parent = figma.getNodeById(parentId)
      if (parent && 'appendChild' in parent) parent.appendChild(rect)
    }

    return { nodeId: rect.id }
  },

  // สร้าง Design System ครบจาก polyscan tokens
  async build_design_system({}) {
    const COLORS = {
      'bg/base':         '#0e0d14',
      'bg/card':         '#22202e',
      'bg/card-inner':   '#1a1826',
      'bg/sidebar':      '#13121e',
      'primary/default': '#33ff99',
      'primary/hover':   '#00ccc9',
      'primary/on':      '#000000',
      'filter/active':   '#e566ff',
      'text/primary':    '#ffffff',
      'text/secondary':  '#c0c0c0',
      'text/muted':      '#6b6882',
      'under/bg':        '#0d2218',
      'under/text':      '#00fd87',
      'over/bg':         '#2a1212',
      'over/text':       '#ff5f52',
      'border/default':  '#2e2c3e',
      'border/subtle':   '#1e1d2b',
    }

    const TYPOGRAPHY = [
      { name: 'Display/Price',  family: 'Inter', size: 44, weight: 700, color: '#00fd87' },
      { name: 'Heading/Stat',   family: 'Inter', size: 24, weight: 700, color: '#ffffff' },
      { name: 'Label/Section',  family: 'Inter', size: 10, weight: 700, color: '#6b6882' },
      { name: 'Body/Question',  family: 'Inter', size: 12, weight: 400, color: '#ffffff' },
      { name: 'Mono/Number',    family: 'Inter', size: 11, weight: 400, color: '#c0c0c0' },
      { name: 'Badge/Tag',      family: 'Inter', size: 9,  weight: 700, color: '#00fd87' },
    ]

    await loadFont('Inter', 'Regular')
    await loadFont('Inter', 'Bold')

    // Page 1: Color Tokens
    let colorPage = figma.createPage()
    colorPage.name = '🎨 Color Tokens'
    figma.currentPage = colorPage

    const colorFrame = figma.createFrame()
    colorFrame.name = 'Color Tokens'
    colorFrame.resize(1200, 900)
    colorFrame.fills = [{ type: 'SOLID', color: hexToRgb('#0e0d14') }]

    // Title
    const title = figma.createText()
    title.characters = 'POLYSCAN — COLOR TOKENS'
    title.fontSize = 16
    title.fontName = { family: 'Inter', style: 'Bold' }
    title.fills = [{ type: 'SOLID', color: hexToRgb('#6b6882') }]
    title.x = 40
    title.y = 40
    colorFrame.appendChild(title)

    // Color swatches
    const groups = {}
    for (const [name, hex] of Object.entries(COLORS)) {
      const g = name.split('/')[0]
      if (!groups[g]) groups[g] = []
      groups[g].push({ name, hex })
    }

    let y = 100
    for (const [group, items] of Object.entries(groups)) {
      // group label
      const gLabel = figma.createText()
      gLabel.characters = group.toUpperCase()
      gLabel.fontSize = 10
      gLabel.fontName = { family: 'Inter', style: 'Bold' }
      gLabel.fills = [{ type: 'SOLID', color: hexToRgb('#6b6882') }]
      gLabel.x = 40
      gLabel.y = y
      colorFrame.appendChild(gLabel)
      y += 24

      let x = 40
      for (const { name, hex } of items) {
        const tokenName = name.split('/')[1]
        // Swatch
        const swatch = figma.createRectangle()
        swatch.name = name
        swatch.x = x
        swatch.y = y
        swatch.resize(48, 48)
        swatch.fills = [{ type: 'SOLID', color: hexToRgb(hex) }]
        swatch.cornerRadius = 6
        colorFrame.appendChild(swatch)
        // Name
        const nLabel = figma.createText()
        nLabel.characters = tokenName
        nLabel.fontSize = 9
        nLabel.fontName = { family: 'Inter', style: 'Regular' }
        nLabel.fills = [{ type: 'SOLID', color: hexToRgb('#ffffff') }]
        nLabel.x = x
        nLabel.y = y + 52
        colorFrame.appendChild(nLabel)
        // Hex
        const hLabel = figma.createText()
        hLabel.characters = hex
        hLabel.fontSize = 8
        hLabel.fontName = { family: 'Inter', style: 'Regular' }
        hLabel.fills = [{ type: 'SOLID', color: hexToRgb('#6b6882') }]
        hLabel.x = x
        hLabel.y = y + 64
        colorFrame.appendChild(hLabel)

        x += 120
        if (x > 1100) { x = 40; y += 100 }
      }
      y += 110
    }

    // Page 2: Typography
    const typoPage = figma.createPage()
    typoPage.name = '✍️ Typography'
    figma.currentPage = typoPage

    const typoFrame = figma.createFrame()
    typoFrame.name = 'Typography'
    typoFrame.resize(1200, 700)
    typoFrame.fills = [{ type: 'SOLID', color: hexToRgb('#0e0d14') }]

    const typoTitle = figma.createText()
    typoTitle.characters = 'POLYSCAN — TYPOGRAPHY'
    typoTitle.fontSize = 16
    typoTitle.fontName = { family: 'Inter', style: 'Bold' }
    typoTitle.fills = [{ type: 'SOLID', color: hexToRgb('#6b6882') }]
    typoTitle.x = 40
    typoTitle.y = 40
    typoFrame.appendChild(typoTitle)

    let ty = 100
    for (const t of TYPOGRAPHY) {
      const capSize = Math.min(t.size, 36)
      const style = t.weight >= 700 ? 'Bold' : 'Regular'
      const sample = figma.createText()
      sample.characters = `${t.name} — ${t.family} ${t.size}px`
      sample.fontSize = capSize
      sample.fontName = { family: 'Inter', style }
      sample.fills = [{ type: 'SOLID', color: hexToRgb(t.color) }]
      sample.x = 40
      sample.y = ty
      typoFrame.appendChild(sample)
      ty += capSize + 24
    }

    // Page 3: Components
    const compPage = figma.createPage()
    compPage.name = '🧩 Components'
    figma.currentPage = compPage

    const compFrame = figma.createFrame()
    compFrame.name = 'Components'
    compFrame.resize(1200, 600)
    compFrame.fills = [{ type: 'SOLID', color: hexToRgb('#0e0d14') }]

    const compTitle = figma.createText()
    compTitle.characters = 'POLYSCAN — COMPONENTS'
    compTitle.fontSize = 16
    compTitle.fontName = { family: 'Inter', style: 'Bold' }
    compTitle.fills = [{ type: 'SOLID', color: hexToRgb('#6b6882') }]
    compTitle.x = 40
    compTitle.y = 40
    compFrame.appendChild(compTitle)

    // SCAN NOW Button
    const btn = figma.createRectangle()
    btn.name = 'Button/Primary'
    btn.x = 40; btn.y = 100
    btn.resize(140, 40)
    btn.fills = [{ type: 'SOLID', color: hexToRgb('#33ff99') }]
    btn.cornerRadius = 6
    compFrame.appendChild(btn)
    const btnLabel = figma.createText()
    btnLabel.characters = 'SCAN NOW'
    btnLabel.fontSize = 11
    btnLabel.fontName = { family: 'Inter', style: 'Bold' }
    btnLabel.fills = [{ type: 'SOLID', color: hexToRgb('#000000') }]
    btnLabel.x = 58; btnLabel.y = 112
    compFrame.appendChild(btnLabel)

    // UNDER Badge
    const under = figma.createRectangle()
    under.name = 'Badge/UNDER'
    under.x = 200; under.y = 100
    under.resize(72, 28)
    under.fills = [{ type: 'SOLID', color: hexToRgb('#0d2218') }]
    under.cornerRadius = 4
    compFrame.appendChild(under)
    const underLabel = figma.createText()
    underLabel.characters = 'UNDER'
    underLabel.fontSize = 9
    underLabel.fontName = { family: 'Inter', style: 'Bold' }
    underLabel.fills = [{ type: 'SOLID', color: hexToRgb('#00fd87') }]
    underLabel.x = 216; underLabel.y = 110
    compFrame.appendChild(underLabel)

    // OVER Badge
    const over = figma.createRectangle()
    over.name = 'Badge/OVER'
    over.x = 290; over.y = 100
    over.resize(64, 28)
    over.fills = [{ type: 'SOLID', color: hexToRgb('#2a1212') }]
    over.cornerRadius = 4
    compFrame.appendChild(over)
    const overLabel = figma.createText()
    overLabel.characters = 'OVER'
    overLabel.fontSize = 9
    overLabel.fontName = { family: 'Inter', style: 'Bold' }
    overLabel.fills = [{ type: 'SOLID', color: hexToRgb('#ff5f52') }]
    overLabel.x = 306; overLabel.y = 110
    compFrame.appendChild(overLabel)

    // Stat Card
    const card = figma.createRectangle()
    card.name = 'Card/Stat'
    card.x = 40; card.y = 160
    card.resize(180, 90)
    card.fills = [{ type: 'SOLID', color: hexToRgb('#22202e') }]
    card.strokeWeight = 1
    card.strokes = [{ type: 'SOLID', color: hexToRgb('#2e2c3e') }]
    card.cornerRadius = 6
    compFrame.appendChild(card)
    const cardLabel = figma.createText()
    cardLabel.characters = 'GAPS FOUND'
    cardLabel.fontSize = 9
    cardLabel.fontName = { family: 'Inter', style: 'Bold' }
    cardLabel.fills = [{ type: 'SOLID', color: hexToRgb('#6b6882') }]
    cardLabel.x = 56; cardLabel.y = 176
    compFrame.appendChild(cardLabel)
    const cardVal = figma.createText()
    cardVal.characters = '07'
    cardVal.fontSize = 24
    cardVal.fontName = { family: 'Inter', style: 'Bold' }
    cardVal.fills = [{ type: 'SOLID', color: hexToRgb('#33ff99') }]
    cardVal.x = 56; cardVal.y = 196
    compFrame.appendChild(cardVal)

    // Switch back to first page
    figma.currentPage = colorPage

    return {
      summary: 'Design System created: 3 pages (Color Tokens, Typography, Components)',
      pages: ['🎨 Color Tokens', '✍️ Typography', '🧩 Components'],
      tokens: Object.keys(COLORS).length,
    }
  },

  // get current file info
  async get_file_info({}) {
    return {
      fileId: figma.fileKey || 'unknown',
      pageName: figma.currentPage.name,
      pageCount: figma.root.children.length,
      pages: figma.root.children.map(p => ({ id: p.id, name: p.name })),
    }
  },
}

// ─── Message Handler ──────────────────────────────────────────────────────────

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'execute') {
    const { command } = msg
    const handler = handlers[command.action]

    if (!handler) {
      figma.ui.postMessage({ type: 'result', id: command.id, ok: false, error: 'Unknown action: ' + command.action })
      return
    }

    try {
      const result = await handler(command.params || {})
      figma.ui.postMessage({ type: 'result', id: command.id, ok: true, result })
    } catch (e) {
      figma.ui.postMessage({ type: 'result', id: command.id, ok: false, error: e.message })
    }
  }
}
