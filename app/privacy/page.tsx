import type { Metadata } from 'next'
import '@/components/site/guides.css'
import { PrivacyPage } from '@/components/site/PrivacyPage'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Политика конфиденциальности",
  description: "Политика конфиденциальности AlipayFast: какие данные обрабатываются, цели и основания обработки, передача третьим лицам, cookie и права пользователя.",
  path: "/privacy",
})

export default function Page() {
  return <PrivacyPage />
}
