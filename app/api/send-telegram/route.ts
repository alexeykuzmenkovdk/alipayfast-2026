import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { deliver, flushQueue, saveOrder, type SiteOrder } from '@/lib/site-orders'

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

// Заявка с сайта: сначала сохраняем, потом уведомляем Telegram.
// Если Telegram недоступен (сервер в РФ), заявка остаётся в очереди
// и досылается позже — клиент всё равно видит «заявка принята».
export async function POST(request: Request) {
  try {
    const data: OrderData = await request.json()

    if (!data?.contact?.trim() || !data?.orderNumber) {
      return NextResponse.json({ success: false, error: 'Не заполнены обязательные поля' }, { status: 400 })
    }

    const order: SiteOrder = {
      id: randomUUID(),
      orderNumber: String(data.orderNumber),
      name: String(data.name ?? ''),
      contact: String(data.contact),
      contactMethod: String(data.contactMethod ?? 'Telegram'),
      telegramUsername: data.telegramUsername ? String(data.telegramUsername) : undefined,
      yuanAmount: String(data.yuanAmount ?? ''),
      rubleAmount: String(data.rubleAmount ?? ''),
      exchangeRate: Number(data.exchangeRate ?? 0),
      comment: data.comment ? String(data.comment) : undefined,
      createdAt: new Date().toISOString(),
      telegram: { status: 'pending', attempts: 0 },
    }

    saveOrder(order)
    const result = await deliver(order)

    // Попутно досылаем то, что зависло раньше.
    void flushQueue()

    if (result.sent) {
      return NextResponse.json({ success: true, message: 'Заявка отправлена в Telegram' })
    }

    if (result.demo) {
      return NextResponse.json({
        success: true,
        demo: true,
        message: 'Демо-режим: заявка сохранена, уведомление не отправлено',
        setupRequired: true,
        setupInstructions: 'Добавьте TELEGRAM_SITE_BOT_TOKEN и TELEGRAM_SITE_CHAT_ID в переменные окружения.',
      })
    }

    console.error('[SITE-ORDER] Заявка сохранена, но Telegram недоступен:', result.error)
    return NextResponse.json({
      success: true,
      queued: true,
      message: 'Заявка принята. Уведомление оператору уйдёт автоматически.',
    })
  } catch (error) {
    console.error('[SERVER] Ошибка обработки заявки:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Произошла ошибка при обработке заявки' },
      { status: 500 },
    )
  }
}
