'use client'

import { useEffect, useMemo, useState } from 'react'

const SCRIPT = 'https://telegram.org/js/telegram-web-app.js'

interface TelegramUser {
  id: number
  username?: string
  first_name?: string
  last_name?: string
}

interface TelegramWebApp {
  ready: () => void
  expand: () => void
  initData: string
  initDataUnsafe?: { user?: TelegramUser }
  colorScheme?: 'light' | 'dark'
  setHeaderColor?: (color: string) => void
  setBackgroundColor?: (color: string) => void
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp }
  }
}

// Загружает telegram-web-app.js (если его ещё нет), вызывает ready()/expand()
// и отдаёт initData для запросов к API. В обычном браузере через 2.5 секунды
// просто продолжает работу без Telegram.
export function useTelegram() {
  const [ready, setReady] = useState(false)
  const [initData, setInitData] = useState('')
  const [user, setUser] = useState<TelegramUser | null>(null)

  useEffect(() => {
    let cancelled = false

    const apply = () => {
      if (cancelled) return
      const webApp = window.Telegram?.WebApp
      if (webApp) {
        try {
          webApp.ready()
          webApp.expand()
          webApp.setHeaderColor?.('#F2EADB')
          webApp.setBackgroundColor?.('#F2EADB')
        } catch (error) {
          console.error('Ошибка инициализации Telegram WebApp:', error)
        }
        setInitData(webApp.initData ?? '')
        setUser(webApp.initDataUnsafe?.user ?? null)
      }
      setReady(true)
    }

    if (window.Telegram?.WebApp) {
      apply()
      return () => {
        cancelled = true
      }
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`)
    const script = existing ?? document.createElement('script')
    if (!existing) {
      script.src = SCRIPT
      document.head.appendChild(script)
    }
    script.addEventListener('load', apply)
    const timer = window.setTimeout(apply, 2500)

    return () => {
      cancelled = true
      script.removeEventListener('load', apply)
      window.clearTimeout(timer)
    }
  }, [])

  const headers = useMemo(
    () => (initData ? ({ 'x-telegram-init-data': initData } as Record<string, string>) : {}),
    [initData],
  )

  const userLabel = user?.username ?? user?.first_name ?? (user ? String(user.id) : 'guest')

  return { ready, initData, headers, user, userLabel }
}
