import { NextResponse } from 'next/server'
import { addShowcaseItem, listAllShowcaseItems, setShowcasePublish } from '@/lib/store'
import { isDbConfigured } from '@/lib/db'
import { adminUnauthorizedBody, isAdminRequest } from '@/lib/admin-access'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json(adminUnauthorizedBody(request), { status: 401 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ items: [], dbConfigured: false })
  }

  const items = await listAllShowcaseItems()
  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json(adminUnauthorizedBody(request), { status: 401 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const body = await request.json()
  const item = await addShowcaseItem({
    title: String(body.title ?? '').trim(),
    imageUrl: String(body.imageUrl ?? '').trim(),
    priceCny: Number(body.priceCny),
    priceRub: Number(body.priceRub),
    benefitRub: Number(body.benefitRub),
    isPublished: Boolean(body.isPublished),
  })

  return NextResponse.json({ item })
}

export async function PATCH(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json(adminUnauthorizedBody(request), { status: 401 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const body = await request.json()
  const item = await setShowcasePublish(String(body.id), Boolean(body.isPublished))
  return NextResponse.json({ item })
}
