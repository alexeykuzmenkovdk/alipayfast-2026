import { Metadata } from 'next'
import { ChinaTaxiGuidePage } from '@/components/site/ChinaTaxiGuidePage'
import '@/components/site/guides.css'

export const metadata: Metadata = {
  title: 'Как заказать такси в Китае: гид по DiDi для туриста | AlipayFast',
  description:
    'Пошаговый гид по DiDi: как установить приложение, настроить оплату через Alipay, заказать машину, выбрать тариф, отменить заказ и сколько стоит поездка в Китае.',
}

export default function Page() {
  return <ChinaTaxiGuidePage />
}
