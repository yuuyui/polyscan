# Polyscan — Git Workflow Rules

## ⚠️ บังคับใช้ทุก task — ห้ามข้ามขั้นตอน

---

## ขั้นตอนที่ต้องทำอย่างเคร่งครัด

### 1. 📋 สร้าง GitHub Issue ก่อนเสมอ
- ทุก feature / bug fix / improvement ต้องมี Issue ก่อน
- Issue ต้องระบุ: title, description, scope, acceptance criteria
- ใช้ `gh issue create` หรือ GitHub UI
- **ห้าม implement โดยไม่มี Issue**

### 2. 👀 รอ Review จาก Owner ก่อน implement
- หลังสร้าง Issue → แจ้ง owner และรอ approve
- **ห้ามเริ่มเขียนโค้ดจนกว่า owner จะ approve**
- ถ้า owner บอก "ได้เลย" หรือ "ทำได้" = ผ่าน

### 3. 🌿 ทำงานบน Branch เสมอ
- สร้าง branch จาก Issue number: `git checkout -b feat/issue-<number>-<short-desc>`
- ตัวอย่าง: `feat/issue-3-add-export-csv`
- **ห้าม commit ตรงที่ main**

### 4. 🔁 Pull Request ทุกครั้ง
- เมื่อ implement เสร็จ → สร้าง PR เข้า `main`
- PR ต้องมี: title, description, link to Issue (`Closes #<number>`)
- รอ owner review และ merge
- **ห้าม merge เอง**

---

## สรุป Flow

```
สร้าง Issue
    ↓
แจ้ง Owner → รอ Approve
    ↓
สร้าง Branch จาก Issue
    ↓
Implement + Tests
    ↓
สร้าง Pull Request
    ↓
Owner Review & Merge
```

---

## Branch Naming

| ประเภท | รูปแบบ |
|--------|--------|
| Feature | `feat/issue-<n>-<desc>` |
| Bug fix | `fix/issue-<n>-<desc>` |
| Refactor | `refactor/issue-<n>-<desc>` |
| Docs | `docs/issue-<n>-<desc>` |

---

## Commit Message Format

```
<type>: <short description>

Closes #<issue-number>
```

ตัวอย่าง:
```
feat: add CSV export button to ResultTable

Closes #5
```

---

> **สำคัญ:** Dev ทุกคน ต้องปฏิบัติตาม workflow นี้ทุก task
> ไม่มีข้อยกเว้น — แม้แต่ fix เล็กน้อย

---

## 🧪 Tester Flow

Tester ทำหน้าที่ตรวจสอบ quality ก่อน merge เข้า main เสมอ

### ขั้นตอน

#### 1. ดู Issues ทั้งหมด (Open + Closed)
```bash
# ดู open issues
gh issue list --state open

# ดู closed issues
gh issue list --state closed

# ดูทั้งหมดพร้อมกัน
gh issue list --state all
```

#### 2. Group เป็น Epic

จัด issues เป็น epic ตามกลุ่ม feature/domain:

| Epic | ชื่อ Epic | ตัวอย่าง Issues |
|------|-----------|----------------|
| `epic/core-scan` | Core Scan | gap calculation, API fetch, pagination |
| `epic/ui-ux` | UI/UX | design, components, responsive layout |
| `epic/dx` | Developer Experience | workflow, tooling, docs |
| `epic/performance` | Performance | speed, caching, batching |

> ตั้งชื่อ Epic ให้สื่อถึง domain ชัดเจน เช่น `epic/core-scan`, `epic/ui-ux`

#### 3. Analyze Acceptance Criteria ของแต่ละ Epic

รวบรวม acceptance criteria จากทุก issue ในแต่ละ epic:

```
Epic: core-scan
├── Issue #X — calcGaps logic
│   AC: OVER/UNDER/FAIR detection ✓, no-liquidity filter ✓
├── Issue #Y — fetchAllMarkets pagination
│   AC: stops at LTE= ✓, handles empty cursor ✓
└── Issue #Z — fetchMidpoints batching
    AC: batch size 500 ✓, merges results ✓

Coverage: 3/3 issues · 6/6 criteria
```

#### 4. Test

ทำตามลำดับ:

**4.1 Unit Tests**
```bash
npm run test
# → ต้องผ่าน 100% ก่อนเสมอ
```

**4.2 Build Check**
```bash
npm run build
# → ต้องไม่มี TypeScript error
```

**4.3 E2E Test (Playwright)**

ก่อนรัน E2E ต้องตรวจ:
- [ ] Design lock confirmed — design ไม่มีการเปลี่ยนแปลงหลัง approved
- [ ] `data-testid` ใน code ตรงกับ component name ใน Figma
- [ ] ทุก state ที่ test ครอบคลุม (empty, loading, error, success) มี frame ใน Figma

```bash
npx playwright test
# → ต้องผ่านทุก test ที่ครอบคลุม happy path + critical paths
```

รายงาน E2E:
```
E2E: happy path scan → ✅ Pass
E2E: empty state (no results) → ✅ Pass
E2E: error state (network fail) → ✅ Pass
```

**4.4 Manual / Integration Test**
- เปิด dev server: `npm run dev`
- ทดสอบตาม acceptance criteria ของแต่ละ epic ทีละข้อ
- บันทึกผล pass/fail

**4.5 รายงานผล**

```
## Test Report — Epic: core-scan

| Criteria                       | Status    | Notes |
|--------------------------------|-----------|-------|
| UNDER detected when sum < 1    | ✅ Pass   |       |
| OVER detected when sum > 1     | ✅ Pass   |       |
| no-liquidity rows filtered     | ✅ Pass   |       |
| pagination stops at LTE=       | ✅ Pass   |       |
| batch size 500 enforced        | ✅ Pass   |       |

Result: 5/5 Pass ✅
```

---

## สรุป Flow ทั้งหมด (Dev + Tester + Owner)

```
[Dev]    สร้าง Issue
              ↓
[Dev]    แจ้ง Owner → รอ Approve
              ↓
[Dev]    สร้าง Branch → Implement + Tests → Push
              ↓
[Dev]    สร้าง Pull Request
              ↓
[Tester] ดู Issues → Group Epic → Analyze AC → Unit Test → E2E → Manual → รายงานผล
              ↓
[Owner]  Review PR + Test Report → Merge
```
