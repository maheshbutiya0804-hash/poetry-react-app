import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { prisma } from './prisma.js'

function deriveKey(password: string, salt: string, length: number) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, length, (error, key) => error ? reject(error) : resolve(key as Buffer))
  })
}
const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'heartstring_session'
const SESSION_DAYS = Math.max(1, Number(process.env.SESSION_DAYS || 7))
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000

export type SafeAuthUser = {
  id: string
  fullName: string
  email: string
  phone: string | null
  role: string
  status: string
  profileImageUrl: string | null
  hasPassword: boolean
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

export function passwordPolicyError(password: string): string | null {
  if (password.length < 8) return 'Password must contain at least 8 characters.'
  if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter.'
  if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter.'
  if (!/[0-9]/.test(password)) return 'Password must include a number.'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include a special character.'
  return null
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const derived = await deriveKey(password, salt, 64)
  return `scrypt$${salt}$${derived.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hex] = stored.split('$')
  if (scheme !== 'scrypt' || !salt || !hex) return false
  const expected = Buffer.from(hex, 'hex')
  const derived = await deriveKey(password, salt, expected.length)
  return expected.length === derived.length && timingSafeEqual(expected, derived)
}

function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function cookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    httpOnly: true,
    sameSite: isProduction ? ('none' as const) : ('lax' as const),
    secure: isProduction,
    path: '/',
    maxAge: SESSION_MS,
  }
}

function readCookie(req: Request, name: string) {
  const raw = req.headers.cookie
  if (!raw) return null
  for (const part of raw.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return decodeURIComponent(rest.join('='))
  }
  return null
}

export function safeUser(user: { id: string; fullName: string; email: string; phone: string | null; role: string; status: string; profileImageUrl?: string | null; passwordHash?: string | null }): SafeAuthUser {
  return { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role, status: user.status, profileImageUrl: user.profileImageUrl ?? null, hasPassword: Boolean(user.passwordHash) }
}

export async function createLoginSession(res: Response, userId: string) {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_MS)
  await prisma.authSession.create({ data: { userId, tokenHash: hashSessionToken(token), expiresAt } })
  res.cookie(COOKIE_NAME, token, cookieOptions())
}

export async function destroyLoginSession(req: Request, res: Response) {
  const token = readCookie(req, COOKIE_NAME)

  if (token) {
    await prisma.authSession.deleteMany({
      where: {
        tokenHash: hashSessionToken(token),
      },
    })
  }

  const isProduction = process.env.NODE_ENV === 'production'

  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    path: '/',
  })
}

export async function getAuthenticatedUser(req: Request): Promise<SafeAuthUser | null> {
  const token = readCookie(req, COOKIE_NAME)
  if (!token) return null
  const tokenHash = hashSessionToken(token)
  const session = await prisma.authSession.findUnique({ where: { tokenHash }, include: { user: true } })
  if (!session) return null
  if (session.expiresAt <= new Date()) {
    await prisma.authSession.delete({ where: { id: session.id } }).catch(() => undefined)
    return null
  }
  if (session.user.status !== 'ACTIVE') return null
  // Keep session activity without extending the expiry window.
  if (Date.now() - session.lastSeenAt.getTime() > 15 * 60 * 1000) {
    await prisma.authSession.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } }).catch(() => undefined)
  }
  return safeUser(session.user)
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) return res.status(401).json({ message: 'Authentication required.' })
    if (user.role !== 'ADMIN') return res.status(403).json({ message: 'Administrator access required.' })
    ;(req as any).authUser = user
    next()
  } catch (error) {
    console.error('Admin authentication failed:', error)
    res.status(500).json({ message: 'Could not verify authentication.' })
  }
}
