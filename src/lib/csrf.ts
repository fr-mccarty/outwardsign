import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'

const CSRF_COOKIE_NAME = 'parishioner_csrf'
const CSRF_TOKEN_LENGTH = 32

export async function generateCsrfToken(): Promise<string> {
  const token = randomBytes(CSRF_TOKEN_LENGTH).toString('hex')
  const cookieStore = await cookies()
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/parishioner',
    maxAge: 60 * 60 * 24 // 24 hours
  })
  return token
}

export async function validateCsrfToken(token: string): Promise<boolean> {
  const cookieStore = await cookies()
  const storedToken = cookieStore.get(CSRF_COOKIE_NAME)?.value
  if (!storedToken || !token) return false
  // Timing-safe comparison
  return storedToken === token
}

export async function getCsrfToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_COOKIE_NAME)?.value ?? null
}
