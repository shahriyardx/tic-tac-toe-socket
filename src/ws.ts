import { ServerWebSocket } from "bun"

export const ws_send = ({
  ws,
  success,
  error_message,
  type,
  data,
  send = true,
  publish = undefined,
}: {
  ws: ServerWebSocket<unknown>
  success: boolean
  error_message?: string
  type: string
  data: object | string | null
  send?: boolean
  publish?: string
}) => {
  const payload = {
    success,
    type,
    data,
    error_message,
  }

  if (send) {
    ws.send(JSON.stringify(payload))
  }

  if (publish) {
    ws.publish(publish, JSON.stringify(payload))
  }
}
