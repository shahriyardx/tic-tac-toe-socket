import cuid from "cuid"
import { games } from "./game"
import { OutgoingMessage, Symbol } from "./types"
import { ServerWebSocket } from "bun"

const create_board = () => {
  const array = new Array(9)
  array.fill(0)

  return array
}

export const create_game = (ws: ServerWebSocket<unknown>) => {
  const board = create_board()
  const gid = cuid()

  games[gid] = {
    id: gid,
    created_at: Date.now(),
    board,
    players: [],
  }

  const games_payload = JSON.stringify({ type: "games", data: games })
  ws.send(games_payload)
  ws.publish("lobby", games_payload)
  return gid
}

export const join_game = (gid: string, player_id: string) => {
  const players = games[gid].players
  let symbol: Symbol = "X"
  if (players.length == 1) {
    symbol = "O"
  }

  const playerExists = players.find((player) => player.id == player_id)
  if (playerExists) return playerExists

  if (players.length >= 2) return null

  const newPlayer = {
    id: player_id,
    symbol: symbol,
  }
  if (players.length == 0) {
    games[gid].current_turn = player_id
  }

  games[gid].players.push(newPlayer)

  return newPlayer
}
