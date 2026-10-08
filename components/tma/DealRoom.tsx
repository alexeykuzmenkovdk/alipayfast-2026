'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ORDER_STATUS,
  STEP_STATUS,
  fmtCny,
  fmtDateTime,
  fmtRub,
  fmtTime,
  isImageUrl,
  type Order,
  type OrderMessage,
  type PaymentStep,
} from './types'

interface DealRoomProps {
  order: Order
  steps: PaymentStep[]
  messages: OrderMessage[]
  busy: boolean
  receiptUrl: string | null
  onSend: (text: string, fileUrl?: string) => void
  onSendFile: (file: File) => void
  onCancel: () => void
  onReceipt: (file: File) => void
  onMarkPaid: () => void
}

const CHECK_ITEMS: [keyof Checks, string][] = [
  ['amount', 'Перевёл ровно указанную сумму'],
  ['bank', 'Проверил банк получателя'],
  ['receiptApp', 'Сохранил чек в приложении Т-Банка'],
  ['receiptEmail', 'Отправил чек на email оператора'],
]

interface Checks {
  amount: boolean
  bank: boolean
  receiptApp: boolean
  receiptEmail: boolean
}

const EMPTY_CHECKS: Checks = { amount: false, bank: false, receiptApp: false, receiptEmail: false }

