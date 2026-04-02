# History Page Design Specification

> Desktop Layout Integration — History as Sidebar Overlay

---

## 📋 Requirement Summary

1. ✅ **Same page as Desktop** — History overlays/slides into view (not separate page)
2. ✅ **No overlapping** — layered interaction zones (sidebar → main → modal)
3. ✅ **Visual clarity** — sorted, spaced, dev-friendly layout
4. ⏳ **Awaiting approval** — before implementation

---

## 🎯 Design Approach

### Layout Strategy
**Current Desktop (1440 × 900):**
```
┌─────────────────────────────────────────────────────┐
│  Sidebar (240px) │ Main Content (1200px)             │
│  - Brand         │  - Header Bar                      │
│  - Nav           │  - Gap Distribution Chart          │
│  - Stats         │  - Cards Grid / Table View         │
│  - Filters       │                                    │
└─────────────────────────────────────────────────────┘
```

**With History Overlay:**
```
┌─────────────────────────────────────────────────────┐
│  Sidebar (240px) │ History Panel (600px) | Main (600px) │
│  (Nav updated)  │  - Timeline List       | Filtered      │
│                 │  - Scan Results        | Cards/Table   │
│                 │  - Export/Delete       |               │
└─────────────────────────────────────────────────────┘
```

**Interaction Flow:**
1. User clicks "HISTORY" in sidebar nav → History panel slides in from left
2. Main content area shrinks to 50% width
3. History panel (50% width, scrollable) shows on top-left
4. User can click scan in history → update main cards
5. User clicks close or "TERMINAL" → History slides out, layout returns

---

## 🎨 Visual Hierarchy

### Sidebar Navigation State
**Current:**
```
[○] TERMINAL  ← active
[ ] HISTORY
[ ] SETTINGS
```

**With History Active:**
```
[ ] TERMINAL  
[●] HISTORY  ← active (filled circle)
[ ] SETTINGS
```

**Design token:** active = `#e566ff` (magenta), inactive = `#6b6580` (text-muted)

---

## 📐 History Panel Specs

### Size & Position
- **Width:** 600px (right-sizing to fit main content alongside)
- **Height:** 900px (full viewport)
- **Position:** Absolute, top-left of main area (z-index: 30, below modals)
- **Border:** Right border `#2e2c3e` 1px
- **Background:** `#13121e` (sidebar color)
- **Scroll:** Y-axis only (overflow-y: auto)
- **Animation:** Slide in from left 300ms (easing: cubic-bezier(0.4, 0, 0.2, 1))

### Header (Inside Panel)
```
┌──────────────────────────────┐
│ SCAN HISTORY                 │ ← mono, 10px, text-muted
│ ─────────────────────────────│
│ [X] Clear All  [↓] Export    │ ← buttons, text-secondary, 9px
│                              │
```

**Spacing:**
- Top padding: 24px
- Horizontal padding: 16px
- Bottom margin: 16px
- Buttons: gap 8px, right-aligned

---

## 📊 History Item Design

### Per-Scan Card
**Visual Order (top → bottom):**

1. **Timestamp** (header)
   - Format: "2:45 PM · Today" (or "2:45 PM · Yesterday", "2:45 PM · Apr 1")
   - Size: 11px, mono, text-muted
   - Margin-bottom: 8px

2. **Stats Row** (summary)
   - Grid 3-col: "12 signals" | "8 UNDER" | "4 OVER"
   - Size: 9px, mono, text-primary (bold)
   - Background: `#22202e` (bg-card)
   - Padding: 8px 12px
   - Radius: 6px
   - Gap: 8px between columns
   - Margin-bottom: 8px

3. **Action Buttons**
   - Two buttons: "VIEW RESULTS" | "DELETE"
   - Size: 9px, mono, uppercase
   - VIEW: background `#33ff99` (primary), text black
   - DELETE: background transparent, border `#ff5152` (over-text), text `#ff5152`
   - Height: 28px
   - Radius: 6px
   - Gap: 4px
   - Full-width layout: 60% / 40%

4. **Divider**
   - Border-top: 1px `#2e2c3e` (border-default)
   - Margin: 12px 0

**Card Spacing:**
- Each scan card: 16px vertical gap
- Last card: margin-bottom 24px

---

## 🔄 Interaction Zones (Z-index layering)

