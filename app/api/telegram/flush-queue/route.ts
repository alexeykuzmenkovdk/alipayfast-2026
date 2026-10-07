import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { flushQueue, listOrders, pendingOrders } from '@/lib/site-orders'

export const dynamic = 'force-dynamic'

// Досылка заявок, которые не ушли в Telegram (например, когда прокси был выключен).
export async function POST(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const before = pendingOrders().length
  const result = await flushQueue(50)

  return NextResponse.json({
    ...result,
    before,
    sentCount: result.sent.length,
  })
}

// Список заявок с сайта и размер очереди.
export async function GET(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orders = listOrders(100)
  return NextResponse.json({
    pending: orders.filter((order) => order.telegram.status === 'pending').length,
    total: orders.length,
    orders,
  })
}
