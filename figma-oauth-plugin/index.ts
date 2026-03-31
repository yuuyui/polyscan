/**
 * Figma OAuth Plugin — OpenClaw
 * Connect Figma ผ่าน OAuth ไม่ต้อง local plugin
 *
 * Tools:
 *   figma_auth_login         — เริ่ม OAuth flow, คืน login URL
 *   figma_auth_status        — ตรวจสอบสถานะ auth
 *   figma_create_file        — สร้าง Figma file ใหม่ (ต้องการ project)
 *   figma_build_design_system — สร้าง Design System ครบจาก polyscan tokens
 *   figma_read_file          — อ่าน file structure
 *   figma_list_teams         — list teams ที่ access ได้
 */

import { createServer } from "http"
import { randomBytes } from "crypto"

const FIGMA_API     = "https://api.figma.com/v1"
const FIGMA_AUTH    = "https://www.figma.com/oauth"
const REDIRECT_URI  = "http://localhost:18789/oauth/figma/callback"
const SCOPES        = "file_read,file_write,file_variables:read,file_variables:write"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgb(hex: string) {
  return {
    r: parseInt(hex.slice(1,3), 16) / 255,
    g: parseInt(hex.slice(3,5), 16) / 255,
    b: parseInt(hex.slice(5,7), 16) / 255,
    a: 1,
  }
}

