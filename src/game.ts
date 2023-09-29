import { getUserFromToken } from "./auth"
import { type Boards, type SocketData } from "./types"
import { type ServerWebSocket } from "bun"
import { checkTicTacToeWinner, create_game, join_game } from "./utils"
import { ws_send } from "./ws"

export const games: Boards = {}

export const notify_games = (ws: ServerWebSocket<unknown>, _message: object = {}) => {
  ws_send({
    success: true,
    type: "games",
    data: Object.values(games).filter(item => item.players.length < 2),
    ws: ws,
    publish: "lobby",
  })
}

export const create = (ws: ServerWebSocket<unknown>, _message: object) => {
  const data: SocketData = ws.data as SocketData
  const player = getUserFromToken(data.authToken)

  if (!player) return
  const game_id = create_game(ws)
  const game_data = join_game(game_id, player.id)

  notify_games(ws)

  if (game_data.success) {
    ws.subscribe(game_id)

    const extended_game_data = {
      ...game_data,
      game_id: game_id,
    }

    return ws_send({
      success: true,
      type: "game_joined",
      data: extended_game_data,
      ws: ws,
      publish: game_id,
    })
  } else {
    return ws_send({
      success: false,
      type: "error",
      data: null,
      error_message: game_data.data as string,
      ws,
    })
  }
}

export const join = (
  ws: ServerWebSocket<unknown>,
  message: { game_id: string }
) => {
  const data = ws.data as SocketData
  const player = getUserFromToken(data.authToken)

  if (!player) return
  const game_data = join_game(message.game_id, player.id)

  notify_games(ws)

  if (game_data.success) {
    ws.subscribe(message.game_id)

    const extended_game_data = {
      ...game_data,
      game_id: message.game_id,
    }

    ws_send({
      success: true,
      type: "game_joined",
      data: extended_game_data,
      ws: ws,
      publish: message.game_id,
    })

    if (game_data.started) {
      setTimeout(() => {
        ws_send({
          success: true,
          type: "game_started",
          data: games[message.game_id],
          ws: ws,
          publish: message.game_id,
        })
      }, 2000)
    }

    return
  }

  return ws_send({
    success: false,
    type: "error",
    data: null,
    error_message: game_data.data as string,
    ws: ws,
  })
}

export const move = (
  ws: ServerWebSocket<unknown>,
  message: { game_id: string, index: number }
) => {
  const data = ws.data as SocketData
  const player = getUserFromToken(data.authToken)
  const game = games[message.game_id]

  if (!player || !game) return

  const canPlay = game.players.find(p => p.id == player.id)
  if (!canPlay || game.current_turn !== player.id) return
  if (game.board[message.index]) return

  const nextTurn = game.players.find(p => p.id !== player.id)
  game.board[message.index] = canPlay.symbol

  const winner = checkTicTacToeWinner(game.board)
  const moveLeft = game.board.filter(item => item == "")

  if (winner || moveLeft.length <= 0) {
    delete games[message.game_id]
    const winnerPlayer = game.players.find(p => p.symbol == winner)

    return ws_send({
      success: true,
      type: "game_finished",
      data: {
        board: game.board,
        winner: winnerPlayer?.id,
      },
      ws: ws,
      publish: message.game_id,
    })
  }
  game.current_turn = nextTurn?.id
  games[message.game_id] = game

  ws_send({
    success: true,
    type: "game_update",
    data: games[message.game_id],
    ws: ws,
    publish: message.game_id,
  })
}