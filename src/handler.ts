import { type ServerWebSocket, type Server } from "bun"
import { IncomingMessage, type SocketData } from "./types"
import { createToken } from "./auth"

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

export const process_message = (ws: ServerWebSocket<unknown>, content: string | Buffer) => {
    const data = JSON.parse(content as string)
}