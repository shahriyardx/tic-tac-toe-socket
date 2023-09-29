import { JwtPayload } from "jsonwebtoken"

export type Symbol = "X" | "O"

export type Player = {
    id: string
    symbol: Symbol
}

export type Board = {
    id: string
    players: Array<Player>
    board: Array<number>
    current_turn?: string
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