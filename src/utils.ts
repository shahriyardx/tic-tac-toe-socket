import cuid from "cuid"
import { games } from "./game"
import { Symbol } from "./types"

const create_board = () => {
  const array = new Array(9)
  array.fill(0)

  return array
}

export const create_game = () => {
  const board = create_board()
  const gid = cuid()

  games[gid] = {
    id: gid,
    board,
    players: [],
  }

  return gid
}

export const join_game = (gid: string, player_id: string) => {
  const players = games[gid].players
  let symbol: Symbol = "X"
  if (players.length == 1) {
    symbol = "O"
  }

  const playerExists = players.find((player) => player.id == player_id)
  if (playerExists) return { success: true, data: playerExists }

  if (players.length >= 2) return { success: false, data: null }

  const newPlayer = {
    id: player_id,
    symbol: symbol,
  }
  if (players.length == 0) {
    games[gid].current_turn = player_id
  }

  games[gid].players.push(newPlayer)

  return {
    success: true,
    data: newPlayer,
  }
}
