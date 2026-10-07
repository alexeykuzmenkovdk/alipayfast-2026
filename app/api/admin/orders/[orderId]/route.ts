import { NextResponse } from 'next/server'
import { getOrderById, listOrderSteps } from '@/lib/store'
import { isDbConfigured } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-access'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ order: null, steps: [] })
  }

  const order = await getOrderById(params.orderId)
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const steps = await listOrderSteps(order.id)
  return NextResponse.json({ order, steps })
}
