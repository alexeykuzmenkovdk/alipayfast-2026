// Уведомления о заявках с сайта и изменениях курса.
// Все обращения к Telegram идут через lib/net.ts → при необходимости через прокси.

import { telegramRequest, parseTelegramResponse, proxyUrl, telegramApiBase } from '@/lib/net'

export interface SendResult {
  success: boolean
  demo?: boolean
  error?: string
  viaProxy?: boolean
}

export function telegramCreds() {
  const botToken = process.env.TELEGRAM_SITE_BOT_TOKEN ?? process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_SITE_CHAT_ID ?? process.env.TELEGRAM_CHAT_ID
  return { botToken, chatId }
}

export async function sendTelegramMessage(message: string): Promise<SendResult> {
  const { botToken, chatId } = telegramCreds()

  if (!botToken || botToken === 'YOUR_BOT_TOKEN') {
    return {
      success: false,
      demo: true,
      error: 'Не настроен TELEGRAM_SITE_BOT_TOKEN. Добавьте его в переменные окружения.',
    }
  }

  if (!chatId || chatId === 'YOUR_CHAT_ID') {
    return {
      success: false,
      demo: true,
      error: 'Не настроен TELEGRAM_SITE_CHAT_ID. Добавьте его в переменные окружения.',
    }
  }

  const response = await telegramRequest(`${telegramApiBase()}/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
    timeoutMs: 10000,
  })

  const data = parseTelegramResponse(response)

  if (!data.ok) {
    const description = data.description ?? 'Ошибка отправки сообщения в Telegram'
    console.error('[TELEGRAM] Ошибка API:', description, response.viaProxy ? '(через прокси)' : '(напрямую)')
    return {
      success: false,
      viaProxy: response.viaProxy,
      error: description.includes('chat not found')
        ? 'Чат не найден. Проверьте TELEGRAM_SITE_CHAT_ID и напишите боту первым.'
        : description,
    }
  }

  return { success: true, viaProxy: response.viaProxy }
}

export function proxyInfo() {
  const url = proxyUrl()
  return url ? { enabled: true, url } : { enabled: false, url: '' }
}
