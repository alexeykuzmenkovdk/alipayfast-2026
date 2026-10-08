import { NextResponse } from 'next/server'
import { getOrderById, markStepPaid } from '@/lib/store'
import { isDbConfigured } from '@/lib/db'
import { requireTelegramInitData } from '@/lib/tma'
import { notifyAsync, adminRoomKeyboard } from '@/lib/telegram-bot'

export async function POST(
  request: Request,
  { params }: { params: { orderId: string; stepId: string } },
) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const telegram = requireTelegramInitData(request.headers.get('x-telegram-init-data'))
  if (!telegram?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Отмечать оплату можно только в своей заявке.
  const order = await getOrderById(params.orderId)
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
  if (order.userId !== telegram.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const step = await markStepPaid(params.orderId, params.stepId, body.receiptFileUrl || undefined)
  if (!step) {
    return NextResponse.json({ error: 'Step not found' }, { status: 404 })
  }

  const adminId = process.env.ADMIN_USER_ID
  if (adminId) {
    const who = telegram.user.username ? `@${telegram.user.username}` : `ID ${telegram.user.id}`
    notifyAsync(
      Number(adminId),
      `✅ Клиент отметил оплату (${who})\nЗаявка #${params.orderId.slice(0, 6)}, этап ${step.stepIndex}\n\nПроверьте чек в админке.`,
      adminRoomKeyboard(),
    )
  }

  return NextResponse.json({ step })
}
