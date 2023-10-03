import { type ServerWebSocket, type Server } from "bun"
import { type IncomingMessage, type SocketData } from "./types"
import { createToken } from "./auth"
import { create, join, move, notify_lobby, chat } from "./game"

export const upgrade_connection = (req: Request, server: Server) => {
  const url = new URL(req.url)
  const prevId = url.searchParams.get("prevId")
  const name = url.searchParams.get("name")

  const socketData: SocketData = {
    authToken: createToken(prevId, name),
  }
  const upgraded = server.upgrade(req, {
    data: socketData,
  })

  if (upgraded) {
    return undefined
  }

  return new Response("Please open a websocket connection")
}

export const process_message = (
  ws: ServerWebSocket<unknown>,
  content: string
) => {
  const message: IncomingMessage = JSON.parse(content as string)

  const actions: { [key: string]: Function } = {
    create_game: create,
    join_game: join,
    move: move,
    lobby: notify_lobby,
    chat: chat,
  }

  actions[message.type](ws, message)
}
