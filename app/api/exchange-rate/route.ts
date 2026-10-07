import { NextResponse } from 'next/server'
import { EXCHANGE_CONFIG, buildRateTiersWithSettings } from '@/lib/exchange-config'
import { settingsStore } from '@/lib/settings-store'
import { recordDailyRate } from '@/lib/exchange-history'

export const dynamic = 'force-dynamic'

// Текущий курс: базовый курс ЦБ РФ + надбавка по уровню суммы (или ручной курс из админки).
export async function GET(request: Request) {
  const now = new Date()
  const { searchParams } = new URL(request.url)
  const forceUpdate = searchParams.get('forceUpdate') === 'true'

  const settings = settingsStore.getSettings()

  const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${now.getFullYear()}`

  const url = `https://www.cbr.ru/scripts/XML_daily.asp?date_req=${formattedDate}`

  let baseRate: number
  let cbrDate = now.toISOString()
  let fallback = false

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AlipayFast/1.0)' },
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
    })

    if (!response.ok) throw new Error(`Ошибка при запросе к API ЦБ РФ: ${response.status}`)

    const xml = await response.text()
    const yuanMatch = xml.match(/<CharCode>CNY<\/CharCode>[\s\S]*?<Value>(.*?)<\/Value>/)
    if (!yuanMatch?.[1]) throw new Error('Не удалось найти курс юаня в ответе ЦБ РФ')

    const parsed = Number.parseFloat(yuanMatch[1].replace(',', '.'))
    if (isNaN(parsed) || parsed <= 0) throw new Error('Некорректный курс юаня от ЦБ РФ')

    baseRate = Math.round(parsed * 100) / 100

    const dateMatch = xml.match(/<ValCurs Date="(.*?)"/)
    if (dateMatch?.[1]) {
      const [day, month, year] = dateMatch[1].split('.')
      cbrDate = `${year}-${month}-${day}T00:00:00.000Z`
    }

    recordDailyRate(baseRate, now)
  } catch (error) {
    console.error('[SERVER] Ошибка получения курса от ЦБ РФ:', error)
    fallback = true
    baseRate = EXCHANGE_CONFIG.FALLBACK_RATE
  }

  const tiers = buildRateTiersWithSettings(baseRate, settings)
  const bestRate = tiers.reduce((min, t) => Math.min(min, t.rate), Number.POSITIVE_INFINITY)

  // Курс обновляется ежедневно в 10:00 по Владивостоку (UTC+10) — это ровно
  // 00:00 UTC, поэтому следующее обновление — начало следующих суток UTC.
  const DAY_MS = 24 * 60 * 60 * 1000
  const nextUpdate = new Date(Math.floor(now.getTime() / DAY_MS) * DAY_MS + DAY_MS)

  return NextResponse.json({
    success: true,
    baseRate: baseRate.toString(),
    rate: bestRate.toString(),
    bestRate: bestRate.toString(),
    tiers,
    isManual: settings.useManualRate,
    manualRate: settings.manualRate,
    version: settings.version,
    cbrDate,
    timestamp: now.toISOString(),
    nextUpdate: nextUpdate.toISOString(),
    forceUpdate,
    fallbackRate: fallback,
  })
}
