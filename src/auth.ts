import jwt from "jsonwebtoken"
import cuid from "cuid"
import { JsonPayload } from "./types"

const secretKey = Buffer.from(process.env.JWT_SECRET as string)

export const createToken = (prevId: string | null, name: string | null) => {
  const uid = prevId || cuid()

  const payload = {
    name,
    id: uid,
  }

  const token = jwt.sign(payload, secretKey)
  return token
}

export const verifyToken = (token: string) => {
  try {
    return {
      success: true,
      data: jwt.verify(token, secretKey) as JsonPayload,
    }
  } catch {
    return { success: false, data: null }
  }
}

export const getUserFromToken = (token: string) => {
  return verifyToken(token).data
}
