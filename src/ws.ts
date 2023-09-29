import { ServerWebSocket } from "bun"

export const ws_send = ({
  ws,
  success,
  type,
  data,
  send = true,
  publish = undefined,
}: {
  ws: ServerWebSocket<unknown>
  success: boolean
  type: string
  data: object | string | null
  send?: boolean
  publish?: string
}) => {
  const payload = {
    success,
    type,
    data,
  }

  if (send) {
    ws.send(JSON.stringify(payload))
  }

  if (publish) {
    ws.publish(publish, JSON.stringify(payload))
  }
}
