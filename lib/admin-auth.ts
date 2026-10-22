// Проверка доступа к веб-админке.
//
// Токен: admin_<timestamp>_<hmac>. Подпись считается от ADMIN_PASSWORD (или
// отдельного ADMIN_TOKEN_SECRET), поэтому «нарисовать» токен по формату, зная
// только timestamp, больше нельзя. Срок жизни — 24 часа.

import crypto from 'crypto'

const MAX_AGE_MS = 24 * 60 * 60 * 1000
const CLOCK_SKEW_MS = 60 * 1000

function tokenSecret() {
  return process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_PASSWORD || ''
}

function sign(timestamp: number, secret: string) {
  return crypto.createHmac('sha256', secret).update(`admin:${timestamp}`).digest('hex').slice(0, 24)
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export function makeAdminToken(): string {
  const secret = tokenSecret()
  if (!secret) return ''
  const timestamp = Date.now()
  return `admin_${timestamp}_${sign(timestamp, secret)}`
}

export function isAuthenticated(request: Request): boolean {
  try {
    const url = new URL(request.url)
    const tokenFromUrl = url.searchParams.get('token')
    const authHeader = request.headers.get('authorization')
    const tokenFromHeader = authHeader?.replace('Bearer ', '')
    const token = tokenFromUrl || tokenFromHeader

    if (!token) return false

    const parts = token.split('_')
    if (parts.length !== 3 || parts[0] !== 'admin') return false

    const timestamp = Number.parseInt(parts[1], 10)
    if (!Number.isFinite(timestamp)) return false

    const secret = tokenSecret()
    if (!secret) return false

    if (!safeEqual(parts[2], sign(timestamp, secret))) return false

    const age = Date.now() - timestamp
    return age >= -CLOCK_SKEW_MS && age <= MAX_AGE_MS
  } catch (error) {
    console.error('[ADMIN] Ошибка проверки токена:', error)
    return false
  }
}
