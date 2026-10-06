import { NextResponse } from 'next/server'
import { settingsStore } from '@/lib/settings-store'
import { validateSettings } from '@/lib/exchange-config'
import { isAuthenticated } from '@/lib/admin-auth'
import { sendTelegramMessage } from '@/lib/telegram'

// Получить текущие настройки курса (нужна авторизация).
export async function GET(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ success: false, message: 'Требуется аутентификация' }, { status: 401 })
  }

  const settings = settingsStore.getSettings()
  return NextResponse.json({ success: true, ...settings })
}

// Сохранить настройки курса + уведомить админа в Telegram об изменении.
export async function POST(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ success: false, message: 'Требуется аутентификация' }, { status: 401 })
  }

  try {
    const { markup, useManualRate, manualRate } = await request.json()

    const validation = validateSettings({ markup, useManualRate, manualRate })
    if (!validation.isValid) {
      return NextResponse.json({ success: false, message: validation.errors.join(', ') }, { status: 400 })
    }

    const previousSettings = settingsStore.getSettings()
    const newSettings = settingsStore.setSettings({ markup, useManualRate, manualRate })

    let notificationMessage = '<b>🔄 Изменение настроек курса</b>\n\n'

    if (useManualRate !== previousSettings.useManualRate) {
      notificationMessage += `<b>Режим:</b> ${
        useManualRate ? 'Ручной курс ✏️' : 'Автоматический (ЦБ РФ + надбавка) 🤖'
      }\n`
    }

    if (useManualRate) {
      if (manualRate !== previousSettings.manualRate) {
        notificationMessage += `<b>Установлен ручной курс:</b> ${manualRate} ₽\n`
        if (previousSettings.manualRate) {
          const diff = manualRate - previousSettings.manualRate
          const percent = ((diff / previousSettings.manualRate) * 100).toFixed(2)
          notificationMessage += `<b>Изменение:</b> ${diff > 0 ? '+' : ''}${diff.toFixed(2)} ₽ (${
            diff > 0 ? '+' : ''
          }${percent}%) ${diff > 0 ? '📈' : '📉'}\n`
        }
      }
    } else if (markup !== previousSettings.markup) {
      notificationMessage += `<b>Надбавка к курсу ЦБ:</b> ${markup} ₽\n`
      notificationMessage += `<b>Изменение надбавки:</b> ${markup - previousSettings.markup > 0 ? '+' : ''}${(
        markup - previousSettings.markup
      ).toFixed(2)} ₽\n`
    }

    notificationMessage += `\n<b>Версия настроек:</b> ${newSettings.version}`
    notificationMessage += `\n<b>Дата изменения:</b> ${new Date().toLocaleString('ru-RU')}`

    const changed =
      useManualRate !== previousSettings.useManualRate ||
      (useManualRate && manualRate !== previousSettings.manualRate) ||
      (!useManualRate && markup !== previousSettings.markup)

    if (changed) {
      sendTelegramMessage(notificationMessage).catch((error) =>
        console.error('[SERVER] Ошибка при отправке уведомления:', error),
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Настройки успешно сохранены и применены',
      version: newSettings.version,
      shouldRefreshRate: true,
    })
  } catch (error) {
    console.error('[SERVER] Ошибка при сохранении настроек курса:', error)
    return NextResponse.json({ success: false, message: 'Ошибка при сохранении настроек' }, { status: 500 })
  }
}
