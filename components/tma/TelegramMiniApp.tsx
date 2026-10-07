'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { getMarkupForAmount } from '@/lib/exchange-config'
import { useRates } from '@/components/site/rates-context'
import { DealRoom } from './DealRoom'
import { useTelegram } from './useTelegram'
import {
  ORDER_STATUS,
  fmtCny,
  fmtDateTime,
  fmtRub,
  type ArchivedOrder,
  type Order,
  type OrderMessage,
  type PaymentStep,
} from './types'


type TabKey = 'exchange' | 'archive' | 'profile'

// Причина отказа авторизации из тела ответа: без неё 401 не отличить от
// «нет initData», «не тот токен бота» и «подпись не сошлась».
async function readAuthReason(res: Response) {
  const data = (await res.json().catch(() => null)) as { reason?: string } | null
  return data?.reason ?? `HTTP ${res.status}`
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'exchange', label: 'Обмен' },
  { key: 'archive', label: 'Архив' },
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
  const [authError, setAuthError] = useState<string | null>(null)

  const [order, setOrder] = useState<Order | null>(null)
  const [steps, setSteps] = useState<PaymentStep[]>([])
  const [messages, setMessages] = useState<OrderMessage[]>([])

  const [archive, setArchive] = useState<ArchivedOrder[]>([])
  const [archiveLoaded, setArchiveLoaded] = useState(false)

  const [rubAmount, setRubAmount] = useState(50000)
  const [cnyAmount, setCnyAmount] = useState(4000)
  const [contactPhone, setContactPhone] = useState('')

  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)

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

  const archivedTotals = useMemo(() => {
    const completed = archive.filter((item) => item.status === 'COMPLETED')
    return {
      completed: completed.length,
      rub: completed.reduce((sum, item) => sum + item.totalRub, 0),
      cny: completed.reduce((sum, item) => sum + item.totalCny, 0),
    }
  }, [archive])

  const fetchActiveOrder = useCallback(async () => {
    try {
      const res = await fetch('/api/orders/active', { headers: apiHeaders, cache: 'no-store' })
      if (!res.ok) {
        if (res.status === 401) setAuthError(await readAuthReason(res))
        return
      }
      setAuthError(null)
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

  const fetchArchive = useCallback(async () => {
    try {
      const res = await fetch('/api/orders/archive', { headers: apiHeaders, cache: 'no-store' })
      if (!res.ok) {
        if (res.status === 401) setAuthError(await readAuthReason(res))
        setArchiveLoaded(true)
        return
      }
      setAuthError(null)
      const data = await res.json()
      setDbReady(data.dbConfigured !== false)
      setArchive(data.orders ?? [])
      setArchiveLoaded(true)
    } catch (error) {
      console.error('Не удалось загрузить архив сделок:', error)
    }
  }, [apiHeaders])

  useEffect(() => {
    if (!telegramReady) return
    fetchActiveOrder()
    fetchArchive()
  }, [telegramReady, fetchActiveOrder, fetchArchive])

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

  // Раз в 10 секунд обновляем активную заявку и архив: закрытая сделка
  // должна появиться в архиве сама, пока приложение открыто.
  useEffect(() => {
    if (!telegramReady) return
    const id = window.setInterval(() => {
      fetchActiveOrder()
      fetchArchive()
    }, 10000)
    return () => window.clearInterval(id)
  }, [telegramReady, fetchActiveOrder, fetchArchive])

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
        if (res.status === 401) {
          setAuthError(typeof data.reason === 'string' ? data.reason : `HTTP ${res.status}`)
        }
        setNotice({ kind: 'err', text: data.error === 'Active order exists' ? 'У вас уже есть активная заявка.' : 'Не удалось создать заявку.' })
        return
      }
      setAuthError(null)
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
      await fetchArchive()
      setNotice({ kind: 'ok', text: 'Заявка отменена и перенесена в архив.' })
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
            База данных не подключена: заявки, чат и архив сделок недоступны. Задайте <b>DATABASE_URL</b> и перезапустите сервер.
          </div>
        )}

        {authError && (
          <div className="tma-alert err">
            Telegram не подтвердил сессию ({authError}). Откройте мини-приложение из бота <b>@AlipayFastBot</b> и попробуйте снова.
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

                <button className="tma-btn" type="button" disabled={busy || !dbReady || Boolean(authError)} onClick={createOrder}>
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

        {tab === 'archive' && (
          <section className="tma-card">
            <h2 className="tma-h">Архив сделок</h2>

            {!archiveLoaded && <p className="tma-sub">Загружаем сделки…</p>}

            {archiveLoaded && archive.length === 0 && (
              <p className="tma-sub">
                Здесь появятся ваши закрытые сделки: завершённые и отменённые заявки с суммами и датами.
              </p>
            )}

            {archive.length > 0 && (
              <>
                <p className="tma-sub">
                  Завершено {archivedTotals.completed} из {archive.length} · итого{' '}
                  {fmtRub(archivedTotals.rub)} → {fmtCny(archivedTotals.cny)}
                </p>

                <div className="tma-arch-list">
                  {archive.map((item) => (
                    <article key={item.id} className="tma-arch">
                      <div className="tma-arch-head">
                        <b>#{item.id.slice(0, 6)}</b>
                        <span className={`tma-pill ${item.status === 'COMPLETED' ? 'ok' : 'mute'}`}>
                          {ORDER_STATUS[item.status]}
                        </span>
                      </div>

                      <div className="tma-kv">
                        <div>
                          <span>Отдано</span>
                          <b>{fmtRub(item.paidRub > 0 ? item.paidRub : item.totalRub)}</b>
                        </div>
                        <div>
                          <span>Получено</span>
                          <b>{fmtCny(item.totalCny)}</b>
                        </div>
                        <div>
                          <span>Курс сделки</span>
                          <b>{Number(item.rate).toFixed(2)} ₽</b>
                        </div>
                        <div>
                          <span>{item.status === 'COMPLETED' ? 'Завершена' : 'Отменена'}</span>
                          <b>{fmtDateTime(item.updatedAt)}</b>
                        </div>
                      </div>

                      <div className="tma-hint">
                        {item.stepsCount > 0 ? `Этапов оплаты: ${item.stepsCount}` : 'Оплата одним платежом'}
                      </div>
                    </article>
                  ))}
                </div>
              </>
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
