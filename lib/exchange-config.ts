// Конфигурация курса обмена.
// ВАЖНО: этот файл содержит только статические значения.
//
// Механика формирования курса (перенесена из предыдущего сайта):
//   1. Базовый курс берётся из ЦБ РФ (CNY/RUB) — см. app/api/exchange-rate.
//   2. К базовому курсу прибавляется надбавка, зависящая от суммы в юанях
//      (DYNAMIC_MARKUP ниже): чем больше пополнение — тем выгоднее курс.
//   3. Администратор может переопределить всё «ручным курсом» (ручной режим)
//      через /admin/exchange — тогда надбавки не применяются.

export interface MarkupTier {
  /** максимальная сумма в юанях для этого уровня (Infinity — последний) */
  maxYuan: number
  /** надбавка к курсу ЦБ РФ в рублях (абсолютное значение) */
  markup: number
}

export const EXCHANGE_CONFIG = {
  // Базовая надбавка к курсу ЦБ РФ (в рублях). Используется как значение по умолчанию.
  DEFAULT_MARKUP: 0.73,

  // Режим по умолчанию (false = автоматический, true = ручной)
  DEFAULT_USE_MANUAL_RATE: false,

  // Ручной курс по умолчанию (null = не установлен)
  DEFAULT_MANUAL_RATE: null as number | null,

  // Запасной курс при ошибках API ЦБ РФ (только базовый курс, без надбавок)
  FALLBACK_RATE: 11.5,

  // Время кэширования настроек (в миллисекундах)
  CACHE_DURATION: 30 * 60 * 1000, // 30 минут

  DYNAMIC_MARKUP: [
    { maxYuan: 500, markup: 0.96 }, // До 500 юаней: Курс ЦБ + 0.96
    { maxYuan: 2000, markup: 0.84 }, // До 2000 юаней: Курс ЦБ + 0.84
    { maxYuan: 6000, markup: 0.8 }, // От 2000 до 6000 юаней: Курс ЦБ + 0.80
    { maxYuan: Number.POSITIVE_INFINITY, markup: 0.73 }, // От 6000 юаней и выше: Курс ЦБ + 0.73
  ] as MarkupTier[],
} as const

/** Надбавка к курсу ЦБ для суммы в юанях. */
export function getMarkupForAmount(yuanAmount: number): number {
  for (const tier of EXCHANGE_CONFIG.DYNAMIC_MARKUP) {
    if (yuanAmount < tier.maxYuan) {
      return tier.markup
    }
  }
  return EXCHANGE_CONFIG.DEFAULT_MARKUP
}

export function getDefaultSettings() {
  return {
    markup: EXCHANGE_CONFIG.DEFAULT_MARKUP,
    useManualRate: EXCHANGE_CONFIG.DEFAULT_USE_MANUAL_RATE,
    manualRate: EXCHANGE_CONFIG.DEFAULT_MANUAL_RATE,
    version: 1,
    lastUpdated: new Date().toISOString(),
  }
}

export function validateSettings(settings: {
  markup?: unknown
  useManualRate?: unknown
  manualRate?: unknown
}) {
  const errors: string[] = []

  if (typeof settings.markup !== 'number' || settings.markup < 0) {
    errors.push('Надбавка должна быть положительным числом')
  }

  if (settings.useManualRate && (typeof settings.manualRate !== 'number' || settings.manualRate <= 0)) {
    errors.push('Ручной курс должен быть положительным числом')
  }

  return { isValid: errors.length === 0, errors }
}

/**
 * Уровни курса, которые отображает калькулятор нового дизайна.
 * Формируются из DYNAMIC_MARKUP: границы в юанях + итоговый курс (baseRate + надбавка),
 * либо единый ручной курс, если включён ручной режим.
 */
export interface RateTier {
  from: number
  to: number
  rate: number
  label: string
  markup: number
}

const fmtInt = (n: number) => n.toLocaleString('ru-RU')

export function buildRateTiers(
  baseRate: number,
  opts?: { useManualRate?: boolean; manualRate?: number | null; settingsMarkup?: number },
): RateTier[] {
  const manual = opts?.useManualRate && opts.manualRate ? opts.manualRate : null
  const tiers = EXCHANGE_CONFIG.DYNAMIC_MARKUP
  let from = 0

  return tiers.map((tier, i) => {
    const isLast = !Number.isFinite(tier.maxYuan)
    // верхняя граница всегда конечна — Infinity не переживает JSON (превращается в null)
    const to = isLast ? Number.MAX_SAFE_INTEGER : tier.maxYuan
    const markup = manual ? 0 : tier.markup
    const rate = manual ?? baseRate + tier.markup
    const label =
      i === 0 ? `до ${fmtInt(to)} ¥` : isLast ? `от ${fmtInt(from)} ¥` : `${fmtInt(from)} – ${fmtInt(to)} ¥`

    const out: RateTier = { from, to, rate: +rate.toFixed(4), label, markup }
    from = to
    return out
  })
}

export function buildRateTiersWithSettings(baseRate: string | number, settings: {
  useManualRate?: boolean
  manualRate?: number | null
  markup?: number
}): RateTier[] {
  const base = typeof baseRate === 'string' ? Number.parseFloat(baseRate) : baseRate
  return buildRateTiers(Number.isFinite(base) && base > 0 ? base : EXCHANGE_CONFIG.FALLBACK_RATE, settings)
}
