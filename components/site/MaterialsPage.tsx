'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Header, MobileMenu } from './Header'
import { TelegramSection, TgFloat } from './Telegram'
import { Footer } from './Footer'
import { useReveal } from './shared'

const CATS = ['Все', 'Alipay', 'Poizon', 'Taobao', 'Т-Банк', 'Поездки в Китай']

interface Post {
  c: string
  t: string
  d: string
  m: string
  date: string
  img?: string
  ph?: string
  href?: string
}

const POSTS: Post[] = [
  {
    c: 'Alipay',
    t: 'Как установить, верифицировать и пользоваться Alipay',
    d: 'Регистрация по российскому номеру, привязка загранпаспорта, переводы, лимиты и вывод средств.',
    m: '12 мин',
    date: '02.10.2026',
    img: '/assets/covers/alipay-setup.jpg',
    href: '/guides/alipay',
  },
  {
    c: 'Alipay',
    t: 'Как снять блокировку Alipay',
    d: 'Признаки ограничения и снятие блокировки через Центр безопасности — пошагово со скриншотами.',
    m: '4 мин',
    date: '08.10.2026',
    img: '/assets/alipay-unblock/cover.png',
    href: '/guides/alipay-unblock',
  },
  {
    c: 'Poizon',
    t: 'Как заказать товары с Poizon: полная инструкция',
    d: 'Установка приложения, регистрация, поиск, покупка через Alipay и доставка на склад посредника.',
    m: '12 мин',
    date: '28.09.2026',
    img: '/assets/covers/poizon.jpg',
    href: '/guides/poizon',
  },
  {
    c: 'Т-Банк',
    t: 'Перевод через Т-Банк: без ошибок',
    d: 'Почему только Т-Банк и как правильно оформить перевод.',
    m: '3 мин',
    date: '21.09.2026',
    img: '/assets/covers/tbank.jpg',
    href: '/guides/tbank',
  },
  {
    c: 'Taobao',
    t: 'Как заказать товары с Taobao: пошаговая инструкция',
    d: 'Установка приложения, регистрация, поиск, оплата через Alipay и доставка на склад посредника.',
    m: '12 мин',
    date: '07.09.2026',
    img: '/assets/covers/taobao.jpg',
    href: '/guides/taobao',
  },
  {
    c: 'Поездки в Китай',
    t: 'Путешествуете в Китай из России: 50 вещей, которые нужно знать в 2026 году',
    d: 'Безвиз на 30 дней, VPN и приложения, российские карты и Alipay, граница и Дальний Восток, язык и еда — всё для поездки из России.',
    m: '18 мин',
    date: '07.10.2026',
    img: '/assets/covers/china-travel-2026.jpg',
    href: '/guides/china-50-things',
  },
  {
    c: 'Поездки в Китай',
    t: 'Как заказать такси в Китае: гид по DiDi',
    d: 'Установка приложения, оплата через Alipay, тарифы, отмена заказа и безопасность.',
    m: '8 мин',
    date: '08.10.2026',
    img: '/assets/covers/taxi.jpg',
    href: '/guides/china-taxi',
  },
  {
    c: 'Поездки в Китай',
    t: 'Как платить через Alipay в Китае: полный гид для туриста',
    d: 'Настройка приложения, пополнение баланса через AlipayFast, оплата в магазинах и транспорте.',
    m: '7 мин',
    date: '08.10.2026',
    img: '/assets/covers/alipay-china.jpg',
    href: '/guides/alipay-china',
  },
  {
    c: 'Поездки в Китай',
    t: 'Как оплачивать метро в Китае через Alipay',
    d: 'Настраиваем транспортный QR-код из дома: город, универсальный проездной, турникеты.',
    m: '5 мин',
    date: '07.10.2026',
    img: '/assets/covers/metro.jpg',
    href: '/guides/china-metro',
  },
  {
    c: 'Поездки в Китай',
    t: 'Велосипеды и мопеды в Китае: как арендовать туристу',
    d: 'Синие, бирюзовые и жёлтые велосипеды: чем отличаются, как разблокировать и как платить через Alipay.',
    m: '6 мин',
    date: '06.10.2026',
    img: '/assets/covers/bikes.jpg',
    href: '/guides/china-bikes',
  },
]

