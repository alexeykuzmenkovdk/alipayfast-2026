'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { TgIcon, fmt } from './shared'
import type { CalcState } from './Calculator'

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="ft-top">
          <div className="ft-big">
            ALIPAY<em>FAST</em>
          </div>
          <a className="ft-qr" href="https://t.me/alipayfast" target="_blank">
            <Image src="/assets/qr.png" alt="QR Telegram" width={120} height={120} />
            <span>
              Курс каждый день
              <br />
              в Telegram
              <br />
              @alipayfast
            </span>
          </a>
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
            · Политика конфиденциальности
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
      <a href="https://t.me/alipayfast" target="_blank" className="mbar-tg" aria-label="Telegram">
        <TgIcon size={20} />
      </a>
      <a href="#calc" className="btn btn-red btn-sm">
        Пополнить
      </a>
    </div>
  )
}
