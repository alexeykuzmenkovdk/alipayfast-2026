// Проверка initData из Telegram Mini App.
// Подпись считается по алгоритму Telegram WebApp: HMAC-SHA256,
// где ключ — SHA256 от токена бота.

import crypto from 'crypto'

export interface TelegramUser {
  id: number
  username?: string
  first_name?: string
  last_name?: string
}

export interface TelegramInitData {
  user?: TelegramUser
  query_id?: string
}

export function parseInitData(initData: string): Record<string, string> {
  return Object.fromEntries(
    initData
      .split('&')
      .filter(Boolean)
      .map((part) => part.split('=') as [string, string])
      .map(([key, value]) => [key, decodeURIComponent(value ?? '')]),
  )
}

export function validateInitData(initData: string, botToken: string) {
  const data = parseInitData(initData)
  const hash = data.hash
  if (!hash) return false

  const dataCheckString = Object.keys(data)
    .filter((key) => key !== 'hash' && key !== 'signature')
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join('\n')

  const secretKey = crypto.createHash('sha256').update(botToken).digest()
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

  const expected = Buffer.from(hmac, 'utf8')
  const received = Buffer.from(hash, 'utf8')
  if (expected.length !== received.length) return false
  return crypto.timingSafeEqual(expected, received)
}

export function getTelegramUser(initData: string): TelegramInitData {
  const data = parseInitData(initData)
  let user: TelegramUser | undefined
  if (data.user) {
    try {
      user = JSON.parse(data.user) as TelegramUser
    } catch {
      user = undefined
    }
  }
  return { user, query_id: data.query_id }
}

function botToken() {
  return process.env.TELEGRAM_MINI_APP_BOT_TOKEN ?? process.env.TELEGRAM_BOT_TOKEN
}

// Возвращает пользователя Telegram или null, если запрос не авторизован.
// В режиме разработки без initData отдаёт демо-пользователя, чтобы мини-приложение
// можно было открыть в браузере.
export function requireTelegramInitData(initData: string | null): TelegramInitData | null {
  const token = botToken()
  const isProd = process.env.NODE_ENV === 'production'

  if (isProd) {
    if (!initData || !token) return null
    if (!validateInitData(initData, token)) return null
    return getTelegramUser(initData)
  }

  // Локальная разработка: подпись не проверяем, чтобы можно было открыть
  // мини-приложение прямо в браузере.
  if (!initData) return { user: { id: 0, username: 'demo' } }
  return getTelegramUser(initData)
}
