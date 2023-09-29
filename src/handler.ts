import { type ServerWebSocket, type Server } from "bun"
import { type IncomingMessage, type SocketData } from "./types"
import { createToken } from "./auth"
import { create, join, move } from "./game"

export const upgrade_connection = (req: Request, server: Server) => {
  const socketData: SocketData = {
    authToken: createToken(),
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
  content: string | Buffer
) => {
  const message: IncomingMessage = JSON.parse(content as string)
  const actions: { [key: string]: Function } = {
    create_game: create,
    join_game: join,
    move: move,
  }

  actions[message.type](ws, message)
}
