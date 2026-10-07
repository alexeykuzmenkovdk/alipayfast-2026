'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useRates } from './rates-context'

const HERO_IMG: Record<string, string> = {
  coin: '/assets/c-coin.webp',
  envelope: '/assets/c-envelope.webp',
  wallet: '/assets/c-wallet.webp',
}

export function Hero({ variant = 'hongbao' }: { variant?: 'hongbao' | 'coin' | 'envelope' | 'wallet' }) {
  const { bestRate } = useRates()
  const lines = ['Пополнение', 'Alipay', 'юанями']

  return (
    <section className="hero" id="top">
      <div className="wrap">
        <div className="hero-grid">
          <div>
            <div className="over">
              <span>Владивосток · онлайн 24/7</span>
              <span className="cn">支付宝充值</span>
            </div>
            <h1 className="disp h1">
              {lines.map((l, i) => (
                <span key={i} className={'r' + (i === 1 ? ' red' : '')}>
                  {l}
                </span>
              ))}
            </h1>
            <div className="hero-rule"></div>
            <div className="hero-sub">
              <p>
                Оказываю консультационные услуги по пополнению Alipay. Без скрытых комиссий — выгоднее, чем в банке вашего
                города.
              </p>
              <div className="hero-ctas">
                <a href="#calc" className="btn btn-red">
                  Рассчитать →
                </a>
                <a href="https://t.me/alipayfast" target="_blank" className="btn btn-line">
                  Написать
                </a>
              </div>
            </div>
          </div>
          <div className={'hero-img ' + variant}>
            {variant === 'hongbao' ? (
              <Hongbao bestRate={bestRate} />
            ) : (
              <Image src={HERO_IMG[variant]} alt="Пополнение Alipay юанями: обмен рублей на юани" fill sizes="(max-width: 900px) 100vw, 40vw" className="multiply" />
            )}
          </div>
        </div>
        <div className="stats">
          <div className="stat">
            <b>1 000+</b>
            <span>успешных обменов</span>
          </div>
          <div className="stat">
            <b>{bestRate.toFixed(2).replace('.', ',')} ₽</b>
            <span>лучший курс за ¥</span>
          </div>
          <div className="stat">
            <b>0 %</b>
            <span>скрытых комиссий</span>
          </div>
          <div className="stat">
            <b>24/7</b>
            <span>поддержка RU / EN / 中文</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Hongbao({ bestRate }: { bestRate: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [lift, setLift] = useState(0)

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const y = (e.clientY - r.top) / r.height
    setLift(Math.max(0, Math.min(1, 1 - y)))
  }

  return (
    <div
      className="hb"
      ref={ref}
      style={{ ['--lift' as string]: lift }}
      onPointerMove={onMove}
      onPointerLeave={() => setLift(0)}
    >
      <div className="hb-shadow"></div>
      <div className="hb-back"></div>
      <div className="hb-flap"></div>
      <div className="hb-coin">
        <div className="hb-face front">¥</div>
        <div className="hb-face back">
          <small>1 ¥ =</small>
          {bestRate.toFixed(2).replace('.', ',')}
          <small>₽</small>
        </div>
      </div>
      <div className="hb-pocket">
        <span className="hb-seal">福</span>
        <span className="hb-cn">支付宝</span>
        <span className="hb-label">ALIPAYFAST</span>
      </div>
    </div>
  )
}

export function Marquee() {
  const items = ['Taobao', 'Tmall', 'Poizon', '1688', 'JD.com', 'Xiaohongshu', 'Pinduoduo']
  const row = items.map((t, i) => (
    <span key={i}>
      {t}
      <em>¥</em>
    </span>
  ))
  return (
    <div className="marq">
      <div className="marq-track">
        {row}
        {row}
        {row}
        {row}
      </div>
    </div>
  )
}
