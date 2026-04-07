# Polyscan — Figma Workflow

---

## 0. Master Flow

```
มี task เกี่ยวกับ Figma
        │
        ├─ "figma ไม่ถูก" / พบปัญหา ──────────→ § Audit → § Investigate → § Fix
        │
        ├─ แก้ code แล้วอยาก sync ไป Figma ──→ § Sync: Code → Figma
        │
        ├─ แก้ design แล้วอยาก sync มา Code ──→ § Sync: Figma → Code
        │
        └─ เพิ่ม feature ใหม่ ──────────────→ § New Feature Flow
```

**ทุก scenario — ก่อนแก้ Figma ต้อง archive ก่อนเสมอ (§ Archive Rule)**

---

## 1. File Structure

**File:** `dIFXfUTocyKaS6khWnu7Ir` — Polyscan Design System

| Page | ใช้ทำอะไร |
|---|---|
| 🎨 Design Tokens | Color variables, spacing, typography reference |
| 🖥️ Desktop (1440px) | Desktop frames — Scanner & History views |
| 📱 Mobile (375px) | Mobile frames — Scanner & History views |
| 🧩 Components | Master components & component sets |
| `_archive` | before-state ก่อน edit ทุกครั้ง |

---

## 2. Archive Rule (ห้ามข้าม)

ก่อนแก้ไข node ใดๆ — duplicate ไปเก็บใน `_archive` page ก่อนเสมอ

**ชื่อ:** `[BEFORE] <ชื่อ node> · YYYY-MM-DD`

```js
// script template
const clone = targetNode.clone()
await figma.setCurrentPageAsync(archivePage)
archivePage.appendChild(clone)
clone.name = "[BEFORE] Design Tokens · 2026-04-07"
const others = archivePage.children.filter(n => n.id !== clone.id)
const maxY = others.reduce((m, n) => Math.max(m, n.y + n.height), 0)
clone.x = 0
clone.y = others.length > 0 ? maxY + 80 : 0
```

**Positioning rules:**
- ห้ามวางที่ (0,0) ถ้ามี node อื่นอยู่แล้ว
- scan children หา maxY ก่อนเสมอ → เว้น 80px

---

## 3. Audit — ตรวจ Figma ทั้งหมด

ใช้เมื่อ: "figma ไม่ถูก" หรือก่อน sync ครั้งใหญ่

### 3.1 ลำดับการตรวจ

```
1. ทุก Desktop frame (270:260, 270:413)
2. ทุก Mobile frame (55:2, 491:2)
3. Components page — master components
4. Design Tokens page — variable bindings + display
```

### 3.2 สิ่งที่ต้องตรวจในแต่ละ frame

| หัวข้อ | วิธีตรวจ |
|---|---|
| Sidebar เป็น instance ไหม | `node.type === 'INSTANCE'` + `mainComponent.id === '458:4'` |
| Nav active state ถูกไหม | instance properties `State` = `"Active"` / `"Default"` |
| ThemeToggle + MockButton ครบไหม | หา children ที่ชื่อ ThemeToggle, MockButton |
| Button sizing HUG/FILL | `layoutSizingHorizontal` ≠ `'FIXED'` |
| Header structure ตรงกันข้าม frames | screenshot แล้วเทียบ |
| Variable bindings บน swatches | `fill.boundVariables?.color` ≠ null |
| Explicit mode บน theme frames | `frame.explicitVariableModes` ≠ `{}` |

### 3.3 วิธี screenshot ทีเดียวทุก frame

```js
// ใช้ get_screenshot กับแต่ละ frame ID ทีละตัว
// 270:260, 270:413, 55:2, 491:2
```

### 3.4 รายงาน audit

```
Frame: Desktop Scanner (270:260)
- Sidebar instance ✅
- Nav active state ✅
- ThemeToggle ✅ / MockButton ✅
- Button HUG ✅

Frame: Desktop History (270:413)
- Sidebar instance ✅ / ❌ (detached)
- ...
```

