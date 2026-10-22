import { NextResponse } from 'next/server'
import { getOrderById, markOrderMessagesRead } from '@/lib/store'
import { isDbConfigured } from '@/lib/db'
import { requireTelegramInitData } from '@/lib/tma'

export const dynamic = 'force-dynamic'

// Клиент открыл чат сделки в мини-приложении: отмечаем ответы оператора
// прочитанными. Это единственный честный сигнал — Bot API не отдаёт
// информацию о прочтении сообщений бота.
export async function POST(request: Request, { params }: { params: { orderId: string } }) {
  if (!isDbConfigured()) {
    return NextResponse.json({ ok: false, read: 0 })
  }

  const telegram = requireTelegramInitData(request.headers.get('x-telegram-init-data'))
  if (!telegram?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const order = await getOrderById(params.orderId)
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
  if (order.userId !== telegram.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const read = await markOrderMessagesRead(params.orderId)
  return NextResponse.json({ ok: true, read })
}
