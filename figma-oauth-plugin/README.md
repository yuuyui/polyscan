# Figma OAuth Plugin

OpenClaw plugin สำหรับ connect Figma ผ่าน OAuth — ไม่ต้อง local plugin

## Install

```bash
cp -r figma-oauth-plugin ~/.openclaw/extensions/figma-oauth
```

## Config

```json
{
  "plugins": {
    "entries": {
      "figma-oauth": {
        "enabled": true,
        "config": {
          "clientId": "<your-figma-client-id>",
          "clientSecret": "<your-figma-client-secret>"
        }
      }
    }
  }
}
```

## Tools

| Tool | คำอธิบาย |
|------|---------|
| `figma_auth_login` | เริ่ม OAuth flow → คืน login URL |
| `figma_auth_status` | ตรวจสอบ auth status |
| `figma_list_teams` | list teams |
| `figma_build_design_system` | สร้าง Color Variables จาก polyscan tokens |
| `figma_read_file` | อ่าน file structure |

## Usage

```
figma_auth_login → เปิด URL ใน browser → login → กลับมา chat
figma_auth_status → ตรวจสอบว่า connected
figma_build_design_system → สร้าง Design System
```
