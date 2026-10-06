'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { TgIcon, useVladTime } from './shared'
import { useRates } from './rates-context'

export const NAV = [
  { id: 'calc', t: 'Рассчитать', cn: '计算' },
  { id: 'rates', t: 'Курс дня', cn: '汇率' },
  { id: 'how', t: 'Как пополнить', cn: '步骤' },
  { id: 'services', t: 'Сервисы', cn: '服务' },
  { id: 'office', t: 'Офис', cn: '办公室' },
  { id: 'reviews', t: 'Клиенты', cn: '评价' },
  { id: 'faq', t: 'Вопросы', cn: '问答' },
]

export const GUIDES = [
  { tag: 'Alipay', t: 'Как установить, верифицировать и пользоваться Alipay', m: '12 мин', img: '/assets/alipay-guide/cover.jpg', href: '/guides/alipay' },
  { tag: 'Poizon', t: 'Оплата на Poizon через Alipay: пошагово', m: '6 мин', img: '/assets/guide-poizon.png', href: '/materials' },
  { tag: 'Т-Банк', t: 'Как перевести деньги через Т-Банк', m: '3 мин', img: '/assets/guide-alipay.jpg', href: '/guides/tbank' },
]

const MAT_URL = '/materials'

function useScrollSpy(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null)
  const [prog, setProg] = useState(0)
  const [small, setSmall] = useState(false)

  useEffect(() => {
    const f = () => {
      const h = document.documentElement
      setProg(h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight))
      setSmall(h.scrollTop > 40)
      if (!enabled) return
      let cur: string | null = null
      for (const n of NAV) {
        const el = document.getElementById(n.id)
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) cur = n.id
      }
      setActive(cur)
    }
    window.addEventListener('scroll', f, { passive: true })
    f()
    return () => window.removeEventListener('scroll', f)
  }, [enabled])

  return { active, prog, small }
}

export function Header({ onMenu, page = 'home' }: { onMenu: () => void; page?: 'home' | 'materials' }) {
  const time = useVladTime()
  const { bestRate } = useRates()
  const { active, prog, small } = useScrollSpy(page === 'home')
  const [mat, setMat] = useState(false)
  const tm = useRef<ReturnType<typeof setTimeout>>()
  const home = page === 'home'
  const anchor = (id: string) => (home ? `#${id}` : `/#${id}`)

  const openMat = () => {
    if (tm.current) clearTimeout(tm.current)
    setMat(true)
  }
  const closeMat = () => {
    tm.current = setTimeout(() => setMat(false), 160)
  }

  return (
    <>
      <div className="topbar">
        <div className="wrap topbar-in">
          <span className="tb-tbank">
            <b>Т-БАНК</b> переводы только из приложения Т-Банк
          </span>
          <span className="tb-r">
            <span>
              Владивосток <b>{time}</b>
            </span>
            <span className="tb-sep"></span>
            <span className="tb-rate">
              <i className="dot"></i>Наш курс от <b>{fmtRate(bestRate)} ₽</b>
            </span>
          </span>
        </div>
      </div>
      <header className={'hdr' + (small ? ' small' : '')}>
        <div className="wrap hdr-in">
          <Link href="/#top" className="logo">
            <Image src="/assets/logo-mark.png" alt="" width={34} height={34} />
            <span>
              ALIPAY<em>FAST</em>
            </span>
          </Link>
          <nav className="nav2">
            {NAV.map((n, i) => (
              <a key={n.id} href={anchor(n.id)} className={active === n.id ? 'on' : ''}>
                <sup>{String(i + 1).padStart(2, '0')}</sup>
                <span className="nv-flip">
                  <span>{n.t}</span>
                  <span className="cn">{n.cn}</span>
                </span>
              </a>
            ))}
            <div className="nav-mat-w" onMouseEnter={openMat} onMouseLeave={closeMat}>
              <Link
                href={MAT_URL}
                className={'nav-mat' + (page === 'materials' ? ' on' : '')}
                onFocus={openMat}
              >
                <span>Полезные материалы</span>
                <em>NEW</em>
              </Link>
              <div className={'mat-drop' + (mat ? ' open' : '')}>
                <div className="md-h">
                  <span>Свежие инструкции</span>
                  <Link href={MAT_URL}>Все материалы →</Link>
                </div>
                <div className="md-g">
                   {GUIDES.map((g, i) => (
                     <Link key={i} href={g.href} className="md-c">
                       <div className="md-img">
                         <Image src={g.img} alt="" width={320} height={200} />
                       </div>
                       <span className="md-tag">
                         {g.tag} · {g.m}
                       </span>
                       <b>{g.t}</b>
                     </Link>
                   ))}
                 </div>
              </div>
            </div>
          </nav>
          <div className="hdr-r">
            <a href="https://t.me/alipayfast" target="_blank" className="hdr-tg" aria-label="Telegram-канал">
              <TgIcon size={18} />
              <span>@alipayfast</span>
            </a>
            <a href={anchor('calc')} className="btn btn-red btn-sm hdr-cta">
              Пополнить <span>→</span>
            </a>
            <button className="burger2" onClick={onMenu} aria-label="Меню">
              <i></i>
              <i></i>
            </button>
          </div>
        </div>
        <div className="hdr-prog" style={{ transform: `scaleX(${prog})` }}></div>
      </header>
    </>
  )
}

export function MobileMenu({
  open,
  onClose,
  page = 'home',
}: {
  open: boolean
  onClose: () => void
  page?: 'home' | 'materials'
}) {
  const time = useVladTime()
  const { bestRate } = useRates()
  const home = page === 'home'
  const anchor = (id: string) => (home ? `#${id}` : `/#${id}`)

  return (
    <div className={'mmenu' + (open ? ' open' : '')}>
      <div className="mmenu-top">
        <span className="logo">
          <Image src="/assets/logo-mark.png" alt="" width={34} height={34} />
          <span>
            ALIPAY<em>FAST</em>
          </span>
        </span>
        <button className="mm-x" onClick={onClose} aria-label="Закрыть">
          ×
        </button>
      </div>
      <div className="mm-rate">
        <span>
          <i className="dot"></i>Курс от <b>{fmtRate(bestRate)} ₽</b>
        </span>
        <span>Владивосток {time}</span>
      </div>
      <nav>
        {NAV.map((n, i) => (
          <a
            key={n.id}
            href={anchor(n.id)}
            onClick={onClose}
            style={{ transitionDelay: open ? `${80 + i * 45}ms` : '0ms' }}
          >
            <sup>{String(i + 1).padStart(2, '0')}</sup>
            {n.t}
            <span className="cn">{n.cn}</span>
          </a>
        ))}
      </nav>
      <Link href={MAT_URL} className="mm-mat" onClick={onClose}>
        <span>
          <small>NEW · инструкции и гайды</small>Полезные материалы
        </span>
        <em>→</em>
      </Link>
      <div className="mmenu-foot">
        <a className="btn btn-red" href="https://t.me/alipayfast" target="_blank">
          <TgIcon size={16} /> Telegram
        </a>
        <a className="btn" style={{ background: '#F2EADB', color: '#131211' }} href="https://wa.me/79243394924" target="_blank">
          WhatsApp
        </a>
      </div>
    </div>
  )
}

function fmtRate(n: number) {
  return (Number.isFinite(n) ? n : 0).toFixed(2).replace('.', ',')
}
