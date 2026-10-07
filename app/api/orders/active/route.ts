import { NextResponse } from 'next/server'
import { getActiveOrder, listOrderMessages, listOrderSteps } from '@/lib/store'
import { isDbConfigured } from '@/lib/db'
import { telegramAuth } from '@/lib/tma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ order: null, dbConfigured: false })
  }

  const telegram = telegramAuth(request.headers.get('x-telegram-init-data'))
  if (!telegram.user) {
    return NextResponse.json({ error: 'Unauthorized', reason: telegram.reason ?? 'unknown' }, { status: 401 })
  }

  const order = await getActiveOrder(telegram.user.id)
  if (!order) {
    return NextResponse.json({ order: null })
  }

  const steps = await listOrderSteps(order.id)
  const messages = await listOrderMessages(order.id)
  return NextResponse.json({ order, steps, messages })
}
