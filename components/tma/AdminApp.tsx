'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ORDER_STATUS, STEP_STATUS, fmtCny, fmtDateTime, fmtRub, fmtTime, type Order, type OrderMessage, type PaymentStep } from './types'
import { useTelegram } from './useTelegram'

interface Stats {
  today: Period
  week: Period
  month: Period
  all: Period
  active: number
  daily: { date: string; completed: number; turnoverRub: number }[]
}

interface Period {
  completed: number
  canceled: number
  turnoverRub: number
  turnoverCny: number
  avgRate: number
}

type Tab = 'active' | 'archive' | 'stats'

const QUICK_REPLIES = [
  'Здравствуйте! Отправляю реквизиты для оплаты.',
  'Пожалуйста, отправьте QR-код для оплаты или скриншот экрана с QR-кодом.',
  'Чек получен, проверяю оплату. Ожидайте подтверждения.',
  'Оплата подтверждена, юани зачисляются на Alipay в течение ~15 минут.',
]

// Причина отказа приходит в теле 401: без неё «доступ только для оператора»
// не отличить от «открыли вне Telegram» и «подпись не сошлась».
async function deniedReasonFrom(res: Response) {
  const data = (await res.json().catch(() => null)) as { reason?: string } | null
  return data?.reason ?? `HTTP ${res.status}`
}

function deniedText(reason: string) {
  if (reason === 'no_init_data') {
    return 'Приложение открыто вне Telegram: сервер не получил данные сессии. Откройте панель из бота.'
  }
  if (reason.startsWith('not_operator:')) {
    return `Вы вошли под Telegram ID ${reason.slice('not_operator:'.length)}, а доступ разрешён только аккаунту из ADMIN_USER_ID.`
  }
  if (reason === 'admin_user_id_missing') {
    return 'На сервере не задан ADMIN_USER_ID — доступ открыть некому.'
  }
  if (reason.startsWith('signed_by:')) {
    return `Данные подписаны другим Telegram-ботом (${reason.slice('signed_by:'.length)}). Откройте панель из @AlipayFastBot.`
  }
  if (reason === 'signature_mismatch') {
    return 'Подпись Telegram не совпала. Откройте панель из @AlipayFastBot.'
  }
  return `Сервер отклонил доступ (${reason}).`
}

