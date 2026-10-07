import { Metadata } from 'next'
import { AlipayUnblockGuidePage } from '@/components/site/AlipayUnblockGuidePage'
import '@/components/site/guides.css'

export const metadata: Metadata = {
  title: 'Как снять блокировку Alipay: пошаговая инструкция | AlipayFast',
  description:
    'Что делать, если Alipay заблокировал аккаунт: признаки ограничения, снятие через Центр безопасности по шагам, верификация и сроки блокировки.',
}

export default function Page() {
  return <AlipayUnblockGuidePage />
}
