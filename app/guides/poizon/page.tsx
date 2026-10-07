import type { Metadata } from 'next'
import '@/components/site/guides.css'
import { PoizonGuidePage } from '@/components/site/PoizonGuidePage'
import { GuideBreadcrumbs } from '@/components/site/GuideBreadcrumbs'
import { RelatedGuides } from '@/components/site/RelatedGuides'
import { pageMetadata, articleGraph, jsonLd } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Как заказать товары с Poizon: инструкция 2026",
  description: "Пошагово: установка Poizon (Dewu), регистрация, поиск товара, оплата через Alipay и доставка на склад посредника в Китае.",
  path: "/guides/poizon",
  image: "/assets/covers/poizon.jpg",
  type: 'article',
})

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleGraph({ title: "Как заказать товары с Poizon: инструкция 2026", description: "Пошагово: установка Poizon (Dewu), регистрация, поиск товара, оплата через Alipay и доставка на склад посредника в Китае.", path: "/guides/poizon", image: "/assets/covers/poizon.jpg" })) }}
      />
      <GuideBreadcrumbs title={
        "Как заказать товары с Poizon"
      } />
      <PoizonGuidePage />
      <RelatedGuides path="/guides/poizon" />
    </>
  )
}