export function AdminApp() {
  const telegram = useTelegram()

  const [tab, setTab] = useState<Tab>('active')
  const [denied, setDenied] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const [orders, setOrders] = useState<Order[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [steps, setSteps] = useState<PaymentStep[]>([])
  const [messages, setMessages] = useState<OrderMessage[]>([])
  const [chatText, setChatText] = useState('')

  const [stats, setStats] = useState<Stats | null>(null)

  const [stepForm, setStepForm] = useState({
    amountRub: '',
    method: 'SBP',
    requisiteValue: '',
    bankName: 'Т-Банк',
    receiptEmail: '',
  })

  const chatRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(() => orders.find((order) => order.id === selectedId), [orders, selectedId])

  const loadOrders = useCallback(async () => {
    const status = tab === 'active' ? 'active' : 'archive'
    const res = await fetch(`/api/admin/orders?status=${status}`, { headers: telegram.headers, cache: 'no-store' })
    if (res.status === 401) {
      setDenied(await deniedReasonFrom(res))
      return
    }
    setDenied(null)
    const data = await res.json()
    setOrders(data.orders ?? [])
    setSelectedId((prev) => (status === 'active' && prev && data.orders?.some((o: Order) => o.id === prev) ? prev : data.orders?.[0]?.id ?? ''))
  }, [tab, telegram.headers])

  const loadStats = useCallback(async () => {
    const res = await fetch('/api/admin/stats', { headers: telegram.headers, cache: 'no-store' })
    if (res.status === 401) {
      setDenied(await deniedReasonFrom(res))
      return
    }
    setDenied(null)
    setStats(await res.json())
  }, [telegram.headers])

  const loadDeal = useCallback(
    async (orderId: string) => {
      if (!orderId) return
      const [orderRes, messagesRes] = await Promise.all([
        fetch(`/api/admin/orders/${orderId}`, { headers: telegram.headers, cache: 'no-store' }),
        fetch(`/api/admin/orders/${orderId}/messages`, { headers: telegram.headers, cache: 'no-store' }),
      ])
      if (orderRes.status === 401 || messagesRes.status === 401) {
        setDenied(await deniedReasonFrom(orderRes.status === 401 ? orderRes : messagesRes))
        return
      }
      setDenied(null)
      const orderData = await orderRes.json()
      const messagesData = await messagesRes.json()
      setSteps(orderData.steps ?? [])
      setMessages(messagesData.messages ?? [])
    },
    [telegram.headers],
  )

  useEffect(() => {
    if (!telegram.ready) return
    if (tab === 'stats') {
      loadStats()
      return
    }
    loadOrders()
    const id = window.setInterval(loadOrders, 15000)
    return () => window.clearInterval(id)
  }, [telegram.ready, tab, loadOrders, loadStats])

  useEffect(() => {
    if (!telegram.ready || !selectedId || tab === 'stats') return
    loadDeal(selectedId)
    const id = window.setInterval(() => loadDeal(selectedId), 5000)
    return () => window.clearInterval(id)
  }, [telegram.ready, selectedId, tab, loadDeal])

  useEffect(() => {
    const node = chatRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [messages.length])

  const act = async (path: string, method: 'POST', payload?: unknown, okText?: string) => {
    setBusy(true)
    setNotice(null)
    try {
      const res = await fetch(path, {
        method,
        headers: { 'Content-Type': 'application/json', ...telegram.headers },
        body: payload ? JSON.stringify(payload) : undefined,
      })
      if (res.status === 401) {
        setDenied(await deniedReasonFrom(res))
        return false
      }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setNotice({ kind: 'err', text: data.error ?? 'Не получилось выполнить действие' })
        return false
      }
      setDenied(null)
      if (okText) setNotice({ kind: 'ok', text: okText })
      return true
    } finally {
      setBusy(false)
    }
  }

  const sendStep = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedId || !stepForm.amountRub || !stepForm.requisiteValue) {
      setNotice({ kind: 'err', text: 'Заполните сумму и реквизит' })
      return
    }
    const ok = await act(
      `/api/admin/orders/${selectedId}/steps`,
      'POST',
      {
        amountRub: Number(stepForm.amountRub),
        method: stepForm.method,
        requisiteValue: stepForm.requisiteValue,
        bankName: stepForm.bankName,
        receiptEmail: stepForm.receiptEmail,
      },
      'Реквизиты отправлены клиенту',
    )
    if (ok) {
      setStepForm({ amountRub: '', method: 'SBP', requisiteValue: '', bankName: 'Т-Банк', receiptEmail: '' })
      await loadDeal(selectedId)
      await loadOrders()
    }
  }

  const sendMessage = async (text: string) => {
    if (!selectedId || !text.trim()) return
    const ok = await act(`/api/admin/orders/${selectedId}/messages`, 'POST', { text: text.trim() })
    if (ok) {
      setChatText('')
      await loadDeal(selectedId)
    }
  }

  const verify = async (stepId: string) => {
    if (!selectedId) return
    const ok = await act(`/api/admin/orders/${selectedId}/steps/${stepId}/verify`, 'POST', undefined, 'Платёж подтверждён')
    if (ok) {
      await loadDeal(selectedId)
      await loadOrders()
    }
  }

  const finish = async (action: 'complete' | 'cancel') => {
    if (!selectedId) return
    const ok = await act(
      `/api/admin/orders/${selectedId}/${action}`,
      'POST',
      undefined,
      action === 'complete' ? 'Сделка завершена и ушла в архив' : 'Сделка отменена',
    )
    if (ok) {
      await loadOrders()
      await loadDeal(selectedId)
    }
  }

  if (!telegram.ready) {
    return <div className="tma-loading">Загружаем панель оператора…</div>
  }

  if (denied) {
    return (
      <div className="tma">
        <main className="tma-body" style={{ paddingTop: 40 }}>
          <div className="tma-alert err">Доступ только для оператора. {deniedText(denied)}</div>
          <div className="tma-hint" style={{ marginTop: 12 }}>
            Вы вошли как @{telegram.userLabel} (ID {telegram.user?.id ?? '—'}). Код причины: <b>{denied}</b>
          </div>
          <button
            className="tma-btn"
            type="button"
            style={{ marginTop: 16 }}
            onClick={() => {
              setDenied(null)
              loadOrders()
              loadStats()
            }}
          >
            Повторить
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="tma">
      <header className="tma-top">
        <div className="tma-mark">A</div>
        <div className="tma-top-txt">
          <div className="tma-title">Оператор</div>
          <div className="tma-user">@{telegram.userLabel}</div>
        </div>
        <div className="tma-rate">{stats ? `${stats.active} в работе` : '—'}</div>
      </header>

      <nav className="tma-tabs">
        {(
          [
            ['active', 'Заявки'],
            ['archive', 'Архив'],
            ['stats', 'Статистика'],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button key={key} type="button" className={`tma-tab${tab === key ? ' on' : ''}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </nav>

      <main className="tma-body">
        {notice && <div className={`tma-alert ${notice.kind === 'err' ? 'err' : 'ok'}`}>{notice.text}</div>}

        {tab === 'stats' && (
          <>
            <section className="tma-card">
              <h2 className="tma-h">Исполнено сделок</h2>
              <div className="adm-stats">
                {(
                  [
                    ['Сегодня', stats?.today],
                    ['Неделя', stats?.week],
                    ['Месяц', stats?.month],
                    ['Всего', stats?.all],
                  ] as [string, Period | undefined][]
                ).map(([label, period]) => (
                  <div key={label} className="adm-stat">
                    <span>{label}</span>
                    <b>{period?.completed ?? 0}</b>
                    <em>{fmtRub(period?.turnoverRub ?? 0)}</em>
                    <i>{fmtCny(period?.turnoverCny ?? 0)}</i>
                  </div>
                ))}
              </div>
              <div className="tma-hint">
                Средний курс за месяц: {(stats?.month.avgRate ?? 0).toFixed(2)} ₽ · отменено за всё время:{' '}
                {stats?.all.canceled ?? 0}
              </div>
            </section>

            <section className="tma-card">
              <b className="tma-step-title">Последние 14 дней</b>
              {stats?.daily?.length ? (
                <div className="adm-bars">
                  {stats.daily.map((day) => {
                    const max = Math.max(...stats.daily.map((d) => d.completed), 1)
                    return (
                      <div key={day.date} className="adm-bar">
                        <div className="adm-bar-fill" style={{ height: `${Math.round((day.completed / max) * 100)}%` }} />
                        <span>{day.completed}</span>
                        <i>{day.date.slice(8)}.{day.date.slice(5, 7)}</i>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="tma-empty">Завершённых сделок пока нет</div>
              )}
            </section>
          </>
        )}

        {tab !== 'stats' && !selected && <div className="tma-empty">Заявок нет</div>}

        {tab !== 'stats' && selected && (
          <>
            <section className="tma-card">
              <div className="tma-room-head">
                <div>
                  <h2 className="tma-h">#{selected.id.slice(0, 6)}</h2>
                  <p className="tma-sub">{fmtDateTime(selected.createdAt)}</p>
                </div>
                <span className={`tma-pill ${selected.status === 'COMPLETED' ? 'ok' : selected.status === 'CANCELED' ? 'mute' : 'red'}`}>
                  {ORDER_STATUS[selected.status]}
                </span>
              </div>
              <div className="tma-kv">
                <div>
                  <span>Отдаёт</span>
                  <b>{fmtRub(selected.totalRub)}</b>
                </div>
                <div>
                  <span>Получает</span>
                  <b>{fmtCny(selected.totalCny)}</b>
                </div>
                <div>
                  <span>Курс</span>
                  <b>{selected.rate.toFixed(2)} ₽</b>
                </div>
                <div>
                  <span>Клиент</span>
                  <b>{selected.contactUsername ? `@${selected.contactUsername}` : selected.contactPhone ?? `ID ${selected.userId}`}</b>
                </div>
              </div>
            </section>

            {tab === 'active' && (
              <section className="tma-card">
                <b className="tma-step-title">Прислать реквизиты</b>
                <form onSubmit={sendStep} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="tma-row">
                    <label className="tma-label" style={{ flex: 1 }}>
                      <span>Сумма, ₽</span>
                      <input
                        className="tma-input"
                        value={stepForm.amountRub}
                        inputMode="numeric"
                        onChange={(event) => setStepForm((prev) => ({ ...prev, amountRub: event.target.value.replace(/[^\d]/g, '') }))}
                      />
                    </label>
                    <label className="tma-label" style={{ flex: 1 }}>
                      <span>Метод</span>
                      <select
                        className="tma-input"
                        value={stepForm.method}
                        onChange={(event) => setStepForm((prev) => ({ ...prev, method: event.target.value }))}
                      >
                        <option value="SBP">СБП</option>
                        <option value="CARD">Карта</option>
                      </select>
                    </label>
                  </div>
                  <label className="tma-label">
                    <span>Реквизит (телефон или карта)</span>
                    <input
                      className="tma-input"
                      value={stepForm.requisiteValue}
                      placeholder="+7 999 000-00-00"
                      onChange={(event) => setStepForm((prev) => ({ ...prev, requisiteValue: event.target.value }))}
                    />
                  </label>
                  <div className="tma-row">
                    <label className="tma-label" style={{ flex: 1 }}>
                      <span>Банк</span>
                      <input
                        className="tma-input"
                        value={stepForm.bankName}
                        onChange={(event) => setStepForm((prev) => ({ ...prev, bankName: event.target.value }))}
                      />
                    </label>
                    <label className="tma-label" style={{ flex: 1 }}>
                      <span>Email для чека</span>
                      <input
                        className="tma-input"
                        value={stepForm.receiptEmail}
                        placeholder="pay@alipayfast.ru"
                        onChange={(event) => setStepForm((prev) => ({ ...prev, receiptEmail: event.target.value }))}
                      />
                    </label>
                  </div>
                  <button className="tma-btn" type="submit" disabled={busy}>
                    {busy ? 'Отправляем…' : 'Отправить клиенту'}
                  </button>
                </form>
              </section>
            )}

            <section className="tma-card">
              <b className="tma-step-title">Этапы</b>
              {steps.length === 0 ? (
                <div className="tma-empty">Реквизиты ещё не отправлялись</div>
              ) : (
                <div className="tma-steps">
                  {steps.map((step) => (
                    <div key={step.id} className="tma-step-row">
                      <div>
                        <b>Этап {step.stepIndex}</b>
                        <div className="tma-hint">
                          {STEP_STATUS[step.status]} · {fmtRub(step.amountRub)} · {step.requisiteValue}
                        </div>
                        {step.receiptFileUrl && (
                          <a className="tma-receipt" href={step.receiptFileUrl} target="_blank" rel="noreferrer">
                            Чек клиента
                          </a>
                        )}
                      </div>
                      {step.status === 'PAID' ? (
                        <button className="tma-btn" type="button" style={{ width: 'auto' }} disabled={busy} onClick={() => verify(step.id)}>
                          Подтвердить
                        </button>
                      ) : (
                        <span className="tma-pill mute">{STEP_STATUS[step.status]}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="tma-chat-card">
              <div className="tma-chat-head">
                <b className="tma-step-title">Чат с клиентом</b>
                <span className="tma-hint">уведомления уходят в Telegram</span>
              </div>
              <div className="tma-chat tma-chat-big" ref={chatRef}>
                {messages.length === 0 ? (
                  <div className="tma-empty">Сообщений нет</div>
                ) : (
                  messages.map((message) =>
                    message.senderRole === 'system' ? (
                      <div key={message.id} className="tma-system">
                        {message.text}
                      </div>
                    ) : (
                      <div key={message.id} className={`tma-msg${message.senderRole === 'admin' ? ' admin' : ''}`}>
                        <div className="tma-msg meta">
                          {message.senderRole === 'admin' ? 'Оператор' : 'Клиент'} · {fmtTime(message.createdAt)}
                        </div>
                        {message.text}
                      </div>
                    ),
                  )
                )}
              </div>
              <div className="tma-chat-input">
                <textarea
                  className="tma-textarea"
                  rows={2}
                  value={chatText}
                  placeholder="Сообщение клиенту…"
                  onChange={(event) => setChatText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      sendMessage(chatText)
                    }
                  }}
                />
                <button className="tma-btn" type="button" disabled={busy || !chatText.trim()} onClick={() => sendMessage(chatText)}>
                  Отправить
                </button>
              </div>
              <div className="tma-quick">
                {QUICK_REPLIES.map((reply) => (
                  <button key={reply} type="button" className="tma-quick-btn" disabled={busy} onClick={() => sendMessage(reply)}>
                    {reply}
                  </button>
                ))}
              </div>
            </section>

            {tab === 'active' && (
              <section className="tma-card">
                <div className="tma-row">
                  <button className="tma-btn" type="button" disabled={busy} onClick={() => finish('complete')}>
                    Завершить сделку
                  </button>
                  <button className="tma-btn danger" type="button" disabled={busy} onClick={() => finish('cancel')}>
                    Отменить
                  </button>
                </div>
                <div className="tma-hint">Завершённые сделки уходят в архив и попадают в статистику.</div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}
