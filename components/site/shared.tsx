'use client'

import { useEffect, useState } from 'react'

export function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.12 },
    )
    document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el))
    return () => io.disconnect()
  })
}

export const fmt = (n: number, d = 0) =>
  (Number.isFinite(n) ? n : 0).toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d })

export function TgIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.4 3.6 2.9 10.7c-1.3.5-1.3 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.1.9.8.9.5 0 .7-.2 1-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.7c.3-1.3-.5-1.9-1.5-1.4Zm-3 3.4-8.6 7.8-.3 3.6-1.6-4.9 10-6.3c.5-.3.9-.1.5.2Z" />
    </svg>
  )
}

export function useVladTime() {
  const get = () =>
    new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Vladivostok' })
  const [t, setT] = useState(get)
  useEffect(() => {
    const i = setInterval(() => setT(get()), 20000)
    return () => clearInterval(i)
  }, [])
  return t
}
