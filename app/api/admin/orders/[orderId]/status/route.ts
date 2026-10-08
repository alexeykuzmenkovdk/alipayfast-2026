import { NextResponse } from 'next/server'
import { getOrderById, setOrderStatus, type OrderStatus } from '@/lib/store'
import { isDbConfigured } from '@/lib/db'
import { adminUnauthorizedBody, isAdminRequest } from '@/lib/admin-access'
import { notifyAsync, dealRoomKeyboard } from '@/lib/telegram-bot'

export const dynamic = 'force-dynamic'

const ALLOWED: OrderStatus[] = ['CREATED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED']

const CLIENT_NOTICE: Record<OrderStatus, string> = {
  CREATED: 'Оператор вернул заявку в работу. Ожидайте реквизиты.',
  IN_PROGRESS: 'Оператор вернул заявку в работу.',
  COMPLETED: 'Оператор отметил заявку завершённой. Спасибо, что выбрали AlipayFast!',
  CANCELED: 'Оператор отменил заявку.',
}

// Смена статуса сделки оператором (в том числе из архива): отмена, завершение
// или возврат в активные. Клиенту уходит уведомление в Telegram.
export async function POST(request: Request, { params }: { params: { orderId: string } }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json(adminUnauthorizedBody(request), { status: 401 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const body = (await request.json().catch(() => null)) as { status?: string } | null
  const status = body?.status as OrderStatus | undefined
  if (!status || !ALLOWED.includes(status)) {
    return NextResponse.json({ error: 'Некорректный статус' }, { status: 400 })
  }

  const order = await setOrderStatus(params.orderId, status)
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  notifyAsync(
    order.userId,
    `ℹ️ Заявка #${params.orderId.slice(0, 6)}: ${CLIENT_NOTICE[status]}`,
    dealRoomKeyboard(),
  )

  const fresh = await getOrderById(params.orderId)
  return NextResponse.json({ order: fresh ?? order })
}
