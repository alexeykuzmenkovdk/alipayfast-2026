import type { Metadata } from 'next'
import '@/components/tma/tma.css'
import { AdminApp } from '@/components/tma/AdminApp'

export const metadata: Metadata = {
  title: 'AlipayFast — панель оператора',
  description: 'Заявки, чат с клиентами, реквизиты и статистика сделок.',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <AdminApp />
}
