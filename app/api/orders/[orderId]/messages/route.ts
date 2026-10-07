import { NextResponse } from 'next/server'
import { addMessage, listOrderMessages } from '@/lib/store'
import { isDbConfigured } from '@/lib/db'
import { requireTelegramInitData } from '@/lib/tma'
import { notifyAsync, dealRoomKeyboard, isBotConfigured } from '@/lib/telegram-bot'

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
  if (!text) {
    return NextResponse.json({ error: 'Empty message' }, { status: 400 })
  }

  const message = await addMessage({ orderId: params.orderId, senderRole: 'client', text })

  // Оператор должен узнать о сообщении, даже если админка закрыта.
  const adminId = process.env.ADMIN_USER_ID
  if (adminId && isBotConfigured()) {
    const who = telegram.user.username ? `@${telegram.user.username}` : `ID ${telegram.user.id}`
    notifyAsync(
      Number(adminId),
      `✉️ Сообщение от клиента (${who})\nЗаявка #${params.orderId.slice(0, 6)}\n\n${text}`,
      dealRoomKeyboard(),
    )
  }

  return NextResponse.json({ message })
}