---

## 4. Investigate — วินิจฉัยปัญหา

ก่อน fix ทุกครั้ง ต้องรู้ก่อนว่าปัญหาคืออะไร

### 4.1 "สีผิด / ไม่ตรงกับ theme"

```
สีผิดใน frame
    │
    ├─ fill ไม่ได้ bound variable?
    │   → ดู fill.boundVariables?.color
    │   → ถ้า null = hardcoded hex → ต้อง bind variable
    │
    └─ fill bound variable แล้วแต่ยังผิด?
        → ดู frame.explicitVariableModes
        → ถ้า {} (empty) = ไม่มี explicit mode → set mode
```

### 4.2 "Sidebar / Component ไม่ตรงกัน"

```
Component ดูต่างกันใน 2 frames
    │
    ├─ node.type === 'INSTANCE'?
    │   ไม่ใช่ → frame ธรรมดา ไม่ sync กับ master → replace ด้วย instance
    │
    └─ ใช่ แต่ยังต่างกัน?
        → เช็ค mainComponent.id ว่าตรงกันไหม
        → เช็ค instance properties (State, variant)
```

### 4.3 "Button ใหญ่เกินไป / ขนาดแข็ง"

```
Button sizing ผิด
    │
    ├─ layoutMode === 'NONE'?
    │   → ยังไม่มี auto-layout → ต้องเพิ่มก่อน
    │
    └─ มี auto-layout แล้ว?
        → เช็ค primaryAxisSizingMode / layoutSizingHorizontal
        → FIXED = ปัญหา → เปลี่ยนเป็น AUTO (HUG)
```

---

## 5. Pre-Edit Checklist

ก่อนแก้ node ใดๆ:

1. **Archive ก่อน** — ดู §2
2. **Instance หรือ frame?** — ถ้าเป็น instance แก้ที่ master component แทน
3. **มี frame อื่นใช้ component เดียวกันไหม?** — ถ้ามี ต้องแก้ให้ consistent ทุก frame
4. **ถ้าจะ detach** — จะทำให้ไม่ sync กันไหม? ถ้าใช่ → แก้ที่ master แทน

---

## 6. Post-Edit Checklist

ก่อน report "เสร็จ":

- [ ] Screenshot ทุก frame ที่เกี่ยวข้อง — ไม่ใช่แค่ frame ที่แก้
- [ ] Structural consistency ข้าม frames
- [ ] Component hierarchy ตรงกับ code structure
- [ ] ถ้าแก้ master component → verify ทุก instance

**ห้าม report done โดยไม่ผ่าน checklist นี้**

---

## 7. Sync: Code → Figma

เมื่อ code เปลี่ยน และต้องการ update Figma ให้ตรงกัน

```
1. Archive frame ที่จะแก้
2. ระบุว่า code เปลี่ยนอะไร:
   ├─ เพิ่ม/แก้ component → แก้ master component ใน Components page
   ├─ แก้ layout/spacing → แก้ instance ใน frame นั้น
   └─ แก้สี/token → แก้ variable value ใน collection (ไม่ใช่ hardcode)
3. ถ้าแก้ master component → สร้าง instance ใหม่ใน Desktop + Mobile frames
4. Post-edit checklist
```

**Token rules:**
- ห้าม hardcode hex ใน Figma fills — ต้อง bound variable เสมอ
- แก้สีใน CSS → ต้องแก้ variable value ใน Figma ด้วย (ดู §9)

---

## 8. Sync: Figma → Code

เมื่อ design เปลี่ยน และต้องการ update code ให้ตรงกัน

```
1. get_screenshot หรือ get_design_context บน frame ที่แก้
2. เทียบ token ที่ใช้ — ห้าม hardcode hex ใน code
3. ใช้ CSS variable + Tailwind class เท่านั้น
   ✅ bg-primary, text-text-muted, border-border-default
   ❌ style={{ color: '#33ff99' }}
4. ตรวจทั้ง Desktop frame และ Mobile frame — อาจต่างกัน
```

