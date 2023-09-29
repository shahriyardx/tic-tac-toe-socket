import { getUserFromToken } from "./auth"
import { type Boards, type SocketData } from "./types"
import { type ServerWebSocket } from "bun"
import { create_game, join_game } from "./utils"
import { ws_send } from "./ws"

export const games: Boards = {}

export const notify_games = (ws: ServerWebSocket<unknown>) => {
  ws_send({
    success: true,
    type: "games",
    data: Object.values(games),
    ws: ws,
    publish: "lobby",
  })
}

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

      ws_send({
        success: true,
        type: "game_joined",
        data: extended_game_data,
        ws: ws,
        publish: game,
      })
    }
  }

  ws_send({
    success: false,
    type: "game_joined",
    data: null,
    ws: ws,
  })
}

export const join = (ws: ServerWebSocket<unknown>) => {
  const data = ws.data as SocketData & { game_id: string }
  const player = getUserFromToken(data.authToken)
  if (player) {
    join_game(data.game_id, player.id)
  }
}
