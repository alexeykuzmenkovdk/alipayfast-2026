import { NextResponse } from 'next/server'
import { orderStats } from '@/lib/store'
import { isDbConfigured } from '@/lib/db'
import { isAdminRequest, adminUserId, checkAdminAccess } from '@/lib/admin-access'

export const dynamic = 'force-dynamic'

// Статистика сделок для админки и админского мини-аппа.
export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const access = checkAdminAccess(request)
  const stats = await orderStats()

  return NextResponse.json({
    ...stats,
    access: {
      via: access.via,
      userId: access.userId ?? null,
      adminUserId: adminUserId(),
    },
  })
}
