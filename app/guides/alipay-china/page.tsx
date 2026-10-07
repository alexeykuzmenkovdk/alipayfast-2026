import { Metadata } from 'next'
import { AlipayChinaGuidePage } from '@/components/site/AlipayChinaGuidePage'
import '@/components/site/guides.css'

export const metadata: Metadata = {
  title: 'Как платить через Alipay в Китае: полный гид для туриста | AlipayFast',
  description:
    'Alipay в Китае для туриста: как скачать и настроить приложение, пополнить баланс через AlipayFast, платить в магазинах и транспорте.',
}

export default function Page() {
  return <AlipayChinaGuidePage />
}
