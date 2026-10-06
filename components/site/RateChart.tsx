'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRates } from './rates-context'
import { TgIcon } from './shared'
import { EXCHANGE_CONFIG, type RateTier } from '@/lib/exchange-config'

interface Point {
  d: Date
  cb: number
}

const fmt = (n: number, d = 0) =>
  (Number.isFinite(n) ? n : 0).toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d })
const fmtD = (d: Date) => d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
const fmtDL = (d: Date) =>
  d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' })

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Запасной ряд, если история ещё не накопилась.
function synthetic(base: number, days = 180): Point[] {
  const r = seeded(4242)
  const out: Point[] = []
  let v = base
  const today = new Date()
  for (let i = 0; i < days; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    out.unshift({ d, cb: +v.toFixed(4) })
    v = v - (r() - 0.5) * 0.11 + Math.sin(i / 17) * 0.012 - 0.004
    v = Math.max(base - 1.3, Math.min(base + 1.3, v))
  }
  return out
}

function useWidth(ref: React.RefObject<HTMLElement>) {
  const [w, setW] = useState(800)
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [ref])
  return w
}

export function RateChart() {
  const { tiers, isManual, manualRate } = useRates()
  const [period, setPeriod] = useState(30)
  const [tier, setTier] = useState(tiers.length - 1)
  const [hover, setHover] = useState<number | null>(null)
  const [history, setHistory] = useState<Point[]>([])
  const [isSynthetic, setIsSynthetic] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const W = useWidth(boxRef)
  const mobile = W < 560
  const H = mobile ? 260 : 380
  const PR = mobile ? 44 : 60
  const PT = 24
  const PB = 34

  useEffect(() => {
    let alive = true
    fetch('/api/exchange-history', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return
        const list: Point[] = Array.isArray(data?.history)
          ? data.history
              .map((p: { date: string; baseRate: number }) => ({ d: new Date(p.date), cb: Number(p.baseRate) }))
              .filter((p: Point) => !isNaN(p.cb))
          : []
        setHistory(list)
      })
      .catch(() => setHistory([]))
    return () => {
      alive = false
    }
  }, [])

  const baseFallback = useMemo(() => EXCHANGE_CONFIG.FALLBACK_RATE, [])

  const source = useMemo(() => {
    if (history.length >= 8) {
      setIsSynthetic(false)
      return history
    }
    setIsSynthetic(true)
    const base = history.length ? history[history.length - 1].cb : baseFallback
    return synthetic(base)
  }, [history, baseFallback])

  const activeTier: RateTier = tiers[Math.min(tier, tiers.length - 1)]
  const markup = activeTier?.markup ?? 0
  const ourRate = (cb: number) => (isManual && manualRate ? manualRate : +(cb + markup).toFixed(2))

  const data = useMemo(
    () => source.slice(-period).map((p) => ({ d: p.d, cb: p.cb, our: ourRate(p.cb) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [source, period, markup, isManual, manualRate],
  )

  const vals = data.map((p) => p.our)
  let lo = Math.min(...vals)
  let hi = Math.max(...vals)
  const padY = (hi - lo) * 0.18 || 0.2
  lo -= padY
  hi += padY

  const x = (i: number) => (data.length <= 1 ? 0 : (i / (data.length - 1)) * (W - PR))
  const y = (v: number) => PT + (1 - (v - lo) / (hi - lo)) * (H - PT - PB)
  const path = (key: 'our' | 'cb') =>
    data.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p[key]).toFixed(1)}`).join(' ')
  const area = data.length ? `${path('our')} L${x(data.length - 1)} ${H - PB} L0 ${H - PB} Z` : ''

  const ticksY = 4
  const yT = Array.from({ length: ticksY + 1 }, (_, i) => lo + (hi - lo) * (i / ticksY))
  const nX = mobile ? 4 : 6
  const xT = Array.from({ length: nX }, (_, i) => Math.round((i * (data.length - 1)) / (nX - 1)))

  const idx = hover ?? data.length - 1
  const cur = data[idx]
  const prev = data[Math.max(0, idx - 1)]
  const delta = cur && prev ? cur.our - prev.our : 0
  const pct = prev?.our ? (delta / prev.our) * 100 : 0
  const mn = Math.min(...vals)
  const mx = Math.max(...vals)
  const avg = vals.reduce((a, b) => a + b, 0) / (vals.length || 1)
  const periodDelta = data.length ? data[data.length - 1].our - data[0].our : 0

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - r.left
    const i = Math.round((px / (W - PR)) * (data.length - 1))
    setHover(Math.max(0, Math.min(data.length - 1, i)))
  }
  const tipLeft = cur ? Math.min(Math.max(x(idx), 80), Math.max(W - PR - 80, 80)) : 0
  const last7 = source.slice(-8).map((p) => ({ d: p.d, our: ourRate(p.cb) }))

  if (!cur) {
    return <div className="rc-empty mono">Загружаем данные курса…</div>
  }

  return (
    <div className="rc">
      <div className="rc-main">
        <div className="rc-top">
          <div>
            <div className="rc-lbl">
              {hover == null ? 'Курс сегодня' : fmtDL(cur.d)} · {activeTier?.label}
            </div>
            <div className="rc-big">
              {fmt(cur.our, 2)}
              <small>₽</small>
            </div>
            <div className={'rc-delta ' + (delta > 0 ? 'up' : delta < 0 ? 'dn' : '')}>
              {delta > 0 ? '▲' : delta < 0 ? '▼' : '•'} {fmt(Math.abs(delta), 2)} ₽ ({delta >= 0 ? '+' : '−'}
              {fmt(Math.abs(pct), 2)}%) за день
            </div>
          </div>
          <div className="rc-stats">
            <div>
              <span>Мин</span>
              <b>{fmt(mn, 2)}</b>
            </div>
            <div>
              <span>Макс</span>
              <b>{fmt(mx, 2)}</b>
            </div>
            <div>
              <span>Средний</span>
              <b>{fmt(avg, 2)}</b>
            </div>
            <div>
              <span>За {period} дн</span>
              <b className={periodDelta > 0 ? 'up' : 'dn'}>
                {periodDelta > 0 ? '+' : '−'}
                {fmt(Math.abs(periodDelta), 2)}
              </b>
            </div>
          </div>
        </div>

        <div className="rc-ctrl">
          <div className="rc-seg">
            {[7, 30, 90, 180].map((p) => (
              <button
                key={p}
                className={period === p ? 'on' : ''}
                onClick={() => {
                  setPeriod(p)
                  setHover(null)
                }}
              >
                {p === 180 ? '6 мес' : `${p} дн`}
              </button>
            ))}
          </div>
          <div className="rc-tiers">
            {tiers.map((t, i) => (
              <button key={i} className={tier === i ? 'on' : ''} onClick={() => setTier(i)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rc-box" ref={boxRef}>
          <svg width={W} height={H} onPointerMove={onMove} onPointerLeave={() => setHover(null)} style={{ touchAction: 'pan-y' }}>
            <defs>
              <pattern id="rcHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="var(--red)" strokeWidth="1.2" opacity=".22" />
              </pattern>
            </defs>
            {yT.map((v, i) => (
              <g key={i}>
                <line x1="0" x2={W - PR} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeDasharray={i === 0 ? '' : '2 4'} />
                <text x={W - PR + 10} y={y(v) + 4} className="rc-ax">
                  {fmt(v, 2)}
                </text>
              </g>
            ))}
            {xT.map((i, j) => (
              <text
                key={j}
                x={x(i)}
                y={H - 10}
                className="rc-ax"
                textAnchor={j === 0 ? 'start' : j === xT.length - 1 ? 'end' : 'middle'}
              >
                {data[i] ? fmtD(data[i].d) : ''}
              </text>
            ))}
            <path d={area} fill="url(#rcHatch)" />
            <path
              key={`${period}-${tier}-${isManual}`}
              className="rc-line"
              d={path('our')}
              fill="none"
              stroke="var(--red)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              pathLength={1}
            />
            <line x1={x(idx)} x2={x(idx)} y1={PT - 8} y2={H - PB} stroke="var(--ink)" strokeWidth="1" opacity={hover == null ? 0 : 0.5} />
            {hover == null && <circle cx={x(idx)} cy={y(cur.our)} r="12" fill="var(--red)" className="rc-pulse" />}
            <circle cx={x(idx)} cy={y(cur.our)} r="5.5" fill="var(--red)" stroke="var(--paper)" strokeWidth="2.5" />
            <g transform={`translate(${W - PR}, ${y(data[data.length - 1].our)})`}>
              <rect x="2" y="-11" width={PR - 2} height="22" fill="var(--red)" />
              <text x={PR / 2 + 1} y="4" textAnchor="middle" className="rc-ax" style={{ fill: '#fff', fontWeight: 600 }}>
                {fmt(data[data.length - 1].our, 2)}
              </text>
            </g>
          </svg>
          {hover != null && (
            <div className="rc-tip" style={{ left: tipLeft }}>
              <div className="d">{fmtDL(cur.d)}</div>
              <div className="r">
                <i style={{ background: 'var(--red)' }}></i>AlipayFast<b>{fmt(cur.our, 2)} ₽</b>
              </div>
            </div>
          )}
        </div>
        <div className="rc-leg">
          <span>
            <i style={{ background: 'var(--red)' }}></i>Курс AlipayFast, ₽ за 1 ¥
          </span>
          <span className="rc-note">{isSynthetic ? 'Данные для прототипа' : 'Курс ЦБ РФ + надбавка'}</span>
        </div>
      </div>

      <aside className="rc-side">
        <div className="rc-lbl" style={{ marginBottom: 12 }}>
          Последние 7 дней
        </div>
        <div className="rc-days">
          {last7
            .slice(1)
            .reverse()
            .map((p, i) => {
              const pv = last7[last7.length - 2 - i]?.our ?? p.our
              const dl = p.our - pv
              return (
                <div key={i} className={'rc-day' + (i === 0 ? ' today' : '')}>
                  <span>{i === 0 ? 'Сегодня' : p.d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  <b>{fmt(p.our, 2)}</b>
                  <em className={dl > 0 ? 'up' : dl < 0 ? 'dn' : ''}>
                    {dl > 0 ? '▲' : dl < 0 ? '▼' : '•'} {fmt(Math.abs(dl), 2)}
                  </em>
                </div>
              )
            })}
        </div>
        <a className="rc-sub" href="https://t.me/alipayfast" target="_blank">
          <TgIcon />
          <span>
            <b>Курс каждое утро</b>в Telegram-канале @alipayfast
          </span>
          <em>→</em>
        </a>
      </aside>
    </div>
  )
}

export function RatesSection() {
  return (
    <section className="sec" id="rates">
      <div className="wrap">
        <div className="sec-h reveal">
          <div>
            <span className="sec-idx">02 / КУРС ПО ДНЯМ</span>
            <h2 className="disp h2">
              Динамика
              <br />
              <span className="red">юаня</span>
            </h2>
          </div>
          <p>
            Как менялся курс AlipayFast по дням. Наведите на график или проведите пальцем, чтобы увидеть курс за конкретный
            день.
          </p>
        </div>
        <div className="reveal">
          <RateChart />
        </div>
      </div>
    </section>
  )
}
