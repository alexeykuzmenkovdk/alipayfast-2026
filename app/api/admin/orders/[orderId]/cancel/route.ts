import { NextResponse } from 'next/server'
import { adminCancelOrder } from '@/lib/store'
import { isDbConfigured } from '@/lib/db'
import { adminUnauthorizedBody, isAdminRequest } from '@/lib/admin-access'
import { notifyAsync, dealRoomKeyboard } from '@/lib/telegram-bot'

export async function POST(request: Request, { params }: { params: { orderId: string } }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json(adminUnauthorizedBody(request), { status: 401 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const order = await adminCancelOrder(params.orderId)
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  notifyAsync(
    order.userId,
    `⛔️ Заявка #${params.orderId.slice(0, 6)} отменена оператором.\n\nЕсли это ошибка — напишите в комнате сделки.`,
    dealRoomKeyboard(),
  )

  return NextResponse.json({ order })
}