export function DealRoom({
  order,
  steps,
  messages,
  busy,
  receiptUrl,
  onSend,
  onSendFile,
  onCancel,
  onReceipt,
  onMarkPaid,
}: DealRoomProps) {
  const [checks, setChecks] = useState<Checks>(EMPTY_CHECKS)
  const [chatText, setChatText] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const chatRef = useRef<HTMLDivElement>(null)
  const chatFileRef = useRef<HTMLInputElement>(null)

  const activeStep = useMemo(
    () => steps.find((step) => step.status === 'WAITING_FOR_PAYMENT' || step.status === 'WAITING_FOR_DETAILS'),
    [steps],
  )

  const paidStep = useMemo(
    () => [...steps].reverse().find((step) => step.status === 'PAID' || step.status === 'VERIFIED'),
    [steps],
  )

  const stageReady = Object.values(checks).every(Boolean) && Boolean(receiptUrl)
  const closed = order.status === 'CANCELED' || order.status === 'COMPLETED'

  useEffect(() => {
    const node = chatRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [messages.length])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(null), 1600)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copy = async (field: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(field)
    } catch {
      setCopied(null)
    }
  }

  const send = () => {
    const text = chatText.trim()
    if (!text) return
    onSend(text)
    setChatText('')
  }

  return (
    <div className="tma-room">
      <section className="tma-card">
        <div className="tma-room-head">
          <div>
            <h2 className="tma-h">Сделка #{order.id.slice(0, 6)}</h2>
            <p className="tma-sub">Создана {fmtDateTime(order.createdAt)}</p>
          </div>
          <span className={`tma-pill ${order.status === 'COMPLETED' ? 'ok' : closed ? 'mute' : 'red'}`}>
            {ORDER_STATUS[order.status]}
          </span>
        </div>

        <div className="tma-kv">
          <div>
            <span>Отдаю</span>
            <b>{fmtRub(order.totalRub)}</b>
          </div>
          <div>
            <span>Получаю</span>
            <b>{fmtCny(order.totalCny)}</b>
          </div>
          <div>
            <span>Курс</span>
            <b>{order.rate.toFixed(2)} ₽</b>
          </div>
        </div>
      </section>

      {!closed && activeStep && (
        <section className="tma-step">
          <div className="tma-room-head">
            <div>
              <b className="tma-step-title">Этап {activeStep.stepIndex} · к оплате</b>
              <div className="tma-hint">{STEP_STATUS[activeStep.status]}</div>
            </div>
            <span className="tma-pill red">Ожидает оплаты</span>
          </div>

          <div className="tma-pay-amount">{fmtRub(activeStep.amountRub)}</div>

          <div className="tma-copy-list">
            <button
              type="button"
              className="tma-copy-row"
              onClick={() => copy('requisite', activeStep.requisiteValue)}
            >
              <span>
                Реквизит · {activeStep.method === 'CARD' ? 'карта' : 'СБП'}
                <b>{activeStep.requisiteValue}</b>
              </span>
              <em>{copied === 'requisite' ? 'Скопировано' : 'Копировать'}</em>
            </button>

            <button type="button" className="tma-copy-row" onClick={() => copy('bank', activeStep.bankName)}>
              <span>
                Банк получателя
                <b>{activeStep.bankName}</b>
              </span>
              <em>{copied === 'bank' ? 'Скопировано' : 'Копировать'}</em>
            </button>

            <button type="button" className="tma-copy-row" onClick={() => copy('email', activeStep.receiptEmail)}>
              <span>
                Email для чека
                <b>{activeStep.receiptEmail}</b>
              </span>
              <em>{copied === 'email' ? 'Скопировано' : 'Копировать'}</em>
            </button>

            <button
              type="button"
              className="tma-copy-row"
              onClick={() => copy('amount', String(activeStep.amountRub))}
            >
              <span>
                Сумма перевода
                <b>{fmtRub(activeStep.amountRub)}</b>
              </span>
              <em>{copied === 'amount' ? 'Скопировано' : 'Копировать'}</em>
            </button>
          </div>

          <div className="tma-alert">
            Переводите ровно эту сумму из приложения Т-Банка. Если отправить другую сумму, платёж придётся искать вручную.
          </div>

          <div className="tma-checks">
            {CHECK_ITEMS.map(([key, label]) => (
              <label key={key} className="tma-check">
                <input
                  type="checkbox"
                  checked={checks[key]}
                  onChange={(event) => setChecks((prev) => ({ ...prev, [key]: event.target.checked }))}
                />
                {label}
              </label>
            ))}
          </div>

          <label className="tma-label">
            <span>Чек об оплате</span>
            <input
              className="tma-input"
              type="file"
              accept="image/*,application/pdf"
              onChange={(event) => event.target.files?.[0] && onReceipt(event.target.files[0])}
            />
          </label>
          {receiptUrl && (
            <a className="tma-receipt" href={receiptUrl} target="_blank" rel="noreferrer">
              Чек прикреплён · открыть
            </a>
          )}

          <button className="tma-btn" type="button" disabled={!stageReady || busy} onClick={onMarkPaid}>
            {busy ? 'Отправляем…' : 'Я оплатил'}
          </button>
          {!stageReady && <div className="tma-hint">Отметьте все пункты и приложите чек — кнопка станет активной.</div>}
        </section>
      )}

      {!closed && !activeStep && (
        <section className="tma-card paper">
          <b className="tma-step-title">
            {paidStep ? `Этап ${paidStep.stepIndex} ${STEP_STATUS[paidStep.status].toLowerCase()}` : 'Ожидаем реквизиты'}
          </b>
          <p className="tma-sub">
            {paidStep
              ? 'Оператор проверяет платёж и откроет следующий этап. Реквизиты появятся здесь же.'
              : 'Оператор получил заявку и пришлёт реквизиты в этот чат. Обычно это занимает несколько минут.'}
          </p>
          <div className="tma-wait">
            <span className="tma-dot" />
            Ждём оператора
          </div>
        </section>
      )}

      {(steps.length > 1 || (closed && steps.length > 0)) && (
        <section className="tma-card">
          <b className="tma-step-title">Этапы сделки</b>
          <div className="tma-steps">
            {steps.map((step) => (
              <div key={step.id} className="tma-step-row">
                <div>
                  <b>Этап {step.stepIndex}</b>
                  <div className="tma-hint">
                    {STEP_STATUS[step.status]} · {fmtRub(step.amountRub)}
                  </div>
                </div>
                {step.id === activeStep?.id ? (
                  <span className="tma-pill red">Активен</span>
                ) : (
                  <span className="tma-pill mute">{STEP_STATUS[step.status]}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="tma-chat-card">
        <div className="tma-chat-head">
          <b className="tma-step-title">Чат с оператором</b>
          <span className="tma-hint">Уведомления приходят в Telegram</span>
        </div>

        <div className="tma-chat tma-chat-big" ref={chatRef}>
          {messages.length === 0 ? (
            <div className="tma-empty">Сообщений пока нет</div>
          ) : (
            messages.map((message) =>
              message.senderRole === 'system' ? (
                <div key={message.id} className="tma-system">
                  {message.text}
                </div>
              ) : (
                <div key={message.id} className={`tma-msg${message.senderRole === 'admin' ? ' admin' : ''}`}>
                  <div className="tma-msg meta">
                    {message.senderRole === 'admin' ? 'Оператор' : 'Вы'} · {fmtTime(message.createdAt)}
                  </div>
                  {message.fileUrl && isImageUrl(message.fileUrl) && (
                    <a className="tma-msg-img" href={message.fileUrl} target="_blank" rel="noreferrer">
                      <img src={message.fileUrl} alt="Вложение" loading="lazy" />
                    </a>
                  )}
                  {message.fileUrl && !isImageUrl(message.fileUrl) && (
                    <a className="tma-msg-file" href={message.fileUrl} target="_blank" rel="noreferrer">
                      📎 Открыть файл
                    </a>
                  )}
                  {message.text && <div className="tma-msg-text">{message.text}</div>}
                </div>
              ),
            )
          )}
        </div>

        <div className="tma-chat-input">
          <input
            ref={chatFileRef}
            type="file"
            accept="image/*,application/pdf"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) onSendFile(file)
              event.target.value = ''
            }}
          />
          <button
            className="tma-chat-attach"
            type="button"
            disabled={busy}
            title="Прикрепить картинку или файл"
            onClick={() => chatFileRef.current?.click()}
          >
            📎
          </button>
          <textarea
            className="tma-textarea"
            value={chatText}
            placeholder="Напишите оператору…"
            rows={2}
            onChange={(event) => setChatText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                send()
              }
            }}
          />
          <button className="tma-btn" type="button" disabled={busy || !chatText.trim()} onClick={send}>
            Отправить
          </button>
        </div>
      </section>

      {!closed && (
        <section className="tma-card">
          {confirmCancel ? (
            <>
              <b className="tma-step-title">Отменить заявку?</b>
              <p className="tma-sub">Сделка закроется, этапы оплаты сбросятся. Оператор получит уведомление.</p>
              <div className="tma-row">
                <button className="tma-btn danger" type="button" disabled={busy} onClick={onCancel}>
                  Да, отменить
                </button>
                <button className="tma-btn ghost" type="button" onClick={() => setConfirmCancel(false)}>
                  Оставить
                </button>
              </div>
            </>
          ) : (
            <button className="tma-btn ghost" type="button" onClick={() => setConfirmCancel(true)}>
              Отменить заявку
            </button>
          )}
        </section>
      )}
    </div>
  )
}
