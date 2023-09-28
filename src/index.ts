import { type ServerWebSocket } from "bun"

import { createToken, getUserFromToken } from "./auth"
import { process_message, upgrade_connection } from "./handler"
import { IncomingMessage, JsonPayload, OutgoingMessage, type SocketData } from "./types"

Bun.serve({
  fetch(req, server) {
    return upgrade_connection(req, server)
  },
  websocket: {
    message(ws, message) {
      return process_message(ws, message)
    },
    open(ws) {
      const data = ws.data as SocketData
      const user: JsonPayload | null = getUserFromToken(data.authToken)

      if (user) {
        const message: OutgoingMessage = {
          success: true,
          type: "connection",
          data: {
            token: data.authToken,
          },
        }
        ws.send(JSON.stringify(message))
      }
    },
    close(ws, code, message) {},
    drain(ws) {},
  },
  port: 3000,
})
