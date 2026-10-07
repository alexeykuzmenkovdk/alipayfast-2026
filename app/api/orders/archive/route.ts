import { NextResponse } from 'next/server'
import { listUserArchivedOrders } from '@/lib/store'
import { isDbConfigured } from '@/lib/db'
import { requireTelegramInitData } from '@/lib/tma'

export const dynamic = 'force-dynamic'

// Закрытые сделки клиента: завершённые и отменённые заявки этого пользователя.
export async function GET(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ orders: [], dbConfigured: false })
  }

  const telegram = requireTelegramInitData(request.headers.get('x-telegram-init-data'))
  if (!telegram?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orders = await listUserArchivedOrders(telegram.user.id)
  return NextResponse.json({ orders })
}
