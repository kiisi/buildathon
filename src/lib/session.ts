// This file is imported ONLY inside createServerFn handlers.
// Never import this at the top level of a route file.
import { SignJWT, jwtVerify } from 'jose'
import { setCookie, getCookie } from '@tanstack/react-start/server'

const COOKIE_NAME = 'lg_session'
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'super-secret-change-me-in-production-32chars',
)

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)

  setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === 'production',
  })
}

export async function getSession(): Promise<{ userId: string } | null> {
  const token = getCookie(COOKIE_NAME)
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    return { userId: payload.userId as string }
  } catch {
    return null
  }
}

export function clearSession() {
  setCookie(COOKIE_NAME, '', { maxAge: 0, path: '/' })
}
