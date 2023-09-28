import { JwtPayload } from "jsonwebtoken"

export type Board = {
    id: number
    players: Array<string>
    board: Array<number>
}

export type Boards = {
    [key: string]: Board
}

export type SocketData = {
    authToken: string
}

export interface JsonPayload extends JwtPayload {
    id: string
}

export type OutgoingMessage = {
    success: true,
    type: string
    data: object
}

export type IncomingMessage = {
    type: string
    data: object
}