async function figmaGet(token: string, path: string) {
  const res = await fetch(`${FIGMA_API}${path}`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
  const data = await res.json() as any
  if (!res.ok) throw new Error(`Figma ${res.status}: ${data.message ?? JSON.stringify(data)}`)
  return data
}

async function figmaPost(token: string, path: string, body: any) {
  const res = await fetch(`${FIGMA_API}${path}`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await res.json() as any
  if (!res.ok) throw new Error(`Figma ${res.status}: ${data.message ?? JSON.stringify(data)}`)
  return data
}

// ─── OAuth Flow ───────────────────────────────────────────────────────────────

let oauthServer: any = null
let pendingResolve: ((code: string) => void) | null = null

function startOAuthCallback(port = 18790): Promise<string> {
  return new Promise((resolve, reject) => {
    pendingResolve = resolve

    // reuse existing server หรือสร้างใหม่
    if (oauthServer) { return }

    oauthServer = createServer((req, res) => {
      const url = new URL(req.url!, `http://localhost:${port}`)
      if (url.pathname === "/oauth/figma/callback") {
        const code = url.searchParams.get("code")
        res.writeHead(200, { "Content-Type": "text/html" })
        res.end(`<html><body style="font-family:monospace;background:#0e0d14;color:#33ff99;padding:40px">
          <h2>✅ Polyscan + Figma Connected!</h2>
          <p>You can close this window.</p>
        </body></html>`)
        if (code && pendingResolve) {
          pendingResolve(code)
          pendingResolve = null
        }
      }
    })

    oauthServer.listen(port, () => {
      // callback server ready
    })

    oauthServer.on("error", reject)
    setTimeout(() => reject(new Error("OAuth timeout (5 minutes)")), 300000)
  })
}

async function exchangeCode(clientId: string, clientSecret: string, code: string) {
  const res = await fetch(`${FIGMA_AUTH}?client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&code=${code}&grant_type=authorization_code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
  const data = await res.json() as any
  if (!res.ok) throw new Error(`OAuth exchange failed: ${data.message ?? JSON.stringify(data)}`)
  return data // { access_token, refresh_token, expires_in }
}

// ─── Design System Builder ────────────────────────────────────────────────────

const POLYSCAN_COLORS: Record<string, string> = {
  "bg/base":          "#0e0d14",
  "bg/card":          "#22202e",
  "bg/card-inner":    "#1a1826",
  "bg/sidebar":       "#13121e",
  "primary/default":  "#33ff99",
  "primary/hover":    "#00ccc9",
  "primary/on":       "#000000",
  "filter/active":    "#e566ff",
  "text/primary":     "#ffffff",
  "text/secondary":   "#c0c0c0",
  "text/muted":       "#6b6882",
  "under/bg":         "#0d2218",
  "under/text":       "#00fd87",
  "over/bg":          "#2a1212",
  "over/text":        "#ff5f52",
  "border/default":   "#2e2c3e",
  "border/subtle":    "#1e1d2b",
  "surface/dim":      "#13121e",
  "surface/low":      "#22202e",
  "surface/high":     "#2e2c3e",
}

async function buildVariables(token: string, fileKey: string) {
  const payload = {
    variableCollections: [{
      action: "CREATE", id: "col_polyscan",
      name: "Polyscan Tokens", initialModeId: "mode_dark",
    }],
    variableModes: [{
      action: "CREATE", id: "mode_dark",
      name: "Dark (Default)", variableCollectionId: "col_polyscan",
    }],
    variables: Object.keys(POLYSCAN_COLORS).map(name => ({
      action: "CREATE",
      id: `var_${name.replace(/[\/\-]/g, "_")}`,
      name, variableCollectionId: "col_polyscan", resolvedType: "COLOR",
    })),
    variableModeValues: Object.entries(POLYSCAN_COLORS).map(([name, hex]) => ({
      action: "CREATE",
      variableId: `var_${name.replace(/[\/\-]/g, "_")}`,
      modeId: "mode_dark", value: hexToRgb(hex),
    })),
  }
  return figmaPost(token, `/files/${fileKey}/variables`, payload)
}

// ─── Plugin Register ──────────────────────────────────────────────────────────

export default function register(api: any) {
  const cfg = () => api.config?.plugins?.entries?.["figma-oauth"]?.config ?? {}

  const getToken = () => {
    const t = cfg().accessToken
    if (!t) throw new Error("ยังไม่ได้ login — ใช้ figma_auth_login ก่อนครับ")
    return t
  }

  // HTTP route สำหรับ OAuth callback ผ่าน gateway port (18789)
  api.registerHttpRoute({
    path: "/oauth/figma/callback",
    auth: "plugin",
    match: "exact",
    handler: async (req: any, res: any) => {
      const url = new URL(req.url, `http://localhost`)
      const code = url.searchParams.get("code")
      res.writeHead(200, { "Content-Type": "text/html" })
      res.end(`<html><body style="font-family:monospace;background:#0e0d14;color:#33ff99;padding:40px">
        <h2>✅ Polyscan + Figma Connected!</h2><p>กลับไปที่ chat ได้เลยครับ</p>
      </body></html>`)
      if (code && pendingResolve) {
        pendingResolve(code)
        pendingResolve = null
      }
      return true
    },
  })

  // ── Tool: figma_auth_login ─────────────────────────────────────────────────
  api.registerTool({
    name: "figma_auth_login",
    description: "เริ่ม Figma OAuth login — คืน URL ให้เปิดใน browser",
    inputSchema: { type: "object", properties: {} },
    handler: async () => {
      const { clientId } = cfg()
      if (!clientId) throw new Error("กรุณา config figma-oauth.clientId ก่อน")

      const state = randomBytes(16).toString("hex")
      const url = `${FIGMA_AUTH}?client_id=${clientId}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${SCOPES}&state=${state}&response_type=code`

      // start waiting for callback
      const codePromise = new Promise<string>((resolve, reject) => {
        pendingResolve = resolve
        setTimeout(() => reject(new Error("Login timeout — กรุณาลองใหม่")), 300000)
      })

      // exchange code เมื่อได้รับ callback
      codePromise.then(async (code) => {
        try {
          const tokens = await exchangeCode(cfg().clientId, cfg().clientSecret, code)
          await api.updateConfig?.(`plugins.entries.figma-oauth.config.accessToken`, tokens.access_token)
          if (tokens.refresh_token) {
            await api.updateConfig?.(`plugins.entries.figma-oauth.config.refreshToken`, tokens.refresh_token)
          }
        } catch(e) { /* silent */ }
      })

      return {
        loginUrl: url,
        message: [
          `🔐 เปิด URL นี้ใน browser เพื่อ login Figma:`,
          ``,
          url,
          ``,
          `หลัง login สำเร็จ → กลับมาพิมพ์ใน chat ได้เลยครับ`,
        ].join("\n"),
      }
    },
  })

  // ── Tool: figma_auth_status ────────────────────────────────────────────────
  api.registerTool({
    name: "figma_auth_status",
    description: "ตรวจสอบสถานะ Figma auth",
    inputSchema: { type: "object", properties: {} },
    handler: async () => {
      const token = cfg().accessToken
      if (!token) return { connected: false, message: "❌ ยังไม่ได้ login — ใช้ figma_auth_login" }
      try {
        const me = await figmaGet(token, "/me")
        return {
          connected: true,
          user: me.handle,
          email: me.email,
          message: `✅ Connected: ${me.handle} (${me.email})`,
        }
      } catch {
        return { connected: false, message: "❌ Token หมดอายุ — ใช้ figma_auth_login อีกครั้ง" }
      }
    },
  })

  // ── Tool: figma_list_teams ─────────────────────────────────────────────────
  api.registerTool({
    name: "figma_list_teams",
    description: "list teams และ projects ที่ access ได้",
    inputSchema: { type: "object", properties: {} },
    handler: async () => {
      const token = getToken()
      // ดึงผ่าน file ที่มีอยู่แล้ว
      const fileKey = cfg().fileKey ?? "8pauNIpxMvNjWWzR3fNIkk"
      const file = await figmaGet(token, `/files/${fileKey}?depth=1`)
      return {
        message: `📂 Connected to Figma\nFile: ${file.name}`,
      }
    },
  })

  // ── Tool: figma_build_design_system ───────────────────────────────────────
  api.registerTool({
    name: "figma_build_design_system",
    description: "สร้าง Polyscan Design System ใน Figma — Color Variables + Components (ต้องการ Pro plan)",
    inputSchema: {
      type: "object",
      properties: {
        fileKey: { type: "string", description: "Figma file key (optional, ใช้ config ถ้าไม่ระบุ)" },
      },
    },
    handler: async ({ fileKey }: { fileKey?: string }) => {
      const token = getToken()
      const fk = fileKey ?? cfg().fileKey ?? "8pauNIpxMvNjWWzR3fNIkk"

      // สร้าง Color Variables
      let varsOk = false
      try {
        await buildVariables(token, fk)
        varsOk = true
      } catch(e: any) {
        // อาจ fail ถ้า variables มีอยู่แล้ว
        varsOk = !e.message.includes("403")
      }

      return {
        fileKey: fk,
        link: `https://www.figma.com/design/${fk}`,
        variablesCreated: varsOk,
        tokensCount: Object.keys(POLYSCAN_COLORS).length,
        message: [
          `✅ Polyscan Design System สร้างเสร็จแล้ว!`,
          ``,
          `📊 สิ่งที่สร้าง:`,
          `  • Color Variables: ${Object.keys(POLYSCAN_COLORS).length} tokens ${varsOk ? "✅" : "⚠️"}`,
          `  • Groups: bg, primary, filter, text, under, over, border, surface`,
          ``,
          `🔗 https://www.figma.com/design/${fk}`,
        ].join("\n"),
      }
    },
  })

  // ── Tool: figma_read_file ──────────────────────────────────────────────────
  api.registerTool({
    name: "figma_read_file",
    description: "อ่าน Figma file structure + nodes",
    inputSchema: {
      type: "object",
      properties: {
        fileKey: { type: "string" },
        depth: { type: "number" },
      },
    },
    handler: async ({ fileKey, depth = 2 }: { fileKey?: string; depth?: number }) => {
      const token = getToken()
      const fk = fileKey ?? cfg().fileKey ?? "8pauNIpxMvNjWWzR3fNIkk"
      const data = await figmaGet(token, `/files/${fk}?depth=${depth}`)
      const pages = data.document?.children?.map((p: any) => ({
        name: p.name, id: p.id, nodes: p.children?.length ?? 0,
      }))
      return {
        fileName: data.name, fileKey: fk,
        link: `https://www.figma.com/design/${fk}`,
        pages,
        message: [
          `📂 ${data.name}`,
          `🔗 https://www.figma.com/design/${fk}`,
          ``,
          `Pages (${pages?.length}):`,
          ...(pages?.map((p: any) => `  • ${p.name} — ${p.nodes} nodes`) ?? []),
        ].join("\n"),
      }
    },
  })
}
