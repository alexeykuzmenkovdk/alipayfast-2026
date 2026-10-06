'use client'

import { useEffect, useState } from 'react'
import { fmt } from './shared'
import type { OrderPayload } from './Calculator'

export function OrderModal({ order, onClose }: { order: OrderPayload | null; onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [ch, setCh] = useState<'tg' | 'wa'>('tg')
  const [f, setF] = useState({ name: '', contact: '', alipay: '' })
  const [err, setErr] = useState<{ contact?: boolean; alipay?: boolean }>({})
  const [num, setNum] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  useEffect(() => {
    if (order) {
      setStep(0)
      setErr({})
      setSendError(null)
      setNum('AF-' + Math.floor(10000 + Math.random() * 89999))
    }
  }, [order])

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const er = { contact: !f.contact.trim(), alipay: !f.alipay.trim() }
    setErr(er)
    if (er.contact || er.alipay || !order) return

    setSending(true)
    setSendError(null)
    try {
      const res = await fetch('/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: num,
          name: f.name,
          contact: f.contact,
          contactMethod: ch === 'tg' ? 'Telegram' : 'WhatsApp',
          telegramUsername: ch === 'tg' ? f.contact : undefined,
          yuanAmount: fmt(order.cny, 2),
          rubleAmount: fmt(order.rub),
          exchangeRate: order.rate,
          comment: f.alipay ? `Alipay ID: ${f.alipay}` : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.success === false) {
        setSendError(data.error || 'Не удалось отправить заявку. Напишите нам в Telegram.')
        return
      }
      setStep(1)
    } catch {
      setSendError('Не удалось отправить заявку. Проверьте соединение и попробуйте ещё раз.')
    } finally {
      setSending(false)
    }
  }

  const o = order || { rub: 0, cny: 0, rate: 0 }

  return (
    <div className={'modal-bg' + (order ? ' open' : '')} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog">
        <div className="m-head">
          <div>
            <div className="mono" style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>
              {step ? 'ЗАЯВКА ПРИНЯТА' : 'ЗАЯВКА НА ПОПОЛНЕНИЕ'}
            </div>
            <div className="disp">{step ? 'Спасибо!' : 'Почти готово'}</div>
          </div>
          <button className="m-x" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        <div className="m-body">
          <div className="m-sum">
            <div>
              <small>Отдаёте</small>
              <b>{fmt(o.rub)} ₽</b>
            </div>
            <div className="arr">→</div>
            <div>
              <small>Получаете</small>
              <b>{fmt(o.cny, 2)} ¥</b>
            </div>
          </div>
          {step === 0 ? (
            <form onSubmit={submit}>
              <label className="inp">
                <span>Как к вам обращаться</span>
                <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Имя" />
              </label>
              <div className="inp">
                <span>Где удобнее связаться</span>
              </div>
              <div className="radio">
                <button type="button" className={ch === 'tg' ? 'on' : ''} onClick={() => setCh('tg')}>
                  Telegram
                </button>
                <button type="button" className={ch === 'wa' ? 'on' : ''} onClick={() => setCh('wa')}>
                  WhatsApp
                </button>
              </div>
              <label className="inp">
                <span>{ch === 'tg' ? 'Ник в Telegram' : 'Номер WhatsApp'}</span>
                <input
                  className={err.contact ? 'bad' : ''}
                  value={f.contact}
                  onChange={(e) => setF({ ...f, contact: e.target.value })}
                  placeholder={ch === 'tg' ? '@username' : '+7 900 000-00-00'}
                />
              </label>
              <label className="inp">
                <span>Alipay ID / телефон аккаунта</span>
                <input
                  className={err.alipay ? 'bad' : ''}
                  value={f.alipay}
                  onChange={(e) => setF({ ...f, alipay: e.target.value })}
                  placeholder="+86… или email"
                />
              </label>
              {sendError && <div className="m-note" style={{ color: 'var(--red)' }}>{sendError}</div>}
              <button className="btn btn-red" style={{ width: '100%', height: 56 }} disabled={sending}>
                {sending ? 'Отправляем…' : 'Отправить заявку'}
              </button>
              <div className="m-note">
                Оплата — только переводом из приложения Т-Банк. Курс фиксируем на 15 минут.
              </div>
            </form>
          ) : (
            <div className="m-ok">
              <div className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>
                НОМЕР ЗАЯВКИ
              </div>
              <div className="num">{num}</div>
              <ol>
                <li>Менеджер напишет в {ch === 'tg' ? 'Telegram' : 'WhatsApp'} в течение пары минут</li>
                <li>Пришлёт реквизиты для перевода {fmt(o.rub)} ₽ через Т-Банк</li>
                <li>Вы отправляете чек — юани приходят на Alipay</li>
              </ol>
              <a
                className="btn btn-ink"
                style={{ width: '100%', height: 56 }}
                href={ch === 'tg' ? 'https://t.me/alipayfast' : 'https://wa.me/79243394924'}
                target="_blank"
              >
                Открыть {ch === 'tg' ? 'Telegram' : 'WhatsApp'} →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
