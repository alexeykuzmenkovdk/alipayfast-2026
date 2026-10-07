import { Metadata } from 'next'
import { PoizonGuidePage } from '@/components/site/PoizonGuidePage'
import '@/components/site/guides.css'

export const metadata: Metadata = {
  title: 'Как заказать товары с маркетплейса Poizon: полная инструкция 2026 | AlipayFast',
  description:
    'Пошаговый гайд по Poizon (Dewu): как установить приложение, зарегистрироваться, найти товар, оплатить через Alipay, оформить доставку на склад посредника и получить посылку в России.',
}

export default function Page() {
  return <PoizonGuidePage />
}
