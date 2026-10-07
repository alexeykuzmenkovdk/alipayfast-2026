import type { Metadata } from 'next'
import '@/components/site/guides.css'
import { ChinaBikesGuidePage } from '@/components/site/ChinaBikesGuidePage'
import { GuideBreadcrumbs } from '@/components/site/GuideBreadcrumbs'
import { RelatedGuides } from '@/components/site/RelatedGuides'
import { pageMetadata, articleGraph, jsonLd } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Велосипеды и мопеды в Китае: как арендовать",
  description: "Чем отличаются синие, бирюзовые и жёлтые велосипеды, как разблокировать транспорт, сколько стоит поездка и как оплатить через Alipay.",
  path: "/guides/china-bikes",
  image: "/assets/covers/bikes.jpg",
  type: 'article',
})

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleGraph({ title: "Велосипеды и мопеды в Китае: как арендовать", description: "Чем отличаются синие, бирюзовые и жёлтые велосипеды, как разблокировать транспорт, сколько стоит поездка и как оплатить через Alipay.", path: "/guides/china-bikes", image: "/assets/covers/bikes.jpg" })) }}
      />
      <GuideBreadcrumbs title={
        "Велосипеды и мопеды в Китае"
      } />
      <ChinaBikesGuidePage />
      <RelatedGuides path="/guides/china-bikes" />
    </>
  )
}
