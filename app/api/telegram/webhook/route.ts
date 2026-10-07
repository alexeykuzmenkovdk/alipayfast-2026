import { NextResponse } from 'next/server'
import {
  addShowcaseItem,
  answerSourcingRequest,
  declineSourcingRequest,
  getAdminSession,
  publishShowcaseItem,
  setAdminSession,
} from '@/lib/store'
import { isDbConfigured } from '@/lib/db'
import { answerCallbackQuery, getFileUrl, sendMessage, sendPhoto, isBotConfigured } from '@/lib/telegram-bot'

export const dynamic = 'force-dynamic'

function exchangeRate() {
  const configured = Number(process.env.SHOWCASE_EXCHANGE_RATE)
  return Number.isFinite(configured) && configured > 0 ? configured : 12.5
}

function getAdminId() {
  const adminId = process.env.ADMIN_USER_ID
  return adminId ? Number(adminId) : undefined
}

export async function POST(request: Request) {
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (webhookSecret) {
    const receivedSecret = request.headers.get('x-telegram-bot-api-secret-token')
    if (receivedSecret !== webhookSecret) {
      return NextResponse.json({ ok: false }, { status: 401 })
    }
  }

  if (!isDbConfigured() || !isBotConfigured()) {
    return NextResponse.json({ ok: true })
  }

  const body = await request.json()
  const adminId = getAdminId()
  if (!adminId) {
    return NextResponse.json({ ok: true })
  }
  const message = body.message
  const callbackQuery = body.callback_query

  if (callbackQuery?.data?.startsWith('publish_showcase:') && callbackQuery.from?.id === adminId) {
    const itemId = String(callbackQuery.data).split(':')[1]
    const item = await publishShowcaseItem(itemId)
    await answerCallbackQuery(callbackQuery.id, item ? 'Опубликовано' : 'Не найдено')
    return NextResponse.json({ ok: true })
  }

  if (callbackQuery?.data?.startsWith('sourcing_answer:') && callbackQuery.from?.id === adminId) {
    const requestId = String(callbackQuery.data).split(':')[1]
    await setAdminSession(adminId, { stage: 'await_sourcing_answer', sourcingRequestId: requestId })
    await answerCallbackQuery(callbackQuery.id, 'Введите цену в CNY')
    await sendMessage({ chat_id: adminId, text: 'Введите цену в CNY (можно добавить комментарий через |).' })
    return NextResponse.json({ ok: true })
  }

  if (callbackQuery?.data?.startsWith('sourcing_decline:') && callbackQuery.from?.id === adminId) {
    const requestId = String(callbackQuery.data).split(':')[1]
    const declined = await declineSourcingRequest(requestId)
    await answerCallbackQuery(callbackQuery.id, declined ? 'Отклонено' : 'Не найдено')
    if (declined) {
      await sendMessage({
        chat_id: declined.userId,
        text: `К сожалению, мы не можем обработать запрос #${declined.id.slice(0, 6)}.`,
      })
    }
    return NextResponse.json({ ok: true })
  }

  if (!message || message.from?.id !== adminId) {
    return NextResponse.json({ ok: true })
  }

  const session = await getAdminSession(adminId)

  if (message.text === '/admin') {
    const url = process.env.ADMIN_MINI_APP_URL
    const replyMarkup = url
      ? {
          inline_keyboard: [
            [
              url.startsWith('https://')
                ? { text: 'Открыть панель оператора', web_app: { url } }
                : { text: 'Открыть панель оператора', url },
            ],
          ],
        }
      : undefined
    await sendMessage({
      chat_id: adminId,
      text: replyMarkup
        ? 'Панель оператора: заявки, чат с клиентами, реквизиты и статистика.'
        : 'Панель оператора открывается по адресу /admin/tg. Задайте ADMIN_MINI_APP_URL, чтобы получить кнопку здесь.',
      reply_markup: replyMarkup,
    })
    return NextResponse.json({ ok: true })
  }

  if (message.text === '/new_item') {
    await setAdminSession(adminId, { stage: 'await_photo' })
    await sendMessage({ chat_id: adminId, text: 'Пришли фото товара' })
    return NextResponse.json({ ok: true })
  }

  if (session.stage === 'await_photo' && Array.isArray(message.photo)) {
    const bestPhoto = message.photo[message.photo.length - 1]
    const photoUrl = await getFileUrl(bestPhoto.file_id)
    if (photoUrl) {
      await setAdminSession(adminId, { stage: 'await_details', photoUrl })
      await sendMessage({ chat_id: adminId, text: 'Введи: Название | Цена CNY | Цена РФ' })
    } else {
      await sendMessage({ chat_id: adminId, text: 'Не удалось получить фото. Повтори попытку.' })
    }
    return NextResponse.json({ ok: true })
  }

  if (session.stage === 'await_details' && typeof message.text === 'string' && session.photoUrl) {
    const [titleRaw, priceCnyRaw, priceRubRaw] = message.text.split('|').map((part: string) => part.trim())
    const priceCny = Number(priceCnyRaw)
    const priceRub = Number(priceRubRaw)
    if (!titleRaw || Number.isNaN(priceCny) || Number.isNaN(priceRub)) {
      await sendMessage({ chat_id: adminId, text: 'Формат неверный. Пример: Название | 1000 | 15000' })
      return NextResponse.json({ ok: true })
    }

    const benefitRub = priceRub - Math.round(priceCny * exchangeRate())
    const item = await addShowcaseItem({
      title: titleRaw,
      imageUrl: session.photoUrl,
      priceCny,
      priceRub,
      benefitRub,
      isPublished: false,
    })

    await sendPhoto({
      chat_id: adminId,
      photo: session.photoUrl,
      caption: `Создано: ${item.title}\nЦена: ${priceCny} ¥ / ${priceRub} ₽\nЭкономия: ${benefitRub} ₽`,
      reply_markup: {
        inline_keyboard: [[{ text: 'Опубликовать', callback_data: `publish_showcase:${item.id}` }]],
      },
    })
    await setAdminSession(adminId, { stage: 'idle' })
    return NextResponse.json({ ok: true })
  }

  if (session.stage === 'await_sourcing_answer' && typeof message.text === 'string' && session.sourcingRequestId) {
    const [priceRaw, commentRaw] = message.text.split('|').map((part: string) => part.trim())
    const priceCny = Number(priceRaw)
    if (Number.isNaN(priceCny) || priceCny <= 0) {
      await sendMessage({ chat_id: adminId, text: 'Цена должна быть числом. Пример: 1200 | Комментарий' })
      return NextResponse.json({ ok: true })
    }

    const updated = await answerSourcingRequest({
      requestId: session.sourcingRequestId,
      answerCny: priceCny,
      comment: commentRaw || undefined,
    })

    if (updated) {
      const benefitRub = updated.priceRub ? Math.round(updated.priceRub - priceCny * exchangeRate()) : null
      const messageLines = [`✅ Ответ по запросу #${updated.id.slice(0, 6)}`, `Цена Китай: ${priceCny.toLocaleString('ru-RU')} ¥`]
      if (updated.priceRub) {
        messageLines.push(`Цена РФ: ${updated.priceRub.toLocaleString('ru-RU')} ₽`)
      }
      if (benefitRub !== null) {
        messageLines.push(`Экономия: ${benefitRub.toLocaleString('ru-RU')} ₽`)
      }
      if (updated.comment) {
        messageLines.push(`Комментарий: ${updated.comment}`)
      }
      await sendMessage({ chat_id: updated.userId, text: messageLines.join('\n') })
      await sendMessage({ chat_id: adminId, text: 'Ответ отправлен клиенту.' })
    } else {
      await sendMessage({ chat_id: adminId, text: 'Запрос не найден.' })
    }

    await setAdminSession(adminId, { stage: 'idle' })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}
