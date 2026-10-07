import type { Metadata } from 'next'
import '@/components/admin/admin.css'
import { OrdersDashboard } from '@/components/admin/OrdersDashboard'

export const metadata: Metadata = {
  title: 'Заявки — админка AlipayFast',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <OrdersDashboard />
}
