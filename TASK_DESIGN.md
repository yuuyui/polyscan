# task-design — Design Workflow Rules

กฎการทำงานออกแบบ (Figma) สำหรับ Polyscan project — ห้ามข้ามขั้นตอน

---

## 8 กฎหลัก (จาก owner)

1. **กำหนด scope ชัดเจน** — ระบุว่ากำลังออกแบบ page/feature อะไร
2. **Analysis ก่อนออกแบบ** — วิเคราะห์ละเอียดว่าควรมีอะไรบ้าง (UX flows, states, edge cases, data model)
3. **Reuse design system** — ต้องใช้ components/variables ที่มีอยู่แล้วให้ได้มากที่สุด
4. **Approve ก่อนทุกการเปลี่ยนแปลงใหญ่** — ห้ามทำเองโดยไม่ขอ (นิยาม "ใหญ่" = เปลี่ยน layout หลัก / เพิ่ม component ใหม่ / เปลี่ยน flow)
5. **UX/UI หลักการที่ถูกต้อง** — เข้าใจพฤติกรรมผู้ใช้และผู้พัฒนา
6. **Sync code ↔ Figma เสมอ** — ถ้าฝั่งใดฝั่งหนึ่งเปลี่ยน อีกฝั่งต้องตามทันที
7. **Recheck ก่อนเริ่มทุกครั้ง** — ทำ full audit ก่อนเริ่มงานเสมอ ห้ามเชื่อรายงานเก่า
8. **ก่อน implement ต้องถาม** — แล้วทำตาม dev workflow (Issue → branch → PR)

---

## Project Type Flows

### 🆕 New Project
1. สร้าง Figma file + ตั้ง design system (variables/tokens) ก่อนเสมอ
2. กำหนด variables ก่อน design component แรก — ห้าม hardcode
3. Design → Review → Approve → แล้วค่อย dev
4. ห้าม dev ล้ำหน้า approved design

### 🔄 Redesign (มี code อยู่แล้ว)
1. Audit UI ที่มีอยู่ก่อน — screenshot + catalog components ทั้งหมด
2. สร้าง frame `[AS-IS] YYYY-MM-DD` ใน Figma จาก current state
3. ออกแบบ `[TO-BE]` แยก frame ไว้ในไฟล์เดียวกัน
4. ทำ Diff — ระบุชัดว่าอะไรเปลี่ยน / อะไรคงเดิม
5. Approve TO-BE ก่อนเสมอ → Issue → Branch → PR
6. ห้ามแก้ code โดยไม่มี approved TO-BE frame

---

## Pre-Flight Checklist (ก่อนเริ่มทุก design task)

- [ ] **อ่าน TASK_DESIGN.md และ feedback memory ที่เกี่ยวข้อง**
- [ ] **Recheck Figma state**: ทำ audit ทุก page (Desktop, Mobile, Components)
  - นับ unbound fills/strokes
  - ตรวจ component coverage (raw frame ไหนควรเป็น instance)
  - ตรวจ instance overrides
- [ ] **Recheck code state**: file ที่เกี่ยวข้องตรงกับ Figma component ปัจจุบันไหม
- [ ] **รายงานสถานะปัจจุบัน** ก่อนเสนอแผน
- [ ] **เสนอแผน + รอ approve**

--

## During Design

### Archive ก่อนแก้ทุกครั้ง
- Duplicate node ที่จะแก้ → ย้ายไป `_archive` page
- ตั้งชื่อ `[BEFORE] <name> · YYYY-MM-DD`
- Position ต่อท้าย (maxX/maxY + 80px) — ห้ามทับ

### Variable binding (บังคับ)
- ทุก fill/stroke ต้อง bind variable จาก "Polyscan Tokens" collection
- ห้าม hardcode rgb ใน production frames
- ยกเว้น: 🎨 Design Tokens page (intentional reference)

### Component reuse
- ก่อนสร้าง component ใหม่ ต้องเช็คว่ามี component คล้ายกันใน 🧩 Components page หรือยัง
- Component property ต้องครบ (variant, text property, instance swap ตามจำเป็น)
- ทุก raw frame ที่เป็น UI pattern ซ้ำ → ต้องเป็น component instance

### Naming
- Frame: `Row: <name>`, `Card: <name>`, `Section: <name>`
- ห้ามทิ้ง name เป็น `Frame` (default)
- Component variant: `State=active/inactive`, `Type=toggle/text/segment`, `Variant=default/danger`

### Layer Naming Audit (บังคับ)
- ห้ามทิ้ง generic names: `Frame`, `Rectangle`, `Ellipse`, `Group`
- ต้อง rename ทุก node ให้สื่อ semantic role (e.g. `Status Dot`, `Slider Track`, `Color Block`)
- `Vector` ใน icon components ยกเว้นได้ (SVG paths)
- ต้อง scan ทุก page ก่อนรายงาน "เสร็จ"

