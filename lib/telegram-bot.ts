// Вызовы Telegram Bot API для бота мини-приложения.

import { MINI_APP_FALLBACK_LINK } from '@/lib/deal-room'
import { telegramRequest, parseTelegramResponse, telegramApiBase } from '@/lib/net'

interface SendMessagePayload {
  chat_id: number
  text: string
  reply_markup?: unknown
}

interface SendPhotoPayload {
  chat_id: number
  photo: string
  caption?: string
  reply_markup?: unknown
}

// Адрес Bot API можно подменить (TELEGRAM_API_BASE) — удобно для локальных тестов.
const apiBase = telegramApiBase

// Жёсткий таймаут: Telegram не должен подвешивать обработку запроса.
const TIMEOUT_MS = 8000

function getBotToken() {
  const token = process.env.TELEGRAM_MINI_APP_BOT_TOKEN ?? process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    throw new Error('Missing TELEGRAM_MINI_APP_BOT_TOKEN')
  }
  return token
}

export function isBotConfigured() {
  return Boolean(process.env.TELEGRAM_MINI_APP_BOT_TOKEN ?? process.env.TELEGRAM_BOT_TOKEN)
}

// Кнопка «вернуться в комнату сделки»: в Telegram открывает мини-приложение.
// Для web_app нужен https-адрес; если его нет — ведём по ссылке на бота.
export function dealRoomKeyboard() {
  const webAppUrl = process.env.MINI_APP_URL
  if (webAppUrl?.startsWith('https://')) {
    return { inline_keyboard: [[{ text: 'Открыть комнату сделки', web_app: { url: webAppUrl } }]] }
  }
  return {
    inline_keyboard: [
      [{ text: 'Открыть комнату сделки', url: process.env.TELEGRAM_MINI_APP_LINK ?? MINI_APP_FALLBACK_LINK }],
    ],
  }
}

// Кнопка для оператора: уведомление о сообщении клиента должно вести в панель
// оператора, а не в клиентское мини-приложение.
export function adminRoomKeyboard() {
  const webAppUrl = process.env.ADMIN_MINI_APP_URL
  if (!webAppUrl) return undefined
  if (webAppUrl.startsWith('https://')) {
    return { inline_keyboard: [[{ text: 'Открыть панель оператора', web_app: { url: webAppUrl } }]] }
  }
  return { inline_keyboard: [[{ text: 'Открыть панель оператора', url: webAppUrl }]] }
}

export async function sendMessage(payload: SendMessagePayload) {
  const token = getBotToken()
  const response = await telegramRequest(`${apiBase()}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    timeoutMs: TIMEOUT_MS,
  })
  return parseTelegramResponse(response)
}

export async function sendPhoto(payload: SendPhotoPayload) {
  const token = getBotToken()
  const response = await telegramRequest(`${apiBase()}/bot${token}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    timeoutMs: TIMEOUT_MS,
  })
  return parseTelegramResponse(response)
}

export async function getFileUrl(fileId: string) {
  const token = getBotToken()
  const response = await telegramRequest(`${apiBase()}/bot${token}/getFile?file_id=${fileId}`, {
    timeoutMs: TIMEOUT_MS,
  })
  const data = parseTelegramResponse(response)
  if (!data.ok) return null
  const result = data.result as { file_path?: string } | undefined
  if (!result?.file_path) return null
  return `${apiBase()}/file/bot${token}/${result.file_path}`
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  const token = getBotToken()
  await telegramRequest(`${apiBase()}/bot${token}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
    timeoutMs: TIMEOUT_MS,
  })
}

export interface NotifyResult {
  ok: boolean
  description?: string
  messageId?: number
}

// Отправка уведомления пользователю. Никогда не бросает исключение:
// уведомление не должно ломать основной сценарий заявки.
// Сетевые сбои (прокси/Telegram) повторяем один раз — они обычно короткие.
export async function notify(
  userId: number,
  text: string,
  replyMarkup?: unknown,
  onResult?: (result: NotifyResult) => void,
): Promise<NotifyResult> {
  if (!isBotConfigured() || !userId) {
    const result: NotifyResult = { ok: false, description: 'bot_not_configured' }
    onResult?.(result)
    return result
  }

  let last: NotifyResult = { ok: false, description: 'unknown' }

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await sendMessage({ chat_id: userId, text, reply_markup: replyMarkup })
      if (response.ok) {
        const messageId = (response.result as { message_id?: number } | undefined)?.message_id
        last = { ok: true, messageId }
        onResult?.(last)
        return last
      }

      last = { ok: false, description: String(response.description ?? '') || 'telegram_error' }
      const retryable = /timeout|econn|socket|network|некорректн/i.test(last.description ?? '')
      if (!retryable || attempt === 2) break
    } catch (error) {
      last = { ok: false, description: error instanceof Error ? error.message : 'network_error' }
      if (attempt === 2) break
    }
    await new Promise((resolve) => setTimeout(resolve, 700))
  }

  console.error('[TELEGRAM] Уведомление не доставлено:', last.description, { userId })
  onResult?.(last)
  return last
}

// То же, но без ожидания: ответ клиенту не должен зависеть от доступности
// Telegram. Если Telegram тормозит, пользователь этого не почувствует.
export function notifyAsync(
  userId: number,
  text: string,
  replyMarkup?: unknown,
  onResult?: (result: NotifyResult) => void,
) {
  void notify(userId, text, replyMarkup, onResult)
}

// Превращает ссылку на загрузку (/uploads/..) в абсолютную — Telegram sendPhoto
// требует публично доступный URL, относительный путь он не примет.
export function absoluteUploadUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://alipayfast.ru').replace(/\/$/, '')
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

// Отправка картинки-вложения в Telegram (с подписью). При сбое тихо откатываемся
// на обычное текстовое уведомление, чтобы получатель хотя бы узнал о сообщении.
export function notifyPhotoAsync(
  userId: number,
  fileUrl: string,
  caption: string,
  replyMarkup?: unknown,
  onResult?: (result: NotifyResult) => void,
) {
  if (!isBotConfigured() || !userId) {
    onResult?.({ ok: false, description: 'bot_not_configured' })
    return
  }
  void (async () => {
    try {
      const response = await sendPhoto({
        chat_id: userId,
        photo: absoluteUploadUrl(fileUrl),
        caption,
        reply_markup: replyMarkup,
      })
      if (response.ok) {
        const messageId = (response.result as { message_id?: number } | undefined)?.message_id
        onResult?.({ ok: true, messageId })
        return
      }
      console.error('[TELEGRAM] Фото не отправлено, шлём текст:', response.description)
    } catch (error) {
      console.error('[TELEGRAM] Не удалось отправить фото, шлём текст:', error)
    }
    const fallback = await notify(userId, `${caption}
${absoluteUploadUrl(fileUrl)}`, replyMarkup)
    onResult?.(fallback)
  })()
}
