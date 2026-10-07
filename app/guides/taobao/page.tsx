import { Metadata } from 'next'
import { TaobaoGuidePage } from '@/components/site/TaobaoGuidePage'
import '@/components/site/guides.css'

export const metadata: Metadata = {
  title: 'Как заказать товары с маркетплейса Taobao: пошаговая инструкция 2026 | AlipayFast',
  description:
    'Пошаговый гайд по Taobao: установка приложения, регистрация, перевод интерфейса, поиск товаров, оплата через Alipay, возврат и оформление доставки на склад посредника.',
}

export default function Page() {
  return <TaobaoGuidePage />
}
