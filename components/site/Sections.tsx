'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Calculator, type CalcState, type OrderPayload } from './Calculator'
import { COMPANY, FULL_ADDRESS, OFFICE_MAP_SRC } from '@/lib/company'
import { FAQ } from '@/lib/seo-faq'

export function CalcSection({
  onOrder,
  onChange,
}: {
  onOrder: (o: OrderPayload) => void
  onChange?: (c: CalcState) => void
}) {
  return (
    <section className="sec calc-sec" id="calc">
      <div className="wrap">
        <div className="sec-h reveal">
          <div>
            <span className="sec-idx">01 / КАЛЬКУЛЯТОР</span>
            <h2 className="disp h2">
              Сколько юаней
              <br />
              вы получите
            </h2>
          </div>
          <p>Курс зависит от суммы: чем больше пополнение — тем выгоднее каждый юань. Считаем в обе стороны.</p>
        </div>
        <Calculator onOrder={onOrder} onChange={onChange} />
      </div>
    </section>
  )
}

export function Why() {
  const items: [string, string][] = [
    ['Скорость', 'Юани на вашем Alipay в среднем через 15 минут после оплаты. Иногда быстрее.'],
    ['Безопасность', 'Работаем с 2022 года, более тысячи операций. Данные не передаём третьим лицам.'],
    ['Курс', 'Прозрачная шкала без скрытых комиссий. Для новых подписчиков канала — спецкурс на первое пополнение.'],
  ]
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-h reveal">
          <div>
            <span className="sec-idx">03 / ПОЧЕМУ МЫ</span>
            <h2 className="disp h2">
              Быстро.
              <br />
              Честно.
              <br />
              <span className="red">Выгодно.</span>
            </h2>
          </div>
          <p>Не банк и не биржа — живой сервис с офисом во Владивостоке и поддержкой на трёх языках.</p>
        </div>
        <div className="why reveal">
          {items.map(([h, p], i) => (
            <div className="why-i" key={i}>
              <span className="why-n">0{i + 1}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function How() {
  const steps: [string, string][] = [
    ['Свяжитесь с нами', 'Напишите в Telegram или WhatsApp — или оставьте заявку через калькулятор.'],
    ['Укажите сумму', 'Сколько юаней нужно на Alipay. Мы зафиксируем курс.'],
    ['Получите реквизиты', 'Пришлём реквизиты для оплаты в рублях.'],
    ['Оплатите через Т-Банк', 'Переведите сумму из приложения Т-Банк.'],
    ['Подтвердите', 'Отправьте чек и ваш Alipay ID.'],
    ['Получите юани', 'Кошелёк пополнен — можно платить в Китае и на площадках.'],
  ]
  const [on, setOn] = useState(0)
  const refs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setOn(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: '-45% 0px -45% 0px' },
    )
    refs.current.forEach((r) => r && io.observe(r))
    return () => io.disconnect()
  }, [])

  return (
    <section className="sec" id="how" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sec-h reveal">
          <div>
            <span className="sec-idx">04 / КАК ЭТО РАБОТАЕТ</span>
            <h2 className="disp h2">
              Alipay за
              <br />
              <span className="red">5 минут</span>
            </h2>
          </div>
          <p>Без зарубежной карты. Шесть шагов — большую часть делаем мы.</p>
        </div>
        <div className="how">
          <div className="how-img">
            <Image src="/assets/c-envelope-white.webp" alt="" fill sizes="(max-width: 900px) 100vw, 40vw" className="multiply" />
            <div className="big">0{on + 1}</div>
          </div>
          <div className="how-list">
            {steps.map(([h, p], i) => (
              <div
                key={i}
                ref={(el) => {
                  refs.current[i] = el
                }}
                data-i={i}
                className={'how-row' + (on === i ? ' on' : '')}
                onMouseEnter={() => setOn(i)}
              >
                <div className="n">0{i + 1}</div>
                <div>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function Platforms() {
  const P: [string, string, string][] = [
    ['TB', 'Taobao', '淘宝'],
    ['TM', 'Tmall', '天猫'],
    ['JD', 'JD.com', '京东'],
    ['PZ', 'Poizon', '得物'],
    ['1688', '1688', '阿里巴巴'],
    ['XHS', 'Xiaohongshu', '小红书'],
  ]
  return (
    <section className="sec" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sec-h reveal">
          <div>
            <span className="sec-idx">05 / ПЛОЩАДКИ</span>
            <h2 className="disp h2">
              Платите
              <br />
              где угодно
            </h2>
          </div>
          <p>Пополненный Alipay работает на всех популярных китайских маркетплейсах и в офлайн-магазинах Китая.</p>
        </div>
        <div className="plats reveal">
          {P.map(([a, n, c]) => (
            <div className="plat" key={a}>
              <span className="cn">{c}</span>
              <span className="ab">{a}</span>
              <span className="nm">{n}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Services() {
  const S: [string, string][] = [
    ['Прямая оплата продавцам', 'Переведём деньги продавцу на китайской площадке напрямую — вам не нужно разбираться.'],
    ['Выкуп товаров', 'Выкупим товар, даже если у вас нет аккаунта или не проходит оплата.'],
    ['Услуги баера', 'Поиск, проверка качества, выкуп, консолидация и доставка.'],
    ['Доставка в Россию', 'С таможенным оформлением и отслеживанием.'],
    ['Консультации по шопингу', 'Подскажем, где искать, как торговаться и экономить.'],
  ]
  return (
    <section className="sec" id="services" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sec-h reveal">
          <div>
            <span className="sec-idx">06 / УСЛУГИ</span>
            <h2 className="disp h2">
              Больше, чем
              <br />
              пополнение
            </h2>
          </div>
          <p>Полный цикл работы с Китаем — от оплаты до посылки у вас в руках.</p>
        </div>
        <div className="svc svc-wrap reveal">
          {S.map(([h, p], i) => (
            <a href="https://t.me/alipayfast" target="_blank" className="svc-r" key={i}>
              <span className="n">/0{i + 1}</span>
              <h3>{h}</h3>
              <p>{p}</p>
              <span className="ar">→</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Office() {
  const d = new Date()
  const day = d.getDay()
  const h = d.getHours() + d.getMinutes() / 60
  const open = (day >= 1 && day <= 5 && h >= 10 && h < 19) || (day === 6 && h >= 11 && h < 17)
  const todayKey = day === 0 ? 2 : day === 6 ? 1 : 0

  return (
    <section className="sec" id="office" style={{ paddingTop: 0 }}>
      <div className="wrap office">
        <div className="office-img reveal">
          <Image src="/assets/c-wallet.webp" alt="" fill sizes="(max-width: 900px) 100vw, 45vw" />
          <div className="open-badge">
            <span className={'dot' + (open ? '' : ' closed')}></span>
            {open ? 'Офис открыт' : 'Офис закрыт · онлайн 24/7'}
          </div>
        </div>
        <div className="office-info reveal">
          <span className="sec-idx">07 / ОФИС</span>
          <h2 className="disp h2">
            Консультации
            <br />
            во
            <br />
            <span className="red">Владивостоке</span>
          </h2>
          <p style={{ fontSize: 17, color: 'var(--muted)', marginTop: 20, maxWidth: 520 }}>
            Можно встретиться лично с администратором для консультации по работе с Alipay и китайскими площадками. О
            визите предупредите в Telegram или WhatsApp.
          </p>
          <div className="o-grid">
            <div className="o-cell">
              <h4>Адрес</h4>
              <p>
                {COMPANY.street}
                <br />
                {COMPANY.locality}, {COMPANY.postalCode}
              </p>
            </div>
            <div className="o-cell">
              <h4>Связаться</h4>
              <p>
                <a href={`tel:${COMPANY.phoneRaw}`}>{COMPANY.phone}</a>
                <br />
                <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
              </p>
            </div>
            <div className="o-cell">
              <h4>Часы работы</h4>
              <div className="hours">
                <div className={todayKey === 0 ? 'today' : ''}>
                  <span>Пн–Пт</span>
                  <span>10:00–19:00</span>
                </div>
                <div className={todayKey === 1 ? 'today' : ''}>
                  <span>Сб</span>
                  <span>11:00–17:00</span>
                </div>
                <div className={todayKey === 2 ? 'today' : ''}>
                  <span>Вс</span>
                  <span>выходной</span>
                </div>
              </div>
            </div>
            <div className="o-cell" style={{ gridColumn: '1 / -1', paddingLeft: 0, borderLeft: 0 }}>
              <h4>При личном визите</h4>
              <ul style={{ columns: 2, columnGap: 24 }}>
                <li>Разбор вашего сценария покупок</li>
                <li>Индивидуальный подбор решения</li>
                <li>Консультация по Alipay</li>
                <li>Помощь с установкой приложения</li>
              </ul>
            </div>
          </div>
          <div className="office-ctas">
            <a
              className="btn btn-ink"
              href={`https://yandex.ru/maps/?text=${encodeURIComponent(FULL_ADDRESS)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Построить маршрут →
            </a>
            <a className="btn btn-line" href={COMPANY.telegram} target="_blank" rel="noopener noreferrer">
              Договориться о встрече
            </a>
          </div>

          <div className="office-map">
            <iframe
              src={OFFICE_MAP_SRC}
              title={`${COMPANY.name} на карте: ${FULL_ADDRESS}`}
              width="100%"
              height="320"
              loading="lazy"
              style={{ border: 0, display: 'block' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export function Reviews() {
  const R: [string, string, string, string][] = [
    [
      'Михаил С.',
      'Владивосток',
      '15.04.2025',
      'Собирались с семьёй в Харбин на выходные, нужно было срочно пополнить Alipay. Алексей помог с обменом за 15 минут! Курс был даже выгоднее, чем в местных обменниках.',
    ],
    [
      'Андрей К.',
      'Уссурийск',
      '02.05.2025',
      'Регулярно езжу в Суйфэньхэ за товаром для магазина. Раньше возил наличку — теперь просто пополняю Alipay. Быстро, удобно и без лишних вопросов.',
    ],
    [
      'Елена В.',
      'Артём',
      '28.04.2025',
      'Впервые воспользовалась сервисом перед поездкой. Немного переживала, но деньги поступили буквально через 7 минут после оплаты. Спасибо за оперативность!',
    ],
  ]
  return (
    <section className="sec" id="reviews" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sec-h reveal">
          <div>
            <span className="sec-idx">08 / ОТЗЫВЫ</span>
            <h2 className="disp h2">
              1 000+
              <br />
              довольных
            </h2>
          </div>
          <p>
            Клиенты из Владивостока и Приморского края.{' '}
            <a
              href="https://t.me/alipayfast"
              target="_blank"
              style={{ color: 'var(--red)', textDecoration: 'underline', textUnderlineOffset: 3 }}
            >
              Оставить отзыв →
            </a>
          </p>
        </div>
        <div className="revs reveal">
          {R.map(([n, c, dt, t]) => (
            <div className="rev" key={n}>
              <div className="q">“</div>
              <p>{t}</p>
              <div className="rev-f">
                <div className="rev-a">{n[0]}</div>
                <div>
                  <b>{n}</b>
                  <span>{c}</span>
                </div>
                <span className="rev-d">{dt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Faq() {
  const Q = FAQ.map((item) => [item.q, item.a] as [string, string])
  const [open, setOpen] = useState(0)

  return (
    <section className="sec" id="faq" style={{ paddingTop: 0 }}>
      <div className="wrap faq-g">
        <div>
          <span className="sec-idx">09 / FAQ</span>
          <h2 className="disp h2" style={{ marginBottom: 32 }}>
            Частые
            <br />
            вопросы
          </h2>
          <div className="faq-art">
            <Image src="/assets/c-coin.webp" alt="" width={320} height={320} className="multiply" />
          </div>
        </div>
        <div className="faq">
          {Q.map(([q, a], i) => (
            <div key={i} className={'faq-i' + (open === i ? ' open' : '')}>
              <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                {q}
                <span className="pm"></span>
              </button>
              <div className="faq-a">
                <div>
                  <p>{a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="wrap contact-g">
        <div className="contact-l">
          <div>
            <span className="mono" style={{ fontSize: 13, display: 'block', marginBottom: 18 }}>
              10 / КОНТАКТЫ
            </span>
            <h2 className="disp h2">
              Пополним<span>прямо сейчас</span>
            </h2>
          </div>
          <div className="c-btns">
            <a className="c-btn" href="https://t.me/alipayfast" target="_blank">
              <small>Самый быстрый</small>
              <b>
                Telegram <span>→</span>
              </b>
            </a>
            <a className="c-btn alt" href="https://wa.me/79243394924" target="_blank">
              <small>+7 924 339-49-24</small>
              <b>
                WhatsApp <span>→</span>
              </b>
            </a>
          </div>
          <div className="c-meta">
            <span>Пн–Вс · 24/7</span>
            <span>RU · EN · 中文</span>
            <span>Приморский край</span>
          </div>
        </div>
        <div className="contact-r">
          <Image src="/assets/c-note.webp" alt="" fill sizes="(max-width: 900px) 100vw, 45vw" style={{ objectFit: 'cover', objectPosition: '50% 50%' }} />
        </div>
      </div>
    </section>
  )
}
