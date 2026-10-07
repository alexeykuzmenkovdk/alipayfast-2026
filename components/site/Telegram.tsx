'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { TgIcon } from './shared'

export function TelegramSection() {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText('https://t.me/alipayfast')
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }
  const perks: [string, string][] = [
    ['Курс каждое утро', 'Публикуем актуальный курс до 9:00 по Владивостоку'],
    ['Спецкурс на первое пополнение', 'Для новых подписчиков канала'],
    ['Гиды по Alipay и Poizon', 'Регистрация, верификация, оплата на площадках'],
  ]
  return (
    <section className="tg-sec" id="telegram">
      <div className="wrap tg-g">
        <div className="tg-l reveal">
          <span className="mono tg-idx">
            <TgIcon size={14} /> TELEGRAM-КАНАЛ
          </span>
          <h2 className="disp tg-h">
            Подпишись —<br />
            получи <span>спецкурс</span>
          </h2>
          <div className="tg-perks">
            {perks.map(([h, p], i) => (
              <div key={i} className="tg-perk">
                <em>0{i + 1}</em>
                <div>
                  <b>{h}</b>
                  <span>{p}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="tg-ctas">
            <a className="btn tg-btn" href="https://t.me/alipayfast" target="_blank">
              <TgIcon size={18} /> Подписаться
            </a>
            <a className="btn btn-line" href="https://t.me/AlipayFastBot/alipayfast" target="_blank" rel="noreferrer">
              Открыть мини-приложение
            </a>
            <button className="btn tg-copy" onClick={copy}>
              {copied ? 'Ссылка скопирована ✓' : 't.me/alipayfast'}
            </button>
          </div>
        </div>
        <div className="tg-r reveal">
          <a className="tg-card" href="https://t.me/alipayfast" target="_blank">
            <div className="tg-card-top">
              <span>SCAN ME</span>
              <span>扫一扫</span>
            </div>
            <div className="tg-qr">
              <Image src="/assets/qr.png" alt="QR-код Telegram @alipayfast" width={260} height={260} />
            </div>
            <div className="tg-card-b">
              <b>@ALIPAYFAST</b>
              <span>Наведите камеру телефона</span>
            </div>
          </a>
        </div>
      </div>
    </section>
  )
}

export function TgFloat() {
  const [show, setShow] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const f = () => setShow(window.scrollY > 700)
    window.addEventListener('scroll', f, { passive: true })
    f()
    return () => window.removeEventListener('scroll', f)
  }, [])

  return (
    <div className={'tgf' + (show ? ' show' : '') + (open ? ' open' : '')}>
      {open && (
        <div className="tgf-pop">
          <button className="tgf-x" onClick={() => setOpen(false)} aria-label="Закрыть">
            ×
          </button>
          <Image src="/assets/qr.png" alt="QR Telegram" width={180} height={180} />
          <b>@alipayfast</b>
          <span>Курс каждый день + спецкурс для подписчиков</span>
          <a className="btn tg-btn btn-sm" href="https://t.me/alipayfast" target="_blank" style={{ width: '100%' }}>
            Открыть канал
          </a>
        </div>
      )}
      <button className="tgf-btn" onClick={() => setOpen((o) => !o)} aria-label="Telegram">
        <TgIcon size={26} />
      </button>
    </div>
  )
}
