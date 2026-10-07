import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { isProxyConfigured, proxyUrl, telegramReachability, telegramRequest, parseTelegramResponse, telegramApiBase } from '@/lib/net'
import { pendingOrders } from '@/lib/site-orders'

export const dynamic = 'force-dynamic'

// Диагностика Telegram: настроен ли бот, работает ли прокси, проходит ли запрос.
// Открывается по адресу /api/telegram/diagnose?token=...
export async function GET(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const siteBotConfigured = Boolean(process.env.TELEGRAM_SITE_BOT_TOKEN)
  const miniAppBotConfigured = Boolean(process.env.TELEGRAM_MINI_APP_BOT_TOKEN)
  const siteChatConfigured = Boolean(process.env.TELEGRAM_SITE_CHAT_ID)

  const reachability = await telegramReachability()

  // Если прокси настроен, но прямой путь тоже работает — покажем оба результата.
  const proxyTest = isProxyConfigured()
    ? parseTelegramResponse(
        await telegramRequest(`${telegramApiBase()}/`, {
          timeoutMs: 6000,
        }),
      )
    : null

  const pending = pendingOrders().length

  return NextResponse.json({
    proxy: {
      configured: isProxyConfigured(),
      url: proxyUrl() || null,
      hint: isProxyConfigured()
        ? 'Запросы к Telegram идут через прокси'
        : 'Прокси не задан, запросы идут напрямую',
    },
    bots: {
      siteBotConfigured,
      miniAppBotConfigured,
      siteChatConfigured,
    },
    reachability,
    proxyTest,
    queue: {
      pending,
      note: pending > 0 ? 'Есть неотправленные заявки — вызовите POST /api/telegram/flush-queue' : 'Очередь пуста',
    },
    advice: buildAdvice({ reachability, pending, siteBotConfigured, proxyConfigured: isProxyConfigured() }),
  })
}

function buildAdvice(data: {
  reachability: { reachable: boolean; direct: { ok: boolean } }
  pending: number
  siteBotConfigured: boolean
  proxyConfigured: boolean
}) {
  const notes: string[] = []

  if (!data.siteBotConfigured) notes.push('Не задан TELEGRAM_SITE_BOT_TOKEN — заявки с сайта не уходят.')
  if (!data.reachability.reachable) {
    notes.push(
      data.proxyConfigured
        ? 'Через прокси Telegram недоступен: проверьте, что локальный клиент (xray/sing-box) запущен и слушает порт из TELEGRAM_PROXY_URL.'
        : 'Telegram недоступен напрямую. Для сервера в РФ задайте TELEGRAM_PROXY_URL — заявки будут уходить через ваш VLESS-сервер.',
    )
  }
  if (data.reachability.reachable && !data.reachability.direct.ok && data.proxyConfigured) {
    notes.push('Прямой доступ к Telegram закрыт, прокси работает — это ожидаемая схема для сервера в РФ.')
  }
  if (data.pending > 0) notes.push(`В очереди ${data.pending} заявок — отправьте POST /api/telegram/flush-queue.`)

  return notes.length ? notes : ['Всё в порядке: Telegram доступен, очередь пуста.']
}