| Layer | z-index | Element | Behavior |
|-------|---------|---------|----------|
| Base | 0 | Main desktop layout | visible always |
| Sidebar | 10 | Left sidebar | visible always |
| Content shrink | - | Main area (600px → 600px width) | responsive to history |
| History panel | 30 | History overlay | slides in/out, scrollable |
| Modal | 40 | Detail modal (future) | above history |
| Toast | 50 | Notifications | above all |

**Key principle:** No overlapping — history panel pushes main content, not overlays it

---

## 🎯 States & Transitions

### State: Closed (Default)
- Sidebar shows: TERMINAL (active), HISTORY (inactive), SETTINGS (inactive)
- Main content: full width 1200px
- History panel: display none

### State: Open
- Sidebar shows: TERMINAL (inactive), HISTORY (active), SETTINGS (inactive)
- Main content: width 600px (responsive grid cols adjust)
- History panel: visible, slide-in animation 300ms

### State: Item Selected
- Clicked scan's timestamp highlighted: background `#2a2540` (border-subtle)
- Main cards update to match that scan's results
- User can switch between scans without closing history

---

## 💾 Data Model

### Scan History Item
```typescript
interface ScanHistory {
  id: string                  // unique scan ID
  timestamp: Date             // when scan ran
  totalScanned: number        // markets checked
  signalsFound: number        // passed minGap filter
  underCount: number          // UNDER opportunities
  overCount: number           // OVER opportunities
  minGap: number              // threshold used
  direction: FilterDirection  // ALL/UNDER/OVER
  results: GapResult[]        // actual results snapshot
}
```

### Storage
- `useState<ScanHistory[]>()`
- Persist to localStorage (max 10 scans, purge oldest)
- Export: download JSON on "Export" click

---

## 🔧 Implementation Checklist (Pre-Approval)

### Phase 1: Design Mockup (This)
- [x] Layout integration (desktop sidebar + history panel)
- [x] Sizing & spacing specs
- [x] Interaction zones (z-index, no overlaps)
- [x] Visual hierarchy (states, colors, typography)
- [x] Data model (TypeScript)
- [ ] ⏳ **Approval from owner**

### Phase 2: Code Structure (After Approval)
- [ ] Create `HistoryPanel.tsx` component
- [ ] Create `ScanHistoryItem.tsx` sub-component
- [ ] Add `useHistory()` hook (state + localStorage)
- [ ] Update `App.tsx` (routing history state)
- [ ] Update `tailwind.config.js` (custom widths: 600px)
- [ ] Add animations CSS (slide-in 300ms)

### Phase 3: Integration
- [ ] Connect SCAN button → save to history
- [ ] "VIEW RESULTS" button → load saved scan
- [ ] "DELETE" button → remove from history
- [ ] Export JSON button
- [ ] Clear All confirmation modal

### Phase 4: Polish
- [ ] Hover states
- [ ] Empty state message
- [ ] Scroll behavior
- [ ] Mobile responsiveness (history as drawer if <1024px)

---

## 🎨 Color Reference

| Element | Token | Hex |
|---------|-------|-----|
| Background | bg-sidebar | `#13121e` |
| Card bg | bg-card | `#22202e` |
| Border | border-default | `#2e2c3e` |
| Border subtle | border-subtle | `#2a2540` |
| Primary | primary | `#33ff99` |
| OVER text | over-text | `#ff5152` |
| Text primary | text-primary | `#ffffff` |
| Text muted | text-muted | `#6b6580` |
| Active nav | filter-active | `#e566ff` |

---

## 📱 Mobile Consideration (Future)

For screens <1024px:
- History becomes **side drawer** (right-aligned, full height)
- Main content: full width, overlay z-check
- Or: modal bottom-sheet approach
- *(To be designed after desktop approval)*

---

## ✅ Ready for Approval?

**Summary:**
- Layout: sidebar nav + history panel overlay (no overlap with main)
- Spacing: 600px panels, 16px gaps, clear hierarchy
- Interaction: slide-in/out, item selection updates main cards
- Data model: `ScanHistory[]` with timestamp, stats, results snapshot
- States: closed (default) → open → item selected

**Next step:** Await owner approval to implement

---

**Owner sign-off needed:**
- [ ] Layout approach OK?
- [ ] Spacing/sizing suitable?
- [ ] Interaction flow makes sense?
- [ ] Proceed to Phase 2 (coding)?
