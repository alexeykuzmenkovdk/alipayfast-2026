import type { Metadata } from 'next'
import '@/components/site/guides.css'
import { AlipayChinaGuidePage } from '@/components/site/AlipayChinaGuidePage'
import { GuideBreadcrumbs } from '@/components/site/GuideBreadcrumbs'
import { RelatedGuides } from '@/components/site/RelatedGuides'
import { pageMetadata, articleGraph, jsonLd } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Как платить через Alipay в Китае: гид для туриста",
  description: "Alipay в Китае для туриста: как скачать и настроить приложение, пополнить баланс через AlipayFast, платить в магазинах и транспорте.",
  path: "/guides/alipay-china",
  image: "/assets/covers/alipay-china.jpg",
  type: 'article',
})

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleGraph({ title: "Как платить через Alipay в Китае: гид для туриста", description: "Alipay в Китае для туриста: как скачать и настроить приложение, пополнить баланс через AlipayFast, платить в магазинах и транспорте.", path: "/guides/alipay-china", image: "/assets/covers/alipay-china.jpg" })) }}
      />
      <GuideBreadcrumbs title={
        "Как платить через Alipay в Китае"
      } />
      <AlipayChinaGuidePage />
      <RelatedGuides path="/guides/alipay-china" />
    </>
  )
}
