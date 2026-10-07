'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRates } from './rates-context'
import { fmt } from './shared'
import type { RateTier } from '@/lib/exchange-config'

const MIN_RUB = 3000
const STEP_RUB = 1000
const MAX_RUB = 300000

export interface CalcState {
  rub: number
  cny: number
  tier: number
  valid: boolean
}

export interface OrderPayload {
  rub: number
  cny: number
  rate: number
}

export function Calculator({
  onOrder,
  onChange,
}: {
  onOrder: (o: OrderPayload) => void
  onChange?: (c: CalcState) => void
}) {
  const { tiers, isManual } = useRates()
  const TIERS: RateTier[] = tiers

  const [mode, setMode] = useState<'rub' | 'cny'>('rub')
  const [val, setVal] = useState(15000)
  const [upd, setUpd] = useState<Date | null>(null)
  const [spin, setSpin] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const saved = Number(localStorage.getItem('apf_val'))
    if (saved) setVal(saved)
    setUpd(new Date())
    setHydrated(true)
  }, [])

  useEffect(() => {
    localStorage.setItem('apf_val', String(val))
  }, [val])

  const tierIdxByCny = (cny: number) => {
    const i = TIERS.findIndex((t) => cny >= t.from && cny < t.to)
    return i === -1 ? TIERS.length - 1 : i
  }

  const rubToCny = (rub: number) => {
    for (let i = TIERS.length - 1; i >= 0; i--) {
      const c = rub / TIERS[i].rate
      if (c >= TIERS[i].from) return { cny: c, tier: i }
    }
    return { cny: rub / TIERS[0].rate, tier: 0 }
  }

  const cnyToRub = (cny: number) => {
    const i = tierIdxByCny(cny)
    return { rub: cny * TIERS[i].rate, tier: i }
  }

  let rub: number
  let cny: number
  let tier: number
  if (mode === 'rub') {
    rub = val
    ;({ cny, tier } = rubToCny(rub))
  } else {
    cny = val
    ;({ rub, tier } = cnyToRub(cny))
    rub = Math.ceil(rub / STEP_RUB) * STEP_RUB
  }

  const rubOk = rub >= MIN_RUB && rub % STEP_RUB === 0
  const valid = mode === 'rub' ? rubOk : cny > 0 && rub >= MIN_RUB
  const finalCny = mode === 'rub' ? cny : rub / TIERS[tier].rate

  useEffect(() => {
    onChangeRef.current?.({ rub, cny: finalCny, tier, valid })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rub, finalCny, tier, valid])

  const next = TIERS[tier + 1]
  const needCny = next ? next.from - cny : 0
  const progress = next ? Math.min(100, ((cny - TIERS[tier].from) / (next.from - TIERS[tier].from)) * 100) : 100

  const chips = useMemo(
    () => (mode === 'rub' ? [5000, 15000, 40000, 135000] : [500, 1500, 5000, 10000]),
    [mode],
  )
  const rMax = mode === 'rub' ? 150000 : 12000
  const rMin = mode === 'rub' ? MIN_RUB : 100
  const rStep = mode === 'rub' ? STEP_RUB : 50
  const p = Math.max(0, Math.min(100, ((val - rMin) / (rMax - rMin)) * 100))

  const switchMode = (m: 'rub' | 'cny') => {
    if (m === mode) return
    if (m === 'cny') setVal(Math.max(100, Math.round(cny / 10) * 10))
    else setVal(Math.max(MIN_RUB, Math.round(rub / STEP_RUB) * STEP_RUB))
    setMode(m)
  }
  const bump = (d: number) =>
    setVal((v) => Math.max(mode === 'rub' ? MIN_RUB : 0, Math.min(MAX_RUB, (Number(v) || 0) + d * rStep)))
  const jumpToNext = () => {
    if (!next) return
    if (mode === 'cny') setVal(next.from)
    else setVal(Math.ceil((next.from * next.rate) / STEP_RUB) * STEP_RUB)
  }
  const refresh = () => {
    setSpin(true)
    setTimeout(() => {
      setSpin(false)
      setUpd(new Date())
    }, 800)
  }

  return (
    <div className="calc">
      <div>
        <div className="seg">
          <button className={mode === 'rub' ? 'on' : ''} onClick={() => switchMode('rub')}>
            Отдаю рубли
          </button>
          <button className={mode === 'cny' ? 'on' : ''} onClick={() => switchMode('cny')}>
            Нужно юаней
          </button>
        </div>
        <div className="fld-l">
          <span>{mode === 'rub' ? 'Сумма в рублях' : 'Сумма в юанях'}</span>
          <span>{mode === 'rub' ? 'RUB' : 'CNY'}</span>
        </div>
        <div className="amt">
          <input
            inputMode="numeric"
            size={1}
            value={val ? fmt(val) : ''}
            onChange={(e) => {
              const n = Number(e.target.value.replace(/\D/g, ''))
              setVal(Math.min(MAX_RUB, n))
            }}
            onBlur={() => {
              if (mode === 'rub') setVal((v) => Math.max(MIN_RUB, Math.round(v / STEP_RUB) * STEP_RUB))
            }}
            aria-label="Сумма"
          />
          <span className="cur">{mode === 'rub' ? '₽' : '¥'}</span>
          <div className="steps">
            <button className="step" onClick={() => bump(-1)} aria-label="Меньше">
              −
            </button>
            <button className="step" onClick={() => bump(1)} aria-label="Больше">
              +
            </button>
          </div>
        </div>
        <input
          type="range"
          className="range"
          style={{ ['--p' as string]: p + '%' }}
          min={rMin}
          max={rMax}
          step={rStep}
          value={Math.min(val, rMax)}
          onChange={(e) => setVal(Number(e.target.value))}
        />
        <div className="chips">
          {chips.map((c) => (
            <button key={c} className={'chip' + (val === c ? ' on' : '')} onClick={() => setVal(c)}>
              {fmt(c)} {mode === 'rub' ? '₽' : '¥'}
            </button>
          ))}
        </div>
        <div className={'hint' + (mode === 'rub' && !rubOk ? ' err' : '')}>
          {mode === 'rub'
            ? 'Минимум 3 000 ₽ · сумма кратна 1 000 ₽'
            : 'К оплате округляем до 1 000 ₽ · минимум 3 000 ₽'}
        </div>
        <div className="tiers">
          {TIERS.map((t, i) => (
            <div key={i} className={'tier' + (i === tier ? ' on' : '')}>
              <i></i>
              <span>{t.label}</span>
              <b>1 ¥ = {fmt(t.rate, 2)} ₽</b>
            </div>
          ))}
        </div>
        <div
          className="hint"
          style={{ marginTop: 0, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}
        >
          <span>{isManual ? 'Курс установлен вручную' : 'Курс зависит от суммы'} · фиксируем на 15 минут</span>
          <button className={'upd' + (spin ? ' spin' : '')} onClick={refresh}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5" />
            </svg>
            обновлено {hydrated && upd ? upd.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
          </button>
        </div>
      </div>
      <div className="res">
        <div className="res-l">{mode === 'rub' ? 'Вы получите на Alipay' : 'К оплате через Т-Банк'}</div>
        <div className="res-v">
          {mode === 'rub' ? (
            <>
              {fmt(cny, 2)}
              <small>¥</small>
            </>
          ) : (
            <>
              {fmt(rub)}
              <small>₽</small>
            </>
          )}
        </div>
        <div className="res-meta">
          {mode === 'rub'
            ? `за ${fmt(rub)} ₽`
            : `за ${fmt(cny)} ¥ · вы получите ${fmt(rub / TIERS[tier].rate, 2)} ¥`}{' '}
          · курс {fmt(TIERS[tier].rate, 2)} ₽
        </div>
        <div style={{ height: 28 }}></div>
        {next ? (
          <div className="nudge">
            <div style={{ flex: 1 }}>
              Ещё <b>{fmt(Math.ceil(needCny))} ¥</b> — и курс станет {fmt(next.rate, 2)} ₽.{' '}
              <button onClick={jumpToNext}>Выгоднее</button>
              <div className="bar">
                <i style={{ width: progress + '%' }}></i>
              </div>
            </div>
          </div>
        ) : (
          <div className="nudge">
            <div>
              У вас лучший курс — <b>{fmt(TIERS[TIERS.length - 1].rate, 2)} ₽</b> за юань.
            </div>
          </div>
        )}
        <button
          className="btn btn-red"
          disabled={!valid}
          style={{ opacity: valid ? 1 : 0.5 }}
          onClick={() => valid && onOrder({ rub, cny: finalCny, rate: TIERS[tier].rate })}
        >
          Пополнить на {fmt(finalCny, 0)} ¥ →
        </button>
        <div className="hint" style={{ textAlign: 'center' }}>
          Без скрытых комиссий · зачисление ~15 минут
        </div>
      </div>
    </div>
  )
}
