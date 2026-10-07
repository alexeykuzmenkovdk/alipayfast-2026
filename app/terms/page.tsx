import type { Metadata } from 'next'
import { TermsPage } from '@/components/site/TermsPage'

export const metadata: Metadata = {
  title: 'Условия использования — AlipayFast',
  description:
    'Условия использования сервиса AlipayFast: статус сервиса, перечень информационно-консультационных услуг, права и обязанности сторон, ответственность и обработка персональных данных.',
  robots: { index: true, follow: true },
}

export default function Page() {
  return <TermsPage />
}
