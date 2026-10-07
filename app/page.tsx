import type { Metadata } from 'next'
import { HomePage } from '@/components/site/HomePage'
import { pageMetadata, serviceGraph, faqGraph, jsonLd } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Пополнение Alipay юанями: выгодный курс, за 15 минут',
  description:
    'Пополняем Alipay китайскими юанями: выгодный курс без скрытых комиссий, оплата через Т-Банк, зачисление ~15 минут. Офис во Владивостоке, онлайн 24/7.',
  path: '/',
})

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(serviceGraph()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqGraph()) }} />
      <HomePage />
    </>
  )
}
