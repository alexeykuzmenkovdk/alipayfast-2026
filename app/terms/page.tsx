import type { Metadata } from 'next'
import '@/components/site/guides.css'
import { TermsPage } from '@/components/site/TermsPage'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Пользовательское соглашение",
  description: "Условия использования сервиса AlipayFast: порядок оказания услуг обмена, права и обязанности сторон, ответственность и порядок расчётов.",
  path: "/terms",
})

export default function Page() {
  return <TermsPage />
}
