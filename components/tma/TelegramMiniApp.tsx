'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { getMarkupForAmount } from '@/lib/exchange-config'
import { useRates } from '@/components/site/rates-context'
import { DealRoom } from './DealRoom'
import { useTelegram } from './useTelegram'
import {
  ORDER_STATUS,
  fmtCny,
  fmtRub,
  type Order,
  type OrderMessage,
  type PaymentStep,
  type ShowcaseItem,
} from './types'


type TabKey = 'exchange' | 'showcase' | 'requests' | 'profile'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'exchange', label: 'Обмен' },
  { key: 'showcase', label: 'Витрина' },
  { key: 'requests', label: 'Запросы' },
  { key: 'profile', label: 'Профиль' },
]


export function TelegramMiniApp() {
  const rates = useRates()
  const telegram = useTelegram()
  const telegramReady = telegram.ready
  const userLabel = telegram.userLabel
  const apiHeaders = telegram.headers


  const [tab, setTab] = useState<TabKey>('exchange')
  const [dbReady, setDbReady] = useState(true)

  const [order, setOrder] = useState<Order | null>(null)
  const [steps, setSteps] = useState<PaymentStep[]>([])
  const [messages, setMessages] = useState<OrderMessage[]>([])

  const [showcase, setShowcase] = useState<ShowcaseItem[]>([])

  const [rubAmount, setRubAmount] = useState(50000)
  const [cnyAmount, setCnyAmount] = useState(4000)
  const [contactPhone, setContactPhone] = useState('')

  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)

  const [sourcing, setSourcing] = useState({ link: '', description: '', priceRub: '', imageUrl: '' })
  const [cooldownHours, setCooldownHours] = useState(0)

  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const rateForCny = useCallback(
    (amountCny: number) => {
      if (rates.isManual && rates.manualRate) return rates.manualRate
      return rates.baseRate + getMarkupForAmount(amountCny)
    },
    [rates.baseRate, rates.isManual, rates.manualRate],
  )

  const rateForRub = useCallback(
    (amountRub: number) => {
      if (rates.isManual && rates.manualRate) return rates.manualRate
      return rates.baseRate + getMarkupForAmount(amountRub / rates.baseRate)
    },
    [rates.baseRate, rates.isManual, rates.manualRate],
  )

  const currentRate = useMemo(() => rateForCny(cnyAmount), [cnyAmount, rateForCny])
  const activeStep = useMemo(
    () => steps.find((step) => step.status === 'WAITING_FOR_PAYMENT' || step.status === 'WAITING_FOR_DETAILS'),
    [steps],
  )

  const fetchActiveOrder = useCallback(async () => {
    try {
      const res = await fetch('/api/orders/active', { headers: apiHeaders, cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      setDbReady(data.dbConfigured !== false)
      if (data.order) {
        setOrder(data.order)
        setSteps(data.steps ?? [])
        setMessages(data.messages ?? [])
      } else {
        setOrder(null)
        setSteps([])
        setMessages([])
      }
    } catch (error) {
      console.error('Не удалось загрузить заявку:', error)
    }
  }, [apiHeaders])

  const fetchShowcase = useCallback(async () => {
    try {
      const res = await fetch('/api/showcase', { cache: 'no-store' })
      const data = await res.json()
      setShowcase(data.items ?? [])
    } catch (error) {
      console.error('Не удалось загрузить витрину:', error)
    }
  }, [])

  useEffect(() => {
    if (!telegramReady) return
    fetchActiveOrder()
    fetchShowcase()
  }, [telegramReady, fetchActiveOrder, fetchShowcase])

  useEffect(() => {
    if (!order || !telegramReady) return
    const id = window.setInterval(() => {
      fetch(`/api/orders/${order.id}/messages`, { headers: apiHeaders, cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.messages)) setMessages(data.messages)
        })
        .catch(() => null)
    }, 5000)
    return () => window.clearInterval(id)
  }, [order, apiHeaders, telegramReady])

  useEffect(() => {
    if (!order || !telegramReady) return
    const id = window.setInterval(() => {
      fetchActiveOrder()
    }, 10000)
    return () => window.clearInterval(id)
  }, [order, fetchActiveOrder, telegramReady])

  const handleRubChange = (raw: string) => {
    const parsed = Number(raw.replace(/[^\d]/g, ''))
    if (!Number.isFinite(parsed)) return
    setRubAmount(parsed)
    const rate = rateForRub(parsed)
    setCnyAmount(Math.round(parsed / rate))
  }

  const handleCnyChange = (raw: string) => {
    const parsed = Number(raw.replace(/[^\d]/g, ''))
    if (!Number.isFinite(parsed)) return
    setCnyAmount(parsed)
    setRubAmount(Math.round(parsed * rateForCny(parsed)))
  }

  const pickShowcase = (item: ShowcaseItem) => {
    setCnyAmount(item.priceCny)
    setRubAmount(Math.round(item.priceCny * rateForCny(item.priceCny)))
    setTab('exchange')
  }

  const createOrder = async () => {
    setBusy(true)
    setNotice(null)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...apiHeaders },
        body: JSON.stringify({
          totalRub: rubAmount,
          totalCny: cnyAmount,
          rate: rateForCny(cnyAmount),
          contactPhone: contactPhone.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setNotice({ kind: 'err', text: data.error === 'Active order exists' ? 'У вас уже есть активная заявка.' : 'Не удалось создать заявку.' })
        return
      }
      setOrder(data.order)
      setSteps(data.steps ?? [])
      setMessages(data.messages ?? [])
      setNotice({ kind: 'ok', text: 'Заявка создана. Комната сделки открыта.' })
    } catch {
      setNotice({ kind: 'err', text: 'Ошибка сети при создании заявки.' })
    } finally {
      setBusy(false)
    }
  }

  const cancelOrder = async () => {
    if (!order) return
    setBusy(true)
    try {
      await fetch(`/api/orders/${order.id}/cancel`, { method: 'POST', headers: apiHeaders })
      setReceiptUrl(null)
      await fetchActiveOrder()
      setNotice({ kind: 'ok', text: 'Заявка отменена.' })
    } finally {
      setBusy(false)
    }
  }

  const uploadFile = async (file: File) => {
    const body = new FormData()
    body.append('file', file)
    const res = await fetch('/api/uploads', { method: 'POST', headers: apiHeaders, body })
    if (!res.ok) return null
    const data = await res.json()
    return data.url as string
  }

  const handleReceipt = async (file: File) => {
    setBusy(true)
    const url = await uploadFile(file)
    setBusy(false)
    if (url) {
      setReceiptUrl(url)
      setNotice({ kind: 'ok', text: 'Чек загружен.' })
    } else {
      setNotice({ kind: 'err', text: 'Не удалось загрузить чек.' })
    }
  }

  const markPaid = async () => {
    if (!order || !activeStep || !receiptUrl) return
    setBusy(true)
    try {
      await fetch(`/api/orders/${order.id}/steps/${activeStep.id}/paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...apiHeaders },
        body: JSON.stringify({ receiptFileUrl: receiptUrl }),
      })
      await fetchActiveOrder()
      setNotice({ kind: 'ok', text: 'Оплата отмечена. Оператор проверит чек.' })
    } finally {
      setBusy(false)
    }
  }

  const sendMessage = async (text: string) => {
    if (!order || !text.trim()) return
    setBusy(true)
    try {
      const res = await fetch(`/api/orders/${order.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...apiHeaders },
        body: JSON.stringify({ text: text.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => [...prev, data.message])
      } else {
        setNotice({ kind: 'err', text: 'Сообщение не отправилось, попробуйте ещё раз.' })
      }
    } finally {
      setBusy(false)
    }
  }

  const submitSourcing = async () => {
    setBusy(true)
    setNotice(null)
    try {
      const res = await fetch('/api/sourcing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...apiHeaders },
        body: JSON.stringify({
          description: sourcing.description,
          imageUrl: sourcing.imageUrl,
          link: sourcing.link || undefined,
          priceRub: sourcing.priceRub ? Number(sourcing.priceRub) : undefined,
        }),
      })
      if (res.status === 429) {
        const data = await res.json()
        setCooldownHours(data.nextAvailableHours ?? 48)
        return
      }
      if (!res.ok) {
        setNotice({ kind: 'err', text: 'Не удалось отправить запрос.' })
        return
      }
      setCooldownHours(48)
      setSourcing({ link: '', description: '', priceRub: '', imageUrl: '' })
      setNotice({ kind: 'ok', text: 'Запрос отправлен. Ответ придёт в Telegram.' })
    } finally {
      setBusy(false)
    }
  }

  const handleSourcingPhoto = async (file: File) => {
    setBusy(true)
    const url = await uploadFile(file)
    setBusy(false)
    if (url) setSourcing((prev) => ({ ...prev, imageUrl: url }))
  }

  if (!telegramReady || rates.loading) {
    return <div className="tma-loading">Загружаем AlipayFast…</div>
  }

  return (
    <div className="tma">
      <header className="tma-top">
        <div className="tma-mark">A</div>
        <div className="tma-top-txt">
          <div className="tma-title">AlipayFast</div>
          <div className="tma-user">@{userLabel}</div>
        </div>
        <div className="tma-rate">
          <b>{currentRate.toFixed(2)}</b> ₽/¥
        </div>
      </header>

      <nav className="tma-tabs">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`tma-tab${tab === item.key ? ' on' : ''}`}
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main className="tma-body">
        {!dbReady && (
          <div className="tma-alert err">
            База данных не подключена: заявки, чат и витрина недоступны. Задайте <b>DATABASE_URL</b> и перезапустите сервер.
          </div>
        )}

        {notice && <div className={`tma-alert ${notice.kind === 'err' ? 'err' : 'ok'}`}>{notice.text}</div>}

        {tab === 'exchange' &&
          (order ? (
            <DealRoom
              order={order}
              steps={steps}
              messages={messages}
              busy={busy}
              receiptUrl={receiptUrl}
              onSend={sendMessage}
              onCancel={cancelOrder}
              onReceipt={handleReceipt}
              onMarkPaid={markPaid}
            />
          ) : (
            <>
              <section className="tma-card">
                <h2 className="tma-h">Обмен рублей на Alipay</h2>
                <p className="tma-sub">
                  Введите сумму — чем крупнее обмен, тем выгоднее курс.
                </p>

                <label className="tma-label">
                  <span>Отдаю, ₽</span>
                  <input
                    className="tma-input"
                    value={rubAmount.toLocaleString('ru-RU')}
                    inputMode="numeric"
                    onChange={(event) => handleRubChange(event.target.value)}
                  />
                </label>

                <label className="tma-label">
                  <span>Получаю, ¥</span>
                  <input
                    className="tma-input"
                    value={cnyAmount.toLocaleString('ru-RU')}
                    inputMode="numeric"
                    onChange={(event) => handleCnyChange(event.target.value)}
                  />
                </label>

                <label className="tma-label">
                  <span>Телефон для связи (если нет username)</span>
                  <input
                    className="tma-input"
                    value={contactPhone}
                    placeholder="+7 999 000-00-00"
                    onChange={(event) => setContactPhone(event.target.value)}
                  />
                </label>

                <div className="tma-rate-box">
                  <div className="tma-rate-line">
                    <span>Ваш курс</span>
                    <b>{currentRate.toFixed(2)} ₽</b>
                  </div>
                  <div className="tma-hint">Курс зависит от суммы:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {rates.tiers.map((tier) => (
                      <div key={tier.label} className="tma-rate-line">
                        <span>{tier.label}</span>
                        <b>{tier.rate.toFixed(2)} ₽</b>
                      </div>
                    ))}
                  </div>
                  <div className="tma-hint">Обновлено {rates.updatedAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>

                <button className="tma-btn" type="button" disabled={busy || !dbReady} onClick={createOrder}>
                  Создать заявку
                </button>
              </section>

              <section className="tma-card paper">
                <h3 className="tma-h" style={{ fontSize: 18 }}>
                  Как это работает
                </h3>
                <ul className="tma-sub" style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <li>Оплата из мобильного приложения Т-Банка по СБП.</li>
                  <li>Чек загружаете прямо здесь и дублируете на email.</li>
                  <li>Оператор подтверждает этап, вы видите статус в этой комнате.</li>
                  <li>Крупные суммы делим на этапы — так безопаснее.</li>
                </ul>
              </section>
            </>
          ))}

        {tab === 'showcase' && (
          <>
            <div className="tma-alert">
              Цены из Китая и экономия против российской розницы. Нажмите «Хочу купить» — сумма подставится в калькулятор.
            </div>
            {showcase.length === 0 ? (
              <div className="tma-empty">Витрина пока пуста</div>
            ) : (
              <div className="tma-grid">
                {showcase.map((item) => (
                  <article key={item.id} className="tma-item">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.title} loading="lazy" />
                    <div className="tma-item-body">
                      <div className="tma-item-title">{item.title}</div>
                      <div className="tma-benefit">Экономия {fmtRub(item.benefitRub)}</div>
                      <div className="tma-hint">В Китае {fmtCny(item.priceCny)} · в РФ {fmtRub(item.priceRub)}</div>
                      <div className="tma-item-foot">
                        <button className="tma-btn line" type="button" onClick={() => pickShowcase(item)}>
                          Хочу купить
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'requests' && (
          <section className="tma-card">
            <h2 className="tma-h">Узнать цену в Китае</h2>
            <p className="tma-sub">
              Пришлите фото или ссылку на товар — оператор посчитает цену и ответит в Telegram. Один запрос раз в 48 часов.
            </p>

            <label className="tma-label">
              <span>Ссылка на товар</span>
              <input
                className="tma-input"
                value={sourcing.link}
                placeholder="https://…"
                onChange={(event) => setSourcing((prev) => ({ ...prev, link: event.target.value }))}
              />
            </label>

            <label className="tma-label">
              <span>Фото товара</span>
              <input
                className="tma-input"
                type="file"
                accept="image/*"
                onChange={(event) => event.target.files?.[0] && handleSourcingPhoto(event.target.files[0])}
              />
            </label>
            {sourcing.imageUrl && <div className="tma-hint">Фото загружено</div>}

            <label className="tma-label">
              <span>Описание</span>
              <textarea
                className="tma-textarea"
                value={sourcing.description}
                placeholder="Например: кроссовки Nike Air Force 1, белые, размер 42"
                onChange={(event) => setSourcing((prev) => ({ ...prev, description: event.target.value }))}
              />
            </label>

            <label className="tma-label">
              <span>Цена в РФ, ₽ (если знаете)</span>
              <input
                className="tma-input"
                value={sourcing.priceRub}
                inputMode="numeric"
                onChange={(event) => setSourcing((prev) => ({ ...prev, priceRub: event.target.value.replace(/[^\d]/g, '') }))}
              />
            </label>

            <button className="tma-btn" type="button" disabled={busy || cooldownHours > 0} onClick={submitSourcing}>
              Узнать цену
            </button>
            {cooldownHours > 0 && (
              <div className="tma-alert">Повторный запрос будет доступен через {cooldownHours} ч.</div>
            )}
          </section>
        )}

        {tab === 'profile' && (
          <>
            <section className="tma-card">
              <div className="tma-me">
                <div className="tma-avatar">{userLabel.slice(0, 1).toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>@{userLabel}</div>
                  <div className="tma-hint">Открыто внутри Telegram</div>
                </div>
              </div>
              <div className="tma-kv">
                <div>
                  <span>Курс сейчас</span>
                  <b>{currentRate.toFixed(2)} ₽</b>
                </div>
              </div>
            </section>

            {order && (
              <section className="tma-card">
                <h3 className="tma-h" style={{ fontSize: 18 }}>
                  Активная заявка
                </h3>
                <div className="tma-kv">
                  <div>
                    <span>Номер</span>
                    <b>#{order.id.slice(0, 6)}</b>
                  </div>
                  <div>
                    <span>Статус</span>
                    <b>{ORDER_STATUS[order.status]}</b>
                  </div>
                  <div>
                    <span>Сумма</span>
                    <b>{fmtRub(order.totalRub)}</b>
                  </div>
                  <div>
                    <span>К получению</span>
                    <b>{fmtCny(order.totalCny)}</b>
                  </div>
                </div>
              </section>
            )}

            <section className="tma-card paper">
              <h3 className="tma-h" style={{ fontSize: 18 }}>
                Поддержка
              </h3>
              <p className="tma-sub">
                Ответы в комнате сделки приходят в чат Telegram. По вопросам курса пишите оператору прямо здесь.
              </p>
            </section>

            <div className="tma-foot">AlipayFast · обмен RUB → Alipay</div>
          </>
        )}
      </main>
    </div>
  )
}
