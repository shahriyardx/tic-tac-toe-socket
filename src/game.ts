import { getUserFromToken } from "./auth"
import { type Boards, type SocketData } from "./types"
import { type ServerWebSocket } from "bun"
import { create_game, join_game } from "./utils"

export const games: Boards = {}

export const create = (ws: ServerWebSocket<unknown>) => {
  const data: SocketData = ws.data as SocketData
  const player = getUserFromToken(data.authToken)

  if (player) {
    const game = create_game(ws)
    const game_data = join_game(game, player.id)

    if (game_data) {
      const extended_game_data = {
        ...game_data,
        game_id: game,
      }
      const payload = {
        success: true,
        type: "game_joined",
        data: extended_game_data,
      }
      
      return ws.publish(game, JSON.stringify(payload))
    }
  }

  ws.send(JSON.stringify({ success: false, data: null }))
}

export const join = (ws: ServerWebSocket<unknown>) => {
  const data = ws.data as SocketData & { game_id: string }
  const player = getUserFromToken(data.authToken)
  if (player) {
    join_game(data.game_id, player.id)
  }
}
