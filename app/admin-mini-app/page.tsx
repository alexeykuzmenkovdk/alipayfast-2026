import type { Metadata } from 'next'
import '@/components/tma/tma.css'
import { AdminApp } from '@/components/tma/AdminApp'

// HTML мини-аппа нельзя кэшировать: после пересборки хэши чанков меняются,
// и закэшированная страница ссылается на уже удалённые файлы — белый экран.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'AlipayFast — панель оператора',
  description: 'Заявки, чат с клиентами, реквизиты и статистика сделок.',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <AdminApp />
}
