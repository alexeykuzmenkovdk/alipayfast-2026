import type { Metadata } from 'next'
import '@/components/admin/admin.css'
import { ExchangeSettingsForm } from '@/components/admin/ExchangeSettingsForm'

export const metadata: Metadata = {
  title: 'Курс — админка AlipayFast',
  robots: { index: false, follow: false },
}

export default function Page() {
  return (
    <main className="adm-wrap">
      <ExchangeSettingsForm />
    </main>
  )
}
