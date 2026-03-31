# Polyscan Bridge — Figma Plugin

Plugin สำหรับเชื่อมต่อ Claude (OpenClaw) กับ Figma ได้โดยตรง

## วิธีติดตั้ง

### 1. Start Bridge Server (ครั้งแรกเท่านั้น)
```bash
cd polyscan/figma-bridge-server
npm install
npm start
# → Bridge running on port 3333
```

### 2. ติดตั้ง Plugin ใน Figma
1. เปิด Figma
2. Menu → **Plugins** → **Development** → **Import plugin from manifest**
3. เลือกไฟล์ `polyscan/figma-plugin/manifest.json`

### 3. เปิด Plugin ใน Figma
1. เปิด Figma file ที่ต้องการ
2. Plugins → Development → **Polyscan Bridge**
3. กด **CONNECT** (url: `ws://localhost:3333`)
4. เห็น ✅ CONNECTED = พร้อมแล้ว

### 4. ใช้งานผ่าน Chat
พิมพ์ใน chat:
```
สร้าง Design System จาก polyscan ใน Figma
```
Claude จะเรียก `figma_build_design_system` → สร้าง nodes ใน Figma ทันที

## Commands ที่รองรับ

| Action | คำอธิบาย |
|--------|---------|
| `build_design_system` | สร้าง Color Tokens + Typography + Components |
| `create_page` | สร้าง page ใหม่ |
| `create_frame` | สร้าง frame |
| `create_text` | สร้าง text node |
| `create_rect` | สร้าง rectangle |
| `get_file_info` | ดูข้อมูล file ปัจจุบัน |
