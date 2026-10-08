import { NextResponse } from 'next/server'
import { addMessage, getOrderById, listOrderMessages } from '@/lib/store'
import { isDbConfigured } from '@/lib/db'
import { requireTelegramInitData, type TelegramUser } from '@/lib/tma'
import { notifyAsync, notifyPhotoAsync, adminRoomKeyboard, isBotConfigured } from '@/lib/telegram-bot'

function isImage(url: string | undefined) {
  return Boolean(url && /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(url))
}

// Переписка доступна только владельцу заявки — иначе по чужому ID любой
// авторизованный клиент читал бы и писал в чужой чат.
async function ownedOrder(
  request: Request,
  orderId: string,
): Promise<{ error?: NextResponse; user?: TelegramUser }> {
  const telegram = requireTelegramInitData(request.headers.get('x-telegram-init-data'))
  if (!telegram?.user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const order = await getOrderById(orderId)
  if (!order) return { error: NextResponse.json({ error: 'Order not found' }, { status: 404 }) }
  if (order.userId !== telegram.user.id) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { user: telegram.user }
}

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
  if (!isDbConfigured()) {
    return NextResponse.json({ messages: [] })
  }

  const owned = await ownedOrder(request, params.orderId)
  if (owned.error) return owned.error

  const messages = await listOrderMessages(params.orderId)
  return NextResponse.json({ messages })
}

export async function POST(request: Request, { params }: { params: { orderId: string } }) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const owned = await ownedOrder(request, params.orderId)
  if (owned.error) return owned.error
  const user = owned.user!

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
    const who = user.username ? `@${user.username}` : `ID ${user.id}`
    const head = `✉️ Сообщение от клиента (${who})\nЗаявка #${params.orderId.slice(0, 6)}`
    if (fileUrl && isImage(fileUrl)) {
      notifyPhotoAsync(Number(adminId), fileUrl, `${head}\n\n${text || '📷 Картинка'}`, adminRoomKeyboard())
    } else {
      const preview = text || (fileUrl ? `📎 Вложение: ${fileUrl}` : '')
      notifyAsync(Number(adminId), `${head}\n\n${preview}`, adminRoomKeyboard())
    }
  }

  return NextResponse.json({ message })
}
