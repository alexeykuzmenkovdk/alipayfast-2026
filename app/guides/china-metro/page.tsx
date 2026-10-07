import type { Metadata } from 'next'
import '@/components/site/guides.css'
import { ChinaMetroGuidePage } from '@/components/site/ChinaMetroGuidePage'
import { GuideBreadcrumbs } from '@/components/site/GuideBreadcrumbs'
import { RelatedGuides } from '@/components/site/RelatedGuides'
import { pageMetadata, articleGraph, jsonLd } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Метро в Китае: как оплачивать через Alipay",
  description: "Как настроить транспортный QR-код в Alipay для метро и автобусов Китая: выбор проездного, вынос кода на рабочий стол и проход турникетов.",
  path: "/guides/china-metro",
  image: "/assets/covers/metro.jpg",
  type: 'article',
})

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleGraph({ title: "Метро в Китае: как оплачивать через Alipay", description: "Как настроить транспортный QR-код в Alipay для метро и автобусов Китая: выбор проездного, вынос кода на рабочий стол и проход турникетов.", path: "/guides/china-metro", image: "/assets/covers/metro.jpg" })) }}
      />
      <GuideBreadcrumbs title={
        "Как оплачивать метро в Китае"
      } />
      <ChinaMetroGuidePage />
      <RelatedGuides path="/guides/china-metro" />
    </>
  )
}
