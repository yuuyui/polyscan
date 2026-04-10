# RULES_OWNER — Owner Workflow Rules

## บทบาทของ Owner

Owner คือผู้มีอำนาจ approve และ reject ทุกการเปลี่ยนแปลง ทั้ง design และ code ก่อนที่จะ merge เข้า main

---

## จุดที่ต้อง Approve (Approval Gates)

### 1. Issue Approval
- Dev สร้าง Issue → แจ้ง Owner
- Owner ต้องตรวจ:
  - [ ] scope ชัดเจน ไม่กว้างเกินไป
  - [ ] acceptance criteria วัดผลได้จริง ไม่คลุมเครือ
  - [ ] ไม่ซ้อนทับกับ Issue อื่นที่กำลังทำอยู่
- ถ้า approve → บอก "ได้เลย" หรือ "ทำได้"
- ถ้าไม่ approve → ระบุสิ่งที่ต้องแก้ก่อน
- ห้าม dev เริ่มเขียนโค้ดจนกว่าจะได้รับ approve

### 2. Design Approval (TO-BE)
- Designer เสนอแผน + frame [TO-BE] → รอ approve
- Owner ต้องตรวจ frame ใน Figma ที่ designer ระบุ

**UX/UI Checklist:**
- [ ] ผู้ใช้หา action หลักได้ชัดเจน — ไม่ต้องเดา
- [ ] มี state ครบ — empty, loading, error, success
- [ ] error message บอกผู้ใช้ว่าต้องทำอะไรต่อ ไม่ใช่แค่ "เกิดข้อผิดพลาด"
- [ ] ใช้งานได้บน mobile — ไม่ใช่แค่ desktop
- [ ] มีกลุ่มผู้ใช้ที่อาจถูกทิ้งไว้ไหม เช่น ผู้ใช้ที่ไม่คุ้นเทคโนโลยี
- [ ] ผู้ใช้รู้ว่าระบบกำลังทำอะไร — loading indicator ชัดเจน
- [ ] action ที่ย้อนไม่ได้ (ลบ, submit) มี confirmation ก่อน
- [ ] design ตรงกับ pattern ที่มีอยู่แล้วในระบบ — ไม่คิดใหม่ทุกครั้ง

- ถ้า approve → designer ดำเนินการต่อได้
- ห้าม dev implement ถ้ายังไม่ approve TO-BE

### 3. Design Lock
- ก่อน QA เริ่มเขียน E2E test → Owner ต้อง lock design
- ตรวจก่อน lock:
  - [ ] design ครอบคลุมทุก state ที่ QA จะ test
  - [ ] naming convention ตรงกับ data-testid ใน code
- หลัง lock แล้ว ห้ามเปลี่ยน design โดยไม่แจ้ง QA และ update test

### 4. PR + Test Report Review
- Tester รายงานผล + Dev สร้าง PR → Owner review
- Owner ต้องตรวจ:
  - [ ] Test Report ผ่านครบทุก acceptance criteria
  - [ ] PR description link ไปยัง Issue ที่ถูกต้อง
  - [ ] scope ของ code ตรงกับ Issue ที่ approve ไว้ — ไม่ scope creep
  - [ ] ไม่มี breaking change ที่ไม่ได้พูดถึง
- ถ้าผ่าน → merge
- ห้าม merge เองถ้า Test Report ยังไม่ผ่าน

---

## สรุป Flow ของ Owner

```
Dev สร้าง Issue
    → Owner approve → Dev implement
Designer เสนอ TO-BE
    → Owner approve (UX checklist) → ดำเนิน
QA พร้อมเขียน E2E
    → Owner lock design
Dev สร้าง PR + Tester รายงาน
    → Owner review → Merge
```
