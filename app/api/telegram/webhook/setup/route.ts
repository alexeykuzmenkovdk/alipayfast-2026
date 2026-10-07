import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { telegramRequest, parseTelegramResponse, proxyUrl, telegramApiBase } from '@/lib/net'

export async function POST(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = process.env.TELEGRAM_MINI_APP_BOT_TOKEN ?? process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'Missing TELEGRAM_MINI_APP_BOT_TOKEN' }, { status: 400 })
  }

  const body = await request.json().catch(() => ({}))
  const origin = request.headers.get('origin')
  const webhookUrl = body.url ?? process.env.TELEGRAM_WEBHOOK_URL ?? (origin ? `${origin}/api/telegram/webhook` : null)
  if (!webhookUrl) {
    return NextResponse.json({ error: 'Webhook URL is not defined' }, { status: 400 })
  }

  const response = await telegramRequest(`${telegramApiBase()}/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
    }),
    timeoutMs: 10000,
  })

  const data = parseTelegramResponse(response)

  return NextResponse.json({
    ok: data.ok,
    result: data.result,
    description: data.description,
    viaProxy: response.viaProxy,
    proxyUrl: proxyUrl() || null,
  })
}
