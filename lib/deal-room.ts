// Тексты комнаты сделки: приветствие с данными заявки и уведомления
// в Telegram, чтобы клиент и оператор не теряли друг друга.
//
// Курс ЦБ РФ клиенту не показываем — только наш итоговый курс.

export const MINI_APP_FALLBACK_LINK = 'https://t.me/AlipayFastBot/alipayfast'

function adminName() {
  return process.env.ADMIN_DISPLAY_NAME ?? 'alipayfast'
}

function adminContact() {
  return process.env.ADMIN_CONTACT ?? '@whaledator'
}

export function welcomeMessage(data: {
  totalCny: number
  totalRub: number
  username?: string | null
  phone?: string | null
}) {
  const lines = [
    '👋 Добро пожаловать! Мы получили вашу заявку и уже начали обработку.',
    '',
    '📌 Данные заявки:',
    `• Сумма обмена: ${data.totalCny.toFixed(2)} CNY (${data.totalRub.toFixed(2)} RUB)`,
    `• Ник клиента: ${data.username ? `@${data.username}` : 'не указан'}`,
  ]

  if (data.phone) {
    lines.push(`• Телефон: ${data.phone}`)
  }

  lines.push(
    '',
    `💳 Обмены принимаются только через Т-Банк. Ожидайте — совсем скоро вам ответит админ ${adminName()} (${adminContact()}) и отправит актуальные банковские реквизиты.`,
    '',
    '⚠️ ВНИМАНИЕ: при оплате внимательно выбирайте банк. Если перевод будет отправлен на банк, отличный от указанного в реквизитах, сделка не сможет быть завершена, а средства в 99% случаев возврату не подлежат.',
  )

  return lines.join('\n')
}

export function stepReadyText(data: {
  orderId: string
  stepIndex: number
  amountRub: number
  method: string
  requisiteValue: string
  bankName: string
  receiptEmail: string
}) {
  const method = data.method === 'CARD' ? 'перевод на карту' : 'СБП'
  return [
    `💳 Заявка #${data.orderId.slice(0, 6)} — этап ${data.stepIndex} готов к оплате`,
    '',
    `Сумма: ${Math.round(data.amountRub).toLocaleString('ru-RU')} ₽ (${method})`,
    `Реквизит: ${data.requisiteValue}`,
    `Банк: ${data.bankName}`,
    `Чек на email: ${data.receiptEmail}`,
    '',
    'Переведите сумму и загрузите чек в комнате сделки. При оплате внимательно выбирайте банк — иначе платёж не найдётся.',
  ].join('\n')
}
