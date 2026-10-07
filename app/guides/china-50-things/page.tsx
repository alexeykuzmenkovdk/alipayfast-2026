import { Metadata } from 'next'
import { China50ThingsGuidePage } from '@/components/site/China50ThingsGuidePage'
import '@/components/site/guides.css'

export const metadata: Metadata = {
  title: 'Путешествуете в Китай из России: 50 вещей, которые нужно знать в 2026 году | AlipayFast',
  description:
    '50 практических советов для поездки в Китай из России в 2026 году: безвиз на 30 дней, VPN и приложения, российские карты и Alipay, граница и Дальний Восток, метро, такси, язык, еда и что взять с собой.',
}

export default function Page() {
  return <China50ThingsGuidePage />
}
