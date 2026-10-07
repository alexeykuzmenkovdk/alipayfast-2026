import type { Metadata } from 'next'
import '@/components/site/guides.css'
import { ChinaTaxiGuidePage } from '@/components/site/ChinaTaxiGuidePage'
import { GuideBreadcrumbs } from '@/components/site/GuideBreadcrumbs'
import { RelatedGuides } from '@/components/site/RelatedGuides'
import { pageMetadata, articleGraph, jsonLd } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Как заказать такси в Китае: гид по DiDi",
  description: "Пошаговый гид по DiDi: как установить приложение, настроить оплату через Alipay, заказать машину, выбрать тариф, отменить заказ и сколько стоит поездка.",
  path: "/guides/china-taxi",
  image: "/assets/china-taxi/01-hero.png",
  type: 'article',
})

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleGraph({ title: "Как заказать такси в Китае: гид по DiDi", description: "Пошаговый гид по DiDi: как установить приложение, настроить оплату через Alipay, заказать машину, выбрать тариф, отменить заказ и сколько стоит поездка.", path: "/guides/china-taxi", image: "/assets/china-taxi/01-hero.png" })) }}
      />
      <GuideBreadcrumbs title={
        "Как заказать такси в Китае"
      } />
      <ChinaTaxiGuidePage />
      <RelatedGuides path="/guides/china-taxi" />
    </>
  )
}
