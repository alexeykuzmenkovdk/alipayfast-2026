import type { Metadata } from 'next'
import '@/components/tma/tma.css'
import { TelegramMiniApp } from '@/components/tma/TelegramMiniApp'

export const metadata: Metadata = {
  title: 'AlipayFast Mini App',
  description:
    'Мини-приложение AlipayFast в Telegram: обмен рублей на Alipay, поэтапная оплата, чат с оператором и витрина выгодных товаров.',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <TelegramMiniApp />
}
