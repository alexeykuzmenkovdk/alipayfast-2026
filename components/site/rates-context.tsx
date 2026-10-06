'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { EXCHANGE_CONFIG, buildRateTiersWithSettings, type RateTier } from '@/lib/exchange-config'

export interface RatesData {
  baseRate: number
  isManual: boolean
  manualRate: number | null
  tiers: RateTier[]
  bestRate: number
  updatedAt: Date
  loading: boolean
  fallback: boolean
  refresh: () => void
}

const initialTiers = buildRateTiersWithSettings(EXCHANGE_CONFIG.FALLBACK_RATE, {})

const RatesContext = createContext<RatesData>({
  baseRate: EXCHANGE_CONFIG.FALLBACK_RATE,
  isManual: false,
  manualRate: null,
  tiers: initialTiers,
  bestRate: Math.min(...initialTiers.map((t) => t.rate)),
  updatedAt: new Date(),
  loading: true,
  fallback: false,
  refresh: () => {},
})

export function RatesProvider({ children }: { children: React.ReactNode }) {
  const [baseRate, setBaseRate] = useState<number>(EXCHANGE_CONFIG.FALLBACK_RATE)
  const [isManual, setIsManual] = useState(false)
  const [manualRate, setManualRate] = useState<number | null>(null)
  const [tiers, setTiers] = useState<RateTier[]>(initialTiers)
  const [updatedAt, setUpdatedAt] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [fallback, setFallback] = useState(false)
  const mounted = useRef(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/exchange-rate?nocache=${Date.now()}`, { cache: 'no-store' })
      const data = await res.json()
      if (!mounted.current || !res.ok) return

      const base = Number.parseFloat(data.baseRate) || EXCHANGE_CONFIG.FALLBACK_RATE
      setBaseRate(base)
      setIsManual(Boolean(data.isManual))
      setManualRate(data.manualRate ?? null)
      setTiers(Array.isArray(data.tiers) ? data.tiers : buildRateTiersWithSettings(base, data))
      setFallback(Boolean(data.fallbackRate))
      setUpdatedAt(new Date())
    } catch (error) {
      console.error('Ошибка загрузки курса:', error)
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    load()
    return () => {
      mounted.current = false
    }
  }, [load])

  const bestRate = tiers.reduce((min, t) => Math.min(min, t.rate), Number.POSITIVE_INFINITY)

  return (
    <RatesContext.Provider
      value={{ baseRate, isManual, manualRate, tiers, bestRate, updatedAt, loading, fallback, refresh: load }}
    >
      {children}
    </RatesContext.Provider>
  )
}

export function useRates() {
  return useContext(RatesContext)
}
