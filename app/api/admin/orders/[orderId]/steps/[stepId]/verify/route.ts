import { NextResponse } from 'next/server'
import { getOrderById, verifyPaymentStep } from '@/lib/store'
import { isDbConfigured } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-access'
import { notifyAsync, dealRoomKeyboard } from '@/lib/telegram-bot'

export async function POST(
  request: Request,
  { params }: { params: { orderId: string; stepId: string } },
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const step = await verifyPaymentStep(params.orderId, params.stepId)
  if (!step) {
    return NextResponse.json({ error: 'Step not found' }, { status: 404 })
  }

  const order = await getOrderById(params.orderId)
  if (order) {
    notifyAsync(
      order.userId,
      `✅ Платёж по заявке #${params.orderId.slice(0, 6)} подтверждён.\n\nЮани зачисляются на Alipay в течение ~15 минут. Следующий этап оператор откроет отдельно.`,
      dealRoomKeyboard(),
    )
  }

  return NextResponse.json({ step })
}
