import { type ServerWebSocket } from "bun"

import { getUserFromToken } from "./auth"
import { process_message, upgrade_connection } from "./handler"
import { JsonPayload, OutgoingMessage, type SocketData } from "./types"
import { games, notify_games } from "./game"

const clients: { [key: string]: ServerWebSocket<unknown> } = {}

Bun.serve({
  fetch(req, server) {
    return upgrade_connection(req, server)
  },
  websocket: {
    message(ws, message) {
      process_message(ws, message as string)
    },
    open(ws) {
      ws.subscribe("lobby")
      const data = ws.data as SocketData
      const user: JsonPayload | null = getUserFromToken(data.authToken)
      if (user) {
        clients[user.id] = ws
        const message: OutgoingMessage = {
          success: true,
          type: "connection",
          data: {
            token: data.authToken,
            user_id: user.id,
          },
        }
        ws.send(JSON.stringify(message))
        notify_games(ws)
      }
    },
    close(ws, code, message) {
      const data = ws.data as SocketData
      const user: JsonPayload | null = getUserFromToken(data.authToken)
      
      if (!user) return
      delete clients[user.id]

      let wasPlaying = null
      for (let gameid in games) {
        const game = games[gameid]
        const playingThis = game.players.find((p) => p.id == user.id)

        if (playingThis) {
          wasPlaying = game
          delete games[gameid]
          for (let client of Object.values(clients)) {
            if (client.isSubscribed("lobby")) {
              notify_games(client)
            } 
          }
        }
      }

      if (wasPlaying) {
        if (wasPlaying.players.length == 2) {
          const anotherPlayer = wasPlaying.players.find(
            (p) => p.id !== user.id
          )
          if (anotherPlayer) {
            const clientWs = clients[anotherPlayer.id]
            clientWs.send(
              JSON.stringify({ success: true, type: "oponent_disconnected" })
            )
          }
        }
      }
    },
  },
  port: Number(process.env.PORT),
})

console.log("Server is running")