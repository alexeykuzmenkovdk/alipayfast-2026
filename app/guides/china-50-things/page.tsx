import type { Metadata } from 'next'
import '@/components/site/guides.css'
import { China50ThingsGuidePage } from '@/components/site/China50ThingsGuidePage'
import { GuideBreadcrumbs } from '@/components/site/GuideBreadcrumbs'
import { RelatedGuides } from '@/components/site/RelatedGuides'
import { pageMetadata, articleGraph, jsonLd } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "50 вещей о Китае: что знать перед поездкой",
  description: "Безвиз, VPN и приложения, российские карты и Alipay, метро, такси, еда и что взять с собой — 50 практичных советов для поездки в Китай.",
  path: "/guides/china-50-things",
  image: "/assets/china-50-things/hero.jpg",
  type: 'article',
})

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleGraph({ title: "50 вещей о Китае: что знать перед поездкой", description: "Безвиз, VPN и приложения, российские карты и Alipay, метро, такси, еда и что взять с собой — 50 практичных советов для поездки в Китай.", path: "/guides/china-50-things", image: "/assets/china-50-things/hero.jpg" })) }}
      />
      <GuideBreadcrumbs title={
        "50 вещей о Китае"
      } />
      <China50ThingsGuidePage />
      <RelatedGuides path="/guides/china-50-things" />
    </>
  )
}
