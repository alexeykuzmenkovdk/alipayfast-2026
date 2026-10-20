import fs from 'node:fs'
import path from 'node:path'
import { getDefaultSettings } from './exchange-config'

export interface ExchangeSettings {
  markup: number
  useManualRate: boolean
  manualRate: number | null
  version: number
  lastUpdated: string
}

// Настройки курса переживают перезапуск: без этого после каждого деплоя
// надбавка молча откатывалась к 0.88, и сайт с ботом-постером уезжали от того,
// что оператор выставил в /admin/exchange.
const SETTINGS_FILE = process.env.EXCHANGE_SETTINGS_FILE
  ? path.resolve(process.env.EXCHANGE_SETTINGS_FILE)
  : path.join(process.cwd(), 'data', 'exchange-settings.json')

function readFromDisk(): ExchangeSettings | null {
  try {
    const parsed = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')) as Partial<ExchangeSettings>
    if (typeof parsed.markup !== 'number' || !Number.isFinite(parsed.markup)) return null
    const base = getDefaultSettings()
    return {
      markup: parsed.markup,
      useManualRate: Boolean(parsed.useManualRate),
      manualRate: typeof parsed.manualRate === 'number' && Number.isFinite(parsed.manualRate) ? parsed.manualRate : null,
      version: typeof parsed.version === 'number' ? parsed.version : base.version,
      lastUpdated: typeof parsed.lastUpdated === 'string' ? parsed.lastUpdated : base.lastUpdated,
    }
  } catch {
    return null
  }
}

function writeToDisk(settings: ExchangeSettings): void {
  try {
    fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true })
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8')
  } catch (error) {
    console.error('[STORE] Не удалось сохранить настройки курса:', error)
  }
}

// Централизованное хранилище настроек курса (в памяти + на диске).
class SettingsStore {
  private static instance: SettingsStore
  private settings: ExchangeSettings | null = null

  private constructor() {}

  static getInstance(): SettingsStore {
    if (!SettingsStore.instance) {
      SettingsStore.instance = new SettingsStore()
    }
    return SettingsStore.instance
  }

  getSettings(): ExchangeSettings {
    if (!this.settings) {
      const saved = readFromDisk()
      this.settings = saved ?? getDefaultSettings()
      console.log(
        saved ? '[STORE] Настройки курса загружены с диска:' : '[STORE] Инициализированы настройки из конфигурации:',
        this.settings,
      )
    }
    return this.settings
  }

  setSettings(newSettings: Partial<ExchangeSettings>): ExchangeSettings {
    const current = this.getSettings()
    this.settings = {
      ...current,
      ...newSettings,
      version: current.version + 1,
      lastUpdated: new Date().toISOString(),
    }
    writeToDisk(this.settings)
    console.log('[STORE] Настройки обновлены:', this.settings)
    return this.settings
  }

  resetToDefaults(): ExchangeSettings {
    this.settings = getDefaultSettings()
    writeToDisk(this.settings)
    console.log('[STORE] Настройки сброшены к значениям по умолчанию:', this.settings)
    return this.settings
  }
}

export const settingsStore = SettingsStore.getInstance()
