import { NextResponse } from 'next/server'
import { listShowcaseItems } from '@/lib/store'
import { isDbConfigured } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ items: [] })
  }
  return NextResponse.json({ items: await listShowcaseItems() })
}
