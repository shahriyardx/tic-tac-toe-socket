import { type ServerWebSocket } from "bun"

import { getUserFromToken } from "./auth"
import { process_message, upgrade_connection } from "./handler"
import { JsonPayload, OutgoingMessage, type SocketData } from "./types"

Bun.serve({
  fetch(req, server) {
    return upgrade_connection(req, server)
  },
  websocket: {
    message(ws, message) {
      process_message(ws, message)
    },
    open(ws) {
      ws.subscribe("lobby")
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
        ws.publish("lobby", JSON.stringify(message))
      }
    },
    close(ws, code, message) {},
    drain(ws) {},
  },
  port: Number(process.env.PORT),
})