export function MaterialsPage() {
  const [menu, setMenu] = useState(false)
  const [cat, setCat] = useState('Все')
  const [q, setQ] = useState('')
  useReveal()

  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : ''
  }, [menu])

  const list = POSTS.filter(
    (p) => (cat === 'Все' || p.c === cat) && (p.t + p.d).toLowerCase().includes(q.toLowerCase()),
  )
  const [feat, ...rest] = list
  const cnt = (c: string) => (c === 'Все' ? POSTS.length : POSTS.filter((p) => p.c === c).length)

  return (
    <>
      <Header onMenu={() => setMenu(true)} page="materials" />
      <MobileMenu open={menu} onClose={() => setMenu(false)} page="materials" />
      <section className="mt-hero">
        <div className="wrap">
          <div className="mt-crumb">
            <Link href="/">Главная</Link> / Полезные материалы
          </div>
          <h1 className="disp mt-h">
            Полезные
            <br />
            <span className="red">материалы</span>
          </h1>
          <div className="mt-sub">
            <p>Инструкции по Alipay, Poizon, Taobao и поездкам в Китай. Пошагово, со скриншотами, на русском.</p>
            <label className="mt-search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Найти инструкцию" />
            </label>
          </div>
        </div>
      </section>
      <div className="wrap">
        <div className="mt-filters">
          {CATS.map((c) => (
            <button key={c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>
              {c}
              <sup>{cnt(c)}</sup>
            </button>
          ))}
        </div>
        {feat && (
          <article className="mt-feat">
            <div className="mt-feat-img">
              {feat.img ? (
                <Image src={feat.img} alt="" width={600} height={420} priority />
              ) : (
                <div
                  className="ph"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'grid',
                    placeItems: 'center',
                    fontFamily: 'var(--display)',
                    fontSize: 180,
                    color: '#fff',
                  }}
                >
                  {feat.ph}
                </div>
              )}
            </div>
            <div>
              <span className="mt-tag">Новое · {feat.c}</span>
              <h2>{feat.t}</h2>
              <p>{feat.d}</p>
              <div className="mt-meta">
                <span>{feat.date}</span>
                <span>Читать {feat.m}</span>
              </div>
               <Link className="btn btn-red" href={feat.href || '/materials'}>
                 Читать инструкцию →
               </Link>
            </div>
          </article>
        )}
        <div className="mt-grid">
          {!list.length && (
            <div className="mt-empty">
              Ничего не нашлось. Напишите нам в{' '}
              <a href="https://t.me/alipayfast" target="_blank" className="red">
                Telegram
              </a>{' '}
              — подскажем.
            </div>
          )}
          {rest.map((p) => {
            const ready = !!p.href && p.href !== '/materials'
            const body = (
              <>
                <div className="mt-card-img">
                  {p.img ? <Image src={p.img} alt="" width={480} height={360} /> : <div className="ph">{p.ph}</div>}
                  <span className="num">{p.c}</span>
                </div>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
                <div className="ft2">
                  <span>{p.date}</span>
                  <span>{ready ? p.m : 'Скоро'}</span>
                </div>
              </>
            )
            return ready ? (
              <Link className="mt-card reveal" key={p.t} href={p.href as string}>
                {body}
              </Link>
            ) : (
              <article className="mt-card mt-card-soon reveal" key={p.t}>
                {body}
              </article>
            )
          })}
          {list.length > 0 && (
            <div className="mt-soon">
              <span className="mt-tag">Скоро</span>
              <b>Нужна инструкция, которой нет?</b>
              <span>Напишите тему — сделаем гайд и опубликуем в канале.</span>
              <a className="btn btn-line btn-sm" href="https://t.me/alipayfast" target="_blank">
                Предложить тему
              </a>
            </div>
          )}
        </div>
      </div>
      <TelegramSection />
      <Footer />
      <TgFloat />
    </>
  )
}