### Component Property Parity (Desktop ↔ Mobile)
- Desktop ↔ Mobile component ที่ทำหน้าที่เดียวกันต้องมี property เหมือนกัน
- เช่น NavItem ต้องมี `Tab` property เหมือน MobileNavItem
- ถ้าเพิ่ม variant ฝั่งหนึ่ง ต้องเพิ่มอีกฝั่งด้วย
- Screen naming ต้อง match: `Desktop — X` ↔ `Mobile — X`

### Data Consistency Check (Desktop ↔ Mobile)
- ข้อมูลใน Desktop ต้องตรงกับ Mobile (ชื่อ, ตัวเลข, badge, variant type)
- ถ้า swap variant ต้องเช็คว่า data ข้างในตรงกับ variant ที่เลือก

### State Coverage (บังคับ)
- ทุก feature/component ต้องมี frame ครบทุก state: `empty`, `loading`, `error`, `success`, `edge case`
- State เหล่านี้จะถูกใช้เป็น reference สำหรับ E2E test

---

## After Design

### Verification Pipeline (บังคับทุกขั้น — ห้ามข้าม)

**ขั้น 1 — Structural verification (ทันทีหลังแก้)**
- [ ] ดึง node tree ของ frame ที่แก้ทั้งหมด — verify hierarchy ถูก
- [ ] นับ children count ของแต่ละ container — ตรงกับที่คาดไว้ไหม
- [ ] เช็คว่าทุก node ที่ตั้งใจสร้าง/แก้ มีอยู่จริง (ใช้ id ที่ return จาก script)
- [ ] เช็ค instance ที่สร้างใหม่: `mainComponent` ตรงไหม, `variantProperties` ตรงไหม

**ขั้น 2 — Visual verification (screenshot)**
- [ ] Screenshot frame ที่แก้ — ตรวจว่าตรงกับ original/intent
- [ ] Screenshot frame อื่นที่ใช้ component เดียวกัน — ตรวจว่าไม่พังจากการแก้
- [ ] เปรียบเทียบ side-by-side กับ archive (`[BEFORE] ...`) ถ้ามี
- [ ] ตรวจ visual issues:
  - Text cropping/clipping
  - Element overlap
  - ขนาดผิด (เทียบ pixel-by-pixel กับ original)
  - สีไม่ตรงกับ variable ที่คาดหวัง

**ขั้น 3 — Variable binding audit**
- [ ] Run audit script ที่ scope ทุก page (ใช้ emoji prefix ให้ถูก)
- [ ] นับ unbound fills + strokes ของแต่ละ page
- [ ] ถ้าตัวเลข > 0 → ดู sample → ตัดสินว่า intentional หรือต้องแก้
- [ ] เทียบกับตัวเลขก่อนเริ่ม task — ต้องลดลงหรือเท่าเดิม (ห้ามเพิ่ม)

**ขั้น 4 — Component property verification**
- [ ] ทุก component ที่สร้าง/แก้ มี `componentPropertyDefinitions` ตามที่ตั้งใจ
- [ ] Variant names ถูก format (e.g. `State=active`, `Type=toggle`)
- [ ] Text properties มี default value ที่เหมาะสม
- [ ] Instance overrides ที่ตั้งไว้ persist จริง (verify โดยอ่าน text node ของ instance อีกครั้ง)

**ขั้น 5 — Cross-frame consistency**
- [ ] หาทุก frame ที่ใช้ component ที่แก้ — list ครบไหม
- [ ] Screenshot ทุก frame เหล่านั้น
- [ ] Verify ว่า render ถูก ไม่มีกรณี broken inheritance
- [ ] เทียบ structural consistency ระหว่าง 2 frame (เช่น Desktop Sidebar vs Desktop with History Sidebar — ต้องใช้ component เดียวกัน)

**ขั้น 6 — Code↔Figma sync check**
- [ ] หา code file ที่ implement component นี้ (เช่น `src/components/<Name>.tsx`)
- [ ] Verify props/state ของ code ตรงกับ component properties ใน Figma
- [ ] Verify class/style ของ code ใช้ token ตรงกับ Figma variable
- [ ] ถ้ามี gap → บันทึกใน report

**ขั้น 7 — Re-audit (last gate)**
- [ ] Run pre-flight audit script อีกรอบ
- [ ] เทียบกับตัวเลขก่อนเริ่ม
- [ ] ห้าม report "เสร็จ" ถ้ายังมี unbound เพิ่มขึ้นจากเดิม
- [ ] ห้าม report "0 issues" ถ้ายังไม่ run audit script ที่ใช้ page name ถูก

---

