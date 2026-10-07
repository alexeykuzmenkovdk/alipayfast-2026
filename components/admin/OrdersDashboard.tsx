'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface AdminOrder {
  id: string
  userId: number
  status: string
  totalRub: number
  totalCny: number
  rate: number
  contactUsername?: string | null
  contactPhone?: string | null
  createdAt: string
  messageCount: number
  lastMessage: string | null
}

interface AdminStep {
  id: string
  stepIndex: number
  status: string
  amountRub: number
  method: string
  requisiteValue: string
  bankName: string
  receiptEmail: string
  receiptFileUrl?: string
}

interface AdminMessage {
  id: string
  senderRole: 'client' | 'admin' | 'system'
  text?: string
  createdAt: string
}

interface ShowcaseItem {
  id: string
  title: string
  imageUrl: string
  priceCny: number
  priceRub: number
  benefitRub: number
  isPublished: boolean
}

const TOKEN_KEY = 'apf_admin_token'

const ORDER_STATUS: Record<string, string> = {
  CREATED: 'Новая',
  IN_PROGRESS: 'В работе',
  COMPLETED: 'Завершена',
  CANCELED: 'Отменена',
}

const STEP_STATUS: Record<string, string> = {
  WAITING_FOR_DETAILS: 'Ждём данные',
  WAITING_FOR_PAYMENT: 'Ожидает оплаты',
  PAID: 'Оплачен, проверяем',
  VERIFIED: 'Подтверждён',
  CANCELED: 'Отменён',
}

const QUICK_REPLIES: { label: string; text: string }[] = [
  {
    label: 'Запросить QR-код',
    text: 'Пожалуйста, отправьте QR-код для оплаты или скриншот экрана с QR-кодом. После этого вернитесь в мини-приложение.',
  },
  {
    label: 'Запросить медиа',
    text: 'Пожалуйста, отправьте фото или видео подтверждения. После отправки вернитесь в мини-приложение.',
  },
]