---

## 9. New Feature Flow

```
1. สร้าง master component ใน 🧩 Components page ก่อน
   └─ ดู section layout rules (§ Section Layout)
2. สร้าง code component ให้ชื่อ/structure ตรงกัน
3. วาง instance ใน Desktop frames (270:260, 270:413)
4. วาง instance ใน Mobile frames (55:2, 491:2)
5. Post-edit checklist — cross-frame verify
6. อัพเดท component IDs table (§ Key IDs)
```

---

## 10. Design Tokens Maintenance

เมื่อแก้สีใน `index.css` — ต้องทำใน Figma ด้วย:

```
แก้ CSS variable value
    │
    ├─ 1. แก้ variable value ใน Figma collection
    │      (Polyscan Tokens > variable นั้น > Default / Binance mode)
    │
    ├─ 2. ตรวจ swatch text labels ใน Design Tokens page
    │      (503:xx = Default labels, 503:8x = Binance labels)
    │      → อัพเดท hex string ให้ตรงกับ CSS
    │
    └─ 3. verify ด้วย get_screenshot บน node 503:2 (Themes section)
```

**Binance column frame (503:72) ต้องมี explicit mode `498:0` เสมอ**
ตรวจด้วย: `frame.explicitVariableModes` → ต้องไม่ empty `{}`

---

## 11. Component-First Principle

Figma component ต้องตรงกับ code component 1:1

| Code | Figma | Node ID |
|---|---|---|
| `<Sidebar />` | `Sidebar` | `458:4` |
| `<NavItem />` | `NavItem` set | `445:14` |
| `<ThemeToggle />` | `ThemeToggle` set | `508:60` |
| `<MockButton />` | `MockButton` set | `505:51` |

**กฎ:**
- code มี component → Figma ต้องมี master
- frame ใช้ component → ต้องเป็น instance ไม่ใช่ copy

```js
// สร้าง instance
const comp = figma.getNodeById("458:4")
const instance = comp.createInstance()
parent.appendChild(instance)
instance.setProperties({ "State": "Active" })
```

---

## 12. Layout Rules

### Auto-layout sizing

| ต้องการ | ค่า | เงื่อนไข |
|---|---|---|
| HUG content | `primaryAxisSizingMode = 'AUTO'` | ต้องมี `layoutMode` ก่อน |
| FILL parent | `layoutSizingHorizontal = 'FILL'` | ต้อง append ก่อนแล้วค่อย set |
| Fixed | `layoutSizingHorizontal = 'FIXED'` + `resize(w,h)` | — |

**Critical:** FILL / HUG ต้อง set หลัง `parent.appendChild(child)` เสมอ
**Critical:** Absolute-positioned node (sticky header) ใช้ FILL ไม่ได้ → ใช้ FIXED

### Button (UX rule)

Buttons ต้องเป็น HUG ไม่ใช่ FIXED:

```js
frame.layoutMode = 'HORIZONTAL'
frame.paddingLeft = 16; frame.paddingRight = 16
frame.paddingTop = 6; frame.paddingBottom = 6
frame.primaryAxisSizingMode = 'AUTO'
frame.counterAxisSizingMode = 'AUTO'
```

---

## 13. Variable Modes — Multi-Theme Frames

Frame ที่แสดง theme หลายตัว (เช่น Themes section ใน Design Tokens page) ต้อง set explicit mode:

```js
const collections = await figma.variables.getLocalVariableCollectionsAsync()
const col = collections[0]
defaultFrame.setExplicitVariableModeForCollection(col, "46:0")
binanceFrame.setExplicitVariableModeForCollection(col, "498:0")
```

**ถ้าไม่ set:** ทุก node ใน frame resolve เป็น Default mode — แม้ frame จะชื่อ "Binance"

