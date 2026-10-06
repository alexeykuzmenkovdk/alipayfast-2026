import fs from 'fs'
import path from 'path'

// Хранилище истории базового курса ЦБ РФ по дням.
// Каждый день в файл добавляется одна запись — используется графиком курса.

export interface HistoryPoint {
  /** ISO-дата (yyyy-mm-dd) */
  date: string
  /** базовый курс ЦБ РФ, ₽ за 1 ¥ */
  baseRate: number
}

const historyFilePath = path.join(process.cwd(), 'data', 'exchange-history.json')

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

export function readHistory(): HistoryPoint[] {
  try {
    if (!fs.existsSync(historyFilePath)) return []
    const raw = fs.readFileSync(historyFilePath, 'utf8')
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((p) => p && typeof p.date === 'string' && typeof p.baseRate === 'number')
      .sort((a, b) => a.date.localeCompare(b.date))
  } catch (error) {
    console.error('[HISTORY] Ошибка чтения истории курса:', error)
    return []
  }
}

/** Добавляет запись за день. Повторный вызов в тот же день обновляет значение. */
export function recordDailyRate(baseRate: number, date = new Date()): HistoryPoint[] {
  const iso = date.toISOString().slice(0, 10)
  const history = readHistory()
  const idx = history.findIndex((p) => p.date === iso)
  if (idx >= 0) {
    history[idx] = { date: iso, baseRate }
  } else {
    history.push({ date: iso, baseRate })
  }
  try {
    ensureDir(historyFilePath)
    fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2), 'utf8')
  } catch (error) {
    console.error('[HISTORY] Ошибка записи истории курса:', error)
  }
  return history
}
