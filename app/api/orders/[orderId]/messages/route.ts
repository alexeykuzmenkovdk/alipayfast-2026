import { NextResponse } from 'next/server'
import { addMessage, listOrderMessages } from '@/lib/store'
import { isDbConfigured } from '@/lib/db'
import { requireTelegramInitData } from '@/lib/tma'
import { notifyAsync, notifyPhotoAsync, dealRoomKeyboard, isBotConfigured } from '@/lib/telegram-bot'

function isImage(url: string | undefined) {
  return Boolean(url && /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(url))
}

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
  if (!isDbConfigured()) {
    return NextResponse.json({ messages: [] })
  }

  const telegram = requireTelegramInitData(request.headers.get('x-telegram-init-data'))
  if (!telegram?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const messages = await listOrderMessages(params.orderId)
  return NextResponse.json({ messages })
}

export async function POST(request: Request, { params }: { params: { orderId: string } }) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const telegram = requireTelegramInitData(request.headers.get('x-telegram-init-data'))
  if (!telegram?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const text = String(body.text ?? '').trim()
  const fileUrl = typeof body.fileUrl === 'string' && body.fileUrl.trim() ? body.fileUrl.trim() : undefined
  if (!text && !fileUrl) {
    return NextResponse.json({ error: 'Empty message' }, { status: 400 })
  }

  const message = await addMessage({ orderId: params.orderId, senderRole: 'client', text: text || undefined, fileUrl })

  // Оператор должен узнать о сообщении, даже если админка закрыта.
  const adminId = process.env.ADMIN_USER_ID
  if (adminId && isBotConfigured()) {
    const who = telegram.user.username ? `@${telegram.user.username}` : `ID ${telegram.user.id}`
    const head = `✉️ Сообщение от клиента (${who})\nЗаявка #${params.orderId.slice(0, 6)}`
    if (fileUrl && isImage(fileUrl)) {
      notifyPhotoAsync(Number(adminId), fileUrl, `${head}\n\n${text || '📷 Картинка'}`, dealRoomKeyboard())
    } else {
      const preview = text || (fileUrl ? `📎 Вложение: ${fileUrl}` : '')
      notifyAsync(Number(adminId), `${head}\n\n${preview}`, dealRoomKeyboard())
    }
  }

  return NextResponse.json({ message })
}
