import { NextResponse } from 'next/server'
import { listOrders, type OrderStatus } from '@/lib/store'
import { isDbConfigured } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-access'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ orders: [], dbConfigured: false })
  }

  const status = new URL(request.url).searchParams.get('status')
  const filter: OrderStatus[] | undefined =
    status === 'active'
      ? ['CREATED', 'IN_PROGRESS']
      : status === 'archive'
        ? ['COMPLETED', 'CANCELED']
        : undefined

  const orders = await listOrders(filter)
  return NextResponse.json({ orders })
}
