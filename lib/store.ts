// Данные мини-приложения: заявки, этапы оплаты, чат, витрина, запросы на поиск цены
// и состояние диалога администратора в Telegram-боте. Хранилище — PostgreSQL.

import { randomUUID } from 'crypto'
import { ensureSchema, getPool } from '@/lib/db'
import { welcomeMessage } from '@/lib/deal-room'

export type OrderStatus = 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED'
export type PaymentStatus =
  | 'WAITING_FOR_DETAILS'
  | 'WAITING_FOR_PAYMENT'
  | 'PAID'
  | 'VERIFIED'
  | 'CANCELED'
export type MessageRole = 'client' | 'admin' | 'system'
export type SourcingStatus = 'PENDING' | 'ANSWERED' | 'DECLINED'
export type PaymentMethod = 'CARD' | 'SBP'

export interface Order {
  id: string
  userId: number
  status: OrderStatus
  totalRub: number
  totalCny: number
  rate: number
  alipayId?: string | null
  fullName?: string | null
  contactUsername?: string | null
  contactPhone?: string | null
  createdAt: string
  updatedAt: string
}

export interface PaymentStep {
  id: string
  orderId: string
  stepIndex: number
  status: PaymentStatus
  amountRub: number
  method: PaymentMethod
  requisiteValue: string
  bankName: string
  receiptEmail: string
  receiptFileUrl?: string
  createdAt: string
  updatedAt: string
}

export interface OrderMessage {
  id: string
  orderId: string
  senderRole: MessageRole
  text?: string
  fileUrl?: string
  createdAt: string
}

export interface ShowcaseItem {
  id: string
  title: string
  imageUrl: string
  priceCny: number
  priceRub: number
  benefitRub: number
  isPublished: boolean
}

export interface SourcingRequest {
  id: string
  userId: number
  description: string
  imageUrl: string
  link?: string
  priceRub?: number
  answerCny?: number
  comment?: string
  status: SourcingStatus
  createdAt: string
  answeredAt?: string
}

interface AdminSession {
  stage: 'idle' | 'await_photo' | 'await_details' | 'await_sourcing_answer'
  photoUrl?: string
  sourcingRequestId?: string
}

export interface OrderWithMeta extends Order {
  messageCount: number
  lastMessage: string | null
}

type Row = Record<string, unknown>

const DEFAULT_SHOWCASE = [
  {
    title: 'Dyson Airwrap',
    imageUrl: '/assets/showcase/dyson.png',
    priceCny: 4200,
    priceRub: 65000,
    benefitRub: 18000,
  },
  {
    title: 'Nike Air Force 1',
    imageUrl: '/assets/showcase/nike.png',
    priceCny: 980,
    priceRub: 15000,
    benefitRub: 4500,
  },
  {
    title: 'iPhone 15 Pro 256',
    imageUrl: '/assets/showcase/iphone.png',
    priceCny: 8999,
    priceRub: 125000,
    benefitRub: 22000,
  },
]

async function seedShowcase() {
  const pool = getPool()
  const existing = await pool.query('SELECT id FROM showcase_items LIMIT 1')
  if (existing.rowCount && existing.rowCount > 0) return
  for (const item of DEFAULT_SHOWCASE) {
    await pool.query(
      `INSERT INTO showcase_items (id, title, image_url, price_cny, price_rub, benefit_rub, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)`,
      [randomUUID(), item.title, item.imageUrl, item.priceCny, item.priceRub, item.benefitRub],
    )
  }
}

async function ensureReady() {
  await ensureSchema()
  await seedShowcase()
}

function asDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString()
  return new Date(String(value)).toISOString()
}

function mapOrder(row: Row): Order {
  return {
    id: String(row.id),
    userId: Number(row.user_id),
    status: row.status as OrderStatus,
    totalRub: Number(row.total_rub),
    totalCny: Number(row.total_cny),
    rate: Number(row.rate),
    alipayId: (row.alipay_id as string | null) ?? null,
    fullName: (row.full_name as string | null) ?? null,
    contactUsername: (row.contact_username as string | null) ?? null,
    contactPhone: (row.contact_phone as string | null) ?? null,
    createdAt: asDate(row.created_at),
    updatedAt: asDate(row.updated_at),
  }
}

