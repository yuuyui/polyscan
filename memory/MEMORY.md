# Polyscan Memory Index

## Project
- [project_polyscan.md](project_polyscan.md) — Project overview, tech stack, Figma file details
- [project_workflow.md](project_workflow.md) — Git workflow rules, tutorial phases, task-dev workflow, key docs

## User
- [user_preferences.md](user_preferences.md) — Thai communication, Figma+code workflow, preferences

## Feedback
- [feedback_figma.md](feedback_figma.md) — Figma sections must use dark bg/base background, not white

---

## ⚠️ Lesson Learned — 2026-04-03

### สิ่งที่ทำผิด
- รัน `cleanup` command ลบ nodes ใน Figma โดยไม่ backup ก่อน
- ลบ "Desktop — Polyscan" และ "Desktop — Polyscan with History" ทิ้งไปเพราะ logic เช็คชื่อผิด
- Recreate ผ่าน plugin API ไม่สามารถทำ auto-layout, constraints, component instances ได้เหมือน 100%

### กฎที่ต้องทำเสมอก่อน delete/modify ใน Figma
1. **อ่าน node names ให้ครบก่อนเสมอ** — ไม่ assume ว่า "ชื่อไม่ตรงแน่นอนลบได้"
2. **Snapshot ก่อนทำ** — ถาม user ให้ confirm ก่อน destructive action ทุกครั้ง
3. **ห้ามลบถ้าไม่แน่ใจ** — ถามก่อนเสมอ
4. **Figma API recreate ≠ original** — auto-layout และ components ทำไม่ได้เหมือนเดิม

### วิธี recover
- Figma → File → View version history → restore version ก่อนแก้
- ถ้าทำใน copy file → original file ยังปลอดภัย
