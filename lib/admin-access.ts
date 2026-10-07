// Доступ к админским эндпоинтам.
//
// Два способа:
//   1. Веб-админка — токен admin_<timestamp>_<random> (см. lib/admin-auth.ts).
//   2. Админский Telegram Mini App — подпись initData + Telegram ID оператора
//      из ADMIN_USER_ID. Так мини-апп получает доступ, не зная пароля.

import { telegramAuth } from '@/lib/tma'
import { isAuthenticated } from '@/lib/admin-auth'

export function adminUserId() {
  const raw = process.env.ADMIN_USER_ID
  return raw ? Number(raw) : null
}

export interface AdminAccess {
  ok: boolean
  via: 'token' | 'telegram' | 'none'
  userId?: number
  username?: string
  reason?: string
}

export function checkAdminAccess(request: Request): AdminAccess {
  const initData = request.headers.get('x-telegram-init-data')
  const auth = telegramAuth(initData)
  const expected = adminUserId()

  if (auth.user && expected !== null && auth.user.id === expected) {
    return { ok: true, via: 'telegram', userId: auth.user.id, username: auth.user.username }
  }

  // В разработке, когда ADMIN_USER_ID не задан, пускаем только демо-режим —
  // то есть открытие мини-аппа в браузере без данных Telegram. Реальные
  // Telegram-пользователи при этом доступа не получают.
  if (!initData && auth.user && expected === null && process.env.NODE_ENV !== 'production') {
    return { ok: true, via: 'telegram', userId: auth.user.id, username: auth.user.username }
  }

  if (isAuthenticated(request)) {
    return { ok: true, via: 'token' }
  }

  return { ok: false, via: 'none', reason: deniedReason({ initData, auth, expected }) }
}

// Причина отказа — в ответе API и на экране панели: без неё «Доступ только для
// оператора» не отличить от «открыли не из Telegram», «подпись не сошлась» и
// «зашли не под тем аккаунтом».
function deniedReason(input: {
  initData: string | null
  auth: ReturnType<typeof telegramAuth>
  expected: number | null
}) {
  if (!input.initData) return 'no_init_data'
  if (!input.auth.user) return input.auth.reason ?? 'unknown'
  if (input.expected === null) return 'admin_user_id_missing'
  return `not_operator:${input.auth.user.id}`
}

export function isAdminRequest(request: Request) {
  return checkAdminAccess(request).ok
}

// Тело 401 для админских ручек: кроме ошибки отдаём причину отказа.
export function adminUnauthorizedBody(request: Request) {
  return { error: 'Unauthorized', reason: checkAdminAccess(request).reason ?? 'unknown' }
}

// Отдельно для страницы: тот же доступ, но с понятной причиной отказа.
export function adminAccessDeniedReason(request: Request) {
  const access = checkAdminAccess(request)
  if (access.ok) return null

  const expected = adminUserId()
  if (expected === null) {
    return 'Не задан ADMIN_USER_ID — мини-апп оператора недоступен.'
  }
  return 'Доступ есть только у оператора. Откройте это приложение из бота под своим Telegram-аккаунтом.'
}
