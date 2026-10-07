import { NextResponse } from 'next/server'
import { addMessage, addPaymentStep, getOrderById } from '@/lib/store'
import { isDbConfigured } from '@/lib/db'
import { adminUnauthorizedBody, isAdminRequest } from '@/lib/admin-access'
import { notifyAsync, dealRoomKeyboard } from '@/lib/telegram-bot'
import { stepReadyText } from '@/lib/deal-room'

export async function POST(request: Request, { params }: { params: { orderId: string } }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json(adminUnauthorizedBody(request), { status: 401 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const body = await request.json()
  const order = await getOrderById(params.orderId)
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const step = await addPaymentStep({
    orderId: params.orderId,
    amountRub: Number(body.amountRub),
    method: body.method === 'CARD' ? 'CARD' : 'SBP',
    requisiteValue: String(body.requisiteValue ?? ''),
    bankName: String(body.bankName ?? 'Т-Банк'),
    receiptEmail: String(body.receiptEmail ?? ''),
    status: body.status,
  })

  // Реквизиты дублируем в чат сделки и в Telegram клиенту.
  await addMessage({ orderId: params.orderId, senderRole: 'admin', text: stepReadyText({ ...step, orderId: order.id }) })
  notifyAsync(
    order.userId,
    stepReadyText({ ...step, orderId: order.id }),
    dealRoomKeyboard(),
  )

  return NextResponse.json({ step })
}