### Verification Anti-Cheats (ห้ามทำ)

- ❌ เชื่อว่า `setProperties` ใช้ได้ผลโดยไม่ verify text จริงของ instance
- ❌ Run audit ด้วย page name ที่ไม่มี emoji prefix แล้วได้ 0 → claim "เสร็จ"
- ❌ Screenshot แค่ frame ที่แก้ โดยไม่ดู cross-frame impact
- ❌ Verify โดยอ่านแค่ค่า return จาก script ที่ผ่านมา (script อาจ crash กลางทาง)
- ❌ Skip "ขั้น 7 re-audit" เพราะ "ก็เพิ่งทำไป"

---

### Reporting Format (บังคับ)

```
## Summary
- สิ่งที่แก้: <component/instance/frame> × <จำนวน>
- Component ที่ได้รับผลกระทบ: <list>

## Verification
- Structural: <pass/fail + detail>
- Visual: <pass/fail + screenshot evidence>
- Variable binding: <before count → after count>
- Cross-frame: <frame list ที่เช็คแล้ว>
- Code↔Figma sync: <synced / gap detail>

## Frames ที่ owner ต้องไปตรวจ
1. <page> → <frame name> — เพื่อตรวจ <จุดที่แก้>
2. ...

## งานที่ยังเหลือ
- ...

## Risk / สิ่งที่ไม่แน่ใจ
- ...
```

---

## E2E Integration

ต้องคิดตั้งแต่ design phase — ไม่ใช่ทำทีหลัง:

- **Naming convention ร่วมกัน** — component name ใน Figma ต้อง map กับ `data-testid` ใน code เพื่อให้ QA เขียน test ได้โดยไม่ต้องเดา
- **State coverage** — ทุก state ที่ E2E ต้อง test ต้องมี frame ใน Figma ก่อน (empty, loading, error, success, edge case)
- **Flow annotation** — annotate happy path + critical paths ใน Figma ให้ชัด
- **Design Lock** — ต้อง approve และ lock design ก่อน QA เริ่มเขียน E2E test
- ห้ามเปลี่ยน design หลัง design lock โดยไม่แจ้ง QA และ update test ด้วย

---

## Anti-Patterns (ห้ามทำ)

- ❌ Audit ด้วย page name ผิด (ลืม emoji prefix) แล้วเชื่อผลลัพธ์
- ❌ รายงาน "0 unbound" หรือ "เสร็จแล้ว" โดยไม่ verify
- ❌ Detach instance เพื่อแก้ปัญหาเฉพาะหน้า (ทำให้ไม่ sync)
- ❌ สร้าง component ใหม่ทั้งที่มี component คล้ายกันอยู่แล้ว
- ❌ แก้ Figma โดยไม่ archive ก่อน
- ❌ ลงมือแก้โดยไม่รอ approve
- ❌ ใช้ `setProperties` กับ text property แล้วไม่ verify ว่าเปลี่ยนจริง (ใช้ direct text node update แทน)
- ❌ Resize ก่อน set sizing modes (resize reset เป็น FIXED)
- ❌ Set `layoutSizingHorizontal/Vertical = 'FILL'` ก่อน append child
- ❌ ทิ้ง leftover instance (e.g. MockButton) ไว้ในไฟล์ — ต้อง cleanup ทุกครั้งที่เจอ
- ❌ สร้าง component variant โดยไม่มี property ที่จำเป็น (e.g. hardcode icon ใน state variant แทนที่จะมี Tab property)
- ❌ แก้ overlap / resize section แล้วไม่เช็ค section-to-section overlap ที่อาจเกิดจาก bounds เปลี่ยน
- ❌ แก้ code โดยไม่มี approved TO-BE frame ใน Figma
- ❌ เปลี่ยน design หลัง design lock โดยไม่แจ้ง QA และ update E2E test

---

## ขั้นตอนมาตรฐาน (Standard Flow)

```
1. อ่าน rules + memory ที่เกี่ยวข้อง
   ↓
2. ระบุ project type — New Project / Redesign
   ↓
3. Recheck current state (Figma + code) — full audit
   ↓
4. รายงานสถานะ + เสนอแผน
   ↓
5. รอ approve
   ↓
6. Archive nodes ที่จะแก้
   ↓
7. ทำงานเป็น step ย่อย — verify ทุก step
   ↓
8. Final audit + screenshot ทุก frame ที่เกี่ยวข้อง
   ↓
9. รายงานผลลัพธ์ + frame ที่ owner ต้องตรวจ
   ↓
10. ถ้าจะ implement code → ขออนุญาต → ทำตาม dev workflow (Issue → branch → PR)
    ↓
11. ถ้ามี E2E → ตรวจ design lock + naming convention ก่อน QA เริ่มเขียน test
```
