// Доступ к админским эндпоинтам.
//
// Два способа:
//   1. Веб-админка — токен admin_<timestamp>_<random> (см. lib/admin-auth.ts).
//   2. Админский Telegram Mini App — подпись initData + Telegram ID оператора
//      из ADMIN_USER_ID. Так мини-апп получает доступ, не зная пароля.

import { requireTelegramInitData } from '@/lib/tma'
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
}

export function checkAdminAccess(request: Request): AdminAccess {
  const initData = request.headers.get('x-telegram-init-data')
  const telegram = requireTelegramInitData(initData)
  const expected = adminUserId()

  if (telegram?.user && expected !== null && telegram.user.id === expected) {
    return { ok: true, via: 'telegram', userId: telegram.user.id, username: telegram.user.username }
  }

  // В разработке, когда ADMIN_USER_ID не задан, пускаем только демо-режим —
  // то есть открытие мини-аппа в браузере без данных Telegram. Реальные
  // Telegram-пользователи при этом доступа не получают.
  if (!initData && telegram?.user && expected === null && process.env.NODE_ENV !== 'production') {
    return { ok: true, via: 'telegram', userId: telegram.user.id, username: telegram.user.username }
  }

  if (isAuthenticated(request)) {
    return { ok: true, via: 'token' }
  }

  return { ok: false, via: 'none' }
}

export function isAdminRequest(request: Request) {
  return checkAdminAccess(request).ok
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
