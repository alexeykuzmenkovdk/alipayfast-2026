import { NextResponse } from 'next/server'
import { completeOrder, getOrderById } from '@/lib/store'
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

  const result = await completeOrder(params.orderId)
  if (!result) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 409 })
  }

  notifyAsync(
    result.userId,
    `🎉 Заявка #${params.orderId.slice(0, 6)} завершена. Спасибо, что выбрали AlipayFast!`,
    dealRoomKeyboard(),
  )

  const order = await getOrderById(params.orderId)
  return NextResponse.json({ order: order ?? result })
}
