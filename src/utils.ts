import cuid from "cuid"
import { games, notify_games } from "./game"
import { Symbol } from "./types"
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

  notify_games(ws)
  return gid
}

export const join_game = (gid: string, player_id: string) => {
  const players = games[gid].players
  let symbol: Symbol = "X"
  if (players.length == 1) {
    symbol = "O"
  }

  const playerExists = players.find((player) => player.id == player_id)
  if (playerExists) return {success: true, data: playerExists}

  if (players.length >= 2)
    return { success: false, data: "maximum players reached for this game" }

  const newPlayer = {
    id: player_id,
    symbol: symbol,
  }
  if (players.length == 0) {
    games[gid].current_turn = player_id
  }
  games[gid].players.push(newPlayer)
  
  if (games[gid].players.length == 2) {
    games[gid].started = true
  }
  
  return {success: true, data: newPlayer, started: games[gid].started}
}

export const checkTicTacToeWinner = (board: Array<string>) => {
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board[a] !== "" && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}