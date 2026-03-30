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

> **สำคัญ:** Jasmine ต้องปฏิบัติตาม workflow นี้ทุก task
> ไม่มีข้อยกเว้น — แม้แต่ fix เล็กน้อย
