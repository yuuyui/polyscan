/**
 * Polyscan Figma Bridge Server
 * WebSocket relay ระหว่าง OpenClaw tool calls และ Figma Plugin
 *
 * Port: 3333
 * Protocol:
 *   Client (OpenClaw) → POST /execute  { action, params, id }
 *   Server → WS message to Figma Plugin
 *   Figma Plugin → WS message back { id, ok, result, error }
 *   Server → HTTP response to OpenClaw
 */

import { WebSocketServer, WebSocket } from "ws"
import { createServer } from "http"
import { randomUUID } from "crypto"

const PORT = process.env.PORT ?? 3333
const pending = new Map() // id → { resolve, reject, timeout }
let figmaWs = null        // active Figma Plugin connection

// ─── HTTP Server ──────────────────────────────────────────────────────────────

const httpServer = createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") { res.writeHead(200); res.end(); return }

  // Health check
  if (req.method === "GET" && req.url === "/status") {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({
      ok: true,
      figmaConnected: figmaWs?.readyState === WebSocket.OPEN,
      pending: pending.size,
    }))
    return
  }

  // Execute command
  if (req.method === "POST" && req.url === "/execute") {
    let body = ""
    req.on("data", d => body += d)
    req.on("end", async () => {
      try {
        const cmd = JSON.parse(body)
        const id = cmd.id ?? randomUUID()

        if (!figmaWs || figmaWs.readyState !== WebSocket.OPEN) {
          res.writeHead(503, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ ok: false, error: "Figma plugin not connected. Open Figma → Plugins → Polyscan Bridge" }))
          return
        }

        // ส่ง command ไปยัง Figma Plugin ผ่าน WebSocket
        figmaWs.send(JSON.stringify({ ...cmd, id }))

        // รอผลกลับมา (timeout 30s)
        const result = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            pending.delete(id)
            reject(new Error("Timeout waiting for Figma response (30s)"))
          }, 30000)
          pending.set(id, { resolve, reject, timeout })
        })

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify(result))
      } catch (e) {
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ ok: false, error: e.message }))
      }
    })
    return
  }

  res.writeHead(404); res.end("Not found")
})

// ─── WebSocket Server ─────────────────────────────────────────────────────────

const wss = new WebSocketServer({ server: httpServer })

wss.on("connection", (ws, req) => {
  console.log(`[bridge] Figma Plugin connected from ${req.socket.remoteAddress}`)
  figmaWs = ws

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString())
      const { id, ok, result, error } = msg

      if (id && pending.has(id)) {
        const { resolve, reject, timeout } = pending.get(id)
        clearTimeout(timeout)
        pending.delete(id)
        if (ok) resolve({ ok: true, result })
        else reject(new Error(error ?? "Figma error"))
      }
    } catch (e) {
      console.error("[bridge] Parse error:", e.message)
    }
  })

  ws.on("close", () => {
    console.log("[bridge] Figma Plugin disconnected")
    figmaWs = null
    // reject all pending
    for (const [id, { reject, timeout }] of pending) {
      clearTimeout(timeout)
      reject(new Error("Figma Plugin disconnected"))
    }
    pending.clear()
  })

  ws.on("error", (e) => {
    console.error("[bridge] WS error:", e.message)
  })
})

// ─── Start ────────────────────────────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`\n🌉 Figma Bridge Server running on port ${PORT}`)
  console.log(`   Status: http://localhost:${PORT}/status`)
  console.log(`   Execute: POST http://localhost:${PORT}/execute`)
  console.log(`\n   Waiting for Figma Plugin connection (ws://localhost:${PORT})...\n`)
})
