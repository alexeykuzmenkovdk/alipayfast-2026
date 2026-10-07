import { NextResponse } from 'next/server'
import { createSourcingRequest, getLastSourcingRequest } from '@/lib/store'
import { isDbConfigured } from '@/lib/db'
import { requireTelegramInitData } from '@/lib/tma'
import { sendMessage, sendPhoto, isBotConfigured } from '@/lib/telegram-bot'

const HOURS_LIMIT = 48

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const telegram = requireTelegramInitData(request.headers.get('x-telegram-init-data'))
  if (!telegram?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const lastRequest = await getLastSourcingRequest(telegram.user.id)
  if (lastRequest) {
    const hoursSince = (Date.now() - new Date(lastRequest.createdAt).getTime()) / 36e5
    if (hoursSince < HOURS_LIMIT) {
      return NextResponse.json(
        { error: 'Cooldown', nextAvailableHours: Math.ceil(HOURS_LIMIT - hoursSince) },
        { status: 429 },
      )
    }
  }

  const body = await request.json()
  const description = String(body.description ?? '').trim()
  if (!description) {
    return NextResponse.json({ error: 'Empty description' }, { status: 400 })
  }

  const requestItem = await createSourcingRequest({
    userId: telegram.user.id,
    description,
    imageUrl: body.imageUrl ? String(body.imageUrl) : '',
    link: body.link ? String(body.link) : undefined,
    priceRub: body.priceRub ? Number(body.priceRub) : undefined,
  })

  const adminId = process.env.ADMIN_USER_ID
  if (adminId && isBotConfigured()) {
    const captionLines = [`🔍 Запрос #${requestItem.id.slice(0, 6)}`, `Описание: ${requestItem.description}`]
    if (requestItem.priceRub) {
      captionLines.push(`Цена РФ: ${requestItem.priceRub.toLocaleString('ru-RU')} ₽`)
    }
    if (requestItem.link) {
      captionLines.push(`Ссылка: ${requestItem.link}`)
    }
    const caption = captionLines.join('\n')

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: 'Ответить ценой', callback_data: `sourcing_answer:${requestItem.id}` },
          { text: 'Отклонить', callback_data: `sourcing_decline:${requestItem.id}` },
        ],
      ],
    }

    if (requestItem.imageUrl) {
      sendPhoto({ chat_id: Number(adminId), photo: requestItem.imageUrl, caption, reply_markup: replyMarkup }).catch(
        () => null,
      )
    } else {
      sendMessage({ chat_id: Number(adminId), text: caption, reply_markup: replyMarkup }).catch(() => null)
    }
  }

  return NextResponse.json({ request: requestItem })
}
