import { NextResponse } from 'next/server'
import { addMessage, getOrderById, listOrderMessages } from '@/lib/store'
import { isDbConfigured } from '@/lib/db'
import { adminUnauthorizedBody, isAdminRequest } from '@/lib/admin-access'
import { notifyAsync, notifyPhotoAsync, dealRoomKeyboard } from '@/lib/telegram-bot'

function isImage(url: string | undefined) {
  return Boolean(url && /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(url))
}

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json(adminUnauthorizedBody(request), { status: 401 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ messages: [] })
  }

  const messages = await listOrderMessages(params.orderId)
  return NextResponse.json({ messages })
}

export async function POST(request: Request, { params }: { params: { orderId: string } }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json(adminUnauthorizedBody(request), { status: 401 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const body = await request.json()
  const text = String(body.text ?? '').trim()
  const fileUrl = typeof body.fileUrl === 'string' && body.fileUrl.trim() ? body.fileUrl.trim() : undefined
  if (!text && !fileUrl) {
    return NextResponse.json({ error: 'Empty message' }, { status: 400 })
  }

  const order = await getOrderById(params.orderId)
  const message = await addMessage({ orderId: params.orderId, senderRole: 'admin', text: text || undefined, fileUrl })

  // Клиент получает сообщение в Telegram, даже если приложение закрыто.
  if (order) {
    const head = `✉️ Оператор ответил по заявке #${params.orderId.slice(0, 6)}`
    if (fileUrl && isImage(fileUrl)) {
      notifyPhotoAsync(order.userId, fileUrl, `${head}\n\n${text || '📷 Картинка'}`, dealRoomKeyboard())
    } else {
      const payload = text || (fileUrl ? `📎 Вложение: ${fileUrl}` : '')
      notifyAsync(order.userId, `${head}\n\n${payload}`, dealRoomKeyboard())
    }
  }

  return NextResponse.json({ message })
}
