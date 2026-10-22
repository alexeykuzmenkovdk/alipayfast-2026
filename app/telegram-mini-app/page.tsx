import type { Metadata } from 'next'
import '@/components/tma/tma.css'
import { TelegramMiniApp } from '@/components/tma/TelegramMiniApp'

// HTML мини-аппа нельзя кэшировать: после пересборки хэши чанков меняются,
// и закэшированная страница ссылается на уже удалённые файлы — белый экран.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'AlipayFast Mini App',
  description:
    'Мини-приложение AlipayFast в Telegram: обмен рублей на Alipay, поэтапная оплата, чат с оператором и витрина выгодных товаров.',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <TelegramMiniApp />
}
