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

  // Telegram Mini Apps: secret_key = HMAC_SHA256("WebAppData", bot_token),
  // hash = HMAC_SHA256(secret_key, data_check_string).
  // (sha256(bot_token) — это алгоритм Login Widget, для initData он не подходит.)
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
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

// Все токены аккаунта — для диагностики: если initData подписана не основным
// ботом, подскажем, каким именно.
function knownTokens(): { name: string; token: string }[] {
  const entries: [string, string | undefined][] = [
    ['TELEGRAM_MINI_APP_BOT_TOKEN', process.env.TELEGRAM_MINI_APP_BOT_TOKEN],
    ['TELEGRAM_BOT_TOKEN', process.env.TELEGRAM_BOT_TOKEN],
    ['TELEGRAM_SITE_BOT_TOKEN', process.env.TELEGRAM_SITE_BOT_TOKEN],
  ]
  return entries
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([name, token]) => ({ name, token }))
}

export type TelegramAuth = TelegramInitData & { reason?: string }

// Проверяет подпись initData и возвращает пользователя либо причину отказа.
// Причину отдаём в ответе API и в логах — без неё 401 не отличить от «нет
// заголовка», «не тот токен» и «подпись не сошлась».
export function telegramAuth(initData: string | null): TelegramAuth {
  const isProd = process.env.NODE_ENV === 'production'

  if (!isProd) {
    // Локальная разработка: подпись не проверяем, чтобы можно было открыть
    // мини-приложение прямо в браузере.
    if (!initData) return { user: { id: 0, username: 'demo' } }
    return getTelegramUser(initData)
  }

  if (!initData) return { reason: 'no_init_data' }
  const token = botToken()
  if (!token) return { reason: 'no_bot_token' }

  if (!validateInitData(initData, token)) {
    const data = parseInitData(initData)
    const matched = knownTokens()
      .filter((entry) => entry.token !== token && validateInitData(initData, entry.token))
      .map((entry) => entry.name)

    console.warn(
      '[tma] initData signature mismatch',
      JSON.stringify({
        fields: Object.keys(data).sort(),
        hasSignature: Boolean(data.signature),
        hashLength: data.hash?.length ?? 0,
        authDate: data.auth_date ?? null,
        initDataLength: initData.length,
        userId: data.user ? safeUserId(data.user) : null,
        matchedOtherToken: matched.length ? matched : null,
      }),
    )
    return { reason: matched.length ? `signed_by:${matched[0]}` : 'signature_mismatch' }
  }

  const parsed = getTelegramUser(initData)
  if (!parsed.user) return { reason: 'no_user' }
  return parsed
}

function safeUserId(rawUser: string): number | null {
  try {
    return (JSON.parse(rawUser) as TelegramUser).id ?? null
  } catch {
    return null
  }
}

// Возвращает пользователя Telegram или null, если запрос не авторизован.
export function requireTelegramInitData(initData: string | null): TelegramInitData | null {
  const auth = telegramAuth(initData)
  return auth.user ? { user: auth.user, query_id: auth.query_id } : null
}
