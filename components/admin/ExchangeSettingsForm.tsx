'use client'

import { useCallback, useEffect, useState } from 'react'

interface Settings {
  markup: number
  useManualRate: boolean
  manualRate: number | null
  version: number
  lastUpdated: string
}

const TOKEN_KEY = 'apf_admin_token'

export function ExchangeSettingsForm() {
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [settings, setSettings] = useState<Settings | null>(null)
  const [markup, setMarkup] = useState('0.88')
  const [useManual, setUseManual] = useState(false)
  const [manualRate, setManualRate] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) : null
    if (saved) setToken(saved)
  }, [])

  const load = useCallback(
    async (t: string) => {
      try {
        const res = await fetch(`/api/admin/exchange-settings?token=${encodeURIComponent(t)}`, { cache: 'no-store' })
        if (res.status === 401) {
          sessionStorage.removeItem(TOKEN_KEY)
          setToken(null)
          return
        }
        const data = await res.json()
        if (data.success) {
          setSettings(data)
          setMarkup(String(data.markup))
          setUseManual(Boolean(data.useManualRate))
          setManualRate(data.manualRate != null ? String(data.manualRate) : '')
        }
      } catch (e) {
        console.error(e)
      }
    },
    [],
  )

  useEffect(() => {
    if (token) load(token)
  }, [token, load])

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.message || 'Неверный пароль')
        return
      }
      sessionStorage.setItem(TOKEN_KEY, data.token)
      setPassword('')
      setToken(data.token)
    } catch {
      setError('Ошибка авторизации')
    } finally {
      setBusy(false)
    }
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setError(null)
    setStatus(null)
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/exchange-settings?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markup: Number(markup),
          useManualRate: useManual,
          manualRate: manualRate ? Number(manualRate) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.message || 'Не удалось сохранить настройки')
        return
      }
      setStatus('Настройки сохранены. Курс на сайте уже обновлён.')
      load(token)
    } catch {
      setError('Ошибка сохранения настроек')
    } finally {
      setBusy(false)
    }
  }

  if (!token) {
    return (
      <form className="adm-card" onSubmit={login}>
        <h1 className="adm-h">Курс · вход</h1>
        <p className="adm-sub">Введите пароль администратора (ADMIN_PASSWORD).</p>
        {error && <div className="adm-err">{error}</div>}
        <label className="adm-lbl">
          Пароль
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        </label>
        <button className="adm-btn" disabled={busy}>
          {busy ? 'Проверяем…' : 'Войти'}
        </button>
      </form>
    )
  }

  return (
    <form className="adm-card" onSubmit={save}>
      <h1 className="adm-h">Настройки курса</h1>
      <p className="adm-sub">
        Базовый курс берётся из ЦБ РФ. Надбавка прибавляется к нему в зависимости от суммы в юанях. Либо включите ручной
        курс.
      </p>

      {settings && (
        <div className="adm-meta">
          Версия {settings.version} · обновлено {new Date(settings.lastUpdated).toLocaleString('ru-RU')}
        </div>
      )}
      {status && <div className="adm-ok">{status}</div>}
      {error && <div className="adm-err">{error}</div>}

      <label className="adm-lbl">
        Надбавка к курсу ЦБ (₽), верхний уровень «от 10 000 ¥»
        <input value={markup} onChange={(e) => setMarkup(e.target.value)} inputMode="decimal" />
      </label>
      <p className="adm-hint">
        Это самый выгодный уровень. Остальные уровни ранжира сдвигаются вместе с ним по
        фиксированному шагу: до 1 000 ¥ / от 1 000 ¥ / от 3 000 ¥ / от 10 000 ¥
        (границы и шаги — в <code>lib/exchange-config.ts</code>).
      </p>

      <label className="adm-check">
        <input type="checkbox" checked={useManual} onChange={(e) => setUseManual(e.target.checked)} />
        Ручной курс (отключает надбавки)
      </label>

      {useManual && (
        <label className="adm-lbl">
          Ручной курс, ₽ за 1 ¥
          <input value={manualRate} onChange={(e) => setManualRate(e.target.value)} inputMode="decimal" placeholder="13.33" />
        </label>
      )}

      <div className="adm-actions">
        <button className="adm-btn" disabled={busy}>
          {busy ? 'Сохраняем…' : 'Сохранить'}
        </button>
        <button
          type="button"
          className="adm-btn ghost"
          onClick={() => {
            sessionStorage.removeItem(TOKEN_KEY)
            setToken(null)
          }}
        >
          Выйти
        </button>
      </div>
    </form>
  )
}
