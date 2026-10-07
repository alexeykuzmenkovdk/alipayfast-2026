import { Metadata } from 'next'
import { ChinaMetroGuidePage } from '@/components/site/ChinaMetroGuidePage'
import '@/components/site/guides.css'

export const metadata: Metadata = {
  title: 'Как оплачивать метро в Китае через Alipay: настройка QR-кода | AlipayFast',
  description:
    'Пошаговая инструкция: как настроить транспортный QR-код в Alipay для метро и автобусов Китая, выбрать универсальный проездной, вынести код на рабочий стол и пройти турникеты.',
}

export default function Page() {
  return <ChinaMetroGuidePage />
}
