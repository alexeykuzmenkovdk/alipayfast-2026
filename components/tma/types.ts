export type OrderStatus = 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED'

export type PaymentStatus = 'WAITING_FOR_DETAILS' | 'WAITING_FOR_PAYMENT' | 'PAID' | 'VERIFIED' | 'CANCELED'

export interface Order {
  id: string
  userId: number
  totalRub: number
  totalCny: number
  rate: number
  status: OrderStatus
  contactUsername?: string | null
  contactPhone?: string | null
  createdAt: string
}

export interface PaymentStep {
  id: string
  stepIndex: number
  status: PaymentStatus
  amountRub: number
  method: 'CARD' | 'SBP'
  requisiteValue: string
  bankName: string
  receiptEmail: string
  receiptFileUrl?: string
}

export interface OrderMessage {
  id: string
  senderRole: 'client' | 'admin' | 'system'
  text?: string
  createdAt: string
}

export interface ShowcaseItem {
  id: string
  title: string
  imageUrl: string
  priceCny: number
  priceRub: number
  benefitRub: number
}

export interface SourcingRequest {
  id: string
  answerCny?: number
  comment?: string
  status: string
}

export const ORDER_STATUS: Record<OrderStatus, string> = {
  CREATED: 'Ожидает реквизиты',
  IN_PROGRESS: 'В работе',
  COMPLETED: 'Завершена',
  CANCELED: 'Отменена',
}

export const STEP_STATUS: Record<PaymentStatus, string> = {
  WAITING_FOR_DETAILS: 'Ждём реквизиты',
  WAITING_FOR_PAYMENT: 'Ожидает оплаты',
  PAID: 'Оплачен, проверяем',
  VERIFIED: 'Подтверждён',
  CANCELED: 'Отменён',
}

export function fmtRub(value: number) {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`
}

export function fmtCny(value: number) {
  return `${Math.round(value).toLocaleString('ru-RU')} ¥`
}

export function fmtTime(value: string) {
  try {
    return new Date(value).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export function fmtDateTime(value: string) {
  try {
    return new Date(value).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}
