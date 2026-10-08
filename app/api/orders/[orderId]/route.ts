import { NextResponse } from 'next/server'
import { getOrderById, listOrderMessages, listOrderSteps } from '@/lib/store'
import { isDbConfigured } from '@/lib/db'
import { requireTelegramInitData } from '@/lib/tma'

export const dynamic = 'force-dynamic'

// Заявка клиента (в том числе архивная) вместе с этапами и перепиской.
// Отдаём только владельцу заявки — иначе по чужому ID можно было бы читать чат.
export async function GET(request: Request, { params }: { params: { orderId: string } }) {
  if (!isDbConfigured()) {
    return NextResponse.json({ order: null, steps: [], messages: [] })
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

  const [steps, messages] = await Promise.all([listOrderSteps(order.id), listOrderMessages(order.id)])
  return NextResponse.json({ order, steps, messages })
}
