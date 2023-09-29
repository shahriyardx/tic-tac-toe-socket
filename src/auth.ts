import jwt, { JwtPayload } from "jsonwebtoken"
import cuid from "cuid"
import { JsonPayload } from "./types"

const secretKey = Buffer.from(process.env.JWT_SECRET as string)

export const createToken = () => {
  const uid = cuid()

  const payload = {
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