function mapStep(row: Row): PaymentStep {
  return {
    id: String(row.id),
    orderId: String(row.order_id),
    stepIndex: Number(row.step_index),
    status: row.status as PaymentStatus,
    amountRub: Number(row.amount_rub),
    method: row.method as PaymentMethod,
    requisiteValue: String(row.requisite_value),
    bankName: String(row.bank_name),
    receiptEmail: String(row.receipt_email),
    receiptFileUrl: (row.receipt_file_url as string | null) ?? undefined,
    createdAt: asDate(row.created_at),
    updatedAt: asDate(row.updated_at),
  }
}

function mapMessage(row: Row): OrderMessage {
  return {
    id: String(row.id),
    orderId: String(row.order_id),
    senderRole: row.sender_role as MessageRole,
    text: (row.text as string | null) ?? undefined,
    fileUrl: (row.file_url as string | null) ?? undefined,
    createdAt: asDate(row.created_at),
  }
}

function mapShowcase(row: Row): ShowcaseItem {
  return {
    id: String(row.id),
    title: String(row.title),
    imageUrl: String(row.image_url),
    priceCny: Number(row.price_cny),
    priceRub: Number(row.price_rub),
    benefitRub: Number(row.benefit_rub),
    isPublished: Boolean(row.is_published),
  }
}

function mapSourcing(row: Row): SourcingRequest {
  return {
    id: String(row.id),
    userId: Number(row.user_id),
    description: String(row.description),
    imageUrl: String(row.image_url),
    link: (row.link as string | null) ?? undefined,
    priceRub: row.price_rub == null ? undefined : Number(row.price_rub),
    answerCny: row.answer_cny == null ? undefined : Number(row.answer_cny),
    comment: (row.comment as string | null) ?? undefined,
    status: row.status as SourcingStatus,
    createdAt: asDate(row.created_at),
    answeredAt: row.answered_at ? asDate(row.answered_at) : undefined,
  }
}

export async function getActiveOrder(userId: number) {
  await ensureReady()
  const pool = getPool()
  // updated_at, а не created_at: если оператор вернул сделку из архива в
  // работу, клиент должен увидеть именно её как актуальную активную заявку.
  const result = await pool.query(
    `SELECT * FROM orders WHERE user_id = $1 AND status IN ('CREATED', 'IN_PROGRESS') ORDER BY updated_at DESC LIMIT 1`,
    [userId],
  )
  return result.rows[0] ? mapOrder(result.rows[0]) : undefined
}

export async function listOrderSteps(orderId: string) {
  await ensureReady()
  const pool = getPool()
  const result = await pool.query(
    'SELECT * FROM payment_steps WHERE order_id = $1 ORDER BY step_index ASC',
    [orderId],
  )
  return result.rows.map(mapStep)
}

export async function listOrderMessages(orderId: string) {
  await ensureReady()
  const pool = getPool()
  const result = await pool.query(
    'SELECT * FROM order_messages WHERE order_id = $1 ORDER BY created_at ASC',
    [orderId],
  )
  return result.rows.map(mapMessage)
}

export async function getOrderById(orderId: string) {
  await ensureReady()
  const pool = getPool()
  const result = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId])
  return result.rows[0] ? mapOrder(result.rows[0]) : undefined
}

