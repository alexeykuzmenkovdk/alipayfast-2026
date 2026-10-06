import { Metadata } from 'next'
import { AlipayGuidePage } from '@/components/site/AlipayGuidePage'
import '@/components/site/guides.css'

export const metadata: Metadata = {
  title: 'Alipay: установка, регистрация и настройка | AlipayFast',
  description:
    'Подробный гайд по Alipay: как скачать и установить приложение, зарегистрироваться, пройти верификацию, настроить платёжный пароль, переводить и получать деньги.',
}

export default function Page() {
  return <AlipayGuidePage />
}
