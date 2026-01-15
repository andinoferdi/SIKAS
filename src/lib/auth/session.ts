import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

const getSecretKey = () => {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET environment variable is required in production")
    }
    return new TextEncoder().encode("dev-only-insecure-secret-do-not-use-in-production")
  }
  return new TextEncoder().encode(secret)
}

const SECRET_KEY = getSecretKey()

export interface SessionPayload {
  userId: string
  userName: string
  expiresAt: Date
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY)
}

export async function decrypt(session: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, SECRET_KEY)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function createSession(userId: string, userName: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt({ userId, userName, expiresAt })

  const cookieStore = await cookies()
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value
  if (!session) return null
  return decrypt(session)
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}
