// Пул подключений к PostgreSQL для заявок, этапов оплаты, чата, витрины и запросов.
// Строка подключения берётся из DATABASE_URL.

import { Pool } from 'pg'

const globalPool = globalThis as typeof globalThis & {
  apfPool?: Pool
  apfSchemaReady?: boolean
}

function createPool() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured')
  }

  // PGlite (локальная разработка) обслуживает соединения последовательно,
  // поэтому пул ограничиваем через PG_POOL_MAX=1.
  const max = Number(process.env.PG_POOL_MAX)
  return new Pool({
    connectionString,
    ...(Number.isFinite(max) && max > 0 ? { max } : {}),
  })
}

export function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL)
}

export function getPool() {
  if (!globalPool.apfPool) {
    globalPool.apfPool = createPool()
  }
  return globalPool.apfPool
}

export async function ensureSchema() {
  if (globalPool.apfSchemaReady) return
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      status TEXT NOT NULL,
      total_rub INTEGER NOT NULL,
      total_cny INTEGER NOT NULL,
      rate NUMERIC NOT NULL,
      alipay_id TEXT,
      full_name TEXT,
      contact_username TEXT,
      contact_phone TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payment_steps (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      step_index INTEGER NOT NULL,
      status TEXT NOT NULL,
      amount_rub INTEGER NOT NULL,
      method TEXT NOT NULL,
      requisite_value TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      receipt_email TEXT NOT NULL,
      receipt_file_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_messages (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      sender_role TEXT NOT NULL,
      text TEXT,
      file_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS showcase_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      image_url TEXT NOT NULL,
      price_cny INTEGER NOT NULL,
      price_rub INTEGER NOT NULL,
      benefit_rub INTEGER NOT NULL,
      is_published BOOLEAN NOT NULL DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS sourcing_requests (
      id TEXT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      link TEXT,
      price_rub INTEGER,
      answer_cny INTEGER,
      comment TEXT,
      status TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL,
      answered_at TIMESTAMP WITH TIME ZONE
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      admin_id BIGINT PRIMARY KEY,
      stage TEXT NOT NULL,
      photo_url TEXT,
      sourcing_request_id TEXT
    );

    ALTER TABLE orders
      ALTER COLUMN alipay_id DROP NOT NULL,
      ALTER COLUMN full_name DROP NOT NULL;

    ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS contact_username TEXT,
      ADD COLUMN IF NOT EXISTS contact_phone TEXT;

    ALTER TABLE admin_sessions
      ADD COLUMN IF NOT EXISTS sourcing_request_id TEXT;
  `)

  globalPool.apfSchemaReady = true
}
