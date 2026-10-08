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

// Отправка уведомления пользователю. Никогда не бросает исключение:
// уведомление не должно ломать основной сценарий заявки.
export async function notify(userId: number, text: string, replyMarkup?: unknown) {
  if (!isBotConfigured() || !userId) return
  try {
    await sendMessage({ chat_id: userId, text, reply_markup: replyMarkup })
  } catch (error) {
    console.error('[TELEGRAM] Не удалось отправить уведомление:', error)
  }
}

// То же, но без ожидания: ответ клиенту не должен зависеть от доступности
// Telegram. Если Telegram тормозит, пользователь этого не почувствует.
export function notifyAsync(userId: number, text: string, replyMarkup?: unknown) {
  void notify(userId, text, replyMarkup)
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
export function notifyPhotoAsync(userId: number, fileUrl: string, caption: string, replyMarkup?: unknown) {
  if (!isBotConfigured() || !userId) return
  void (async () => {
    try {
      await sendPhoto({ chat_id: userId, photo: absoluteUploadUrl(fileUrl), caption, reply_markup: replyMarkup })
    } catch (error) {
      console.error('[TELEGRAM] Не удалось отправить фото, шлём текст:', error)
      await notify(userId, `${caption}\n${absoluteUploadUrl(fileUrl)}`, replyMarkup)
    }
  })()
}