function rub(value: number) {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`
}

function contactLabel(order: AdminOrder) {
  if (order.contactUsername) return `@${order.contactUsername}`
  if (order.contactPhone) return order.contactPhone
  return `ID ${order.userId}`
}

export function OrdersDashboard() {
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)

  const [tab, setTab] = useState<'orders' | 'showcase'>('orders')
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [selectedId, setSelectedId] = useState('')

  const [steps, setSteps] = useState<AdminStep[]>([])
  const [messages, setMessages] = useState<AdminMessage[]>([])
  const [messageText, setMessageText] = useState('')
  const [busy, setBusy] = useState(false)

  const [stepForm, setStepForm] = useState({
    amountRub: '',
    method: 'SBP',
    requisiteValue: '',
    bankName: 'Т-Банк',
    receiptEmail: '',
  })

  const [items, setItems] = useState<ShowcaseItem[]>([])
  const [itemForm, setItemForm] = useState({
    title: '',
    imageUrl: '',
    priceCny: '',
    priceRub: '',
    benefitRub: '',
    isPublished: true,
  })

  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) : null
    if (saved) setToken(saved)
  }, [])

  const withToken = useCallback((path: string) => `${path}${path.includes('?') ? '&' : '?'}token=${encodeURIComponent(token ?? '')}`, [token])

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setOrders([])
    setSelectedId('')
  }, [])

  const handle401 = useCallback(() => {
    setNotice({ kind: 'err', text: 'Сессия истекла, войдите заново.' })
    logout()
  }, [logout])

  const login = async (event: React.FormEvent) => {
    event.preventDefault()
    setAuthError(null)
    setBusy(true)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setAuthError(data.message ?? 'Неверный пароль')
        return
      }
      sessionStorage.setItem(TOKEN_KEY, data.token)
      setPassword('')
      setToken(data.token)
    } catch {
      setAuthError('Ошибка авторизации')
    } finally {
      setBusy(false)
    }
  }

  const loadOrders = useCallback(async () => {
    if (!token) return
    setOrdersLoading(true)
    try {
      const res = await fetch(withToken('/api/admin/orders'), { cache: 'no-store' })
      if (res.status === 401) {
        handle401()
        return
      }
      const data = await res.json()
      if (!mounted.current) return
      setOrders(data.orders ?? [])
      if (data.dbConfigured === false) {
        setNotice({ kind: 'err', text: 'DATABASE_URL не настроен — заявки недоступны.' })
      }
      setSelectedId((prev) => prev || data.orders?.[0]?.id || '')
    } finally {
      if (mounted.current) setOrdersLoading(false)
    }
  }, [token, withToken, handle401])

  const loadOrder = useCallback(
    async (orderId: string) => {
      if (!token || !orderId) return
      try {
        const [messagesRes, stepsRes] = await Promise.all([
          fetch(withToken(`/api/admin/orders/${orderId}/messages`), { cache: 'no-store' }),
          fetch(withToken(`/api/admin/orders/${orderId}`), { cache: 'no-store' }),
        ])
        if (messagesRes.status === 401 || stepsRes.status === 401) {
          handle401()
          return
        }
        const messagesData = await messagesRes.json()
        const stepsData = await stepsRes.json()
        if (!mounted.current) return
        setMessages(messagesData.messages ?? [])
        setSteps(stepsData.steps ?? [])
      } catch (error) {
        console.error(error)
      }
    },
    [token, withToken, handle401],
  )

  const loadShowcase = useCallback(async () => {
    if (!token) return
    const res = await fetch(withToken('/api/admin/showcase'), { cache: 'no-store' })
    if (res.status === 401) {
      handle401()
      return
    }
    const data = await res.json()
    if (mounted.current) setItems(data.items ?? [])
  }, [token, withToken, handle401])

  useEffect(() => {
    if (!token) return
    if (tab === 'orders') {
      loadOrders()
      const id = window.setInterval(loadOrders, 10000)
      return () => window.clearInterval(id)
    }
    loadShowcase()
    return undefined
  }, [token, tab, loadOrders, loadShowcase])

  useEffect(() => {
    if (!token || !selectedId || tab !== 'orders') return
    loadOrder(selectedId)
    const id = window.setInterval(() => loadOrder(selectedId), 5000)
    return () => window.clearInterval(id)
  }, [token, selectedId, tab, loadOrder])

  const sendMessage = async (text: string) => {
    if (!selectedId || !text.trim()) return
    setBusy(true)
    try {
      const res = await fetch(withToken(`/api/admin/orders/${selectedId}/messages`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      })
      if (res.status === 401) {
        handle401()
        return
      }
      if (!res.ok) {
        setNotice({ kind: 'err', text: 'Не удалось отправить сообщение.' })
        return
      }
      const data = await res.json()
      setMessages((prev) => [...prev, data.message])
      setMessageText('')
      setNotice({ kind: 'ok', text: 'Сообщение отправлено клиенту в Telegram.' })
    } finally {
      setBusy(false)
    }
  }

  const orderAction = async (action: 'complete' | 'cancel') => {
    if (!selectedId) return
    setBusy(true)
    try {
      const res = await fetch(withToken(`/api/admin/orders/${selectedId}/${action}`), { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (res.status === 401) {
        handle401()
        return
      }
      if (!res.ok) {
        setNotice({ kind: 'err', text: data.error ?? 'Не удалось выполнить действие.' })
        return
      }
      setNotice({ kind: 'ok', text: action === 'complete' ? 'Заявка завершена.' : 'Заявка отменена.' })
      await loadOrders()
      await loadOrder(selectedId)
    } finally {
      setBusy(false)
    }
  }

  const addStep = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedId) return
    if (!stepForm.amountRub || !stepForm.requisiteValue) {
      setNotice({ kind: 'err', text: 'Укажите сумму и реквизит этапа.' })
      return
    }
    setBusy(true)
    try {
      const res = await fetch(withToken(`/api/admin/orders/${selectedId}/steps`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountRub: Number(stepForm.amountRub),
          method: stepForm.method,
          requisiteValue: stepForm.requisiteValue,
          bankName: stepForm.bankName,
          receiptEmail: stepForm.receiptEmail,
        }),
      })
      if (res.status === 401) {
        handle401()
        return
      }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setNotice({ kind: 'err', text: data.error ?? 'Не удалось добавить этап.' })
        return
      }
      setStepForm({ amountRub: '', method: 'SBP', requisiteValue: '', bankName: 'Т-Банк', receiptEmail: '' })
      setNotice({ kind: 'ok', text: `Этап ${data.step?.stepIndex ?? ''} добавлен, клиент получил уведомление.` })
      await loadOrder(selectedId)
      await loadOrders()
    } finally {
      setBusy(false)
    }
  }

  const verifyStep = async (stepId: string) => {
    if (!selectedId) return
    setBusy(true)
    try {
      const res = await fetch(withToken(`/api/admin/orders/${selectedId}/steps/${stepId}/verify`), { method: 'POST' })
      if (res.status === 401) {
        handle401()
        return
      }
      if (!res.ok) {
        setNotice({ kind: 'err', text: 'Не удалось подтвердить платёж.' })
        return
      }
      setNotice({ kind: 'ok', text: 'Платёж подтверждён.' })
      await loadOrder(selectedId)
      await loadOrders()
    } finally {
      setBusy(false)
    }
  }

  const createItem = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!itemForm.title || !itemForm.imageUrl) {
      setNotice({ kind: 'err', text: 'Заполните название и ссылку на изображение.' })
      return
    }
    setBusy(true)
    try {
      const res = await fetch(withToken('/api/admin/showcase'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: itemForm.title,
          imageUrl: itemForm.imageUrl,
          priceCny: Number(itemForm.priceCny) || 0,
          priceRub: Number(itemForm.priceRub) || 0,
          benefitRub: Number(itemForm.benefitRub) || 0,
          isPublished: itemForm.isPublished,
        }),
      })
      if (res.status === 401) {
        handle401()
        return
      }
      if (!res.ok) {
        setNotice({ kind: 'err', text: 'Не удалось добавить позицию.' })
        return
      }
      setItemForm({ title: '', imageUrl: '', priceCny: '', priceRub: '', benefitRub: '', isPublished: true })
      setNotice({ kind: 'ok', text: 'Позиция добавлена в витрину.' })
      await loadShowcase()
    } finally {
      setBusy(false)
    }
  }

  const toggleItem = async (item: ShowcaseItem) => {
    setBusy(true)
    try {
      const res = await fetch(withToken('/api/admin/showcase'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, isPublished: !item.isPublished }),
      })
      if (res.status === 401) {
        handle401()
        return
      }
      await loadShowcase()
    } finally {
      setBusy(false)
    }
  }

  const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedId), [orders, selectedId])

  if (!token) {
    return (
      <main className="adm-wrap">
        <form className="adm-card" onSubmit={login}>
          <h1 className="adm-h">Заявки · вход</h1>
          <p className="adm-sub">Введите пароль администратора (ADMIN_PASSWORD).</p>
          {authError && <div className="adm-err">{authError}</div>}
          <label className="adm-lbl">
            Пароль
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus />
          </label>
          <button className="adm-btn" disabled={busy}>
            {busy ? 'Проверяем…' : 'Войти'}
          </button>
          <p className="adm-hint">
            Курс настраивается на странице <a href="/admin/exchange">/admin/exchange</a>.
          </p>
        </form>
      </main>
    )
  }

  return (
    <div className="adm-page">
      <header className="adm-top">
        <h1 className="adm-h">AlipayFast · заявки</h1>
        <a className="adm-btn ghost adm-sm" href="/admin/exchange" style={{ display: 'inline-flex', alignItems: 'center' }}>
          Курс
        </a>
        <a className="adm-btn ghost adm-sm" href="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
          На сайт
        </a>
        <button className="adm-btn adm-sm" type="button" onClick={logout}>
          Выйти
        </button>
      </header>

      <nav className="adm-tabs">
        <button className={`adm-tab${tab === 'orders' ? ' on' : ''}`} type="button" onClick={() => setTab('orders')}>
          Заявки
        </button>
        <button className={`adm-tab${tab === 'showcase' ? ' on' : ''}`} type="button" onClick={() => setTab('showcase')}>
          Витрина
        </button>
      </nav>

      <main className="adm-body">
        {notice && <div className={notice.kind === 'err' ? 'adm-err' : 'adm-ok'}>{notice.text}</div>}

        {tab === 'orders' && (
          <div className="adm-grid">
            <section className="adm-panel">
              <div className="adm-row" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 className="adm-panel-h" style={{ marginRight: 'auto' }}>
                  Входящие
                </h2>
                <button className="adm-btn ghost adm-sm" type="button" onClick={loadOrders} disabled={ordersLoading}>
                  {ordersLoading ? 'Обновляем…' : 'Обновить'}
                </button>
              </div>

              <div className="adm-list">
                {orders.length === 0 ? (
                  <div className="adm-empty">{ordersLoading ? 'Загрузка…' : 'Заявок пока нет'}</div>
                ) : (
                  orders.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      className={`adm-row-btn${selectedId === order.id ? ' on' : ''}`}
                      onClick={() => setSelectedId(order.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <b>#{order.id.slice(0, 6)}</b>
                        <span className={`adm-pill ${order.status === 'COMPLETED' ? 'ok' : 'red'}`}>
                          {ORDER_STATUS[order.status] ?? order.status}
                        </span>
                      </div>
                      <div className="adm-hint">
                        {new Date(order.createdAt).toLocaleString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        · {rub(order.totalRub)} · {contactLabel(order)}
                      </div>
                      {order.lastMessage && <div className="adm-hint">Последнее: {order.lastMessage}</div>}
                    </button>
                  ))
                )}
              </div>
            </section>

            <section className="adm-panel">
              {!selectedOrder ? (
                <div className="adm-empty">Выберите заявку слева.</div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h2 className="adm-panel-h" style={{ marginRight: 'auto' }}>
                      Сделка #{selectedOrder.id.slice(0, 6)}
                    </h2>
                    <span className={`adm-pill ${selectedOrder.status === 'COMPLETED' ? 'ok' : 'red'}`}>
                      {ORDER_STATUS[selectedOrder.status] ?? selectedOrder.status}
                    </span>
                  </div>

                  <div className="adm-kv">
                    <div>
                      <span>Отдаю</span>
                      <b>{rub(selectedOrder.totalRub)}</b>
                    </div>
                    <div>
                      <span>Курс</span>
                      <b>{selectedOrder.rate.toFixed(2)} ₽</b>
                    </div>
                    <div>
                      <span>Получаю</span>
                      <b>{Math.round(selectedOrder.totalCny).toLocaleString('ru-RU')} ¥</b>
                    </div>
                    <div>
                      <span>Клиент</span>
                      <b>{contactLabel(selectedOrder)}</b>
                    </div>
                  </div>

                  <div className="adm-steps">
                    {steps.length === 0 ? (
                      <div className="adm-empty">Этапов оплаты нет</div>
                    ) : (
                      steps.map((step) => (
                        <div key={step.id} className="adm-step">
                          <div>
                            <b>Этап {step.stepIndex}</b>
                            <div className="adm-hint">
                              {STEP_STATUS[step.status] ?? step.status} · {rub(step.amountRub)} ·{' '}
                              {step.method === 'SBP' ? 'СБП' : 'Карта'} · {step.requisiteValue}
                            </div>
                            {step.receiptFileUrl && (
                              <a className="adm-hint" href={step.receiptFileUrl} target="_blank" rel="noreferrer">
                                Чек клиента
                              </a>
                            )}
                          </div>
                          {step.status === 'PAID' ? (
                            <button className="adm-btn adm-sm" type="button" disabled={busy} onClick={() => verifyStep(step.id)}>
                              Подтвердить
                            </button>
                          ) : (
                            <span className="adm-pill">{STEP_STATUS[step.status] ?? step.status}</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={addStep} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <h3 className="adm-panel-h" style={{ fontSize: 16 }}>
                      Новый этап оплаты
                    </h3>
                    <div className="adm-3col">
                      <label className="adm-lbl">
                        Сумма, ₽
                        <input
                          className="adm-input"
                          value={stepForm.amountRub}
                          inputMode="numeric"
                          onChange={(event) =>
                            setStepForm((prev) => ({ ...prev, amountRub: event.target.value.replace(/[^\d]/g, '') }))
                          }
                        />
                      </label>
                      <label className="adm-lbl">
                        Метод
                        <select
                          className="adm-select"
                          value={stepForm.method}
                          onChange={(event) => setStepForm((prev) => ({ ...prev, method: event.target.value }))}
                        >
                          <option value="SBP">СБП</option>
                          <option value="CARD">Карта</option>
                        </select>
                      </label>
                      <label className="adm-lbl">
                        Банк
                        <input
                          className="adm-input"
                          value={stepForm.bankName}
                          onChange={(event) => setStepForm((prev) => ({ ...prev, bankName: event.target.value }))}
                        />
                      </label>
                    </div>
                    <div className="adm-3col">
                      <label className="adm-lbl">
                        Реквизит
                        <input
                          className="adm-input"
                          value={stepForm.requisiteValue}
                          placeholder="+7 999 000-00-00"
                          onChange={(event) => setStepForm((prev) => ({ ...prev, requisiteValue: event.target.value }))}
                        />
                      </label>
                      <label className="adm-lbl">
                        Email для чека
                        <input
                          className="adm-input"
                          value={stepForm.receiptEmail}
                          placeholder="pay@alipayfast.ru"
                          onChange={(event) => setStepForm((prev) => ({ ...prev, receiptEmail: event.target.value }))}
                        />
                      </label>
                    </div>
                    <button className="adm-btn" disabled={busy}>
                      Добавить этап и уведомить клиента
                    </button>
                  </form>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <h3 className="adm-panel-h" style={{ fontSize: 16 }}>
                      Чат с клиентом
                    </h3>
                    <div className="adm-chat">
                      {messages.length === 0 ? (
                        <div className="adm-empty">Сообщений нет</div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={
                              message.senderRole === 'system'
                                ? 'adm-msg system'
                                : `adm-msg${message.senderRole === 'admin' ? ' admin' : ''}`
                            }
                          >
                            <div className="adm-msg-meta">
                              {message.senderRole === 'admin'
                                ? 'Администратор'
                                : message.senderRole === 'system'
                                  ? 'Автосообщение'
                                  : 'Клиент'}{' '}
                              · {new Date(message.createdAt).toLocaleString('ru-RU')}
                            </div>
                            {message.text ?? '—'}
                          </div>
                        ))
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {QUICK_REPLIES.map((quick) => (
                        <button
                          key={quick.label}
                          className="adm-btn ghost adm-sm"
                          type="button"
                          disabled={busy}
                          onClick={() => sendMessage(quick.text)}
                        >
                          {quick.label}
                        </button>
                      ))}
                    </div>

                    <textarea
                      className="adm-textarea"
                      value={messageText}
                      placeholder="Сообщение клиенту (придёт в Telegram)"
                      onChange={(event) => setMessageText(event.target.value)}
                    />
                    <button className="adm-btn" type="button" disabled={busy} onClick={() => sendMessage(messageText)}>
                      Отправить
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button className="adm-btn" type="button" disabled={busy} onClick={() => orderAction('complete')}>
                      Завершить заявку
                    </button>
                    <button className="adm-btn ghost" type="button" disabled={busy} onClick={() => orderAction('cancel')}>
                      Отменить заявку
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        )}

        {tab === 'showcase' && (
          <div className="adm-grid">
            <section className="adm-panel">
              <h2 className="adm-panel-h">Новая позиция</h2>
              <form onSubmit={createItem} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label className="adm-lbl">
                  Название
                  <input
                    className="adm-input"
                    value={itemForm.title}
                    onChange={(event) => setItemForm((prev) => ({ ...prev, title: event.target.value }))}
                  />
                </label>
                <label className="adm-lbl">
                  Ссылка на изображение
                  <input
                    className="adm-input"
                    value={itemForm.imageUrl}
                    placeholder="/uploads/… или https://…"
                    onChange={(event) => setItemForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                  />
                </label>
                <div className="adm-3col">
                  <label className="adm-lbl">
                    Цена, ¥
                    <input
                      className="adm-input"
                      value={itemForm.priceCny}
                      inputMode="numeric"
                      onChange={(event) => setItemForm((prev) => ({ ...prev, priceCny: event.target.value.replace(/[^\d]/g, '') }))}
                    />
                  </label>
                  <label className="adm-lbl">
                    Цена, ₽
                    <input
                      className="adm-input"
                      value={itemForm.priceRub}
                      inputMode="numeric"
                      onChange={(event) => setItemForm((prev) => ({ ...prev, priceRub: event.target.value.replace(/[^\d]/g, '') }))}
                    />
                  </label>
                  <label className="adm-lbl">
                    Выгода, ₽
                    <input
                      className="adm-input"
                      value={itemForm.benefitRub}
                      inputMode="numeric"
                      onChange={(event) => setItemForm((prev) => ({ ...prev, benefitRub: event.target.value.replace(/[^\d]/g, '') }))}
                    />
                  </label>
                </div>
                <label className="adm-check">
                  <input
                    type="checkbox"
                    checked={itemForm.isPublished}
                    onChange={(event) => setItemForm((prev) => ({ ...prev, isPublished: event.target.checked }))}
                  />
                  Публиковать сразу
                </label>
                <button className="adm-btn" disabled={busy}>
                  Добавить в витрину
                </button>
              </form>
            </section>

            <section className="adm-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 className="adm-panel-h" style={{ marginRight: 'auto' }}>
                  Позиции витрины
                </h2>
                <button className="adm-btn ghost adm-sm" type="button" onClick={loadShowcase}>
                  Обновить
                </button>
              </div>
              <div className="adm-list">
                {items.length === 0 ? (
                  <div className="adm-empty">Позиций нет</div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="adm-item">
                      <div>
                        <b>{item.title}</b>
                        <div className="adm-hint">
                          {item.priceCny} ¥ · {rub(item.priceRub)} · выгода {rub(item.benefitRub)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`adm-pill ${item.isPublished ? 'ok' : ''}`}>
                          {item.isPublished ? 'Опубликовано' : 'Скрыто'}
                        </span>
                        <button className="adm-btn ghost adm-sm" type="button" disabled={busy} onClick={() => toggleItem(item)}>
                          {item.isPublished ? 'Скрыть' : 'Показать'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
