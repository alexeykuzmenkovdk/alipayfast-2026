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
  // Надбавка к курсу ЦБ РФ (в рублях) для верхнего уровня. Служит базой
  // ранжира: остальные уровни считаются от неё по фиксированным шагам.
  DEFAULT_MARKUP: 0.88,

  // Режим по умолчанию (false = автоматический, true = ручной)
  DEFAULT_USE_MANUAL_RATE: false,

  // Ручной курс по умолчанию (null = не установлен)
  DEFAULT_MANUAL_RATE: null as number | null,

  // Запасной курс при ошибках API ЦБ РФ (только базовый курс, без надбавок)
  FALLBACK_RATE: 11.5,

  // Время кэширования настроек (в миллисекундах)
  CACHE_DURATION: 30 * 60 * 1000, // 30 минут

  // Единый ранжир курса по сумме заказа (в юанях). Границы уровней и надбавка
  // к курсу ЦБ РФ. Чем крупнее сумма — тем ниже надбавка (выгоднее курс).
  // Это единственный источник истины для сайта, калькулятора, графика и
  // мини-приложения. Шаг ранжира (разница надбавок между уровнями):
  //   1.09 → 0.99 → 0.89 (−0.10, −0.10) → 0.88 (−0.01 для самого крупного)
  DYNAMIC_MARKUP: [
    { maxYuan: 1000, markup: 1.09 }, // до 1 000 ¥
    { maxYuan: 3000, markup: 0.99 }, // от 1 000 ¥
    { maxYuan: 10000, markup: 0.89 }, // от 3 000 ¥
    { maxYuan: Number.POSITIVE_INFINITY, markup: 0.88 }, // от 10 000 ¥
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
  // Надбавка из настроек задаёт верхний (самый выгодный) уровень ранжира.
  // Весь ранжир сдвигается на разницу с надбавкой по умолчанию, поэтому шаг
  // между уровнями сохраняется, а оператор может поднять/опустить весь ряд.
  const baseMarkup = opts?.settingsMarkup ?? EXCHANGE_CONFIG.DEFAULT_MARKUP
  const shift = Number.isFinite(baseMarkup) ? baseMarkup - EXCHANGE_CONFIG.DEFAULT_MARKUP : 0
  const tiers = EXCHANGE_CONFIG.DYNAMIC_MARKUP
  let from = 0

  return tiers.map((tier, i) => {
    const isLast = !Number.isFinite(tier.maxYuan)
    // верхняя граница всегда конечна — Infinity не переживает JSON (превращается в null)
    const to = isLast ? Number.MAX_SAFE_INTEGER : tier.maxYuan
    const markup = manual ? 0 : +(tier.markup + shift).toFixed(4)
    const rate = manual ?? baseRate + markup
    const label =
      i === 0 ? `до ${fmtInt(to)} ¥` : isLast ? `от ${fmtInt(from)} ¥` : `${fmtInt(from)} – ${fmtInt(to)} ¥`

    const out: RateTier = { from, to, rate: +rate.toFixed(4), label, markup }
    from = to
    return out
  })
}

export function buildRateTiersWithSettings(
  baseRate: string | number,
  settings: { useManualRate?: boolean; manualRate?: number | null; markup?: number },
): RateTier[] {
  const base = typeof baseRate === 'string' ? Number.parseFloat(baseRate) : baseRate
  return buildRateTiers(Number.isFinite(base) && base > 0 ? base : EXCHANGE_CONFIG.FALLBACK_RATE, {
    useManualRate: settings.useManualRate,
    manualRate: settings.manualRate,
    settingsMarkup: settings.markup,
  })
}

// ── Единая логика ранжира для всех поверхностей ──────────────────────────────
// Калькулятор, график и мини-приложение обязаны считать курс одинаково:
// находят уровень по сумме в юанях и берут его курс/надбавку.

/** Индекс уровня для суммы в юанях (последний уровень — «от N и выше»). */
export function tierIndexForCny(tiers: RateTier[], cny: number): number {
  const i = tiers.findIndex((t) => cny >= t.from && cny < t.to)
  return i === -1 ? tiers.length - 1 : i
}

/** Курс (₽ за 1 ¥) для суммы в юанях. */
export function rateForCnyValue(tiers: RateTier[], cny: number): number {
  const tier = tiers[tierIndexForCny(tiers, cny)]
  return tier ? tier.rate : EXCHANGE_CONFIG.FALLBACK_RATE
}

/**
 * Сколько юаней дадут за сумму в рублях — с учётом ранжира.
 * Перебираем уровни сверху вниз: для крупных сумм сначала примеряем самый
 * выгодный курс, чтобы не «перепрыгнуть» на более дешёвый уровень.
 */
export function cnyFromRub(tiers: RateTier[], rub: number): { cny: number; tier: number } {
  for (let i = tiers.length - 1; i >= 0; i--) {
    const c = rub / tiers[i].rate
    if (c >= tiers[i].from) return { cny: c, tier: i }
  }
  return { cny: tiers[0] ? rub / tiers[0].rate : 0, tier: 0 }
}

/** Сколько рублей нужно отдать за сумму в юанях — с учётом ранжира. */
export function rubFromCny(tiers: RateTier[], cny: number): { rub: number; tier: number } {
  const i = tierIndexForCny(tiers, cny)
  const rate = tiers[i]?.rate ?? EXCHANGE_CONFIG.FALLBACK_RATE
  return { rub: cny * rate, tier: i }
}
