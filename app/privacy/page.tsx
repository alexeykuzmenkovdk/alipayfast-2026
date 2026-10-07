import type { Metadata } from 'next'
import { PrivacyPage } from '@/components/site/PrivacyPage'

export const metadata: Metadata = {
  title: 'Политика конфиденциальности — AlipayFast',
  description:
    'Политика конфиденциальности AlipayFast: какие персональные данные обрабатываются, цели и правовые основания обработки, передача третьим лицам, файлы cookie, права пользователя и контакты оператора.',
  robots: { index: true, follow: true },
}

export default function Page() {
  return <PrivacyPage />
}
