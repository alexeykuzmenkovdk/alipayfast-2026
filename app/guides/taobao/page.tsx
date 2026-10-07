import type { Metadata } from 'next'
import '@/components/site/guides.css'
import { TaobaoGuidePage } from '@/components/site/TaobaoGuidePage'
import { GuideBreadcrumbs } from '@/components/site/GuideBreadcrumbs'
import { RelatedGuides } from '@/components/site/RelatedGuides'
import { pageMetadata, articleGraph, jsonLd } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Как заказать товары с Taobao: пошаговая инструкция",
  description: "Установка приложения Taobao, регистрация, перевод интерфейса, поиск товаров, оплата через Alipay и доставка на склад посредника.",
  path: "/guides/taobao",
  image: "/assets/covers/taobao.jpg",
  type: 'article',
})

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleGraph({ title: "Как заказать товары с Taobao: пошаговая инструкция", description: "Установка приложения Taobao, регистрация, перевод интерфейса, поиск товаров, оплата через Alipay и доставка на склад посредника.", path: "/guides/taobao", image: "/assets/covers/taobao.jpg" })) }}
      />
      <GuideBreadcrumbs title={
        "Как заказать товары с Taobao"
      } />
      <TaobaoGuidePage />
      <RelatedGuides path="/guides/taobao" />
    </>
  )
}