**ตรวจ:**
```js
frame.explicitVariableModes
// ✅ { "VariableCollectionId:46:2": "498:0" }
// ❌ {} → bug
```

**Polyscan IDs:**
- Collection: `VariableCollectionId:46:2`
- Default mode: `46:0` → frame `503:5`
- Binance mode: `498:0` → frame `503:72`

---

## 14. Binding Fill to Variable

```js
const variable = await figma.variables.getVariableByIdAsync("VariableID:46:7")
const fill = { type: "SOLID", color: { r: 0, g: 0, b: 0 } }
const boundFill = figma.variables.setBoundVariableForPaint(fill, "color", variable)
node.fills = [boundFill]  // setBoundVariableForPaint returns NEW paint
```

ใช้เมื่อ: indicator / dot ที่ต้องแสดงสี primary ของแต่ละ theme — bind variable แทน hardcode hex

---

## 15. Key IDs (Figma)

### Frames

| Frame | Node ID |
|---|---|
| Desktop Scanner | `270:260` |
| Desktop History | `270:413` |
| Mobile Scanner | `55:2` |
| Mobile History | `491:2` |
| Design Tokens frame | `48:2` |
| Themes section | `503:2` |
| Default column | `503:5` |
| Binance column | `503:72` |

### Components

| Component | Node ID |
|---|---|
| Sidebar | `458:4` |
| NavItem set | `445:14` |
| NavItem Active | `445:4` |
| NavItem Default | `445:9` |
| ThemeToggle set | `508:60` |
| ThemeToggle Default | `508:45` |
| MockButton set | `505:51` |
| MockButton Default | `505:45` |

### Variables

| Variable | ID |
|---|---|
| primary/default | `VariableID:46:7` |
| bg/base | `VariableID:46:3` |
| Collection | `VariableCollectionId:46:2` |

---

## 16. Section Layout (Components Page)

เมื่อเพิ่ม section ใหม่:

1. Map bounding boxes ทุก section ที่มีอยู่ก่อน
2. ตรวจ overlap ทั้ง X และ Y
3. Section order (left → right): Navigation | Buttons&Badges | Scanner/History | Charts&Tables | Sidebar Components | Tokens
4. คอลัมน์ใหม่: วางที่ xEnd ของ section ซ้ายสุดที่ extend ลงใน Y เดียวกัน + 80px
5. Verify: loop ทุก pair ตรวจไม่มี overlap

---

## 17. use_figma Quick Reference

```js
// Page switch — ใช้ async เสมอ
await figma.setCurrentPageAsync(page)         // ✅
figma.currentPage = page                       // ❌ throws

// Colors — 0-1 range เสมอ
{ r: 0.2, g: 1, b: 0.6 }                      // ✅
{ r: 51, g: 255, b: 153 }                      // ❌

// FILL/HUG — append ก่อน
parent.appendChild(child)
child.layoutSizingHorizontal = 'FILL'          // ✅

child.layoutSizingHorizontal = 'FILL'
parent.appendChild(child)                      // ❌ throws

// Return IDs เสมอ
return { createdNodeIds: [...], mutatedNodeIds: [...] }
```

---

## 18. Error Recovery

| Error | สาเหตุ | แก้ |
|---|---|---|
| `"Setting figma.currentPage is not supported"` | sync setter | `await figma.setCurrentPageAsync()` |
| `"node must be auto-layout"` | FILL/HUG ก่อน append | append ก่อน แล้วค่อย set |
| `"not implemented"` | `figma.notify()` | ลบออก ใช้ `return` แทน |
| `"node does not exist"` | wrong page / wrong ID | เช็ค page context + ID |
| FILL error on absolute node | sticky/absolute node | ใช้ FIXED แทน |
| สีผิดใน theme frame | ไม่มี explicit mode | `setExplicitVariableModeForCollection` |
| สี hardcode ไม่ switch theme | ไม่ได้ bind variable | `setBoundVariableForPaint` |
