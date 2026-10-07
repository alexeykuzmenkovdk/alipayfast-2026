// Единая точка для обращений к Telegram Bot API.
//
// Сервер размещается в РФ, поэтому доступ к api.telegram.org может быть
// нестабильным. Все запросы к Telegram идут через telegramRequest, который умеет
// ходить напрямую или через прокси:
//
//   TELEGRAM_PROXY_URL=http://127.0.0.1:10809   — HTTP(S)-прокси
//   TELEGRAM_PROXY_URL=socks5://127.0.0.1:10808 — SOCKS5
//
// VLESS/XTTP сам по себе не является HTTP-прокси, поэтому на сервере нужно
// поднять локальный клиент (xray/sing-box), который слушает 127.0.0.1 и
// выпускает трафик наружу через ваш VLESS-сервер. Приложению достаточно указать
// его локальный порт в TELEGRAM_PROXY_URL.

import http from 'node:http'
import https from 'node:https'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { SocksProxyAgent } from 'socks-proxy-agent'

const DEFAULT_TIMEOUT_MS = 8000

export interface TelegramHttpResponse {
  ok: boolean
  status: number
  body: string
  error?: string
  viaProxy: boolean
}

export function proxyUrl() {
  return (process.env.TELEGRAM_PROXY_URL ?? '').trim()
}

// Адрес Bot API. Меняется только для локальных тестов.
export function telegramApiBase() {
  return (process.env.TELEGRAM_API_BASE ?? 'https://api.telegram.org').trim().replace(/\/$/, '')
}

export function isProxyConfigured() {
  return proxyUrl().length > 0
}

let cachedAgent: { url: string; agent: http.Agent } | null = null

function agentFor(url: string) {
  if (cachedAgent?.url === url) return cachedAgent.agent

  let agent: http.Agent
  try {
    const protocol = new URL(url).protocol
    agent = protocol.startsWith('socks') ? new SocksProxyAgent(url) : new HttpsProxyAgent(url)
  } catch {
    throw new Error(`Некорректный TELEGRAM_PROXY_URL: ${url}`)
  }

  cachedAgent = { url, agent }
  return agent
}

// Выполняет запрос к Telegram напрямую или через прокси из TELEGRAM_PROXY_URL.
export function telegramRequest(
  url: string,
  options: { method?: string; headers?: Record<string, string>; body?: string; timeoutMs?: number } = {},
): Promise<TelegramHttpResponse> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const configuredProxy = proxyUrl()
  const viaProxy = Boolean(configuredProxy)

  let agent: http.Agent | undefined
  if (viaProxy) {
    try {
      agent = agentFor(configuredProxy)
    } catch (error) {
      return Promise.resolve({
        ok: false,
        status: 0,
        body: '',
        error: error instanceof Error ? error.message : 'Ошибка настройки прокси',
        viaProxy: false,
      })
    }
  }

  return new Promise((resolve) => {
    // Схема выбирается по адресу: https для Telegram, http — для локальных тестов.
    const transport = url.startsWith('http://') ? http : https

    const request = transport.request(
      url,
      {
        method: options.method ?? 'GET',
        headers: options.headers,
        agent,
        signal: AbortSignal.timeout(timeoutMs),
      },
      (response) => {
        let body = ''
        response.setEncoding('utf8')
        response.on('data', (chunk) => (body += chunk))
        response.on('end', () => {
          const status = response.statusCode ?? 0
          resolve({ ok: status >= 200 && status < 300, status, body, viaProxy })
        })
      },
    )

    request.on('error', (error: Error) => {
      resolve({ ok: false, status: 0, body: '', error: error.message, viaProxy })
    })

    if (options.body) request.write(options.body)
    request.end()
  })
}

export function parseTelegramResponse(response: TelegramHttpResponse): {
  ok: boolean
  description?: string
  result?: unknown
} {
  if (response.error && !response.body) {
    return { ok: false, description: response.error }
  }

  try {
    const data = JSON.parse(response.body)
    return { ok: Boolean(data.ok), description: data.description, result: data.result }
  } catch {
    return { ok: false, description: `Некорректный ответ Telegram (HTTP ${response.status})` }
  }
}

// Проверка связности: как настроено сейчас и напрямую, для сравнения.
export async function telegramReachability() {
  const token = process.env.TELEGRAM_SITE_BOT_TOKEN ?? process.env.TELEGRAM_MINI_APP_BOT_TOKEN ?? ''
  const url = token ? `${telegramApiBase()}/bot${token}/getMe` : `${telegramApiBase()}/`

  const current = parseTelegramResponse(await telegramRequest(url, { timeoutMs: 6000 }))

  // Проверяем прямое соединение, временно игнорируя прокси.
  const saved = process.env.TELEGRAM_PROXY_URL
  delete process.env.TELEGRAM_PROXY_URL
  const direct = parseTelegramResponse(await telegramRequest(url, { timeoutMs: 6000 }))
  if (saved !== undefined) process.env.TELEGRAM_PROXY_URL = saved

  return {
    proxyConfigured: Boolean(saved),
    proxyUrl: saved ?? '',
    direct: { ok: direct.ok, description: direct.description },
    viaProxy: saved ? { ok: current.ok, description: current.description } : null,
    reachable: current.ok,
  }
}
