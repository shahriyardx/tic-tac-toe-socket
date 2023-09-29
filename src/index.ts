import { type ServerWebSocket } from "bun"

import { getUserFromToken } from "./auth"
import { process_message, upgrade_connection } from "./handler"
import { JsonPayload, OutgoingMessage, type SocketData } from "./types"
import { notify_games } from "./game"

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
            user_id: user.id
          },
        }
        ws.send(JSON.stringify(message))
        notify_games(ws)
      }
    },
    close(ws, code, message) {},
    drain(ws) {},
  },
  port: Number(process.env.PORT),
})
