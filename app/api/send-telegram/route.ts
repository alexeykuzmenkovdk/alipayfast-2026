import { NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/lib/telegram'

interface OrderData {
  orderNumber: string
  name: string
  contact: string
  contactMethod: string
  telegramUsername?: string
  yuanAmount: string
  rubleAmount: string
  exchangeRate: number
  comment?: string
}

// Заявка на пополнение с сайта -> уведомление в Telegram.
export async function POST(request: Request) {
  try {
    const data: OrderData = await request.json()

    const message = `
<b>🔔 Новая заявка на пополнение Alipay!</b>

<b>Номер заявки:</b> ${data.orderNumber}
<b>Имя клиента:</b> ${data.name || '—'}
<b>Контакт:</b> ${data.contact} (${data.contactMethod})
${data.telegramUsername ? `<b>Ник в Telegram:</b> ${data.telegramUsername.startsWith('@') ? data.telegramUsername : '@' + data.telegramUsername}` : ''}
<b>Сумма:</b> ${data.yuanAmount} CNY (${data.rubleAmount} RUB)
<b>Курс:</b> ${data.exchangeRate} RUB
${data.comment ? `<b>Комментарий:</b> ${data.comment}` : ''}

<i>Дата и время:</i> ${new Date().toLocaleString('ru-RU')}
`.trim()

    const result = await sendTelegramMessage(message)

    if (result.demo) {
      return NextResponse.json({
        success: true,
        demo: true,
        message: 'Демо-режим: уведомление было бы отправлено в Telegram',
        setupRequired: true,
        setupInstructions:
          'Добавьте TELEGRAM_SITE_BOT_TOKEN и TELEGRAM_SITE_CHAT_ID в переменные окружения.',
      })
    }

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Заявка успешно отправлена в Telegram' })
    }

    return NextResponse.json({ success: false, error: result.error }, { status: 400 })
  } catch (error) {
    console.error('[SERVER] Ошибка обработки заявки:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Произошла ошибка при обработке заявки' },
      { status: 500 },
    )
  }
}
