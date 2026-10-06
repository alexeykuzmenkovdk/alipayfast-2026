import { getDefaultSettings } from './exchange-config'

export interface ExchangeSettings {
  markup: number
  useManualRate: boolean
  manualRate: number | null
  version: number
  lastUpdated: string
}

// Централизованное хранилище настроек курса (в памяти процесса).
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
      this.settings = getDefaultSettings()
      console.log('[STORE] Инициализированы настройки из конфигурации:', this.settings)
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
    console.log('[STORE] Настройки обновлены:', this.settings)
    return this.settings
  }

  resetToDefaults(): ExchangeSettings {
    this.settings = getDefaultSettings()
    console.log('[STORE] Настройки сброшены к значениям по умолчанию:', this.settings)
    return this.settings
  }
}

export const settingsStore = SettingsStore.getInstance()
