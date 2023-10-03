import cuid from "cuid"
import { games, notify_lobby } from "./game"
import { JsonPayload, Symbol } from "./types"
import { ServerWebSocket } from "bun"

const create_board = () => {
  const array = new Array(9)
  array.fill("")

  return array
}

export const create_game = (ws: ServerWebSocket<unknown>) => {
  const board = create_board()
  const gid = cuid()

  games[gid] = {
    id: gid,
    created_at: Date.now(),
    started: false,
    board,
    players: [],
  }

  notify_lobby(ws)
  return gid
}

export const join_game = (gid: string, payload: JsonPayload) => {
  const players = games[gid].players

  let symbol: Symbol = "X"
  if (players.length == 1) {
    symbol = "O"
  }

  const player = {
    ...payload,
    symbol,
  }

  const playerExists = players.find((p) => p.id === player.id)
  if (playerExists) return { success: true, data: games[gid] }

  if (players.length >= 2)
    return { success: false, data: games[gid], error_message: "maximum players reached" }

  if (players.length == 0) {
    games[gid].current_turn = player.id
  }
  games[gid].players.push(player)

  if (games[gid].players.length == 2) {
    games[gid].started = true
  }

  return { success: true, data: games[gid] }
}

export const checkTicTacToeWinner = (board: Array<string>) => {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (const combination of winningCombinations) {
    const [a, b, c] = combination
    if (board[a] !== "" && board[a] === board[b] && board[a] === board[c]) {
      return board[a]
    }
  }

  return null
}
