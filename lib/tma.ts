// Проверка initData из Telegram Mini App.
// Алгоритм Telegram WebApp: secret_key = HMAC_SHA256("WebAppData", bot_token),
// hash = HMAC_SHA256(secret_key, data_check_string), где строка собирается из
// всех полей, кроме hash и signature, по алфавиту через \n.
//
// Клиенты Telegram кодируют значения по-разному (проценты/%2B против пробела),
// и от этого зависит хешируемая строка. Поэтому пробуем несколько вариантов
// сборки — все они завязаны на один и тот же секрет бота, слабее проверку это
// не делает, зато честный пользователь не упирается в 401 из-за кодировки.

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

interface InitField {
  key: string
  raw: string
  decoded: string
  percent: string
}

function parseFields(initData: string): InitField[] {
  const fields: InitField[] = []
  for (const part of initData.split('&')) {
    if (!part) continue
    const separator = part.indexOf('=')
    const key = separator === -1 ? part : part.slice(0, separator)
    const raw = separator === -1 ? '' : part.slice(separator + 1)
    let percent = raw
    let decoded = raw
    try {
      percent = decodeURIComponent(raw)
    } catch {
      percent = raw
    }
    try {
      decoded = decodeURIComponent(raw.replace(/\+/g, ' '))
    } catch {
      decoded = percent
    }
    fields.push({ key, raw, decoded, percent })
  }
  return fields
}

export function parseInitData(initData: string): Record<string, string> {
  return Object.fromEntries(parseFields(initData).map((field) => [field.key, field.decoded]))
}

// Варианты сборки data_check_string: как брать значения (сырые, раскодированные
// по-формному или просто percent-декодированные) и какие поля исключать.
// Клиенты Telegram различаются в том, кодируют ли они пробел как «+».
const ENCODINGS: [string, (field: InitField) => string][] = [
  ['decoded', (field) => field.decoded],
  ['percent', (field) => field.percent],
  ['raw', (field) => field.raw],
]

const EXCLUSIONS: [string, string[]][] = [
  ['no_hash_signature', ['hash', 'signature']],
  ['no_hash', ['hash']],
]

function computeHash(dataCheckString: string, botToken: string) {
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
  return crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')
}

function hashCandidates(initData: string, botToken: string): Record<string, string> {
  const fields = parseFields(initData)
  const result: Record<string, string> = {}
  for (const [encodingName, pick] of ENCODINGS) {
    for (const [exclusionName, excluded] of EXCLUSIONS) {
      const dataCheckString = fields
        .filter((field) => !excluded.includes(field.key))
        .map((field) => `${field.key}=${pick(field)}`)
        .sort()
        .join('\n')
      result[`${encodingName}/${exclusionName}`] = computeHash(dataCheckString, botToken)
    }
  }
  return result
}

// Возвращает название сработавшего варианта или null. Название нужно только
// для логов: canonical — decoded/no_hash_signature.
export function matchInitData(initData: string, botToken: string): string | null {
  const hash = parseFields(initData).find((field) => field.key === 'hash')?.raw.trim().toLowerCase()
  if (!hash) return null
  for (const [name, candidate] of Object.entries(hashCandidates(initData, botToken))) {
    if (candidate === hash) return name
  }
  return null
}

export function validateInitData(initData: string, botToken: string) {
  return matchInitData(initData, botToken) !== null
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

// Все токены аккаунта, которыми может быть подписана initData. Отдельный токен
// нужен, когда панель оператора открывается из другого бота, чем клиентский
// мини-апп (например, @AlipayFastAppBot).
function knownTokens(): { name: string; token: string }[] {
  const entries: [string, string | undefined][] = [
    ['TELEGRAM_MINI_APP_BOT_TOKEN', process.env.TELEGRAM_MINI_APP_BOT_TOKEN],
    ['TELEGRAM_ADMIN_BOT_TOKEN', process.env.TELEGRAM_ADMIN_BOT_TOKEN],
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

  const candidates = knownTokens()
  if (!candidates.length) return { reason: 'no_bot_token' }

  if (process.env.TMA_DEBUG_DUMP === '1') {
    console.warn('[tma] raw initData', initData)
  }

  // Мини-апп может открываться разными ботами аккаунта (клиентский @AlipayFastBot,
  // админский @AlipayFastAppBot и т.п.), поэтому подпись проверяем против всех
  // известных токенов — но всё равно требуем валидную подпись initData.
  for (const entry of candidates) {
    const matched = matchInitData(initData, entry.token)
    if (!matched) continue
    if (entry.name !== 'TELEGRAM_MINI_APP_BOT_TOKEN') {
      console.warn('[tma] initData verified with', entry.name, `(${matched})`)
    } else if (matched !== 'decoded/no_hash_signature') {
      console.warn('[tma] initData matched non-canonical variant:', matched)
    }
    const parsed = getTelegramUser(initData)
    if (!parsed.user) return { reason: 'no_user' }
    return parsed
  }

  const data = parseInitData(initData)
  const primary = candidates[0]
  const computed = Object.fromEntries(
    Object.entries(hashCandidates(initData, primary.token)).map(([name, value]) => [name, value.slice(0, 16)]),
  )

  console.warn(
    '[tma] initData signature mismatch',
    JSON.stringify({
      fields: Object.keys(data).sort(),
      hasSignature: Boolean(data.signature),
      receivedHash: (data.hash ?? '').slice(0, 16),
      authDate: data.auth_date ?? null,
      initDataLength: initData.length,
      userId: data.user ? safeUserId(data.user) : null,
      tokensChecked: candidates.map((entry) => entry.name),
      computed,
    }),
  )
  return { reason: 'signature_mismatch' }
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
