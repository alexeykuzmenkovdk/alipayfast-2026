'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { TgIcon, fmt } from './shared'
import type { CalcState } from './Calculator'
import { COMPANY } from '@/lib/company'

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="ft-top">
          <div className="ft-big">
            ALIPAY<em>FAST</em>
          </div>
          <a className="ft-qr" href={COMPANY.telegram} target="_blank" rel="noopener noreferrer">
            <Image src="/assets/qr.webp" alt="QR Telegram" width={120} height={120} />
            <span>
              Курс каждый день
              <br />
              в Telegram
              <br />
              @alipayfast
            </span>
          </a>
        </div>
        <div className="ft-contacts">
          <div>
            <span className="ft-lbl">Офис</span>
            <address>
              {COMPANY.street}
              <br />
              {COMPANY.locality}, {COMPANY.postalCode}
            </address>
          </div>
          <div>
            <span className="ft-lbl">Связаться</span>
            <p>
              <a href={`tel:${COMPANY.phoneRaw}`}>{COMPANY.phone}</a>
              <br />
              <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
            </p>
          </div>
          <div>
            <span className="ft-lbl">Часы работы</span>
            <p>
              Пн–Пт 10:00–19:00
              <br />
              Сб 11:00–17:00, Вс выходной
            </p>
          </div>
        </div>
        <div className="ft">
          <span>© 2026 AlipayFast · Обмен рублей на юани · Владивосток</span>
          <span>
            <Link href="/materials" style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
              Полезные материалы
            </Link>{' '}
            ·{' '}
            <Link href="/terms" style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
              Условия использования
            </Link>{' '}
            ·{' '}
            <Link href="/privacy" style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
              Политика конфиденциальности
            </Link>
          </span>
        </div>
      </div>
    </footer>
  )
}

export function MobileBar({ calc }: { calc: CalcState | null }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const f = () => {
      const c = document.getElementById('calc')
      if (!c) return
      const r = c.getBoundingClientRect()
      setShow(window.scrollY > 500 && !(r.top < window.innerHeight && r.bottom > 0))
    }
    window.addEventListener('scroll', f, { passive: true })
    f()
    return () => window.removeEventListener('scroll', f)
  }, [])

  if (!calc) return null

  return (
    <div className={'mbar' + (show ? ' show' : '')}>
      <div className="t">
        {fmt(calc.rub)} ₽ →<b>
          {fmt(calc.cny, 0)} <em>¥</em>
        </b>
      </div>
      <a href={COMPANY.telegram} target="_blank" rel="noopener noreferrer" className="mbar-tg" aria-label="Telegram">
        <TgIcon size={20} />
      </a>
      <a href="#calc" className="btn btn-red btn-sm">
        Пополнить
      </a>
    </div>
  )
}
