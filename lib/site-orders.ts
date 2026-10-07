// Заявки, отправленные с сайта (калькулятор → модальное окно).
//
// Заявка сохраняется ДО отправки в Telegram: если Telegram недоступен или
// запрос не прошёл через прокси, заявка не теряется, а попадает в очередь и
// досылается позже (см. /api/telegram/flush-queue).

import fs from 'fs'
import path from 'path'
import { sendTelegramMessage } from '@/lib/telegram'

export type TelegramStatus = 'pending' | 'sent' | 'failed'

export interface SiteOrder {
  id: string
  orderNumber: string
  name: string
  contact: string
  contactMethod: string
  telegramUsername?: string
  yuanAmount: string
  rubleAmount: string
  exchangeRate: number
  comment?: string
  createdAt: string
  telegram: {
    status: TelegramStatus
    attempts: number
    lastError?: string
    sentAt?: string
  }
}

interface SiteOrdersFile {
  orders: SiteOrder[]
}

const MAX_ORDERS = 500

function dataDir() {
  return path.join(process.cwd(), 'data')
}

function filePath() {
  return path.join(dataDir(), 'site-orders.json')
}

function read(): SiteOrdersFile {
  try {
    const dir = dataDir()
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    if (!fs.existsSync(filePath())) return { orders: [] }
    const parsed = JSON.parse(fs.readFileSync(filePath(), 'utf8'))
    return { orders: Array.isArray(parsed?.orders) ? parsed.orders : [] }
  } catch (error) {
    console.error('[SITE-ORDERS] Не удалось прочитать файл заявок:', error)
    return { orders: [] }
  }
}

function write(data: SiteOrdersFile) {
  try {
    const dir = dataDir()
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const orders = data.orders.slice(-MAX_ORDERS)
    fs.writeFileSync(filePath(), JSON.stringify({ orders }, null, 2), 'utf8')
  } catch (error) {
    console.error('[SITE-ORDERS] Не удалось сохранить файл заявок:', error)
  }
}

export function telegramMessageFor(order: SiteOrder) {
  const nick = order.telegramUsername
    ? order.telegramUsername.startsWith('@')
      ? order.telegramUsername
      : `@${order.telegramUsername}`
    : ''

  return `
<b>🔔 Новая заявка на пополнение Alipay!</b>

<b>Номер заявки:</b> ${order.orderNumber}
<b>Имя клиента:</b> ${order.name || '—'}
<b>Контакт:</b> ${order.contact} (${order.contactMethod})
${nick ? `<b>Ник в Telegram:</b> ${nick}` : ''}
<b>Сумма:</b> ${order.yuanAmount} CNY (${order.rubleAmount} RUB)
<b>Курс:</b> ${order.exchangeRate} RUB
${order.comment ? `<b>Комментарий:</b> ${order.comment}` : ''}

<i>Дата и время:</i> ${new Date(order.createdAt).toLocaleString('ru-RU')}
`.trim()
}

export function saveOrder(order: SiteOrder) {
  const data = read()
  data.orders.push(order)
  write(data)
}

export function updateOrder(id: string, patch: Partial<SiteOrder['telegram']>) {
  const data = read()
  const target = data.orders.find((order) => order.id === id)
  if (!target) return
  target.telegram = { ...target.telegram, ...patch }
  write(data)
}

export function pendingOrders() {
  return read().orders.filter((order) => order.telegram.status === 'pending')
}

export function listOrders(limit = 50) {
  return read().orders.slice(-limit).reverse()
}

// Пытается отправить заявку в Telegram.
export async function deliver(order: SiteOrder) {
  const result = await sendTelegramMessage(telegramMessageFor(order))

  if (result.success) {
    updateOrder(order.id, {
      status: 'sent',
      attempts: order.telegram.attempts + 1,
      sentAt: new Date().toISOString(),
      lastError: undefined,
    })
    return { sent: true, demo: false, error: undefined as string | undefined }
  }

  if (result.demo) {
    // Бот не настроен — заявку всё равно сохранили, но в очередь не ставим.
    updateOrder(order.id, { status: 'failed', attempts: order.telegram.attempts + 1, lastError: result.error })
    return { sent: false, demo: true, error: result.error }
  }

  updateOrder(order.id, {
    status: 'pending',
    attempts: order.telegram.attempts + 1,
    lastError: result.error,
  })
  return { sent: false, demo: false, error: result.error }
}

// Досылка очереди. Возвращает, что удалось отправить.
export async function flushQueue(limit = 20) {
  const queue = pendingOrders().slice(0, limit)
  const sent: string[] = []

  for (const order of queue) {
    const result = await deliver(order)
    if (result.sent) sent.push(order.orderNumber)
  }

  return { attempted: queue.length, sent, remaining: pendingOrders().length }
}
