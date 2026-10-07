import { NextResponse } from 'next/server'
import { createOrder, getActiveOrder, listOrderMessages, listOrderSteps } from '@/lib/store'
import { isDbConfigured } from '@/lib/db'
import { telegramAuth } from '@/lib/tma'
import { notifyAsync } from '@/lib/telegram-bot'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const telegram = telegramAuth(request.headers.get('x-telegram-init-data'))
  if (!telegram.user) {
    return NextResponse.json({ error: 'Unauthorized', reason: telegram.reason ?? 'unknown' }, { status: 401 })
  }

  const existing = await getActiveOrder(telegram.user.id)
  if (existing) {
    return NextResponse.json({ error: 'Active order exists' }, { status: 409 })
  }

  const body = await request.json()
  const totalRub = Number(body.totalRub)
  const totalCny = Number(body.totalCny)
  const rate = Number(body.rate)

  if (!Number.isFinite(totalRub) || !Number.isFinite(totalCny) || !Number.isFinite(rate) || totalRub <= 0 || totalCny <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const contactPhone = body.contactPhone ? String(body.contactPhone) : undefined
  const order = await createOrder({
    userId: telegram.user.id,
    totalRub: Math.round(totalRub),
    totalCny: Math.round(totalCny),
    rate,
    contactUsername: telegram.user.username ?? telegram.user.first_name,
    contactPhone,
    username: telegram.user.username,
  })

  const steps = await listOrderSteps(order.id)
  const messages = await listOrderMessages(order.id)

  // Оператор узнаёт о заявке сразу, а не когда откроет админку.
  const adminId = process.env.ADMIN_USER_ID
  if (adminId) {
    const who = telegram.user.username ? `@${telegram.user.username}` : contactPhone ?? `ID ${telegram.user.id}`
    notifyAsync(
      Number(adminId),
      [
        `🆕 Новая заявка #${order.id.slice(0, 6)}`,
        '',
        `Отдаёт: ${order.totalRub.toLocaleString('ru-RU')} ₽`,
        `Получает: ${order.totalCny.toLocaleString('ru-RU')} ¥`,
        `Курс: ${order.rate.toFixed(2)} ₽`,
        `Клиент: ${who}`,
        '',
        'Откройте админку, чтобы прислать реквизиты.',
      ].join('\n'),
    )
  }

  return NextResponse.json({ order, steps, messages })
}
