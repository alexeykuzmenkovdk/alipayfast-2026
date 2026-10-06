// Отправка уведомлений в Telegram (заявки с сайта, изменения курса).

export interface SendResult {
  success: boolean
  demo?: boolean
  error?: string
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

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
    })

    const data = await response.json()
    if (!data.ok) {
      console.error('[TELEGRAM] Ошибка API:', data.description)
      return {
        success: false,
        error:
          data.description?.includes('chat not found')
            ? 'Чат не найден. Проверьте TELEGRAM_SITE_CHAT_ID и напишите боту первым.'
            : data.description || 'Ошибка отправки сообщения в Telegram',
      }
    }
    return { success: true }
  } catch (error) {
    console.error('[TELEGRAM] Ошибка отправки:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка при отправке сообщения',
    }
  }
}
