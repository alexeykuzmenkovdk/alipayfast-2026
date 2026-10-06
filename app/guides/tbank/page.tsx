import { Metadata } from 'next'
import { TbankGuidePage } from '@/components/site/GuidePage'
import '@/components/site/guides.css'

export const metadata: Metadata = {
  title: 'Как перевести деньги через Т-Банк | AlipayFast',
  description: 'Подробная пошаговая инструкция по пополнению Alipay через Т-Банк',
}

export default function Page() {
  return <TbankGuidePage />
}