export async function createOrder(data: {
  userId: number
  totalRub: number
  totalCny: number
  rate: number
  alipayId?: string
  fullName?: string
  contactUsername?: string
  contactPhone?: string
  username?: string
}) {
  await ensureReady()
  const pool = getPool()
  const client = await pool.connect()
  const now = new Date().toISOString()
  const orderId = randomUUID()
  try {
    await client.query('BEGIN')
    await client.query(
      `INSERT INTO orders
        (id, user_id, status, total_rub, total_cny, rate, alipay_id, full_name, contact_username, contact_phone, created_at, updated_at)
       VALUES ($1, $2, 'CREATED', $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        orderId,
        data.userId,
        data.totalRub,
        data.totalCny,
        data.rate,
        data.alipayId ?? null,
        data.fullName ?? null,
        data.contactUsername ?? null,
        data.contactPhone ?? null,
        now,
        now,
      ],
    )
    // Реквизиты не выдумываем: этап оплаты добавит оператор.
    // В комнату сразу кладём приветствие с данными заявки.
    const greeting = welcomeMessage({
      totalCny: data.totalCny,
      totalRub: data.totalRub,
      username: data.username,
      phone: data.contactPhone,
    })
    await client.query(
      `INSERT INTO order_messages (id, order_id, sender_role, text, file_url, created_at)
       VALUES ($1, $2, 'system', $3, NULL, $4)`,
      [randomUUID(), orderId, greeting, now],
    )
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }

  const order = await getOrderById(orderId)
  if (!order) throw new Error('Order was not created')
  return order
}

export async function cancelOrder(orderId: string) {
  await ensureReady()
  const pool = getPool()
  const now = new Date().toISOString()
  const result = await pool.query(
    "UPDATE orders SET status = 'CANCELED', updated_at = $2 WHERE id = $1 AND status != 'COMPLETED' RETURNING *",
    [orderId, now],
  )
  if (!result.rows[0]) return undefined
  await pool.query(
    "UPDATE payment_steps SET status = 'CANCELED', updated_at = $2 WHERE order_id = $1 AND status != 'VERIFIED'",
    [orderId, now],
  )
  return mapOrder(result.rows[0])
}

export async function markStepPaid(orderId: string, stepId: string, receiptFileUrl?: string) {
  await ensureReady()
  const pool = getPool()
  const now = new Date().toISOString()
  const result = await pool.query(
    "UPDATE payment_steps SET status = 'PAID', receipt_file_url = $3, updated_at = $4 WHERE id = $1 AND order_id = $2 RETURNING *",
    [stepId, orderId, receiptFileUrl ?? null, now],
  )
  if (!result.rows[0]) return undefined
  await pool.query("UPDATE orders SET status = 'IN_PROGRESS', updated_at = $2 WHERE id = $1", [orderId, now])
  return mapStep(result.rows[0])
}

export async function addMessage(data: { orderId: string; senderRole: MessageRole; text?: string; fileUrl?: string }) {
  await ensureReady()
  const pool = getPool()
  const messageId = randomUUID()
  const now = new Date().toISOString()
  await pool.query(
    `INSERT INTO order_messages (id, order_id, sender_role, text, file_url, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [messageId, data.orderId, data.senderRole, data.text ?? null, data.fileUrl ?? null, now],
  )
  return {
    id: messageId,
    orderId: data.orderId,
    senderRole: data.senderRole,
    text: data.text,
    fileUrl: data.fileUrl,
    createdAt: now,
  }
}

export async function listShowcaseItems() {
  await ensureReady()
  const pool = getPool()
  const result = await pool.query('SELECT * FROM showcase_items WHERE is_published = TRUE ORDER BY title ASC')
  return result.rows.map(mapShowcase)
}

export async function listAllShowcaseItems() {
  await ensureReady()
  const pool = getPool()
  const result = await pool.query('SELECT * FROM showcase_items ORDER BY title ASC')
  return result.rows.map(mapShowcase)
}

export async function addShowcaseItem(item: Omit<ShowcaseItem, 'id' | 'isPublished'> & { isPublished?: boolean }) {
  await ensureReady()
  const pool = getPool()
  const id = randomUUID()
  const published = item.isPublished ?? false
  await pool.query(
    `INSERT INTO showcase_items (id, title, image_url, price_cny, price_rub, benefit_rub, is_published)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, item.title, item.imageUrl, item.priceCny, item.priceRub, item.benefitRub, published],
  )
  return { ...item, id, isPublished: published }
}

export async function setShowcasePublish(id: string, isPublished: boolean) {
  await ensureReady()
  const pool = getPool()
  const result = await pool.query(
    'UPDATE showcase_items SET is_published = $2 WHERE id = $1 RETURNING *',
    [id, isPublished],
  )
  return result.rows[0] ? mapShowcase(result.rows[0]) : undefined
}

export async function publishShowcaseItem(id: string) {
  await ensureReady()
  const pool = getPool()
  const result = await pool.query(
    'UPDATE showcase_items SET is_published = TRUE WHERE id = $1 RETURNING *',
    [id],
  )
  return result.rows[0] ? mapShowcase(result.rows[0]) : undefined
}

export interface ArchivedOrder extends Order {
  stepsCount: number
  paidRub: number
}

// Закрытые сделки одного пользователя: завершённые и отменённые.
export async function listUserArchivedOrders(userId: number, limit = 50): Promise<ArchivedOrder[]> {
  await ensureReady()
  const pool = getPool()
  const result = await pool.query(
    `SELECT o.*,
      (SELECT COUNT(*) FROM payment_steps s WHERE s.order_id = o.id) AS steps_count,
      (SELECT COALESCE(SUM(s.amount_rub), 0) FROM payment_steps s WHERE s.order_id = o.id AND s.status = 'VERIFIED') AS paid_rub
     FROM orders o
     WHERE o.user_id = $1 AND o.status IN ('COMPLETED', 'CANCELED')
     ORDER BY o.updated_at DESC
     LIMIT $2`,
    [userId, limit],
  )
  return result.rows.map((row) => ({
    ...mapOrder(row),
    stepsCount: Number(row.steps_count ?? 0),
    paidRub: Number(row.paid_rub ?? 0),
  }))
}

export async function listOrders(statuses?: OrderStatus[]): Promise<OrderWithMeta[]> {
  await ensureReady()
  const pool = getPool()
  const result = await pool.query(
    `SELECT o.*,
      (SELECT COUNT(*) FROM order_messages m WHERE m.order_id = o.id) as message_count,
      (SELECT text FROM order_messages m WHERE m.order_id = o.id ORDER BY created_at DESC LIMIT 1) as last_message
     FROM orders o
     ${statuses?.length ? 'WHERE o.status = ANY($1)' : ''}
     ORDER BY o.created_at DESC`,
    statuses?.length ? [statuses] : [],
  )
  return result.rows.map((row) => ({
    ...mapOrder(row),
    messageCount: Number(row.message_count ?? 0),
    lastMessage: (row.last_message as string | null) ?? null,
  }))
}

export interface PeriodStats {
  completed: number
  canceled: number
  turnoverRub: number
  turnoverCny: number
  avgRate: number
}

export interface OrderStats {
  today: PeriodStats
  week: PeriodStats
  month: PeriodStats
  all: PeriodStats
  active: number
  daily: { date: string; completed: number; turnoverRub: number }[]
}

// Статистика исполненных сделок за день, неделю, месяц и всё время.
export async function orderStats(): Promise<OrderStats> {
  await ensureReady()
  const pool = getPool()

  const agg = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'COMPLETED' AND updated_at >= NOW() - INTERVAL '1 day')     AS d_completed,
      COUNT(*) FILTER (WHERE status = 'COMPLETED' AND updated_at >= NOW() - INTERVAL '7 days')    AS w_completed,
      COUNT(*) FILTER (WHERE status = 'COMPLETED' AND updated_at >= NOW() - INTERVAL '30 days')   AS m_completed,
      COUNT(*) FILTER (WHERE status = 'COMPLETED')                                                AS all_completed,
      COUNT(*) FILTER (WHERE status = 'CANCELED' AND updated_at >= NOW() - INTERVAL '1 day')      AS d_canceled,
      COUNT(*) FILTER (WHERE status = 'CANCELED' AND updated_at >= NOW() - INTERVAL '7 days')     AS w_canceled,
      COUNT(*) FILTER (WHERE status = 'CANCELED' AND updated_at >= NOW() - INTERVAL '30 days')    AS m_canceled,
      COUNT(*) FILTER (WHERE status = 'CANCELED')                                                 AS all_canceled,
      COUNT(*) FILTER (WHERE status IN ('CREATED', 'IN_PROGRESS'))                                AS active,
      COALESCE(SUM(total_rub) FILTER (WHERE status = 'COMPLETED' AND updated_at >= NOW() - INTERVAL '1 day'), 0)   AS d_rub,
      COALESCE(SUM(total_rub) FILTER (WHERE status = 'COMPLETED' AND updated_at >= NOW() - INTERVAL '7 days'), 0)  AS w_rub,
      COALESCE(SUM(total_rub) FILTER (WHERE status = 'COMPLETED' AND updated_at >= NOW() - INTERVAL '30 days'), 0) AS m_rub,
      COALESCE(SUM(total_rub) FILTER (WHERE status = 'COMPLETED'), 0)                                              AS all_rub,
      COALESCE(SUM(total_cny) FILTER (WHERE status = 'COMPLETED' AND updated_at >= NOW() - INTERVAL '1 day'), 0)   AS d_cny,
      COALESCE(SUM(total_cny) FILTER (WHERE status = 'COMPLETED' AND updated_at >= NOW() - INTERVAL '7 days'), 0)  AS w_cny,
      COALESCE(SUM(total_cny) FILTER (WHERE status = 'COMPLETED' AND updated_at >= NOW() - INTERVAL '30 days'), 0) AS m_cny,
      COALESCE(SUM(total_cny) FILTER (WHERE status = 'COMPLETED'), 0)                                              AS all_cny,
      COALESCE(AVG(rate) FILTER (WHERE status = 'COMPLETED' AND updated_at >= NOW() - INTERVAL '1 day'), 0)   AS d_rate,
      COALESCE(AVG(rate) FILTER (WHERE status = 'COMPLETED' AND updated_at >= NOW() - INTERVAL '7 days'), 0)  AS w_rate,
      COALESCE(AVG(rate) FILTER (WHERE status = 'COMPLETED' AND updated_at >= NOW() - INTERVAL '30 days'), 0) AS m_rate,
      COALESCE(AVG(rate) FILTER (WHERE status = 'COMPLETED'), 0)                                              AS all_rate
    FROM orders
  `)

  const row = (agg.rows[0] ?? {}) as Record<string, unknown>
  const num = (key: string) => Number(row[key] ?? 0)

  const build = (prefix: 'd' | 'w' | 'm' | 'all'): PeriodStats => {
    const suffix = prefix === 'all' ? 'all' : prefix
    if (prefix === 'all') {
      return {
        completed: num('all_completed'),
        canceled: num('all_canceled'),
        turnoverRub: num('all_rub'),
        turnoverCny: num('all_cny'),
        avgRate: num('all_rate'),
      }
    }
    return {
      completed: num(`${suffix}_completed`),
      canceled: num(`${suffix}_canceled`),
      turnoverRub: num(`${suffix}_rub`),
      turnoverCny: num(`${suffix}_cny`),
      avgRate: num(`${suffix}_rate`),
    }
  }

  const dailyResult = await pool.query(`
    SELECT to_char(date_trunc('day', updated_at), 'YYYY-MM-DD') AS day,
           COUNT(*) AS completed,
           COALESCE(SUM(total_rub), 0) AS turnover_rub
    FROM orders
    WHERE status = 'COMPLETED' AND updated_at >= NOW() - INTERVAL '14 days'
    GROUP BY 1
    ORDER BY 1
  `)

  return {
    today: build('d'),
    week: build('w'),
    month: build('m'),
    all: build('all'),
    active: num('active'),
    daily: dailyResult.rows.map((r) => ({
      date: String(r.day),
      completed: Number(r.completed),
      turnoverRub: Number(r.turnover_rub),
    })),
  }
}

export async function createSourcingRequest(data: {
  userId: number
  description: string
  imageUrl: string
  link?: string
  priceRub?: number
}) {
  await ensureReady()
  const pool = getPool()
  const id = randomUUID()
  const now = new Date().toISOString()
  await pool.query(
    `INSERT INTO sourcing_requests
      (id, user_id, description, image_url, link, price_rub, status, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7)`,
    [id, data.userId, data.description, data.imageUrl, data.link ?? null, data.priceRub ?? null, now],
  )
  return {
    id,
    userId: data.userId,
    description: data.description,
    imageUrl: data.imageUrl,
    link: data.link,
    priceRub: data.priceRub,
    status: 'PENDING' as SourcingStatus,
    createdAt: now,
  }
}

export async function getLastSourcingRequest(userId: number) {
  await ensureReady()
  const pool = getPool()
  const result = await pool.query(
    'SELECT * FROM sourcing_requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
    [userId],
  )
  return result.rows[0] ? mapSourcing(result.rows[0]) : undefined
}

export async function getSourcingRequestById(requestId: string) {
  await ensureReady()
  const pool = getPool()
  const result = await pool.query('SELECT * FROM sourcing_requests WHERE id = $1', [requestId])
  return result.rows[0] ? mapSourcing(result.rows[0]) : undefined
}

export async function answerSourcingRequest(data: { requestId: string; answerCny: number; comment?: string }) {
  await ensureReady()
  const pool = getPool()
  const now = new Date().toISOString()
  const result = await pool.query(
    `UPDATE sourcing_requests
      SET answer_cny = $2,
          comment = $3,
          status = 'ANSWERED',
          answered_at = $4
      WHERE id = $1
      RETURNING *`,
    [data.requestId, data.answerCny, data.comment ?? null, now],
  )
  return result.rows[0] ? mapSourcing(result.rows[0]) : undefined
}

export async function declineSourcingRequest(requestId: string) {
  await ensureReady()
  const pool = getPool()
  const now = new Date().toISOString()
  const result = await pool.query(
    `UPDATE sourcing_requests
      SET status = 'DECLINED',
          answered_at = $2
      WHERE id = $1
      RETURNING *`,
    [requestId, now],
  )
  return result.rows[0] ? mapSourcing(result.rows[0]) : undefined
}

export async function getAdminSession(adminId: number): Promise<AdminSession> {
  await ensureReady()
  const pool = getPool()
  const result = await pool.query('SELECT * FROM admin_sessions WHERE admin_id = $1', [adminId])
  const row = result.rows[0]
  if (!row) return { stage: 'idle' }
  return {
    stage: row.stage as AdminSession['stage'],
    photoUrl: (row.photo_url as string | null) ?? undefined,
    sourcingRequestId: (row.sourcing_request_id as string | null) ?? undefined,
  }
}

export async function setAdminSession(adminId: number, session: AdminSession) {
  await ensureReady()
  const pool = getPool()
  await pool.query(
    `INSERT INTO admin_sessions (admin_id, stage, photo_url, sourcing_request_id)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (admin_id) DO UPDATE
      SET stage = EXCLUDED.stage,
          photo_url = EXCLUDED.photo_url,
          sourcing_request_id = EXCLUDED.sourcing_request_id`,
    [adminId, session.stage, session.photoUrl ?? null, session.sourcingRequestId ?? null],
  )
}

export async function addPaymentStep(data: {
  orderId: string
  amountRub: number
  method: PaymentMethod
  requisiteValue: string
  bankName: string
  receiptEmail: string
  status?: PaymentStatus
}) {
  await ensureReady()
  const pool = getPool()
  const result = await pool.query(
    'SELECT COALESCE(MAX(step_index), 0) as max_index FROM payment_steps WHERE order_id = $1',
    [data.orderId],
  )
  const nextIndex = Number(result.rows[0]?.max_index ?? 0) + 1
  const now = new Date().toISOString()
  const id = randomUUID()
  const status = data.status ?? 'WAITING_FOR_PAYMENT'
  await pool.query(
    `INSERT INTO payment_steps
      (id, order_id, step_index, status, amount_rub, method, requisite_value, bank_name, receipt_email, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      id,
      data.orderId,
      nextIndex,
      status,
      data.amountRub,
      data.method,
      data.requisiteValue,
      data.bankName,
      data.receiptEmail,
      now,
      now,
    ],
  )
  const step = await pool.query('SELECT * FROM payment_steps WHERE id = $1', [id])
  return mapStep(step.rows[0])
}

export async function verifyPaymentStep(orderId: string, stepId: string) {
  await ensureReady()
  const pool = getPool()
  const now = new Date().toISOString()
  const result = await pool.query(
    "UPDATE payment_steps SET status = 'VERIFIED', updated_at = $3 WHERE id = $1 AND order_id = $2 RETURNING *",
    [stepId, orderId, now],
  )
  return result.rows[0] ? mapStep(result.rows[0]) : undefined
}

export async function completeOrder(orderId: string, options?: { force?: boolean }) {
  await ensureReady()
  const pool = getPool()
  if (options?.force) {
    // Принудительное завершение: клиент не нажал «Оплатил», но оператор
    // подтверждает, что деньги фактически получены. Незавершённые этапы
    // помечаем подтверждёнными, чтобы архив и статистика оставались честными.
    const now = new Date().toISOString()
    await pool.query(
      "UPDATE payment_steps SET status = 'VERIFIED', updated_at = $2 WHERE order_id = $1 AND status != 'CANCELED'",
      [orderId, now],
    )
  } else {
    const blocking = await pool.query(
      "SELECT 1 FROM payment_steps WHERE order_id = $1 AND status IN ('WAITING_FOR_PAYMENT', 'PAID') LIMIT 1",
      [orderId],
    )
    if (blocking.rowCount && blocking.rowCount > 0) {
      return { error: 'Active steps exist' as const }
    }
  }
  const now = new Date().toISOString()
  const result = await pool.query(
    "UPDATE orders SET status = 'COMPLETED', updated_at = $2 WHERE id = $1 RETURNING *",
    [orderId, now],
  )
  return result.rows[0] ? mapOrder(result.rows[0]) : undefined
}

export async function adminCancelOrder(orderId: string) {
  await ensureReady()
  const pool = getPool()
  const now = new Date().toISOString()
  const result = await pool.query(
    "UPDATE orders SET status = 'CANCELED', updated_at = $2 WHERE id = $1 RETURNING *",
    [orderId, now],
  )
  return result.rows[0] ? mapOrder(result.rows[0]) : undefined
}

// Смена статуса оператором из архива: отмена (сделка не идёт в статистику),
// пометка завершённой, либо возврат в активные. Этапы правим согласованно,
// чтобы активная сделка не осталась без ожидающих оплаты шагов.
export async function setOrderStatus(orderId: string, status: OrderStatus) {
  await ensureReady()
  const pool = getPool()
  const now = new Date().toISOString()
  const result = await pool.query(
    'UPDATE orders SET status = $2, updated_at = $3 WHERE id = $1 RETURNING *',
    [orderId, status, now],
  )
  if (!result.rows[0]) return undefined

  if (status === 'CANCELED') {
    await pool.query(
      "UPDATE payment_steps SET status = 'CANCELED', updated_at = $2 WHERE order_id = $1 AND status != 'VERIFIED'",
      [orderId, now],
    )
  } else if (status === 'IN_PROGRESS' || status === 'CREATED') {
    // Возврат в работу: ранее отменённые этапы снова ждут оплаты.
    await pool.query(
      "UPDATE payment_steps SET status = 'WAITING_FOR_PAYMENT', updated_at = $2 WHERE order_id = $1 AND status = 'CANCELED'",
      [orderId, now],
    )
  }

  return mapOrder(result.rows[0])
}
