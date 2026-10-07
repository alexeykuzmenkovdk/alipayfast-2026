import { NextResponse } from 'next/server'
import { cancelOrder, listOrderMessages, listOrderSteps } from '@/lib/store'
import { isDbConfigured } from '@/lib/db'
import { requireTelegramInitData } from '@/lib/tma'
import { notifyAsync } from '@/lib/telegram-bot'

export async function POST(request: Request, { params }: { params: { orderId: string } }) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const telegram = requireTelegramInitData(request.headers.get('x-telegram-init-data'))
  if (!telegram?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const order = await cancelOrder(params.orderId)
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const adminId = process.env.ADMIN_USER_ID
  if (adminId) {
    const who = telegram.user.username ? `@${telegram.user.username}` : `ID ${telegram.user.id}`
    notifyAsync(Number(adminId), `⛔️ Клиент отменил заявку #${params.orderId.slice(0, 6)} (${who}).`)
  }

  const steps = await listOrderSteps(order.id)
  const messages = await listOrderMessages(order.id)
  return NextResponse.json({ order, steps, messages })
}
