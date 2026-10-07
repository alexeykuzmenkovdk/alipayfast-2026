import { Metadata } from 'next'
import { ChinaBikesGuidePage } from '@/components/site/ChinaBikesGuidePage'
import '@/components/site/guides.css'

export const metadata: Metadata = {
  title: 'Велосипеды и мопеды в Китае: как арендовать туристу | AlipayFast',
  description:
    'Гид по аренде велосипедов и мопедов в Китае: чем отличаются синие, бирюзовые и жёлтые велосипеды, как разблокировать транспорт, сколько стоит поездка и как оплатить через Alipay.',
}

export default function Page() {
  return <ChinaBikesGuidePage />
}
